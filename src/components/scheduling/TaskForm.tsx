import { useState } from "react";
import { ScheduleTask, TaskCategory, TASK_CATEGORIES } from "@/lib/scheduling-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface TaskFormProps {
  task?: ScheduleTask | null;
  allTasks: ScheduleTask[];
  onSave: (task: ScheduleTask) => void;
  onCancel: () => void;
}

export function TaskForm({ task, allTasks, onSave, onCancel }: TaskFormProps) {
  const isEdit = !!task;
  const [name, setName] = useState(task?.name ?? "");
  const [startDate, setStartDate] = useState<Date>(task?.startDate ?? new Date());
  const [duration, setDuration] = useState(task?.duration ?? 5);
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? "general");
  const [dependencies, setDependencies] = useState<string[]>(task?.dependencies ?? []);
  const [progress, setProgress] = useState(task?.progress ?? 0);
  const [resources, setResources] = useState(task?.resources ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      id: task?.id ?? `t${Date.now()}`,
      name: name.trim(),
      startDate,
      duration,
      dependencies,
      category,
      progress,
      resources,
      notes,
    });
  };

  const availableDeps = allTasks.filter((t) => t.id !== task?.id);

  const toggleDep = (id: string) => {
    setDependencies((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Task Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Column Casting" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-xs", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-3 w-3" />
                {format(startDate, "dd MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Duration (days)</Label>
          <Input type="number" inputMode="numeric" min={1} max={365} value={duration} onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
          <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TASK_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Progress: {progress}%</Label>
        <Slider value={[progress]} onValueChange={([v]) => setProgress(v)} max={100} step={5} />
      </div>

      {availableDeps.length > 0 && (
        <div className="space-y-2">
          <Label>Dependencies (predecessors)</Label>
          <div className="max-h-32 overflow-y-auto space-y-1 border border-border rounded-md p-2">
            {availableDeps.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/30 p-1 rounded">
                <input type="checkbox" checked={dependencies.includes(t.id)} onChange={() => toggleDep(t.id)} className="rounded" />
                <span className="truncate">{t.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Resources</Label>
        <Input value={resources} onChange={(e) => setResources(e.target.value)} placeholder="e.g. Mason, RMC" />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="flex-1 gap-2" size="sm">
          {isEdit ? <Save className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isEdit ? "Update Task" : "Add Task"}
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">Cancel</Button>
      </div>
    </div>
  );
}
