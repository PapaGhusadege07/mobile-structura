import { ScheduleTask, getCategoryColor, TASK_CATEGORIES } from "@/lib/scheduling-engine";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface TaskTableProps {
  tasks: ScheduleTask[];
  allTasks: ScheduleTask[];
  onEdit: (task: ScheduleTask) => void;
  onDelete: (id: string) => void;
}

export function TaskTable({ tasks, allTasks, onEdit, onDelete }: TaskTableProps) {
  const getTaskName = (id: string) => allTasks.find((t) => t.id === id)?.name ?? id;
  const getCatLabel = (cat: string) => TASK_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs w-[30%]">Task</TableHead>
            <TableHead className="text-xs">Start</TableHead>
            <TableHead className="text-xs">End</TableHead>
            <TableHead className="text-xs">Days</TableHead>
            <TableHead className="text-xs">Progress</TableHead>
            <TableHead className="text-xs">Float</TableHead>
            <TableHead className="text-xs w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className={cn(task.isCritical && "bg-destructive/5")}>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(task.category) }} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{task.name}</p>
                    <p className="text-[10px] text-muted-foreground">{getCatLabel(task.category)}</p>
                    {task.dependencies.length > 0 && (
                      <p className="text-[9px] text-muted-foreground truncate">
                        ← {task.dependencies.map(getTaskName).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-[10px] py-2">{format(task.startDate, "dd MMM")}</TableCell>
              <TableCell className="text-[10px] py-2">{task.finishDate ? format(task.finishDate, "dd MMM") : "-"}</TableCell>
              <TableCell className="text-[10px] py-2">{task.duration}d</TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-1">
                  <Progress value={task.progress} className="h-1.5 w-12" />
                  <span className="text-[9px] text-muted-foreground">{task.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="py-2">
                {task.isCritical ? (
                  <Badge variant="destructive" className="text-[8px] px-1 py-0">Critical</Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">{task.totalFloat ?? 0}d</span>
                )}
              </TableCell>
              <TableCell className="py-2">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(task)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(task.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
