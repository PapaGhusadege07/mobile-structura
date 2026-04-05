import { useState, useMemo, useCallback } from "react";
import { ScheduleTask, calculateSchedule, getProjectDuration, getSampleProject } from "@/lib/scheduling-engine";
import { GanttChart } from "@/components/scheduling/GanttChart";
import { TaskForm } from "@/components/scheduling/TaskForm";
import { TaskTable } from "@/components/scheduling/TaskTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, ListTodo, BarChart3, Zap, Clock, AlertTriangle, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function SchedulingView() {
  const [rawTasks, setRawTasks] = useState<ScheduleTask[]>(getSampleProject());
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const tasks = useMemo(() => calculateSchedule(rawTasks), [rawTasks]);
  const projectDuration = useMemo(() => getProjectDuration(tasks), [tasks]);
  const criticalCount = useMemo(() => tasks.filter((t) => t.isCritical).length, [tasks]);
  const avgProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length);
  }, [tasks]);

  const projectStart = tasks.length > 0 ? tasks[0].startDate : new Date();
  const projectEnd = tasks.length > 0 ? tasks[tasks.length - 1].finishDate ?? new Date() : new Date();

  const handleSave = useCallback((task: ScheduleTask) => {
    setRawTasks((prev) => {
      const exists = prev.find((t) => t.id === task.id);
      if (exists) return prev.map((t) => (t.id === task.id ? task : t));
      return [...prev, task];
    });
    setShowForm(false);
    setEditingTask(null);
    toast({ title: editingTask ? "Task updated" : "Task added", description: `"${task.name}" saved. Schedule recalculated.` });
  }, [editingTask, toast]);

  const handleDelete = useCallback((id: string) => {
    setRawTasks((prev) => {
      // Remove task and clean up dependencies
      const remaining = prev.filter((t) => t.id !== id);
      return remaining.map((t) => ({ ...t, dependencies: t.dependencies.filter((d) => d !== id) }));
    });
    toast({ title: "Task deleted", description: "Schedule recalculated automatically." });
  }, [toast]);

  const handleEdit = (task: ScheduleTask) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero px-4 pt-6 pb-5">
        <h1 className="text-lg font-bold text-primary-foreground">Construction Scheduler</h1>
        <p className="text-xs text-primary-foreground/70 mt-1">CPM-based project scheduling</p>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-background/10 rounded-lg p-2 backdrop-blur-sm">
            <p className="text-[9px] text-primary-foreground/60 uppercase">Tasks</p>
            <p className="text-sm font-bold text-primary-foreground">{tasks.length}</p>
          </div>
          <div className="bg-background/10 rounded-lg p-2 backdrop-blur-sm">
            <p className="text-[9px] text-primary-foreground/60 uppercase">Duration</p>
            <p className="text-sm font-bold text-primary-foreground">{projectDuration}d</p>
          </div>
          <div className="bg-background/10 rounded-lg p-2 backdrop-blur-sm">
            <p className="text-[9px] text-primary-foreground/60 uppercase">Critical</p>
            <p className="text-sm font-bold text-destructive">{criticalCount}</p>
          </div>
          <div className="bg-background/10 rounded-lg p-2 backdrop-blur-sm">
            <p className="text-[9px] text-primary-foreground/60 uppercase">Progress</p>
            <p className="text-sm font-bold text-primary-foreground">{avgProgress}%</p>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-[10px] text-primary-foreground/60">
            <Clock className="w-3 h-3" />
            <span>{format(projectStart, "dd MMM yyyy")} → {format(projectEnd, "dd MMM yyyy")}</span>
          </div>
        )}
      </div>

      <div className="px-3 -mt-2 space-y-3">
        {/* Action bar */}
        <div className="flex gap-2">
          <Button onClick={handleNewTask} size="sm" className="gap-1.5 flex-1">
            <Plus className="w-3.5 h-3.5" /> Add Task
          </Button>
        </div>

        {/* Tabs: Gantt / List / CPM */}
        <Tabs defaultValue="gantt" className="space-y-3">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="gantt" className="text-xs gap-1">
              <CalendarDays className="w-3 h-3" /> Gantt
            </TabsTrigger>
            <TabsTrigger value="list" className="text-xs gap-1">
              <ListTodo className="w-3 h-3" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="cpm" className="text-xs gap-1">
              <Zap className="w-3 h-3" /> CPM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gantt">
            <GanttChart tasks={tasks} onTaskClick={handleEdit} />
          </TabsContent>

          <TabsContent value="list">
            <TaskTable tasks={tasks} allTasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
          </TabsContent>

          <TabsContent value="cpm">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-destructive" /> Critical Path Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Critical Path Tasks:</p>
                  <div className="space-y-1.5">
                    {tasks.filter((t) => t.isCritical).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded-md bg-destructive/5 border border-destructive/20 cursor-pointer hover:bg-destructive/10"
                        onClick={() => handleEdit(task)}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-destructive" />
                          <span className="text-xs font-medium">{task.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{task.duration}d</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-muted/30 space-y-2">
                  <p className="text-xs font-medium">Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Total tasks:</span> <span className="font-medium">{tasks.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Critical tasks:</span> <span className="font-medium text-destructive">{criticalCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Project duration:</span> <span className="font-medium">{projectDuration} days</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Overall progress:</span> <span className="font-medium">{avgProgress}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-md border border-border/50 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">📌 What is the Critical Path?</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The Critical Path is the longest sequence of dependent tasks. Any delay on these tasks will delay the entire project. Tasks with zero float are on the critical path and require close monitoring.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Form Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-sm">{editingTask ? "Edit Task" : "Add New Task"}</SheetTitle>
          </SheetHeader>
          <TaskForm
            task={editingTask}
            allTasks={rawTasks}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingTask(null); }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
