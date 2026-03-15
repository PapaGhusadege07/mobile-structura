import { useMemo } from "react";
import { ScheduleTask, getCategoryColor } from "@/lib/scheduling-engine";
import { format, differenceInDays } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GanttChartProps {
  tasks: ScheduleTask[];
  onTaskClick: (task: ScheduleTask) => void;
}

export function GanttChart({ tasks, onTaskClick }: GanttChartProps) {
  const { projectStart, projectEnd, totalDays, months } = useMemo(() => {
    if (tasks.length === 0) {
      const now = new Date();
      return { projectStart: now, projectEnd: now, totalDays: 30, months: [] as { label: string; days: number }[] };
    }
    const starts = tasks.map((t) => t.startDate.getTime());
    const ends = tasks.map((t) => (t.finishDate ?? t.startDate).getTime());
    const ps = new Date(Math.min(...starts));
    const pe = new Date(Math.max(...ends));
    ps.setDate(ps.getDate() - 1);
    pe.setDate(pe.getDate() + 3);
    const td = Math.max(differenceInDays(pe, ps), 7);

    // Month headers
    const ms: { label: string; days: number }[] = [];
    let cursor = new Date(ps);
    while (cursor < pe) {
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const end = monthEnd < pe ? monthEnd : pe;
      const days = differenceInDays(end, cursor) + 1;
      ms.push({ label: format(cursor, "MMM yyyy"), days });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return { projectStart: ps, projectEnd: pe, totalDays: td, months: ms };
  }, [tasks]);

  const dayWidth = 28;
  const rowHeight = 32;
  const chartWidth = totalDays * dayWidth;
  const labelWidth = 200;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex border-b border-border bg-muted/30">
        <div className="shrink-0 border-r border-border px-3 py-2 font-medium text-xs text-muted-foreground" style={{ width: labelWidth }}>
          Task Name
        </div>
        <div className="flex-1 overflow-x-auto">
          <div style={{ width: chartWidth }}>
            <div className="flex">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="text-[10px] font-medium text-muted-foreground border-r border-border px-1 py-1 text-center"
                  style={{ width: m.days * dayWidth }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className="max-h-[60vh]">
        <div className="flex">
          {/* Task labels */}
          <div className="shrink-0 border-r border-border" style={{ width: labelWidth }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={cn(
                  "px-3 flex items-center gap-2 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors text-xs truncate",
                  task.isCritical && "font-semibold"
                )}
                style={{ height: rowHeight }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(task.category) }} />
                <span className="truncate">{task.name}</span>
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="flex-1 overflow-x-auto">
            <div style={{ width: chartWidth, position: "relative" }}>
              {tasks.map((task, idx) => {
                const startOffset = differenceInDays(task.startDate, projectStart);
                const duration = differenceInDays(task.finishDate ?? task.startDate, task.startDate) + 1;
                const left = startOffset * dayWidth;
                const width = Math.max(duration * dayWidth - 4, dayWidth - 4);
                const top = idx * rowHeight + 4;
                const barHeight = rowHeight - 8;
                const color = getCategoryColor(task.category);

                return (
                  <div key={task.id} style={{ height: rowHeight }} className="border-b border-border/20">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => onTaskClick(task)}
                          className={cn(
                            "absolute rounded cursor-pointer transition-opacity hover:opacity-80",
                            task.isCritical && "ring-1 ring-destructive/50"
                          )}
                          style={{
                            left: left + 2,
                            top,
                            width,
                            height: barHeight,
                            backgroundColor: color,
                            opacity: 0.85,
                          }}
                        >
                          {/* Progress fill */}
                          <div
                            className="h-full rounded opacity-40"
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor: "hsl(var(--foreground))",
                            }}
                          />
                          {width > 60 && (
                            <span className="absolute inset-0 flex items-center px-2 text-[9px] font-medium text-white truncate">
                              {task.name}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs space-y-1">
                        <p className="font-semibold">{task.name}</p>
                        <p>{format(task.startDate, "dd MMM")} → {format(task.finishDate ?? task.startDate, "dd MMM yyyy")}</p>
                        <p>Duration: {task.duration} days | Progress: {task.progress}%</p>
                        {task.isCritical && <p className="text-destructive font-medium">⚡ Critical Path</p>}
                        {task.totalFloat !== undefined && <p>Float: {task.totalFloat} days</p>}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
