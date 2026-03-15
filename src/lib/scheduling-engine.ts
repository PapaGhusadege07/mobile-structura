// Construction Scheduling Engine with CPM (Critical Path Method)

export interface ScheduleTask {
  id: string;
  name: string;
  startDate: Date;
  duration: number; // working days
  dependencies: string[]; // task IDs
  category: TaskCategory;
  progress: number; // 0-100
  resources: string;
  notes: string;
  // Computed fields
  finishDate?: Date;
  earlyStart?: number;
  earlyFinish?: number;
  lateStart?: number;
  lateFinish?: number;
  totalFloat?: number;
  isCritical?: boolean;
}

export type TaskCategory =
  | "site-preparation"
  | "foundation"
  | "structure"
  | "masonry"
  | "plumbing"
  | "electrical"
  | "finishing"
  | "roofing"
  | "inspection"
  | "general";

export const TASK_CATEGORIES: { value: TaskCategory; label: string; color: string }[] = [
  { value: "site-preparation", label: "Site Preparation", color: "hsl(38, 92%, 50%)" },
  { value: "foundation", label: "Foundation", color: "hsl(215, 50%, 35%)" },
  { value: "structure", label: "Structure", color: "hsl(185, 60%, 45%)" },
  { value: "masonry", label: "Masonry", color: "hsl(0, 72%, 51%)" },
  { value: "plumbing", label: "Plumbing", color: "hsl(152, 60%, 40%)" },
  { value: "electrical", label: "Electrical", color: "hsl(280, 60%, 50%)" },
  { value: "finishing", label: "Finishing", color: "hsl(330, 60%, 50%)" },
  { value: "roofing", label: "Roofing", color: "hsl(20, 70%, 50%)" },
  { value: "inspection", label: "Inspection", color: "hsl(60, 70%, 45%)" },
  { value: "general", label: "General", color: "hsl(210, 15%, 50%)" },
];

export function getCategoryColor(cat: TaskCategory): string {
  return TASK_CATEGORIES.find((c) => c.value === cat)?.color ?? "hsl(210, 15%, 50%)";
}

// Indian public holidays 2026 (sample)
const DEFAULT_HOLIDAYS: Date[] = [
  new Date(2026, 0, 26), // Republic Day
  new Date(2026, 2, 30), // Holi
  new Date(2026, 3, 14), // Ambedkar Jayanti
  new Date(2026, 4, 1),  // May Day
  new Date(2026, 7, 15), // Independence Day
  new Date(2026, 9, 2),  // Gandhi Jayanti
  new Date(2026, 9, 20), // Dussehra
  new Date(2026, 10, 9), // Diwali
  new Date(2026, 11, 25), // Christmas
];

export interface CalendarConfig {
  holidays: Date[];
  workOnSaturday: boolean;
  workOnSunday: boolean;
}

const defaultCalendar: CalendarConfig = {
  holidays: DEFAULT_HOLIDAYS,
  workOnSaturday: true,
  workOnSunday: false,
};

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isWorkingDay(date: Date, config: CalendarConfig = defaultCalendar): boolean {
  const day = date.getDay();
  if (day === 0 && !config.workOnSunday) return false;
  if (day === 6 && !config.workOnSaturday) return false;
  if (config.holidays.some((h) => isSameDay(h, date))) return false;
  return true;
}

export function addWorkingDays(start: Date, days: number, config: CalendarConfig = defaultCalendar): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result, config)) added++;
  }
  return result;
}

export function workingDaysBetween(start: Date, end: Date, config: CalendarConfig = defaultCalendar): number {
  let count = 0;
  const d = new Date(start);
  while (d < end) {
    d.setDate(d.getDate() + 1);
    if (isWorkingDay(d, config)) count++;
  }
  return count;
}

// Calculate finish dates for all tasks based on dependencies
export function calculateSchedule(tasks: ScheduleTask[], config: CalendarConfig = defaultCalendar): ScheduleTask[] {
  const taskMap = new Map<string, ScheduleTask>();
  const computed = tasks.map((t) => ({ ...t }));
  computed.forEach((t) => taskMap.set(t.id, t));

  // Topological sort
  const sorted = topologicalSort(computed);

  // Forward pass — compute finish dates
  for (const task of sorted) {
    let effectiveStart = new Date(task.startDate);
    for (const depId of task.dependencies) {
      const dep = taskMap.get(depId);
      if (dep?.finishDate && dep.finishDate > effectiveStart) {
        effectiveStart = new Date(dep.finishDate);
        effectiveStart.setDate(effectiveStart.getDate() + 1);
        // Advance to next working day
        while (!isWorkingDay(effectiveStart, config)) {
          effectiveStart.setDate(effectiveStart.getDate() + 1);
        }
      }
    }
    task.startDate = effectiveStart;
    task.finishDate = addWorkingDays(effectiveStart, task.duration - 1, config);
    // If duration is 1, finish = start (on a working day)
    if (task.duration <= 1) {
      task.finishDate = new Date(effectiveStart);
    }
    taskMap.set(task.id, task);
  }

  // CPM: Forward pass (early start/finish in working-day indices)
  const projectStart = sorted.length > 0 ? new Date(Math.min(...sorted.map((t) => t.startDate.getTime()))) : new Date();

  for (const task of sorted) {
    const es = workingDaysBetween(projectStart, task.startDate, config);
    task.earlyStart = es;
    task.earlyFinish = es + task.duration;
  }

  // Backward pass
  const maxEF = Math.max(...sorted.map((t) => t.earlyFinish ?? 0));
  for (let i = sorted.length - 1; i >= 0; i--) {
    const task = sorted[i];
    // Find successors
    const successors = sorted.filter((t) => t.dependencies.includes(task.id));
    if (successors.length === 0) {
      task.lateFinish = maxEF;
    } else {
      task.lateFinish = Math.min(...successors.map((s) => s.lateStart ?? maxEF));
    }
    task.lateStart = (task.lateFinish ?? 0) - task.duration;
    task.totalFloat = (task.lateStart ?? 0) - (task.earlyStart ?? 0);
    task.isCritical = task.totalFloat === 0;
  }

  return sorted;
}

function topologicalSort(tasks: ScheduleTask[]): ScheduleTask[] {
  const visited = new Set<string>();
  const result: ScheduleTask[] = [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const task = taskMap.get(id);
    if (!task) return;
    for (const dep of task.dependencies) {
      visit(dep);
    }
    result.push(task);
  }

  tasks.forEach((t) => visit(t.id));
  return result;
}

export function getProjectDuration(tasks: ScheduleTask[]): number {
  if (tasks.length === 0) return 0;
  const earliest = Math.min(...tasks.map((t) => t.startDate.getTime()));
  const latest = Math.max(...tasks.map((t) => (t.finishDate ?? t.startDate).getTime()));
  return Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24));
}

// Sample construction project template
export function getSampleProject(): ScheduleTask[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [
    { id: "t1", name: "Site Clearing & Leveling", startDate: new Date(today), duration: 5, dependencies: [], category: "site-preparation", progress: 0, resources: "Excavator, Laborers", notes: "" },
    { id: "t2", name: "Soil Testing", startDate: new Date(today), duration: 3, dependencies: ["t1"], category: "site-preparation", progress: 0, resources: "Geotechnical Team", notes: "" },
    { id: "t3", name: "Foundation Excavation", startDate: new Date(today), duration: 7, dependencies: ["t2"], category: "foundation", progress: 0, resources: "JCB, Laborers", notes: "" },
    { id: "t4", name: "PCC (Plain Cement Concrete)", startDate: new Date(today), duration: 2, dependencies: ["t3"], category: "foundation", progress: 0, resources: "Mason, RMC", notes: "" },
    { id: "t5", name: "Footing Reinforcement", startDate: new Date(today), duration: 5, dependencies: ["t4"], category: "foundation", progress: 0, resources: "Bar Benders, Steel", notes: "" },
    { id: "t6", name: "Footing Concrete", startDate: new Date(today), duration: 2, dependencies: ["t5"], category: "foundation", progress: 0, resources: "RMC, Vibrator", notes: "" },
    { id: "t7", name: "Column Reinforcement", startDate: new Date(today), duration: 8, dependencies: ["t6"], category: "structure", progress: 0, resources: "Bar Benders", notes: "" },
    { id: "t8", name: "Column Casting", startDate: new Date(today), duration: 3, dependencies: ["t7"], category: "structure", progress: 0, resources: "Shuttering, RMC", notes: "" },
    { id: "t9", name: "Beam & Slab Reinforcement", startDate: new Date(today), duration: 10, dependencies: ["t8"], category: "structure", progress: 0, resources: "Bar Benders, Steel", notes: "" },
    { id: "t10", name: "Slab Casting", startDate: new Date(today), duration: 2, dependencies: ["t9"], category: "structure", progress: 0, resources: "RMC, Pump", notes: "" },
    { id: "t11", name: "Curing Period", startDate: new Date(today), duration: 14, dependencies: ["t10"], category: "structure", progress: 0, resources: "Laborers", notes: "Minimum 14 days curing" },
    { id: "t12", name: "Brick Masonry", startDate: new Date(today), duration: 12, dependencies: ["t11"], category: "masonry", progress: 0, resources: "Masons, Bricks", notes: "" },
    { id: "t13", name: "Plumbing Rough-In", startDate: new Date(today), duration: 8, dependencies: ["t12"], category: "plumbing", progress: 0, resources: "Plumber, PVC", notes: "" },
    { id: "t14", name: "Electrical Conduit", startDate: new Date(today), duration: 8, dependencies: ["t12"], category: "electrical", progress: 0, resources: "Electrician", notes: "" },
    { id: "t15", name: "Plastering", startDate: new Date(today), duration: 10, dependencies: ["t13", "t14"], category: "finishing", progress: 0, resources: "Masons, Putty", notes: "" },
    { id: "t16", name: "Roofing & Waterproofing", startDate: new Date(today), duration: 6, dependencies: ["t11"], category: "roofing", progress: 0, resources: "Waterproofing Crew", notes: "" },
    { id: "t17", name: "Flooring & Tiling", startDate: new Date(today), duration: 10, dependencies: ["t15"], category: "finishing", progress: 0, resources: "Tile Installer", notes: "" },
    { id: "t18", name: "Painting", startDate: new Date(today), duration: 8, dependencies: ["t17"], category: "finishing", progress: 0, resources: "Painters", notes: "" },
    { id: "t19", name: "Electrical Fixtures", startDate: new Date(today), duration: 5, dependencies: ["t17"], category: "electrical", progress: 0, resources: "Electrician", notes: "" },
    { id: "t20", name: "Plumbing Fixtures", startDate: new Date(today), duration: 4, dependencies: ["t17"], category: "plumbing", progress: 0, resources: "Plumber", notes: "" },
    { id: "t21", name: "Final Inspection", startDate: new Date(today), duration: 2, dependencies: ["t18", "t19", "t20", "t16"], category: "inspection", progress: 0, resources: "Engineer", notes: "" },
  ];
}
