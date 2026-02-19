import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Download, FileText, Code, TrendingUp,
  Package, Wrench, IndianRupee, AlertTriangle,
} from "lucide-react";
import {
  type DrainageNetwork,
  getCostBreakdown,
  BENGALURU_RATES,
} from "@/lib/drainage-calculations";

interface CostExportPanelProps {
  network: DrainageNetwork | null;
}

export function CostExportPanel({ network }: CostExportPanelProps) {
  const breakdown = useMemo(() => (network ? getCostBreakdown(network) : null), [network]);

  const exportCSV = () => {
    if (!network) return;
    const header = "Pipe ID,From,To,Diameter(mm),Material,Length(m),Slope(%),Velocity(m/s),Fill Ratio,Risk Score\n";
    const rows = network.pipes
      .map((p) =>
        `${p.id},${p.fromNode},${p.toNode},${p.diameter},${p.material},${p.length.toFixed(1)},${p.slope.toFixed(2)},${p.velocity.toFixed(2)},${(p.fillRatio * 100).toFixed(0)}%,${p.riskScore}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drainage_schedule.csv";
    a.click();
  };

  const exportDXF = () => {
    if (!network) return;
    // Simplified DXF stub (real DXF needs more precision)
    let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
    network.pipes.forEach((pipe, i) => {
      const m1 = network.manholes[i];
      const m2 = network.manholes[i + 1];
      if (!m1 || !m2) return;
      dxf += `0\nLINE\n8\nDRAINAGE_PIPES\n`;
      dxf += `10\n${m1.x.toFixed(2)}\n20\n${m1.y.toFixed(2)}\n30\n0.0\n`;
      dxf += `11\n${m2.x.toFixed(2)}\n21\n${m2.y.toFixed(2)}\n31\n0.0\n`;
    });
    dxf += "0\nENDSEC\n0\nEOF\n";
    const blob = new Blob([dxf], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drainage_network.dxf";
    a.click();
  };

  const exportJSON = () => {
    if (!network) return;
    const blob = new Blob([JSON.stringify(network, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drainage_network.json";
    a.click();
  };

  if (!network || !breakdown) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <IndianRupee className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Cost Estimate & Export</p>
        <p className="text-xs text-muted-foreground">
          Generate an optimized network first to see Bengaluru-rate cost breakdown and export options.
        </p>
      </div>
    );
  }

  const costItems = [
    { label: "Pipe Material", value: breakdown.pipeMaterial, icon: Package, color: "text-accent" },
    { label: "Manholes", value: breakdown.manholes, icon: Wrench, color: "text-secondary" },
    { label: "Excavation", value: breakdown.excavation, icon: TrendingUp, color: "text-warning" },
    { label: "Backfill & Bedding", value: breakdown.backfill, icon: Package, color: "text-muted-foreground" },
    { label: "Labor", value: breakdown.labor, icon: Wrench, color: "text-success" },
  ];

  const maxVal = Math.max(...costItems.map((c) => c.value));

  return (
    <div className="space-y-4">
      {/* Cost Breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-accent" />
            Cost Estimate (Bengaluru SOR 2024-25)
          </h3>
          <div className="text-right">
            <p className="text-lg font-bold text-accent font-mono">₹{breakdown.total}L</p>
            <p className="text-[10px] text-muted-foreground">Total (₹ Lakhs)</p>
          </div>
        </div>

        <div className="space-y-3">
          {costItems.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-3 h-3 ${item.color}`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <span className={`text-xs font-mono font-semibold ${item.color}`}>
                  ₹{item.value}L
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-current transition-all"
                  style={{
                    width: `${(item.value / maxVal) * 100}%`,
                    color: "currentColor",
                    backgroundColor: "currentColor",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rate reference */}
        <div className="mt-4 p-2 rounded-lg bg-muted/50 space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">BBMP Rates Reference</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground font-mono">
            <span>Cement: ₹{BENGALURU_RATES.cement_per_bag}/bag</span>
            <span>Labor: ₹{BENGALURU_RATES.labor_per_day}/day</span>
            <span>Excavation: ₹{BENGALURU_RATES.excavation_per_m3}/m³</span>
            <span>PVC 300mm: ₹{BENGALURU_RATES.pvc_pipe_per_m[300]}/m</span>
          </div>
        </div>
      </div>

      {/* Optimization savings */}
      <div className="rounded-xl border border-success/20 bg-success/5 p-3 flex items-start gap-3">
        <TrendingUp className="w-4 h-4 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-success">Optimizer Savings</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Genetic algorithm reduced total cost vs. manual sizing by selecting optimal diameters per NBC constraints.
            Pipes sized to ≤80% capacity with self-cleansing velocity ≥0.6 m/s.
          </p>
        </div>
      </div>

      {/* Pro export warning */}
      <div className="rounded-xl border border-warning/20 bg-warning/5 p-3 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-warning font-medium">PDF & AutoCAD DWG export requires Pro plan</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Free tier: CSV schedule + JSON + DXF stub. Upgrade for full Civil 3D / AutoCAD DWG, stamped PDF reports, and BBMP submission format.
          </p>
        </div>
      </div>

      {/* Export buttons */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Export (Free)</p>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={exportCSV} variant="outline" size="sm" className="gap-1.5 text-xs flex-col h-auto py-3 border-border">
            <FileText className="w-4 h-4 text-accent" />
            <span>CSV Schedule</span>
          </Button>
          <Button onClick={exportDXF} variant="outline" size="sm" className="gap-1.5 text-xs flex-col h-auto py-3 border-border">
            <Code className="w-4 h-4 text-secondary" />
            <span>DXF / Civil 3D</span>
          </Button>
          <Button onClick={exportJSON} variant="outline" size="sm" className="gap-1.5 text-xs flex-col h-auto py-3 border-border">
            <Download className="w-4 h-4 text-warning" />
            <span>JSON Data</span>
          </Button>
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3">Export (Pro)</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Stamped PDF Report", icon: FileText },
            { label: "AutoCAD DWG", icon: Code },
          ].map((b) => (
            <Button
              key={b.label}
              variant="outline"
              size="sm"
              disabled
              className="gap-1.5 text-xs py-3 h-auto flex-col opacity-50 border-dashed"
            >
              <b.icon className="w-4 h-4" />
              <span>{b.label}</span>
              <span className="text-[10px] text-warning">PRO</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
