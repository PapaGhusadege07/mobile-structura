import { cn } from "@/lib/utils";

interface HealthScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HealthScore({ score, size = "md", className }: HealthScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-success to-success/50";
    if (score >= 60) return "from-warning to-warning/50";
    return "from-destructive to-destructive/50";
  };

  const sizes = {
    sm: {
      container: "w-20 h-20",
      score: "text-xl",
      label: "text-xs",
      strokeWidth: 6,
    },
    md: {
      container: "w-32 h-32",
      score: "text-3xl",
      label: "text-sm",
      strokeWidth: 8,
    },
    lg: {
      container: "w-44 h-44",
      score: "text-5xl",
      label: "text-base",
      strokeWidth: 10,
    },
  };

  const config = sizes[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative", config.container, className)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={cn("stop-current", getScoreColor(score))} />
            <stop offset="100%" className={cn("stop-current", getScoreColor(score))} style={{ opacity: 0.5 }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold font-mono", config.score, getScoreColor(score))}>
          {score}
        </span>
        <span className={cn("text-muted-foreground", config.label)}>Health Score</span>
      </div>
    </div>
  );
}
