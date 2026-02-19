import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrainageDashboard } from "@/components/drainage/DrainageDashboard";
import { DrainageCanvas } from "@/components/drainage/DrainageCanvas";
import { PipeNetwork3D } from "@/components/drainage/PipeNetwork3D";
import { CompliancePanel } from "@/components/drainage/CompliancePanel";
import { CostExportPanel } from "@/components/drainage/CostExportPanel";
import { type DrainageNetwork, IMD_RAINFALL_DATA } from "@/lib/drainage-calculations";
import { LayoutDashboard, PenTool, Box, Shield, IndianRupee, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DrainageView() {
  const [screen, setScreen] = useState<"dashboard" | "canvas">("dashboard");
  const [activeTab, setActiveTab] = useState("canvas");
  const [network, setNetwork] = useState<DrainageNetwork | null>(null);
  const [projectName, setProjectName] = useState("New Bengaluru Project");

  // Prefilled params for "Bengaluru Flood Quick-Start"
  const bengaluruDefaults = {
    area: 22.0,
    runoffCoeff: 0.70,
    rainfallIntensity: IMD_RAINFALL_DATA.monsoon_avg,
    slope: 1.0,
    soilType: "clay" as const,
    landUse: "mixed" as const,
  };

  const handleNewProject = () => {
    setProjectName("Bengaluru Flood Quick-Start – " + new Date().toLocaleDateString("en-IN"));
    setNetwork(null);
    setScreen("canvas");
    setActiveTab("canvas");
  };

  const handleOpenProject = (id: string) => {
    setProjectName(`Project ${id}`);
    setScreen("canvas");
    setActiveTab("canvas");
  };

  if (screen === "dashboard") {
    return (
      <DrainageDashboard
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScreen("dashboard")}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">{projectName}</h1>
            <p className="text-[10px] text-muted-foreground">Drainage Design Optimizer · NBC 2016 · BBMP</p>
          </div>
          {network && (
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full border font-medium ${network.nbcCompliant ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30"}`}>
                {network.nbcCompliant ? "NBC ✓" : "NBC ⚠"}
              </span>
              <span className="text-muted-foreground font-mono">₹{network.totalCost}L</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="canvas" className="text-[10px] sm:text-xs gap-1 px-1">
              <PenTool className="w-3 h-3 hidden sm:block" />
              Design
            </TabsTrigger>
            <TabsTrigger value="3d" className="text-[10px] sm:text-xs gap-1 px-1" disabled={!network}>
              <Box className="w-3 h-3 hidden sm:block" />
              3D View
            </TabsTrigger>
            <TabsTrigger value="compliance" className="text-[10px] sm:text-xs gap-1 px-1">
              <Shield className="w-3 h-3 hidden sm:block" />
              NBC
            </TabsTrigger>
            <TabsTrigger value="cost" className="text-[10px] sm:text-xs gap-1 px-1">
              <IndianRupee className="w-3 h-3 hidden sm:block" />
              Cost
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-[10px] sm:text-xs gap-1 px-1" onClick={() => setScreen("dashboard")}>
              <LayoutDashboard className="w-3 h-3 hidden sm:block" />
              Projects
            </TabsTrigger>
          </TabsList>

          {/* Design Canvas */}
          <TabsContent value="canvas" className="mt-0">
            <DrainageCanvas
              initialParams={bengaluruDefaults}
              onOptimized={(n) => {
                setNetwork(n);
                // Auto-switch to 3D after first optimization
              }}
            />
          </TabsContent>

          {/* 3D Viewer */}
          <TabsContent value="3d" className="mt-0">
            {network ? (
              <div className="space-y-3">
                <PipeNetwork3D network={network} />
                <div className="rounded-xl border border-border bg-card p-3 grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Peak Runoff", value: `${network.peakRunoff} m³/s` },
                    { label: "Total Length", value: `${network.totalPipeLength} m` },
                    { label: "Flood Risk", value: `${network.floodRiskScore}/100` },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-xs font-semibold text-accent">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Nodes colored by flood risk · Flow particles animate at pipe velocity · Diameter labels in mm
                </p>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Run the optimizer on the Design tab first.
              </div>
            )}
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance" className="mt-0">
            <CompliancePanel network={network} />
          </TabsContent>

          {/* Cost & Export */}
          <TabsContent value="cost" className="mt-0">
            <CostExportPanel network={network} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
