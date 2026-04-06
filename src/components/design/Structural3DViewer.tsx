import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  type BeamDesignResult, type ColumnDesignResult, type FootingDesignResult, type SlabDesignResult,
  type BeamInput, type ColumnInput, type FootingInput, type SlabInput,
} from "@/lib/structural-calculations";

interface Structural3DViewerProps {
  type: "beam" | "column" | "footing" | "slab";
  input: BeamInput | ColumnInput | FootingInput | SlabInput;
  result: BeamDesignResult | ColumnDesignResult | FootingDesignResult | SlabDesignResult;
}

interface BarConfig {
  count: number;
  diameter: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
}

const defaultBarConfig: BarConfig = { count: 4, diameter: 16, offsetX: 0, offsetY: 0, offsetZ: 0 };

// ─── CurtailedBar Component ─────────────────────────────────────────────
// Renders a bar that grows from floor up. If value > threshold, the excess
// is shown as a semi-transparent "curtailed" indicator on top.
interface CurtailedBarProps {
  value: number;
  threshold: number;
  position: [number, number, number];
  color: string;
  barWidth?: number;
  barDepth?: number;
}

function CurtailedBar({ value, threshold, position, color, barWidth = 0.08, barDepth = 0.08 }: CurtailedBarProps) {
  const actualHeight = Math.min(value, threshold);
  const curtailedAmount = Math.max(0, value - threshold);

  return (
    <group>
      {/* Main bar – anchored at floor, scales upward */}
      <mesh position={[position[0], position[1] + actualHeight / 2, position[2]]}>
        <boxGeometry args={[barWidth, actualHeight, barDepth]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Curtailed excess indicator – semi-transparent on top */}
      {curtailedAmount > 0 && (
        <mesh position={[position[0], position[1] + actualHeight + curtailedAmount / 2, position[2]]}>
          <boxGeometry args={[barWidth * 1.05, curtailedAmount, barDepth * 1.05]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={0.45} metalness={0.3} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

// ─── Sample data bars for the curtailment demo chart ────────────────────
const sampleBarData = [
  { id: "A1", value: 1.8, color: "#0ea5e9" },
  { id: "A2", value: 2.5, color: "#22c55e" },
  { id: "A3", value: 1.2, color: "#a855f7" },
  { id: "A4", value: 3.0, color: "#f59e0b" },
  { id: "A5", value: 2.0, color: "#ec4899" },
  { id: "A6", value: 2.8, color: "#06b6d4" },
];

// ─── Curtailment Demo Scene ─────────────────────────────────────────────
function CurtailmentDemoScene({ threshold }: { threshold: number }) {
  return (
    <group position={[-1.5, 0, 0]}>
      {sampleBarData.map((bar, i) => (
        <CurtailedBar
          key={bar.id}
          value={bar.value}
          threshold={threshold}
          position={[i * 0.6, 0, 0]}
          color={bar.color}
          barWidth={0.15}
          barDepth={0.15}
        />
      ))}
      {/* Threshold line indicator */}
      <mesh position={[1.25, threshold, 0]}>
        <boxGeometry args={[4.5, 0.01, 0.5]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ─── Beam 3D mesh with structural curtailed bars ────────────────────────
function BeamMesh({ input, config }: { input: BeamInput; config: BarConfig }) {
  const scale = 0.001;
  const width = input.width * scale;
  const depth = input.depth * scale;
  const length = input.spanLength;
  const barRadius = (config.diameter / 2) * scale;

  const tensionBarPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const spacing = (width - 0.06) / Math.max(config.count - 1, 1);
    for (let i = 0; i < config.count; i++) {
      const z = config.count === 1 ? 0 : -((width - 0.06) / 2) + i * spacing;
      positions.push([config.offsetX * 0.01, 0.03 + config.offsetY * 0.01, z + config.offsetZ * 0.01]);
    }
    return positions;
  }, [config, width]);

  // Curtailed bars: alternate bars curtailed to 60% of span
  const curtailedPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    if (config.count >= 3) {
      const spacing = (width - 0.06) / Math.max(config.count - 1, 1);
      for (let i = 1; i < config.count; i += 2) {
        const z = -((width - 0.06) / 2) + i * spacing;
        positions.push([config.offsetX * 0.01, 0.03 + config.offsetY * 0.01, z + config.offsetZ * 0.01]);
      }
    }
    return positions;
  }, [config, width]);

  const curtailedLength = (length - 0.05) * 0.6;

  return (
    <group>
      {/* Concrete body */}
      <mesh position={[0, depth / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, depth, width]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.4} />
      </mesh>

      {/* Full-length tension bars */}
      {tensionBarPositions.map((pos, i) => (
        <mesh key={`t-${i}`} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[barRadius, barRadius, length - 0.05, 16]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Curtailed bars (shorter, shown in purple) */}
      {curtailedPositions.map((pos, i) => (
        <mesh key={`curt-${i}`} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[barRadius * 0.9, barRadius * 0.9, curtailedLength, 16]} />
          <meshStandardMaterial color="#a855f7" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Curtailment markers (rings at curtailment points) */}
      {curtailedPositions.map((pos, i) => (
        <group key={`cm-${i}`}>
          <mesh position={[pos[0] - curtailedLength / 2, pos[1], pos[2]]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[barRadius * 2, barRadius * 0.5, 8, 16]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[pos[0] + curtailedLength / 2, pos[1], pos[2]]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[barRadius * 2, barRadius * 0.5, 8, 16]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      ))}

      {/* Compression bars (top) */}
      {[0, 1].map(i => (
        <mesh key={`c-${i}`} position={[0, depth - 0.03, (i - 0.5) * (width - 0.06)]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, length - 0.05, 12]} />
          <meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Stirrups */}
      {[...Array(Math.floor(length / 0.2))].map((_, i) => {
        const x = (i - Math.floor(length / 0.4)) * 0.2;
        const hw = (width - 0.04) / 2;
        const hd = (depth - 0.04) / 2;
        const r = 0.005;
        return (
          <group key={`st-${i}`} position={[x, depth / 2, 0]}>
            <mesh position={[0, hd, 0]}><boxGeometry args={[r * 2, r * 2, width - 0.04]} /><meshStandardMaterial color="#f59e0b" metalness={0.4} /></mesh>
            <mesh position={[0, -hd, 0]}><boxGeometry args={[r * 2, r * 2, width - 0.04]} /><meshStandardMaterial color="#f59e0b" metalness={0.4} /></mesh>
            <mesh position={[0, 0, -hw]}><boxGeometry args={[r * 2, depth - 0.04, r * 2]} /><meshStandardMaterial color="#f59e0b" metalness={0.4} /></mesh>
            <mesh position={[0, 0, hw]}><boxGeometry args={[r * 2, depth - 0.04, r * 2]} /><meshStandardMaterial color="#f59e0b" metalness={0.4} /></mesh>
          </group>
        );
      })}

      {/* Supports */}
      <mesh position={[-length / 2 + 0.1, -0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, width + 0.1]} />
        <meshStandardMaterial color="hsl(215, 15%, 40%)" />
      </mesh>
      <mesh position={[length / 2 - 0.1, -0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, width + 0.1]} />
        <meshStandardMaterial color="hsl(215, 15%, 40%)" />
      </mesh>
    </group>
  );
}

function ColumnMesh({ input, config }: { input: ColumnInput; config: BarConfig }) {
  const scale = 0.001;
  const width = input.width * scale;
  const depth = input.depth * scale;
  const height = input.height;

  const rebarPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const offset = 0.04;
    positions.push([-width / 2 + offset, 0, -depth / 2 + offset]);
    positions.push([width / 2 - offset, 0, -depth / 2 + offset]);
    positions.push([-width / 2 + offset, 0, depth / 2 - offset]);
    positions.push([width / 2 - offset, 0, depth / 2 - offset]);
    if (config.count > 4) { positions.push([0, 0, -depth / 2 + offset]); positions.push([0, 0, depth / 2 - offset]); }
    if (config.count > 6) { positions.push([-width / 2 + offset, 0, 0]); positions.push([width / 2 - offset, 0, 0]); }
    return positions;
  }, [width, depth, config.count]);

  const barRadius = (config.diameter / 2) * scale;

  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.4} />
      </mesh>
      {rebarPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0] + config.offsetX * 0.005, height / 2, pos[2] + config.offsetZ * 0.005]}>
          <cylinderGeometry args={[barRadius, barRadius, height - 0.1, 16]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {[...Array(Math.floor(height / 0.3))].map((_, i) => (
        <mesh key={`tie-${i}`} position={[0, (i + 0.5) * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.min(width, depth) / 2 - 0.03, 0.005, 4, 4]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[width + 0.1, 0.1, depth + 0.1]} />
        <meshStandardMaterial color="hsl(215, 15%, 40%)" />
      </mesh>
    </group>
  );
}

function FootingMesh({ input, result, config }: { input: FootingInput; result: FootingDesignResult; config: BarConfig }) {
  const scale = 0.001;
  const length = result.dimensions.length * scale;
  const width = result.dimensions.width * scale;
  const depth = result.dimensions.depth * scale;
  const colWidth = input.columnWidth * scale;
  const colDepth = input.columnDepth * scale;
  const barSpacing = 0.15;

  return (
    <group>
      <mesh position={[0, depth / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, depth, width]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, depth + 0.25, 0]}>
        <boxGeometry args={[colWidth, 0.5, colDepth]} />
        <meshStandardMaterial color="hsl(215, 15%, 40%)" />
      </mesh>
      {[...Array(Math.floor(length / barSpacing))].map((_, i) => (
        <mesh key={`rx-${i}`} position={[(i - Math.floor(length / barSpacing / 2)) * barSpacing + config.offsetX * 0.01, 0.04 + config.offsetY * 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, width - 0.1, 8]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} />
        </mesh>
      ))}
      {[...Array(Math.floor(width / barSpacing))].map((_, i) => (
        <mesh key={`ry-${i}`} position={[0, 0.05 + config.offsetY * 0.005, (i - Math.floor(width / barSpacing / 2)) * barSpacing + config.offsetZ * 0.01]}>
          <boxGeometry args={[length - 0.1, 0.012, 0.012]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[length + 0.5, 0.3, width + 0.5]} />
        <meshStandardMaterial color="hsl(30, 60%, 30%)" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function SlabMesh({ input, result, config }: { input: SlabInput; result: SlabDesignResult; config: BarConfig }) {
  const lx = Math.min(input.spanLx, input.spanLy);
  const ly = Math.max(input.spanLx, input.spanLy);
  const thickness = result.thickness * 0.001;
  const barSpacingX = 0.15;
  const barSpacingY = 0.2;

  return (
    <group>
      <mesh position={[0, thickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[ly, thickness, lx]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.35} />
      </mesh>
      {[...Array(Math.floor(ly / barSpacingX))].map((_, i) => (
        <mesh key={`sx-${i}`} position={[
          (i - Math.floor(ly / barSpacingX / 2)) * barSpacingX + config.offsetX * 0.01,
          0.02 + config.offsetY * 0.005, 0
        ]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, lx - 0.1, 8]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} />
        </mesh>
      ))}
      {[...Array(Math.floor(lx / barSpacingY))].map((_, i) => (
        <mesh key={`sy-${i}`} position={[
          0, 0.03 + config.offsetY * 0.005,
          (i - Math.floor(lx / barSpacingY / 2)) * barSpacingY + config.offsetZ * 0.01
        ]}>
          <boxGeometry args={[ly - 0.1, 0.01, 0.01]} />
          <meshStandardMaterial color="#22c55e" metalness={0.5} />
        </mesh>
      ))}
      {[-lx / 2, lx / 2].map((z, i) => (
        <mesh key={`sb-${i}`} position={[0, -0.1, z]}>
          <boxGeometry args={[ly + 0.1, 0.2, 0.15]} />
          <meshStandardMaterial color="hsl(215, 15%, 40%)" />
        </mesh>
      ))}
      {[-ly / 2, ly / 2].map((x, i) => (
        <mesh key={`sb2-${i}`} position={[x, -0.1, 0]}>
          <boxGeometry args={[0.15, 0.2, lx + 0.1]} />
          <meshStandardMaterial color="hsl(215, 15%, 40%)" />
        </mesh>
      ))}
    </group>
  );
}

function LoadingFallback() {
  return (<mesh><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="hsl(215, 15%, 40%)" wireframe /></mesh>);
}

export function Structural3DViewer({ type, input, result }: Structural3DViewerProps) {
  const beamResult = type === "beam" ? result as BeamDesignResult : null;
  const defaultCount = beamResult ? parseInt(beamResult.reinforcement.tensionBars) || 4 : 4;
  const defaultDia = beamResult ? parseInt(beamResult.reinforcement.tensionBars.match(/(\d+)mm/)?.[1] || "16") : 16;

  const [barConfig, setBarConfig] = useState<BarConfig>({
    ...defaultBarConfig,
    count: defaultCount,
    diameter: defaultDia,
  });

  // Curtailment threshold for demo chart (user-adjustable)
  const [curtailThreshold, setCurtailThreshold] = useState(2.0);
  const [showCurtailDemo, setShowCurtailDemo] = useState(false);

  const steelInfo = useMemo(() => {
    if (type === "beam") {
      const beamInput = input as BeamInput;
      const barArea = Math.PI * Math.pow(barConfig.diameter / 2, 2);
      const totalArea = barConfig.count * barArea;
      const mainWeight = totalArea * beamInput.spanLength * 1.1 * 0.00785;
      const curtailedCount = Math.floor(barConfig.count / 2);
      const curtailedWeight = curtailedCount * barArea * beamInput.spanLength * 0.6 * 0.00785;
      const stirrupWeight = (mainWeight + curtailedWeight) * 0.25;
      const totalWeight = mainWeight + curtailedWeight + stirrupWeight;
      return { mainWeight: +mainWeight.toFixed(1), curtailedWeight: +curtailedWeight.toFixed(1), stirrupWeight: +stirrupWeight.toFixed(1), totalWeight: +totalWeight.toFixed(1) };
    }
    if (type === "slab") {
      const slabInput = input as SlabInput;
      const slabResult = result as SlabDesignResult;
      const area = slabInput.spanLx * slabInput.spanLy;
      const steelWeight = (slabResult.reinforcement.shortSpanArea + slabResult.reinforcement.longSpanArea) * Math.sqrt(area) * 0.00785;
      return { mainWeight: +steelWeight.toFixed(1), curtailedWeight: 0, stirrupWeight: 0, totalWeight: +steelWeight.toFixed(1) };
    }
    return null;
  }, [type, input, result, barConfig]);

  const cameraPosition = useMemo((): [number, number, number] => {
    if (showCurtailDemo) return [3, 3, 5];
    switch (type) {
      case "beam": return [4, 2, 3];
      case "column": return [2, 2, 2];
      case "footing": return [2, 1.5, 2];
      case "slab": return [5, 3, 5];
      default: return [3, 2, 3];
    }
  }, [type, showCurtailDemo]);

  return (
    <div className="space-y-3">
      {/* Toggle: Structural vs Curtailment Demo */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowCurtailDemo(false)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!showCurtailDemo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          Structural View
        </button>
        <button
          onClick={() => setShowCurtailDemo(true)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${showCurtailDemo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          Curtailment Demo
        </button>
      </div>

      <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-b from-background to-muted relative">
        <Canvas shadows>
          <Suspense fallback={<LoadingFallback />}>
            <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
            <OrbitControls enablePan enableZoom enableRotate minDistance={1} maxDistance={15} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <directionalLight position={[-3, 3, -3]} intensity={0.3} />
            <Grid args={[10, 10]} position={[0, -0.01, 0]}
              cellSize={0.5} cellThickness={0.5} cellColor="#475569"
              sectionSize={2} sectionThickness={1} sectionColor="#64748b"
              fadeDistance={15} fadeStrength={1} />

            {showCurtailDemo ? (
              <CurtailmentDemoScene threshold={curtailThreshold} />
            ) : (
              <>
                {type === "beam" && <BeamMesh input={input as BeamInput} config={barConfig} />}
                {type === "column" && <ColumnMesh input={input as ColumnInput} config={barConfig} />}
                {type === "footing" && <FootingMesh input={input as FootingInput} result={result as FootingDesignResult} config={barConfig} />}
                {type === "slab" && <SlabMesh input={input as SlabInput} result={result as SlabDesignResult} config={barConfig} />}
              </>
            )}
          </Suspense>
        </Canvas>

        <div className="absolute bottom-2 left-2 flex gap-3 text-xs flex-wrap">
          {showCurtailDemo ? (
            <>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#0ea5e9]" /><span className="text-muted-foreground">Below Threshold</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#ef4444] opacity-50" /><span className="text-muted-foreground">Curtailed Excess</span></div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ background: "hsl(215, 15%, 65%)" }} /><span className="text-muted-foreground">Concrete</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#0ea5e9]" /><span className="text-muted-foreground">Main Steel</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" /><span className="text-muted-foreground">Stirrups/Ties</span></div>
              {type === "beam" && <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#a855f7]" /><span className="text-muted-foreground">Curtailed</span></div>}
              {type === "slab" && <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#22c55e]" /><span className="text-muted-foreground">Distribution</span></div>}
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card variant="elevated">
        <CardContent className="p-4 space-y-4">
          {showCurtailDemo ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Curtailment Threshold Control</h4>
                <Badge variant="outline" className="font-mono text-xs">Threshold: {curtailThreshold.toFixed(1)}</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Threshold Height: {curtailThreshold.toFixed(1)}</Label>
                <Slider value={[curtailThreshold]} onValueChange={([v]) => setCurtailThreshold(v)} min={0.5} max={3.5} step={0.1} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {sampleBarData.map(bar => {
                  const actual = Math.min(bar.value, curtailThreshold);
                  const excess = Math.max(0, bar.value - curtailThreshold);
                  return (
                    <div key={bar.id} className="bg-muted rounded p-2 space-y-1">
                      <div className="font-mono font-semibold" style={{ color: bar.color }}>{bar.id}</div>
                      <div className="text-muted-foreground">Val: {bar.value}</div>
                      <div className="text-muted-foreground">Actual: {actual.toFixed(1)}</div>
                      {excess > 0 && <div className="text-destructive">Cut: {excess.toFixed(1)}</div>}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Reinforcement Editor</h4>
                <Badge variant="outline" className="font-mono text-xs">Live</Badge>
              </div>

              {(type === "beam") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Main Bars: {barConfig.count}</Label>
                    <Slider value={[barConfig.count]} onValueChange={([v]) => setBarConfig(c => ({ ...c, count: v }))} min={2} max={8} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Diameter: {barConfig.diameter}mm</Label>
                    <Slider value={[barConfig.diameter]} onValueChange={([v]) => setBarConfig(c => ({ ...c, diameter: v }))} min={10} max={32} step={2} />
                  </div>
                </div>
              )}

              {(type === "column") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Main Bars: {barConfig.count}</Label>
                    <Slider value={[barConfig.count]} onValueChange={([v]) => setBarConfig(c => ({ ...c, count: v }))} min={4} max={8} step={2} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Diameter: {barConfig.diameter}mm</Label>
                    <Slider value={[barConfig.diameter]} onValueChange={([v]) => setBarConfig(c => ({ ...c, diameter: v }))} min={12} max={32} step={2} />
                  </div>
                </div>
              )}

              {(type === "footing" || type === "slab") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Main Bars: {barConfig.count}</Label>
                    <Slider value={[barConfig.count]} onValueChange={([v]) => setBarConfig(c => ({ ...c, count: v }))} min={4} max={12} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Diameter: {barConfig.diameter}mm</Label>
                    <Slider value={[barConfig.diameter]} onValueChange={([v]) => setBarConfig(c => ({ ...c, diameter: v }))} min={8} max={20} step={2} />
                  </div>
                </div>
              )}

              {/* Axis Controls */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <Label className="text-xs text-accent">X-Axis: {barConfig.offsetX}</Label>
                  <Slider value={[barConfig.offsetX]} onValueChange={([v]) => setBarConfig(c => ({ ...c, offsetX: v }))} min={-10} max={10} step={1} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-accent">Y-Axis: {barConfig.offsetY}</Label>
                  <Slider value={[barConfig.offsetY]} onValueChange={([v]) => setBarConfig(c => ({ ...c, offsetY: v }))} min={-10} max={10} step={1} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-accent">Z-Axis: {barConfig.offsetZ}</Label>
                  <Slider value={[barConfig.offsetZ]} onValueChange={([v]) => setBarConfig(c => ({ ...c, offsetZ: v }))} min={-10} max={10} step={1} />
                </div>
              </div>

              {steelInfo && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Main Bars</div>
                    <div className="font-mono text-sm font-semibold">{steelInfo.mainWeight} kg</div>
                  </div>
                  {steelInfo.curtailedWeight > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Curtailed Bars</div>
                      <div className="font-mono text-sm font-semibold">{steelInfo.curtailedWeight} kg</div>
                    </div>
                  )}
                  {steelInfo.stirrupWeight > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Stirrups</div>
                      <div className="font-mono text-sm font-semibold">{steelInfo.stirrupWeight} kg</div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Total Steel</div>
                    <div className="font-mono text-sm font-bold text-accent">{steelInfo.totalWeight} kg</div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Drag to rotate • Scroll to zoom • Shift+drag to pan
      </div>
    </div>
  );
}
