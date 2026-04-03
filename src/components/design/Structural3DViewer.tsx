import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";
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
  bentUpCount: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
}

const defaultBarConfig: BarConfig = { count: 4, diameter: 16, bentUpCount: 1, offsetX: 0, offsetY: 0, offsetZ: 0 };

function BentUpBar({ position, length, depth, barRadius }: {
  position: [number, number, number]; length: number; depth: number; barRadius: number;
}) {
  const bendLength = depth * 0.6;
  const straightLen = length * 0.3;
  const bendHyp = bendLength / Math.sin(Math.PI / 4);
  const points = [
    new THREE.Vector3(-length / 2, 0, 0),
    new THREE.Vector3(-length / 2 + straightLen, 0, 0),
    new THREE.Vector3(-length / 2 + straightLen + bendHyp * Math.cos(Math.PI / 4), bendLength, 0),
    new THREE.Vector3(length / 2 - straightLen - bendHyp * Math.cos(Math.PI / 4), bendLength, 0),
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
      positions.push([config.offsetX * 0.01, 0.03 + config.offsetY * 0.01, z + config.offsetZ * 0.01]);
    }
    return positions;
  }, [config, width]);

  const bentUpPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const spacing = (width - 0.08) / Math.max(config.bentUpCount, 1);
    for (let i = 0; i < config.bentUpCount; i++) {
      const z = config.bentUpCount === 1 ? 0 : -((width - 0.08) / 2) + i * spacing + spacing / 2;
      positions.push([config.offsetX * 0.01, 0.03, z]);
    }
    return positions;
  }, [config, width]);

  return (
    <group>
      <mesh position={[0, depth / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, depth, width]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.4} />
      </mesh>
      {tensionBarPositions.map((pos, i) => (
        <mesh key={`t-${i}`} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[barRadius, barRadius, length - 0.05, 16]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {bentUpPositions.map((pos, i) => (
        <BentUpBar key={`bent-${i}`} position={pos} length={length - 0.1} depth={depth - 0.06} barRadius={barRadius} />
      ))}
      {[0, 1].map(i => (
        <mesh key={`c-${i}`} position={[0, depth - 0.03, (i - 0.5) * (width - 0.06)]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, length - 0.05, 12]} />
          <meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
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
      {/* Slab body */}
      <mesh position={[0, thickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[ly, thickness, lx]} />
        <meshStandardMaterial color="hsl(215, 15%, 65%)" transparent opacity={0.35} />
      </mesh>

      {/* Short span bars (bottom, along X) */}
      {[...Array(Math.floor(ly / barSpacingX))].map((_, i) => (
        <mesh key={`sx-${i}`} position={[
          (i - Math.floor(ly / barSpacingX / 2)) * barSpacingX + config.offsetX * 0.01,
          0.02 + config.offsetY * 0.005,
          0
        ]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, lx - 0.1, 8]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.6} />
        </mesh>
      ))}

      {/* Long span / distribution bars */}
      {[...Array(Math.floor(lx / barSpacingY))].map((_, i) => (
        <mesh key={`sy-${i}`} position={[
          0,
          0.03 + config.offsetY * 0.005,
          (i - Math.floor(lx / barSpacingY / 2)) * barSpacingY + config.offsetZ * 0.01
        ]}>
          <boxGeometry args={[ly - 0.1, 0.01, 0.01]} />
          <meshStandardMaterial color="#22c55e" metalness={0.5} />
        </mesh>
      ))}

      {/* Support beams */}
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
    bentUpCount: type === "beam" ? Math.max(1, Math.floor(defaultCount / 2)) : 0,
  });

  const steelInfo = useMemo(() => {
    if (type === "beam") {
      const beamInput = input as BeamInput;
      const barArea = Math.PI * Math.pow(barConfig.diameter / 2, 2);
      const totalArea = barConfig.count * barArea;
      const mainWeight = totalArea * beamInput.spanLength * 1.1 * 0.00785;
      const bentWeight = barConfig.bentUpCount * barArea * beamInput.spanLength * 1.15 * 0.00785;
      const stirrupWeight = (mainWeight + bentWeight) * 0.25;
      const totalWeight = mainWeight + bentWeight + stirrupWeight;
      return { mainWeight: +mainWeight.toFixed(1), bentWeight: +bentWeight.toFixed(1), stirrupWeight: +stirrupWeight.toFixed(1), totalWeight: +totalWeight.toFixed(1), totalCost: Math.round(totalWeight * 72) };
    }
    if (type === "slab") {
      const slabInput = input as SlabInput;
      const slabResult = result as SlabDesignResult;
      const area = slabInput.spanLx * slabInput.spanLy;
      const steelWeight = (slabResult.reinforcement.shortSpanArea + slabResult.reinforcement.longSpanArea) * Math.sqrt(area) * 0.00785;
      return { mainWeight: +steelWeight.toFixed(1), bentWeight: 0, stirrupWeight: 0, totalWeight: +steelWeight.toFixed(1), totalCost: Math.round(steelWeight * 72) };
    }
    return null;
  }, [type, input, result, barConfig]);

  const cameraPosition = useMemo((): [number, number, number] => {
    switch (type) {
      case "beam": return [4, 2, 3];
      case "column": return [2, 2, 2];
      case "footing": return [2, 1.5, 2];
      case "slab": return [5, 3, 5];
      default: return [3, 2, 3];
    }
  }, [type]);

  return (
    <div className="space-y-3">
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
            {type === "beam" && <BeamMesh input={input as BeamInput} config={barConfig} />}
            {type === "column" && <ColumnMesh input={input as ColumnInput} config={barConfig} />}
            {type === "footing" && <FootingMesh input={input as FootingInput} result={result as FootingDesignResult} config={barConfig} />}
            {type === "slab" && <SlabMesh input={input as SlabInput} result={result as SlabDesignResult} config={barConfig} />}
          </Suspense>
        </Canvas>
        <div className="absolute bottom-2 left-2 flex gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ background: "hsl(215, 15%, 65%)" }} /><span className="text-muted-foreground">Concrete</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#0ea5e9]" /><span className="text-muted-foreground">Main Steel</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" /><span className="text-muted-foreground">Stirrups/Ties</span></div>
          {type === "beam" && <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /><span className="text-muted-foreground">Bent-up</span></div>}
          {type === "slab" && <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#22c55e]" /><span className="text-muted-foreground">Distribution</span></div>}
        </div>
      </div>

      {/* Interactive Controls */}
      <Card variant="elevated">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Reinforcement Editor</h4>
            <Badge variant="outline" className="font-mono text-xs">Live</Badge>
          </div>

          {(type === "beam") && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Main Bars: {barConfig.count}</Label>
                <Slider value={[barConfig.count]} onValueChange={([v]) => setBarConfig(c => ({ ...c, count: v }))} min={2} max={8} step={1} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Diameter: {barConfig.diameter}mm</Label>
                <Slider value={[barConfig.diameter]} onValueChange={([v]) => setBarConfig(c => ({ ...c, diameter: v }))} min={10} max={32} step={2} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Bent-up: {barConfig.bentUpCount}</Label>
                <Slider value={[barConfig.bentUpCount]} onValueChange={([v]) => setBarConfig(c => ({ ...c, bentUpCount: v }))} min={0} max={4} step={1} />
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

          {/* Axis Controls (all types) */}
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
              {steelInfo.bentWeight > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Bent-up Bars</div>
                  <div className="font-mono text-sm font-semibold">{steelInfo.bentWeight} kg</div>
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
              <div className="col-span-2 p-3 rounded-lg bg-accent/10 flex items-center justify-between">
                <span className="text-sm font-medium">Reinforcement Cost</span>
                <span className="font-mono font-bold text-lg text-accent">₹{steelInfo.totalCost.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Drag to rotate • Scroll to zoom • Shift+drag to pan
      </div>
    </div>
  );
}
