import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  type BeamDesignResult, type ColumnDesignResult, type FootingDesignResult,
  type BeamInput, type ColumnInput, type FootingInput
} from "@/lib/structural-calculations";

interface Structural3DViewerProps {
  type: "beam" | "column" | "footing";
  input: BeamInput | ColumnInput | FootingInput;
  result: BeamDesignResult | ColumnDesignResult | FootingDesignResult;
}

interface BarConfig {
  count: number;
  diameter: number; // mm
  bentUpCount: number;
}

function BentUpBar({ position, length, depth, barRadius, bendAngle = 45 }: {
  position: [number, number, number];
  length: number; depth: number; barRadius: number; bendAngle?: number;
}) {
  const angleRad = (bendAngle * Math.PI) / 180;
  const bendLength = depth * 0.6;
  const straightLen = length * 0.3;
  const bendHyp = bendLength / Math.sin(angleRad);

  const points = [
    new THREE.Vector3(-length / 2, 0, 0),
    new THREE.Vector3(-length / 2 + straightLen, 0, 0),
    new THREE.Vector3(-length / 2 + straightLen + bendHyp * Math.cos(angleRad), bendLength, 0),
    new THREE.Vector3(length / 2 - straightLen - bendHyp * Math.cos(angleRad), bendLength, 0),
    new THREE.Vector3(length / 2 - straightLen, 0, 0),
    new THREE.Vector3(length / 2, 0, 0),
  ];

  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.1);
  const tubeGeom = new THREE.TubeGeometry(curve, 32, barRadius, 8, false);

  return (
    <mesh position={position} geometry={tubeGeom}>
      <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

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
      positions.push([0, 0.03, z]);
    }
    return positions;
  }, [config.count, width]);

  const bentUpPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const spacing = (width - 0.08) / Math.max(config.bentUpCount, 1);
    for (let i = 0; i < config.bentUpCount; i++) {
      const z = config.bentUpCount === 1 ? 0 : -((width - 0.08) / 2) + i * spacing + spacing / 2;
      positions.push([0, 0.03, z]);
    }
    return positions;
  }, [config.bentUpCount, width]);

  return (
    <group>
      {/* Concrete body */}
      <mesh position={[0, depth / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, depth, width]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.5} />
      </mesh>

      {/* Tension bars */}
      {tensionBarPositions.map((pos, i) => (
        <mesh key={`t-${i}`} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[barRadius, barRadius, length - 0.05, 16]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Bent-up bars */}
      {bentUpPositions.map((pos, i) => (
        <BentUpBar
          key={`bent-${i}`}
          position={pos}
          length={length - 0.1}
          depth={depth - 0.06}
          barRadius={barRadius}
        />
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

function ColumnMesh({ input }: { input: ColumnInput }) {
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
    if (width > 0.35) { positions.push([0, 0, -depth / 2 + offset]); positions.push([0, 0, depth / 2 - offset]); }
    if (depth > 0.35) { positions.push([-width / 2 + offset, 0, 0]); positions.push([width / 2 - offset, 0, 0]); }
    return positions;
  }, [width, depth]);

  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.5} />
      </mesh>
      {rebarPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0], height / 2, pos[2]]}>
          <cylinderGeometry args={[0.012, 0.012, height - 0.1, 16]} />
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

function FootingMesh({ input, result }: { input: FootingInput; result: FootingDesignResult }) {
  const scale = 0.001;
  const length = result.dimensions.length * scale;
  const width = result.dimensions.width * scale;
  const depth = result.dimensions.depth * scale;
  const colWidth = input.columnWidth * scale;
  const colDepth = input.columnDepth * scale;

  return (
    <group>
      <mesh position={[0, depth / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, depth, width]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, depth + 0.25, 0]}>
        <boxGeometry args={[colWidth, 0.5, colDepth]} />
        <meshStandardMaterial color="hsl(215, 15%, 40%)" />
      </mesh>
      {[...Array(Math.floor(length / 0.15))].map((_, i) => (
        <mesh key={`rx-${i}`} position={[(i - Math.floor(length / 0.3)) * 0.15, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, width - 0.1, 8]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} />
        </mesh>
      ))}
      {[...Array(Math.floor(width / 0.15))].map((_, i) => (
        <mesh key={`ry-${i}`} position={[0, 0.05, (i - Math.floor(width / 0.3)) * 0.15]}>
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

function LoadingFallback() {
  return (<mesh><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="hsl(215, 15%, 40%)" wireframe /></mesh>);
}

export function Structural3DViewer({ type, input, result }: Structural3DViewerProps) {
  const beamResult = type === "beam" ? result as BeamDesignResult : null;

  // Parse bar count from result
  const defaultCount = beamResult ? parseInt(beamResult.reinforcement.tensionBars) || 4 : 4;
  const defaultDia = beamResult ? parseInt(beamResult.reinforcement.tensionBars.match(/(\d+)mm/)?.[1] || "16") : 16;

  const [barConfig, setBarConfig] = useState<BarConfig>({
    count: defaultCount,
    diameter: defaultDia,
    bentUpCount: Math.max(1, Math.floor(defaultCount / 2)),
  });

  // Calculate steel quantities
  const steelInfo = useMemo(() => {
    if (type !== "beam") return null;
    const beamInput = input as BeamInput;
    const barArea = Math.PI * Math.pow(barConfig.diameter / 2, 2); // mm²
    const totalArea = barConfig.count * barArea;
    const mainWeight = totalArea * beamInput.spanLength * 1.1 * 0.00785; // kg
    const bentWeight = barConfig.bentUpCount * barArea * beamInput.spanLength * 1.15 * 0.00785;
    const stirrupWeight = (mainWeight + bentWeight) * 0.25;
    const totalWeight = mainWeight + bentWeight + stirrupWeight;
    const costPerKg = 72; // ₹ per kg
    return {
      mainWeight: +mainWeight.toFixed(1),
      bentWeight: +bentWeight.toFixed(1),
      stirrupWeight: +stirrupWeight.toFixed(1),
      totalWeight: +totalWeight.toFixed(1),
      totalCost: Math.round(totalWeight * costPerKg),
    };
  }, [type, input, barConfig]);

  const cameraPosition = useMemo(() => {
    switch (type) {
      case "beam": return [4, 2, 3] as [number, number, number];
      case "column": return [2, 2, 2] as [number, number, number];
      case "footing": return [2, 1.5, 2] as [number, number, number];
      default: return [3, 2, 3] as [number, number, number];
    }
  }, [type]);

  return (
    <div className="space-y-3">
      <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-b from-background to-muted relative">
        <Canvas shadows>
          <Suspense fallback={<LoadingFallback />}>
            <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
            <OrbitControls enablePan enableZoom enableRotate minDistance={1} maxDistance={10} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <directionalLight position={[-3, 3, -3]} intensity={0.3} />
            <Grid
              args={[10, 10]} position={[0, -0.01, 0]}
              cellSize={0.5} cellThickness={0.5} cellColor="#475569"
              sectionSize={2} sectionThickness={1} sectionColor="#64748b"
              fadeDistance={15} fadeStrength={1}
            />
            {type === "beam" && <BeamMesh input={input as BeamInput} config={barConfig} />}
            {type === "column" && <ColumnMesh input={input as ColumnInput} />}
            {type === "footing" && <FootingMesh input={input as FootingInput} result={result as FootingDesignResult} />}
          </Suspense>
        </Canvas>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-3 text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ background: "hsl(215, 15%, 65%)" }} /><span className="text-muted-foreground">Concrete</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#0ea5e9]" /><span className="text-muted-foreground">Main Steel</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" /><span className="text-muted-foreground">Stirrups</span></div>
          {type === "beam" && <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /><span className="text-muted-foreground">Bent-up</span></div>}
        </div>
      </div>

      {/* Interactive Controls (beam only) */}
      {type === "beam" && (
        <Card variant="elevated">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Reinforcement Editor</h4>
              <Badge variant="outline" className="font-mono text-xs">Live</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Main Bars: {barConfig.count}</Label>
                <Slider
                  value={[barConfig.count]}
                  onValueChange={([v]) => setBarConfig(c => ({ ...c, count: v }))}
                  min={2} max={8} step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Diameter: {barConfig.diameter}mm</Label>
                <Slider
                  value={[barConfig.diameter]}
                  onValueChange={([v]) => setBarConfig(c => ({ ...c, diameter: v }))}
                  min={10} max={25} step={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Bent-up: {barConfig.bentUpCount}</Label>
                <Slider
                  value={[barConfig.bentUpCount]}
                  onValueChange={([v]) => setBarConfig(c => ({ ...c, bentUpCount: v }))}
                  min={0} max={4} step={1}
                />
              </div>
            </div>

            {/* Steel Quantity Summary */}
            {steelInfo && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Main Bars</div>
                  <div className="font-mono text-sm font-semibold">{steelInfo.mainWeight} kg</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Bent-up Bars</div>
                  <div className="font-mono text-sm font-semibold">{steelInfo.bentWeight} kg</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Stirrups</div>
                  <div className="font-mono text-sm font-semibold">{steelInfo.stirrupWeight} kg</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Total Steel</div>
                  <div className="font-mono text-sm font-bold text-accent">{steelInfo.totalWeight} kg</div>
                </div>
                <div className="col-span-2 p-3 rounded-lg bg-accent/10 flex items-center justify-between">
                  <span className="text-sm font-medium">Reinforcement Cost</span>
                  <span className="font-mono font-bold text-lg text-accent">₹{steelInfo.totalCost.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="text-center text-xs text-muted-foreground">
        Drag to rotate • Scroll to zoom • Shift+drag to pan
      </div>
    </div>
  );
}
