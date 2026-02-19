import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Droplets, Activity, Ruler, AlertTriangle,
  CheckCircle, Clock, TrendingUp, Zap, Map,
  ChevronRight, Star, Lock,
} from "lucide-react";
import { IMD_RAINFALL_DATA } from "@/lib/drainage-calculations";

interface DrainageProject {
  id: string;
  name: string;
  ward: string;
  catchmentArea: number;
  peakRunoff: number;
  pipeLength: number;
  floodRiskScore: number;
  status: "optimized" | "draft" | "review";
  nbcCompliant: boolean;
  totalCost: number;
  createdAt: string;
  isPro?: boolean;
}

const SAMPLE_PROJECTS: DrainageProject[] = [
  {
    id: "p1",
    name: "Koramangala Ward 68 – Trunk Drain",
    ward: "Koramangala",
    catchmentArea: 24.5,
    peakRunoff: 6.81,
    pipeLength: 1240,
    floodRiskScore: 38,
    status: "optimized",
    nbcCompliant: true,
    totalCost: 42.3,
    createdAt: "2025-02-12",
  },
  {
    id: "p2",
    name: "HSR Layout Sector 5 – Secondary Drain",
    ward: "HSR Layout",
    catchmentArea: 11.2,
    peakRunoff: 2.18,
    pipeLength: 680,
    floodRiskScore: 61,
    status: "review",
    nbcCompliant: false,
    totalCost: 19.7,
    createdAt: "2025-02-08",
  },
  {
    id: "p3",
    name: "Whitefield IT Corridor – Stormwater",
    ward: "Whitefield",
    catchmentArea: 38.0,
    peakRunoff: 11.4,
    pipeLength: 2100,
    floodRiskScore: 74,
    status: "draft",
    nbcCompliant: false,
    totalCost: 89.1,
    createdAt: "2025-01-29",
    isPro: true,
  },
];

const RISK_COLOR = (score: number) => {
  if (score < 40) return "text-success border-success/30 bg-success/10";
  if (score < 65) return "text-warning border-warning/30 bg-warning/10";
  return "text-destructive border-destructive/30 bg-destructive/10";
};

const RISK_LABEL = (score: number) => score < 40 ? "Low" : score < 65 ? "Medium" : "High";

const STATUS_STYLES: Record<string, string> = {
  optimized: "bg-success/10 text-success border-success/30",
  draft: "bg-muted text-muted-foreground border-border",
  review: "bg-warning/10 text-warning border-warning/30",
};

interface DrainageDashboardProps {
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
}

export function DrainageDashboard({ onOpenProject, onNewProject }: DrainageDashboardProps) {
  const [projects] = useState<DrainageProject[]>(SAMPLE_PROJECTS);
  const freeProjectCount = projects.filter((p) => !p.isPro).length;

  const stats = {
    totalArea: projects.reduce((s, p) => s + p.catchmentArea, 0),
    avgRisk: Math.round(projects.reduce((s, p) => s + p.floodRiskScore, 0) / projects.length),
    totalLength: projects.reduce((s, p) => s + p.pipeLength, 0),
    totalCost: projects.reduce((s, p) => s + p.totalCost, 0),
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 bg-background">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Drainage Design</h1>
          </div>
          <p className="text-muted-foreground text-sm">NBC 2016 · BBMP Bylaws · IMD Data</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
            Free: {freeProjectCount}/3
          </Badge>
          <button className="text-xs text-muted-foreground hover:text-accent transition-colors">Upgrade →</button>
        </div>
      </div>

      {/* IMD Alert Banner */}
      <div className="mb-5 rounded-xl border border-warning/30 bg-warning/5 p-3 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-warning">IMD Monsoon Alert – Bengaluru</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Forecast: {IMD_RAINFALL_DATA.monsoon_avg}mm/hr design storm. Peak season: {IMD_RAINFALL_DATA.peak_month}.
            Annual avg: {IMD_RAINFALL_DATA.annual_avg_mm}mm.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Total Catchment", value: `${stats.totalArea.toFixed(1)} ha`, icon: Map, color: "text-accent" },
          { label: "Avg Flood Risk", value: `${stats.avgRisk}/100`, icon: Activity, color: stats.avgRisk > 60 ? "text-destructive" : "text-success" },
          { label: "Pipe Network", value: `${(stats.totalLength / 1000).toFixed(2)} km`, icon: Ruler, color: "text-secondary" },
          { label: "Total Cost Est.", value: `₹${stats.totalCost.toFixed(1)}L`, icon: TrendingUp, color: "text-warning" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* New Project Buttons */}
      <div className="flex gap-2 mb-5">
        <Button onClick={onNewProject} className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
        <Button
          onClick={onNewProject}
          variant="outline"
          className="flex-1 gap-2 border-accent/30 text-accent hover:bg-accent/10"
        >
          <Zap className="w-4 h-4" />
          Bengaluru Flood Quick-Start
        </Button>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Your Projects</h2>
          <span className="text-xs text-muted-foreground">{projects.length} total</span>
        </div>

        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onOpenProject(project.id)}
            className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 group"
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{project.name}</h3>
                  {project.isPro && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning/10 border border-warning/30">
                      <Lock className="w-2.5 h-2.5 text-warning" />
                      <span className="text-[10px] text-warning font-medium">PRO</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{project.ward} · {project.createdAt}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-0.5" />
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: "Area", value: `${project.catchmentArea}ha` },
                { label: "Runoff", value: `${project.peakRunoff}m³/s` },
                { label: "Length", value: `${project.pipeLength}m` },
                { label: "Cost", value: `₹${project.totalCost}L` },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-xs font-semibold text-foreground">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Bottom row: risk + status + compliance */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${RISK_COLOR(project.floodRiskScore)}`}>
                <Activity className="w-3 h-3" />
                {RISK_LABEL(project.floodRiskScore)} Risk · {project.floodRiskScore}
              </div>
              <div className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${STATUS_STYLES[project.status]}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </div>
              {project.nbcCompliant ? (
                <CheckCircle className="w-3.5 h-3.5 text-success ml-auto" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-warning ml-auto" />
              )}
            </div>

            {/* Flood risk progress bar */}
            <div className="mt-2">
              <Progress
                value={project.floodRiskScore}
                className="h-1"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Upgrade nudge */}
      <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4 text-center">
        <Star className="w-5 h-5 text-accent mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">Upgrade to Pro</p>
        <p className="text-xs text-muted-foreground mb-3">
          Unlimited projects · AutoCAD export · Priority IMD data · BBMP submission reports
        </p>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
          ₹2,499/month · Get Pro
        </Button>
      </div>
    </div>
  );
}
