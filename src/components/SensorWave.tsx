import { cn } from "@/lib/utils";

interface SensorWaveProps {
  isActive?: boolean;
  className?: string;
}

export function SensorWave({ isActive = true, className }: SensorWaveProps) {
  return (
    <div className={cn("flex items-end justify-center gap-1 h-8", className)}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-300",
            isActive ? "bg-accent" : "bg-muted",
            isActive && "animate-wave"
          )}
          style={{
            height: isActive ? `${12 + Math.random() * 20}px` : "4px",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
