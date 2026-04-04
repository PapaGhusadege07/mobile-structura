import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type BeamInput, type ColumnInput, type FootingInput, type SlabInput,
  type BeamDesignResult, type ColumnDesignResult, type FootingDesignResult, type SlabDesignResult,
} from "@/lib/structural-calculations";
import { PenTool } from "lucide-react";

interface Drawing2DProps {
  type: "beam" | "column" | "footing" | "slab";
  input: BeamInput | ColumnInput | FootingInput | SlabInput;
  result: BeamDesignResult | ColumnDesignResult | FootingDesignResult | SlabDesignResult;
}

function BeamDrawing({ input, result }: { input: BeamInput; result: BeamDesignResult }) {
  const svgW = 600, svgH = 400;
  const margin = 60;
  const bW = svgW - 2 * margin; // beam length in svg
  const bH = 120; // beam depth in svg
  const bTop = 100;
  const bLeft = margin;

  const tensionCount = parseInt(result.reinforcement.tensionBars) || 3;
  const tensionDia = parseInt(result.reinforcement.tensionBars.match(/(\d+)mm/)?.[1] || "16");
  const compCount = parseInt(result.reinforcement.compressionBars) || 2;
  const compDia = parseInt(result.reinforcement.compressionBars.match(/(\d+)mm/)?.[1] || "12");

  // Cross section
  const csLeft = bLeft + bW + 20;
  const csTop = bTop;
  const csW = 80;
  const csH = bH;

  return (
    <svg viewBox={`0 0 ${svgW + 140} ${svgH}`} className="w-full h-auto bg-background rounded-lg border border-border">
      {/* Title */}
      <text x={svgW / 2} y={25} textAnchor="middle" className="fill-foreground text-xs font-bold">
        BEAM - Longitudinal Section & Cross Section
      </text>

      {/* Longitudinal Section */}
      <rect x={bLeft} y={bTop} width={bW} height={bH} fill="none" stroke="currentColor" strokeWidth={2} className="stroke-foreground" />

      {/* Dimensions */}
      <line x1={bLeft} y1={bTop + bH + 30} x2={bLeft + bW} y2={bTop + bH + 30} stroke="currentColor" strokeWidth={1} className="stroke-muted-foreground" markerEnd="url(#arrow)" markerStart="url(#arrowRev)" />
      <text x={bLeft + bW / 2} y={bTop + bH + 50} textAnchor="middle" className="fill-muted-foreground text-[10px]">{input.spanLength * 1000} mm</text>

      {/* Depth dimension */}
      <line x1={bLeft - 20} y1={bTop} x2={bLeft - 20} y2={bTop + bH} stroke="currentColor" strokeWidth={1} className="stroke-muted-foreground" />
      <text x={bLeft - 35} y={bTop + bH / 2} textAnchor="middle" transform={`rotate(-90, ${bLeft - 35}, ${bTop + bH / 2})`} className="fill-muted-foreground text-[10px]">{input.depth} mm</text>

      {/* Tension bars (bottom) */}
      {Array.from({ length: tensionCount }).map((_, i) => {
        const spacing = (bW - 40) / Math.max(tensionCount - 1, 1);
        const x1 = bLeft + 20 + (tensionCount === 1 ? (bW - 40) / 2 : i * spacing);
        return (
          <line key={`tb-${i}`} x1={x1} y1={bTop + bH - 15} x2={x1} y2={bTop + bH - 15}
            stroke="#0ea5e9" strokeWidth={1} />
        );
      })}
      {/* Bottom bars as line */}
      <line x1={bLeft + 10} y1={bTop + bH - 15} x2={bLeft + bW - 10} y2={bTop + bH - 15} stroke="#0ea5e9" strokeWidth={3} />
      <text x={bLeft + bW / 2} y={bTop + bH - 3} textAnchor="middle" fill="#0ea5e9" className="text-[9px] font-mono">
        {result.reinforcement.tensionBars} (Bottom)
      </text>

      {/* Top bars */}
      <line x1={bLeft + 10} y1={bTop + 15} x2={bLeft + bW - 10} y2={bTop + 15} stroke="#22c55e" strokeWidth={2} />
      <text x={bLeft + bW / 2} y={bTop + 30} textAnchor="middle" fill="#22c55e" className="text-[9px] font-mono">
        {result.reinforcement.compressionBars} (Top)
      </text>

      {/* Stirrups */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = bLeft + 30 + i * ((bW - 60) / 7);
        return (
          <rect key={`str-${i}`} x={x - 1} y={bTop + 8} width={2} height={bH - 16}
            fill="#f59e0b" opacity={0.6} />
        );
      })}
      <text x={bLeft + bW / 2} y={bTop + bH / 2 + 5} textAnchor="middle" fill="#f59e0b" className="text-[9px] font-mono">
        {result.reinforcement.stirrups}
      </text>

      {/* Cross Section */}
      <text x={csLeft + csW / 2} y={csTop - 10} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Cross Section
      </text>
      <rect x={csLeft} y={csTop} width={csW} height={csH} fill="none" stroke="currentColor" strokeWidth={2} className="stroke-foreground" />

      {/* Width label */}
      <text x={csLeft + csW / 2} y={csTop + csH + 20} textAnchor="middle" className="fill-muted-foreground text-[9px]">{input.width} mm</text>

      {/* CS tension bars */}
      {Array.from({ length: Math.min(tensionCount, 5) }).map((_, i) => {
        const spacing = (csW - 20) / Math.max(Math.min(tensionCount, 5) - 1, 1);
        const cx = csLeft + 10 + i * spacing;
        return <circle key={`csb-${i}`} cx={cx} cy={csTop + csH - 12} r={4} fill="#0ea5e9" />;
      })}

      {/* CS top bars */}
      {Array.from({ length: Math.min(compCount, 4) }).map((_, i) => {
        const spacing = (csW - 20) / Math.max(Math.min(compCount, 4) - 1, 1);
        const cx = csLeft + 10 + i * spacing;
        return <circle key={`cst-${i}`} cx={cx} cy={csTop + 12} r={3} fill="#22c55e" />;
      })}

      {/* CS stirrup outline */}
      <rect x={csLeft + 5} y={csTop + 5} width={csW - 10} height={csH - 10} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />

      {/* Arrow markers */}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="currentColor" strokeWidth={1} className="stroke-muted-foreground" />
        </marker>
        <marker id="arrowRev" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M8,0 L0,3 L8,6" fill="none" stroke="currentColor" strokeWidth={1} className="stroke-muted-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

function ColumnDrawing({ input, result }: { input: ColumnInput; result: ColumnDesignResult }) {
  const svgW = 500, svgH = 400;
  const margin = 60;
  const colW = 80;
  const colH = 250;
  const colLeft = margin + 40;
  const colTop = 50;

  const barCount = parseInt(result.reinforcement.mainBars) || 4;
  const barDia = parseInt(result.reinforcement.mainBars.match(/(\d+)mm/)?.[1] || "16");

  // Cross section
  const csLeft = colLeft + colW + 80;
  const csTop2 = 120;
  const csW2 = 100;
  const csH2 = 100;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto bg-background rounded-lg border border-border">
      <text x={svgW / 2} y={25} textAnchor="middle" className="fill-foreground text-xs font-bold">
        COLUMN - Elevation & Cross Section
      </text>

      {/* Elevation */}
      <rect x={colLeft} y={colTop} width={colW} height={colH} fill="none" stroke="currentColor" strokeWidth={2} className="stroke-foreground" />

      {/* Height */}
      <line x1={colLeft - 20} y1={colTop} x2={colLeft - 20} y2={colTop + colH} stroke="currentColor" strokeWidth={1} className="stroke-muted-foreground" />
      <text x={colLeft - 35} y={colTop + colH / 2} textAnchor="middle" transform={`rotate(-90, ${colLeft - 35}, ${colTop + colH / 2})`} className="fill-muted-foreground text-[10px]">{input.height * 1000} mm</text>

      {/* Width */}
      <text x={colLeft + colW / 2} y={colTop + colH + 20} textAnchor="middle" className="fill-muted-foreground text-[9px]">{input.width} mm</text>

      {/* Main bars in elevation */}
      <line x1={colLeft + 10} y1={colTop + 5} x2={colLeft + 10} y2={colTop + colH - 5} stroke="#0ea5e9" strokeWidth={3} />
      <line x1={colLeft + colW - 10} y1={colTop + 5} x2={colLeft + colW - 10} y2={colTop + colH - 5} stroke="#0ea5e9" strokeWidth={3} />

      {/* Ties */}
      {Array.from({ length: 7 }).map((_, i) => {
        const y = colTop + 15 + i * ((colH - 30) / 6);
        return <line key={`tie-${i}`} x1={colLeft + 5} y1={y} x2={colLeft + colW - 5} y2={y} stroke="#f59e0b" strokeWidth={1.5} />;
      })}

      <text x={colLeft + colW / 2} y={colTop + colH / 2} textAnchor="middle" fill="#f59e0b" className="text-[9px] font-mono">
        {result.reinforcement.ties}
      </text>

      {/* Cross Section */}
      <text x={csLeft + csW2 / 2} y={csTop2 - 10} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Cross Section
      </text>
      <rect x={csLeft} y={csTop2} width={csW2} height={csH2} fill="none" stroke="currentColor" strokeWidth={2} className="stroke-foreground" />
      <text x={csLeft + csW2 / 2} y={csTop2 + csH2 + 15} textAnchor="middle" className="fill-muted-foreground text-[9px]">{input.width}×{input.depth} mm</text>

      {/* Corner bars */}
      {[[12, 12], [csW2 - 12, 12], [12, csH2 - 12], [csW2 - 12, csH2 - 12]].map(([cx, cy], i) => (
        <circle key={i} cx={csLeft + cx} cy={csTop2 + cy} r={5} fill="#0ea5e9" />
      ))}
      {barCount > 4 && [[csW2 / 2, 12], [csW2 / 2, csH2 - 12]].map(([cx, cy], i) => (
        <circle key={`e-${i}`} cx={csLeft + cx} cy={csTop2 + cy} r={4} fill="#0ea5e9" />
      ))}
      {barCount > 6 && [[12, csH2 / 2], [csW2 - 12, csH2 / 2]].map(([cx, cy], i) => (
        <circle key={`f-${i}`} cx={csLeft + cx} cy={csTop2 + cy} r={4} fill="#0ea5e9" />
      ))}

      {/* Tie outline */}
      <rect x={csLeft + 6} y={csTop2 + 6} width={csW2 - 12} height={csH2 - 12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />

      <text x={csLeft + csW2 / 2} y={csTop2 + csH2 + 30} textAnchor="middle" fill="#0ea5e9" className="text-[9px] font-mono">
        {result.reinforcement.mainBars}
      </text>
    </svg>
  );
}

function FootingDrawing({ input, result }: { input: FootingInput; result: FootingDesignResult }) {
  const svgW = 500, svgH = 350;
  const margin = 50;

  const fW = 260;
  const fH = 50;
  const fLeft = (svgW - fW) / 2;
  const fTop = 160;

  const colW = 60;
  const colH = 80;
  const colLeft = (svgW - colW) / 2;
  const colTop = fTop - colH;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto bg-background rounded-lg border border-border">
      <text x={svgW / 2} y={25} textAnchor="middle" className="fill-foreground text-xs font-bold">
        FOOTING - Section & Plan
      </text>

      {/* Section view */}
      <text x={svgW / 2} y={55} textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">Section</text>

      {/* Column */}
      <rect x={colLeft} y={colTop} width={colW} height={colH} fill="none" stroke="currentColor" strokeWidth={2} className="stroke-foreground" />
      <text x={colLeft + colW / 2} y={colTop - 5} textAnchor="middle" className="fill-muted-foreground text-[8px]">{input.columnWidth}mm</text>

      {/* Footing */}
      <rect x={fLeft} y={fTop} width={fW} height={fH} fill="none" stroke="currentColor" strokeWidth={2} className="stroke-foreground" />

      {/* Dimensions */}
      <text x={svgW / 2} y={fTop + fH + 20} textAnchor="middle" className="fill-muted-foreground text-[9px]">{result.dimensions.length} mm</text>
      <text x={fLeft - 15} y={fTop + fH / 2 + 4} textAnchor="middle" className="fill-muted-foreground text-[9px]">{result.dimensions.depth}mm</text>

      {/* Reinforcement bars (bottom) */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = fLeft + 15 + i * ((fW - 30) / 5);
        return <circle key={i} cx={x} cy={fTop + fH - 10} r={3} fill="#0ea5e9" />;
      })}
      <text x={svgW / 2} y={fTop + fH + 35} textAnchor="middle" fill="#0ea5e9" className="text-[9px] font-mono">
        {result.reinforcement.mainBarsX}
      </text>

      {/* Plan view */}
      <text x={svgW / 2} y={fTop + fH + 60} textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">Plan</text>
      <rect x={fLeft} y={fTop + fH + 70} width={fW} height={fW * (result.dimensions.width / result.dimensions.length)} fill="none" stroke="currentColor" strokeWidth={1.5} className="stroke-foreground" />
      {/* Column outline in plan */}
      <rect x={svgW / 2 - 20} y={fTop + fH + 70 + fW * (result.dimensions.width / result.dimensions.length) / 2 - 20} width={40} height={40}
        fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="4 2" className="stroke-muted-foreground" />
    </svg>
  );
}

function SlabDrawing({ input, result }: { input: SlabInput; result: SlabDesignResult }) {
  const svgW = 500, svgH = 380;
  const margin = 50;
  const planW = 300;
  const planH = 200;
  const planLeft = (svgW - planW) / 2;
  const planTop = 60;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto bg-background rounded-lg border border-border">
      <text x={svgW / 2} y={25} textAnchor="middle" className="fill-foreground text-xs font-bold">
        SLAB - Plan & Section ({result.slabType.toUpperCase()})
      </text>

      {/* Plan view */}
      <rect x={planLeft} y={planTop} width={planW} height={planH} fill="none" stroke="currentColor" strokeWidth={2} className="stroke-foreground" />

      {/* Short span bars (vertical lines) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = planLeft + 15 + i * ((planW - 30) / 7);
        return <line key={`sx-${i}`} x1={x} y1={planTop + 5} x2={x} y2={planTop + planH - 5} stroke="#0ea5e9" strokeWidth={1} opacity={0.7} />;
      })}

      {/* Long span bars (horizontal lines) */}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = planTop + 15 + i * ((planH - 30) / 4);
        return <line key={`sy-${i}`} x1={planLeft + 5} y1={y} x2={planLeft + planW - 5} y2={y} stroke="#22c55e" strokeWidth={1} opacity={0.7} />;
      })}

      {/* Dimensions */}
      <text x={planLeft + planW / 2} y={planTop + planH + 20} textAnchor="middle" className="fill-muted-foreground text-[9px]">Ly = {Math.max(input.spanLx, input.spanLy) * 1000} mm</text>
      <text x={planLeft - 10} y={planTop + planH / 2} textAnchor="middle" transform={`rotate(-90, ${planLeft - 10}, ${planTop + planH / 2})`} className="fill-muted-foreground text-[9px]">Lx = {Math.min(input.spanLx, input.spanLy) * 1000} mm</text>

      {/* Legend */}
      <line x1={planLeft} y1={planTop + planH + 35} x2={planLeft + 20} y2={planTop + planH + 35} stroke="#0ea5e9" strokeWidth={2} />
      <text x={planLeft + 25} y={planTop + planH + 39} className="fill-muted-foreground text-[8px]">{result.reinforcement.shortSpanBars} (Short span)</text>

      <line x1={planLeft + 200} y1={planTop + planH + 35} x2={planLeft + 220} y2={planTop + planH + 35} stroke="#22c55e" strokeWidth={2} />
      <text x={planLeft + 225} y={planTop + planH + 39} className="fill-muted-foreground text-[8px]">{result.reinforcement.longSpanBars} (Long span)</text>

      {/* Section */}
      <text x={svgW / 2} y={planTop + planH + 60} textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold">Section</text>
      <rect x={planLeft} y={planTop + planH + 70} width={planW} height={25} fill="none" stroke="currentColor" strokeWidth={1.5} className="stroke-foreground" />
      <text x={planLeft + planW + 10} y={planTop + planH + 86} className="fill-muted-foreground text-[8px]">{result.thickness}mm</text>

      {/* Bars in section */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = planLeft + 15 + i * ((planW - 30) / 7);
        return <circle key={i} cx={x} cy={planTop + planH + 85} r={2.5} fill="#0ea5e9" />;
      })}
    </svg>
  );
}

export function Drawing2D({ type, input, result }: Drawing2DProps) {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PenTool className="w-4 h-4 text-accent" />2D Reinforcement Drawing
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === "beam" && <BeamDrawing input={input as BeamInput} result={result as BeamDesignResult} />}
        {type === "column" && <ColumnDrawing input={input as ColumnInput} result={result as ColumnDesignResult} />}
        {type === "footing" && <FootingDrawing input={input as FootingInput} result={result as FootingDesignResult} />}
        {type === "slab" && <SlabDrawing input={input as SlabInput} result={result as SlabDesignResult} />}
      </CardContent>
    </Card>
  );
}
