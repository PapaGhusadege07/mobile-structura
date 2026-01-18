import { cn } from "@/lib/utils";

type StatusType = "healthy" | "warning" | "critical" | "scanning";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig = {
  healthy: {
    bgClass: "bg-success/10",
    textClass: "text-success",
    dotClass: "bg-success",
    defaultLabel: "Healthy",
  },
  warning: {
    bgClass: "bg-warning/10",
    textClass: "text-warning",
    dotClass: "bg-warning",
    defaultLabel: "Attention Needed",
  },
  critical: {
    bgClass: "bg-destructive/10",
    textClass: "text-destructive",
    dotClass: "bg-destructive",
    defaultLabel: "Critical",
  },
  scanning: {
    bgClass: "bg-accent/10",
    textClass: "text-accent",
    dotClass: "bg-accent",
    defaultLabel: "Scanning",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          config.dotClass,
          status === "scanning" && "animate-pulse"
        )}
      />
      {label || config.defaultLabel}
    </div>
  );
}
