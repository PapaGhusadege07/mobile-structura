import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { SensorWave } from "@/components/SensorWave";
import { 
  Activity, 
  Compass, 
  Smartphone, 
  X,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

type ScanPhase = "idle" | "preparing" | "scanning" | "analyzing" | "complete";

interface ScanViewProps {
  onComplete?: (result: ScanResult) => void;
  onBack?: () => void;
}

interface ScanResult {
  score: number;
  status: "healthy" | "warning" | "critical";
  metrics: {
    vibration: number;
    tilt: number;
    resonance: number;
  };
}

const sensorTypes = [
  { id: "accelerometer", icon: Activity, label: "Accelerometer", description: "Measuring vibrations" },
  { id: "gyroscope", icon: Compass, label: "Gyroscope", description: "Detecting tilt" },
  { id: "magnetometer", icon: Smartphone, label: "Magnetometer", description: "Analyzing field" },
];

export function ScanView({ onComplete, onBack }: ScanViewProps) {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [activeSensor, setActiveSensor] = useState(0);

  useEffect(() => {
    if (phase === "scanning") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase("analyzing");
            return 100;
          }
          return prev + 2;
        });

        // Cycle through sensors
        setActiveSensor((prev) => (prev + 1) % sensorTypes.length);
      }, 100);

      return () => clearInterval(interval);
    }

    if (phase === "analyzing") {
      const timeout = setTimeout(() => {
        setPhase("complete");
        onComplete?.({
          score: 87,
          status: "healthy",
          metrics: {
            vibration: 92,
            tilt: 88,
            resonance: 81,
          },
        });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [phase, onComplete]);

  const startScan = () => {
    setPhase("preparing");
    setProgress(0);
    setTimeout(() => setPhase("scanning"), 1500);
  };

  return (
    <div className="min-h-screen pb-24 px-6 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Structural Scan</h1>
          <p className="text-muted-foreground text-sm">
            {phase === "idle" && "Place device against structure"}
            {phase === "preparing" && "Calibrating sensors..."}
            {phase === "scanning" && "Analyzing structure..."}
            {phase === "analyzing" && "Processing data..."}
            {phase === "complete" && "Scan complete!"}
          </p>
        </div>
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Main Scan Interface */}
      <div className="flex flex-col items-center mb-8">
        {/* Scan Circle */}
        <div className="relative mb-8">
          <div
            className={cn(
              "w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500",
              phase === "idle" && "border-muted bg-muted/20",
              phase === "preparing" && "border-accent/50 bg-accent/10 animate-pulse",
              phase === "scanning" && "border-accent bg-accent/10",
              phase === "analyzing" && "border-accent bg-accent/20 animate-pulse",
              phase === "complete" && "border-success bg-success/10"
            )}
          >
            {phase === "idle" && (
              <Smartphone className="w-16 h-16 text-muted-foreground" />
            )}
            {(phase === "preparing" || phase === "analyzing") && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {phase === "preparing" ? "Calibrating..." : "Analyzing..."}
                </span>
              </div>
            )}
            {phase === "scanning" && (
              <div className="flex flex-col items-center">
                <SensorWave isActive className="mb-2" />
                <span className="text-3xl font-bold font-mono text-accent">{progress}%</span>
              </div>
            )}
            {phase === "complete" && (
              <CheckCircle2 className="w-20 h-20 text-success" />
            )}
          </div>

          {/* Pulse rings during scanning */}
          {phase === "scanning" && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-pulse-ring" />
              <div
                className="absolute inset-0 rounded-full border-2 border-accent/20 animate-pulse-ring"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}
        </div>

        {/* Action Button */}
        {phase === "idle" && (
          <Button variant="scan" size="xl" onClick={startScan} className="animate-fade-in">
            <Activity className="w-5 h-5" />
            Begin Scan
          </Button>
        )}
      </div>

      {/* Sensor Status Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Sensor Status</h3>
        {sensorTypes.map((sensor, index) => (
          <Card
            key={sensor.id}
            variant="default"
            className={cn(
              "transition-all duration-300",
              phase === "scanning" && activeSensor === index && "ring-2 ring-accent shadow-glow"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "p-3 rounded-xl transition-colors",
                    phase === "scanning" && activeSensor === index
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted"
                  )}
                >
                  <sensor.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{sensor.label}</div>
                  <div className="text-sm text-muted-foreground">{sensor.description}</div>
                </div>
                <StatusBadge
                  status={
                    phase === "idle"
                      ? "healthy"
                      : phase === "scanning" && activeSensor === index
                      ? "scanning"
                      : "healthy"
                  }
                  label={
                    phase === "idle"
                      ? "Ready"
                      : phase === "scanning" && activeSensor === index
                      ? "Active"
                      : "Standby"
                  }
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
