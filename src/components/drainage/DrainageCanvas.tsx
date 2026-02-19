import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Zap, RotateCcw, Eye, Layers, Crosshair,
  Circle, Minus, ChevronDown, Info,
} from "lucide-react";
import {
  type CatchmentParams,
  type DrainageNetwork,
  runGeneticOptimizer,
  IMD_RAINFALL_DATA,
} from "@/lib/drainage-calculations";

// ─── Bengaluru Ward mock coordinates (normalized 0-1) ───
const BENGALURU_FEATURES = {
  roads: [
    { from: [0.1, 0.3], to: [0.9, 0.3], label: "Outer Ring Road" },
    { from: [0.3, 0.1], to: [0.3, 0.9], label: "Hosur Road" },
    { from: [0.1, 0.6], to: [0.9, 0.6], label: "Sarjapur Road" },
    { from: [0.6, 0.1], to: [0.6, 0.9], label: "Old Airport Road" },
    { from: [0.2, 0.2], to: [0.8, 0.8], label: "Diagonal Ave" },
  ],
  catchmentBoundary: [
    [0.15, 0.15], [0.85, 0.15], [0.85, 0.85], [0.15, 0.85],
  ] as [number, number][],
  lowPoints: [[0.5, 0.5], [0.3, 0.6], [0.7, 0.4]] as [number, number][],
};

// ─── Velocity → color heatmap ───
function velocityColor(v: number): string {
  if (v < 0.6) return "#ef4444"; // red – too slow
  if (v < 0.9) return "#f59e0b"; // amber
  if (v < 1.8) return "#22c55e"; // green – optimal
  if (v < 2.5) return "#3b82f6"; // blue – fast
  return "#a855f7"; // purple – too fast
}

interface DrainageCanvasProps {
  initialParams?: Partial<CatchmentParams>;
  onOptimized?: (network: DrainageNetwork) => void;
}

export function DrainageCanvas({ initialParams, onOptimized }: DrainageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [params, setParams] = useState<CatchmentParams>({
    area: initialParams?.area ?? 18.5,
    runoffCoeff: initialParams?.runoffCoeff ?? 0.65,
    rainfallIntensity: initialParams?.rainfallIntensity ?? IMD_RAINFALL_DATA.monsoon_avg,
    slope: initialParams?.slope ?? 1.2,
    soilType: initialParams?.soilType ?? "clay",
    landUse: initialParams?.landUse ?? "residential",
  });

  const [network, setNetwork] = useState<DrainageNetwork | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [viewMode, setViewMode] = useState<"2d" | "velocity" | "risk">("2d");
  const [animOffset, setAnimOffset] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [progress, setProgress] = useState(0);

  // ─── Run optimizer ───
  const runOptimizer = () => {
    setOptimizing(true);
    setProgress(0);

    let gen = 0;
    const totalGen = 50;
    const interval = setInterval(() => {
      gen++;
      setProgress(Math.round((gen / totalGen) * 100));
      if (gen >= totalGen) {
        clearInterval(interval);
        const result = runGeneticOptimizer(params, 9, totalGen);
        setNetwork(result.network);
        setOptimizing(false);
        setProgress(100);
        onOptimized?.(result.network);
      }
    }, 40);
  };

  // ─── Animate flow arrows ───
  useEffect(() => {
    const id = setInterval(() => setAnimOffset((o) => (o + 1) % 30), 60);
    return () => clearInterval(id);
  }, []);

  // ─── Canvas render ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const toX = (n: number) => n * W;
    const toY = (n: number) => n * H;

    // Background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, W, H);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(34,197,94,0.07)";
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx <= 10; gx++) {
        ctx.beginPath();
        ctx.moveTo((gx / 10) * W, 0);
        ctx.lineTo((gx / 10) * W, H);
        ctx.stroke();
      }
      for (let gy = 0; gy <= 10; gy++) {
        ctx.beginPath();
        ctx.moveTo(0, (gy / 10) * H);
        ctx.lineTo(W, (gy / 10) * H);
        ctx.stroke();
      }
    }

    // Catchment boundary
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,212,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    BENGALURU_FEATURES.catchmentBoundary.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(toX(x), toY(y));
      else ctx.lineTo(toX(x), toY(y));
    });
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    // Catchment fill
    ctx.fillStyle = "rgba(0,212,255,0.03)";
    ctx.fill();

    // Roads
    BENGALURU_FEATURES.roads.forEach((road) => {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(100,116,139,0.5)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.moveTo(toX(road.from[0]), toY(road.from[1]));
      ctx.lineTo(toX(road.to[0]), toY(road.to[1]));
      ctx.stroke();
    });

    // Rainfall heatmap if network exists
    if (network && viewMode === "risk") {
      const grad = ctx.createRadialGradient(toX(0.5), toY(0.5), 0, toX(0.5), toY(0.5), toX(0.35));
      const risk = network.floodRiskScore;
      const alpha = risk / 100 * 0.35;
      grad.addColorStop(0, `rgba(239,68,68,${alpha})`);
      grad.addColorStop(0.5, `rgba(251,146,60,${alpha * 0.5})`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Pipes
    if (network) {
      network.pipes.forEach((pipe, i) => {
        const mhFrom = network.manholes[i];
        const mhTo = network.manholes[i + 1];
        if (!mhFrom || !mhTo) return;

        const x1 = toX(mhFrom.x / W);
        const y1 = toY(mhFrom.y / H);
        const x2 = toX(mhTo.x / W);
        const y2 = toY(mhTo.y / H);

        const thickness = Math.max(2, pipe.diameter / 120);
        const color = viewMode === "velocity" ? velocityColor(pipe.velocity) : "#00d4ff";

        // Pipe line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.globalAlpha = 0.85;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Flow arrows (animated)
        if (viewMode !== "risk") {
          const dx = x2 - x1, dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / len, ny = dy / len;
          const numArrows = Math.floor(len / 28);
          for (let a = 0; a < numArrows; a++) {
            const t = ((a + animOffset / 30) % numArrows) / numArrows;
            const ax = x1 + dx * t;
            const ay = y1 + dy * t;
            const arrowLen = 6;
            ctx.beginPath();
            ctx.strokeStyle = viewMode === "velocity" ? color : "#22c55e";
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            ctx.moveTo(ax - nx * arrowLen - ny * 4, ay - ny * arrowLen + nx * 4);
            ctx.lineTo(ax, ay);
            ctx.lineTo(ax - nx * arrowLen + ny * 4, ay - ny * arrowLen - nx * 4);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }

        // Diameter label
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "9px JetBrains Mono, monospace";
        ctx.fillText(`Ø${pipe.diameter}`, (x1 + x2) / 2 - 10, (y1 + y2) / 2 - 5);
      });

      // Manholes
      network.manholes.forEach((mh) => {
        const mx = toX(mh.x / W);
        const my = toY(mh.y / H);
        const risk = mh.floodRisk;
        const color = risk < 40 ? "#22c55e" : risk < 65 ? "#f59e0b" : "#ef4444";

        // Outer glow
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 14);
        glow.addColorStop(0, `${color}40`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mx, my, 14, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#0d1117";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "bold 8px JetBrains Mono, monospace";
        ctx.fillText(mh.id, mx + 8, my - 6);
      });
    } else {
      // Placeholder nodes
      BENGALURU_FEATURES.lowPoints.forEach(([x, y]) => {
        const px = toX(x);
        const py = toY(y);
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.3)";
        ctx.fill();
        ctx.strokeStyle = "#00d4ff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // "Run optimizer" hint
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = "13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Configure parameters → Run Auto-Optimizer", W / 2, H / 2);
      ctx.textAlign = "left";
    }

    // Crosshair overlay
    ctx.strokeStyle = "rgba(0,212,255,0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    ctx.stroke();

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [network, viewMode, animOffset, showGrid, params]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          onClick={runOptimizer}
          disabled={optimizing}
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow"
          size="sm"
        >
          <Zap className="w-3.5 h-3.5" />
          {optimizing ? `Optimizing… ${progress}%` : "Auto-Optimize"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border"
          onClick={() => setNetwork(null)}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>

        {/* View mode */}
        <div className="flex gap-1 ml-auto">
          {(["2d", "velocity", "risk"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === m
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "2d" ? "2D Flow" : m === "velocity" ? "Velocity" : "Risk"}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-1.5 rounded text-xs transition-colors ${showGrid ? "text-accent" : "text-muted-foreground"}`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optimization progress */}
      {optimizing && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Genetic Algorithm · Generation {Math.round(progress / 2)}/50</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-100 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-border/50">
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full"
          style={{ background: "#0d1117" }}
        />

        {/* Legend */}
        {viewMode === "velocity" && (
          <div className="absolute top-2 left-2 bg-black/70 rounded-lg p-2 text-xs space-y-1 backdrop-blur-sm border border-white/10">
            <p className="font-semibold text-white/80 mb-1">Velocity Heatmap</p>
            {[
              { c: "#ef4444", l: "< 0.6 m/s (too slow)" },
              { c: "#f59e0b", l: "0.6–0.9 m/s" },
              { c: "#22c55e", l: "0.9–1.8 m/s (optimal)" },
              { c: "#3b82f6", l: "1.8–2.5 m/s" },
              { c: "#a855f7", l: "> 2.5 m/s (erosion risk)" },
            ].map((e) => (
              <div key={e.l} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: e.c }} />
                <span className="text-white/60">{e.l}</span>
              </div>
            ))}
          </div>
        )}

        {/* Network summary badge */}
        {network && (
          <div className="absolute bottom-2 right-2 bg-black/70 rounded-lg px-3 py-2 backdrop-blur-sm border border-accent/20">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-accent font-mono">{network.pipes.length} pipes</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-success font-mono">{network.totalPipeLength}m</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-warning font-mono">₹{network.totalCost}L</span>
              {network.nbcCompliant && (
                <Badge className="bg-success/10 text-success border-success/30 text-[10px] py-0">NBC ✓</Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Parameters Panel */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-accent" />
          Catchment Parameters
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Catchment area */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Catchment Area (ha)</Label>
            <Input
              type="number"
              value={params.area}
              onChange={(e) => setParams((p) => ({ ...p, area: parseFloat(e.target.value) || 0 }))}
              className="h-8 text-sm font-mono"
            />
          </div>

          {/* Rainfall intensity */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Rainfall Intensity (mm/hr)
              <span className="ml-1 text-accent text-[10px]">IMD</span>
            </Label>
            <Input
              type="number"
              value={params.rainfallIntensity}
              onChange={(e) => setParams((p) => ({ ...p, rainfallIntensity: parseFloat(e.target.value) || 100 }))}
              className="h-8 text-sm font-mono"
            />
          </div>

          {/* Slope */}
          <div className="space-y-2 col-span-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Average Slope (%)</Label>
              <span className="text-xs font-mono text-accent">{params.slope.toFixed(1)}%</span>
            </div>
            <Slider
              value={[params.slope]}
              onValueChange={([v]) => setParams((p) => ({ ...p, slope: v }))}
              min={0.3} max={10} step={0.1}
              className="accent-accent"
            />
          </div>

          {/* Runoff coefficient */}
          <div className="space-y-2 col-span-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Runoff Coefficient (C)</Label>
              <span className="text-xs font-mono text-accent">{params.runoffCoeff.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.runoffCoeff]}
              onValueChange={([v]) => setParams((p) => ({ ...p, runoffCoeff: v }))}
              min={0.1} max={0.9} step={0.01}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.1 (rural)</span>
              <span>0.5 (mixed)</span>
              <span>0.9 (paved)</span>
            </div>
          </div>

          {/* Soil type */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Soil Type</Label>
            <Select value={params.soilType} onValueChange={(v: CatchmentParams["soilType"]) => setParams((p) => ({ ...p, soilType: v }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clay">Clay (Bengaluru Red)</SelectItem>
                <SelectItem value="loam">Loam</SelectItem>
                <SelectItem value="sandy">Sandy</SelectItem>
                <SelectItem value="rocky">Rocky / Granite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Land use */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Land Use</Label>
            <Select value={params.landUse} onValueChange={(v: CatchmentParams["landUse"]) => setParams((p) => ({ ...p, landUse: v }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="mixed">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pipe network table */}
      {network && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Optimized Pipe Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Pipe", "Dia (mm)", "Material", "L (m)", "v (m/s)", "Fill %", "Risk"].map((h) => (
                    <th key={h} className="text-left py-2 pr-3 text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {network.pipes.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 pr-3 font-mono text-foreground">{p.id}</td>
                    <td className="py-2 pr-3 font-mono text-accent">{p.diameter}</td>
                    <td className="py-2 pr-3 text-foreground">{p.material}</td>
                    <td className="py-2 pr-3 font-mono">{p.length.toFixed(1)}</td>
                    <td className="py-2 pr-3 font-mono" style={{ color: velocityColor(p.velocity) }}>
                      {p.velocity.toFixed(2)}
                    </td>
                    <td className="py-2 pr-3 font-mono">
                      <span className={p.fillRatio > 0.75 ? "text-warning" : "text-success"}>
                        {(p.fillRatio * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        p.riskScore < 40 ? "bg-success/10 text-success" :
                        p.riskScore < 65 ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {p.riskScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
