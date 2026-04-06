import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ScanHistory } from "@/components/ScanHistory";
import { HealthScore } from "@/components/HealthScore";
import { Activity, Building2, Shield, Zap, Moon, Sun } from "lucide-react";

interface HomeViewProps {
  onStartScan: () => void;
}

export function HomeView({ onStartScan }: HomeViewProps) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 engineering-grid opacity-30" />
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-accent shadow-glow">
                <Shield className="w-6 h-6 text-accent-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Structura</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Smart Structural Design & Cost Estimation Made Simple
          </p>
          <Button variant="hero" size="lg" onClick={onStartScan} className="w-full sm:w-auto">
            <Zap className="w-5 h-5" />
            Start New Scan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-4">
        <Card variant="elevated" className="animate-fade-in">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Overall Status</div>
                <StatusBadge status="healthy" label="12 structures OK" />
              </div>
              <HealthScore score={82} size="sm" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-3">
        {[
          { icon: Activity, label: "Vibration", value: "—", color: "text-success" },
          { icon: Building2, label: "Structures", value: "0", color: "text-accent" },
        ].map((item, index) => (
          <Card
            key={item.label}
            variant="default"
            className="animate-fade-in"
            style={{ animationDelay: `${(index + 1) * 0.1}s` }}
          >
            <CardContent className="p-4">
              <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="text-lg font-semibold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scan History */}
      <div className="px-6 mt-8">
        <ScanHistory />
      </div>
    </div>
  );
}
