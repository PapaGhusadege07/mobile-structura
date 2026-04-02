import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bell, Vibrate, Shield, HelpCircle, FileText,
  ChevronRight, Smartphone, Cloud, Info, RotateCcw,
  CheckCircle2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CalibrationData {
  accelerometer: { x: number; y: number; z: number } | null;
  gyroscope: { alpha: number; beta: number; gamma: number } | null;
  calibrated: boolean;
  timestamp: string | null;
}

function SensorCalibrationPanel() {
  const [calibration, setCalibration] = useState<CalibrationData>(() => {
    const stored = localStorage.getItem("structura-calibration");
    return stored ? JSON.parse(stored) : { accelerometer: null, gyroscope: null, calibrated: false, timestamp: null };
  });
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Place device on a flat, stable surface",
    "Reading accelerometer data...",
    "Reading gyroscope data...",
    "Calibration complete!"
  ];

  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setProgress(0);
    setStep(0);

    // Step 1: Wait for user to place device
    setTimeout(() => {
      setStep(1);
      setProgress(25);

      // Step 2: Read accelerometer
      const accelReadings: { x: number; y: number; z: number }[] = [];
      let accelHandler: ((e: DeviceMotionEvent) => void) | null = null;

      const readAccel = new Promise<{ x: number; y: number; z: number }>((resolve) => {
        if (window.DeviceMotionEvent) {
          accelHandler = (event: DeviceMotionEvent) => {
            const acc = event.accelerationIncludingGravity;
            if (acc?.x != null && acc?.y != null && acc?.z != null) {
              accelReadings.push({ x: acc.x, y: acc.y, z: acc.z });
            }
          };
          window.addEventListener("devicemotion", accelHandler);
          setTimeout(() => {
            if (accelHandler) window.removeEventListener("devicemotion", accelHandler);
            if (accelReadings.length > 0) {
              const avg = accelReadings.reduce(
                (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
                { x: 0, y: 0, z: 0 }
              );
              resolve({
                x: +(avg.x / accelReadings.length).toFixed(4),
                y: +(avg.y / accelReadings.length).toFixed(4),
                z: +(avg.z / accelReadings.length).toFixed(4),
              });
            } else {
              resolve({ x: 0, y: 0, z: 9.81 }); // fallback
            }
          }, 2000);
        } else {
          resolve({ x: 0, y: 0, z: 9.81 });
        }
      });

      readAccel.then((accelData) => {
        setStep(2);
        setProgress(60);

        // Step 3: Read gyroscope
        const gyroReadings: { alpha: number; beta: number; gamma: number }[] = [];
        let gyroHandler: ((e: DeviceOrientationEvent) => void) | null = null;

        const readGyro = new Promise<{ alpha: number; beta: number; gamma: number }>((resolve) => {
          if (window.DeviceOrientationEvent) {
            gyroHandler = (event: DeviceOrientationEvent) => {
              gyroReadings.push({
                alpha: event.alpha || 0,
                beta: event.beta || 0,
                gamma: event.gamma || 0,
              });
            };
            window.addEventListener("deviceorientation", gyroHandler);
            setTimeout(() => {
              if (gyroHandler) window.removeEventListener("deviceorientation", gyroHandler);
              if (gyroReadings.length > 0) {
                const avg = gyroReadings.reduce(
                  (a, b) => ({ alpha: a.alpha + b.alpha, beta: a.beta + b.beta, gamma: a.gamma + b.gamma }),
                  { alpha: 0, beta: 0, gamma: 0 }
                );
                resolve({
                  alpha: +(avg.alpha / gyroReadings.length).toFixed(4),
                  beta: +(avg.beta / gyroReadings.length).toFixed(4),
                  gamma: +(avg.gamma / gyroReadings.length).toFixed(4),
                });
              } else {
                resolve({ alpha: 0, beta: 0, gamma: 0 });
              }
            }, 2000);
          } else {
            resolve({ alpha: 0, beta: 0, gamma: 0 });
          }
        });

        readGyro.then((gyroData) => {
          setStep(3);
          setProgress(100);

          const newCal: CalibrationData = {
            accelerometer: accelData,
            gyroscope: gyroData,
            calibrated: true,
            timestamp: new Date().toISOString(),
          };
          setCalibration(newCal);
          localStorage.setItem("structura-calibration", JSON.stringify(newCal));

          setTimeout(() => {
            setIsCalibrating(false);
            toast.success("Sensor calibration complete!");
          }, 1000);
        });
      });
    }, 1500);
  }, []);

  const resetCalibration = () => {
    const empty: CalibrationData = { accelerometer: null, gyroscope: null, calibrated: false, timestamp: null };
    setCalibration(empty);
    localStorage.setItem("structura-calibration", JSON.stringify(empty));
    toast.info("Calibration data reset");
  };

  return (
    <div className="space-y-4">
      {/* Calibration Status */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        {calibration.calibrated ? (
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
        )}
        <div className="flex-1">
          <div className="text-sm font-medium">
            {calibration.calibrated ? "Sensors Calibrated" : "Not Calibrated"}
          </div>
          {calibration.timestamp && (
            <div className="text-xs text-muted-foreground">
              Last: {new Date(calibration.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Calibration Progress */}
      {isCalibrating && (
        <div className="space-y-3 p-4 rounded-xl border border-accent/30 bg-accent/5">
          <div className="text-sm font-medium text-accent">{steps[step]}</div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">Keep the device still during calibration</p>
        </div>
      )}

      {/* Sensor Values */}
      {calibration.calibrated && calibration.accelerometer && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Accelerometer</div>
            <div className="font-mono text-xs space-y-0.5">
              <div>X: {calibration.accelerometer.x} m/s²</div>
              <div>Y: {calibration.accelerometer.y} m/s²</div>
              <div>Z: {calibration.accelerometer.z} m/s²</div>
            </div>
          </div>
          {calibration.gyroscope && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Gyroscope</div>
              <div className="font-mono text-xs space-y-0.5">
                <div>α: {calibration.gyroscope.alpha}°</div>
                <div>β: {calibration.gyroscope.beta}°</div>
                <div>γ: {calibration.gyroscope.gamma}°</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="hero"
          className="flex-1"
          onClick={startCalibration}
          disabled={isCalibrating}
        >
          <Smartphone className="w-4 h-4" />
          {isCalibrating ? "Calibrating..." : "Calibrate Sensors"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetCalibration}
          disabled={isCalibrating}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

const settingsGroups = [
  {
    title: "Notifications",
    items: [
      { id: "alerts", icon: Bell, label: "Push Alerts", description: "Get notified of critical changes", hasSwitch: true, enabled: true },
      { id: "vibrate", icon: Vibrate, label: "Haptic Feedback", description: "Vibration during scans", hasSwitch: true, enabled: true },
    ],
  },
  {
    title: "Data & Sync",
    items: [
      { id: "cloud", icon: Cloud, label: "Cloud Sync", description: "Backup scans to cloud", hasSwitch: true, enabled: false },
    ],
  },
  {
    title: "About",
    items: [
      { id: "privacy", icon: Shield, label: "Privacy Policy", description: "How we handle your data" },
      { id: "terms", icon: FileText, label: "Terms of Service", description: "Usage terms and conditions" },
      { id: "help", icon: HelpCircle, label: "Help & Support", description: "FAQs and contact us" },
      { id: "about", icon: Info, label: "About Structura", description: "Version 2.0.0" },
    ],
  },
];

export function SettingsView() {
  return (
    <div className="min-h-screen pb-24 px-6 pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Customize your Structura experience</p>
      </div>

      <div className="space-y-6">
        {/* Sensor Calibration Section */}
        <div className="animate-fade-in">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Sensor Calibration</h2>
          <Card variant="default">
            <CardContent className="p-4">
              <SensorCalibrationPanel />
            </CardContent>
          </Card>
        </div>

        {/* Standard Settings */}
        {settingsGroups.map((group, groupIndex) => (
          <div
            key={group.title}
            className="animate-fade-in"
            style={{ animationDelay: `${(groupIndex + 1) * 0.1}s` }}
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{group.title}</h2>
            <Card variant="default">
              <CardContent className="p-0 divide-y divide-border">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 p-4 transition-colors",
                      !item.hasSwitch && "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    <div className="p-2.5 rounded-xl bg-muted">
                      <item.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                    </div>
                    {item.hasSwitch ? (
                      <Switch defaultChecked={item.enabled} />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <p className="font-semibold">Structura v2.0.0</p>
        <p className="mt-1 text-xs">Precision Engineering at Your Fingertips</p>
        <p className="mt-1">© 2024 All rights reserved</p>
      </div>
    </div>
  );
}
