import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Environment } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { type BeamDesignResult, type ColumnDesignResult, type FootingDesignResult, type BeamInput, type ColumnInput, type FootingInput } from "@/lib/structural-calculations";

interface Structural3DViewerProps {
  type: "beam" | "column" | "footing";
  input: BeamInput | ColumnInput | FootingInput;
  result: BeamDesignResult | ColumnDesignResult | FootingDesignResult;
}

function BeamMesh({ input }: { input: BeamInput }) {
  const scale = 0.001; // Convert mm to meters
  const width = input.width * scale;
  const depth = input.depth * scale;
  const length = input.spanLength;

  return (
    <group>
      {/* Main beam body */}
      <mesh position={[0, depth / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, depth, width]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.7} />
      </mesh>
      
      {/* Tension reinforcement (bottom) */}
      {[...Array(4)].map((_, i) => (
        <mesh key={`tension-${i}`} position={[(i - 1.5) * (length / 4), 0.03, (i % 2 - 0.5) * (width - 0.08)]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, length, 16]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
      ))}

      {/* Stirrups */}
      {[...Array(Math.floor(length / 0.2))].map((_, i) => (
        <mesh key={`stirrup-${i}`} position={[(i - Math.floor(length / 0.4)) * 0.2, depth / 2, 0]}>
          <torusGeometry args={[Math.min(width, depth) / 2 - 0.02, 0.006, 4, 4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      ))}

      {/* Supports */}
      <mesh position={[-length / 2 + 0.1, -0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, width + 0.1]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[length / 2 - 0.1, -0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, width + 0.1]} />
        <meshStandardMaterial color="#64748b" />
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
    // Corner bars
    positions.push([-width / 2 + offset, 0, -depth / 2 + offset]);
    positions.push([width / 2 - offset, 0, -depth / 2 + offset]);
    positions.push([-width / 2 + offset, 0, depth / 2 - offset]);
    positions.push([width / 2 - offset, 0, depth / 2 - offset]);
    // Mid bars if column is large
    if (width > 0.35) {
      positions.push([0, 0, -depth / 2 + offset]);
      positions.push([0, 0, depth / 2 - offset]);
    }
    if (depth > 0.35) {
      positions.push([-width / 2 + offset, 0, 0]);
      positions.push([width / 2 - offset, 0, 0]);
    }
    return positions;
  }, [width, depth]);

  return (
    <group>
      {/* Column body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.6} />
      </mesh>

      {/* Main reinforcement */}
      {rebarPositions.map((pos, i) => (
        <mesh key={`rebar-${i}`} position={[pos[0], height / 2, pos[2]]}>
          <cylinderGeometry args={[0.012, 0.012, height - 0.1, 16]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
      ))}

      {/* Ties */}
      {[...Array(Math.floor(height / 0.3))].map((_, i) => (
        <mesh key={`tie-${i}`} position={[0, (i + 0.5) * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.min(width, depth) / 2 - 0.03, 0.005, 4, 4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      ))}

      {/* Base */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[width + 0.1, 0.1, depth + 0.1]} />
        <meshStandardMaterial color="#64748b" />
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
      {/* Footing body */}
      <mesh position={[0, depth / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, depth, width]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.6} />
      </mesh>

      {/* Column stub */}
      <mesh position={[0, depth + 0.25, 0]}>
        <boxGeometry args={[colWidth, 0.5, colDepth]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Bottom reinforcement grid */}
      {[...Array(Math.floor(length / 0.15))].map((_, i) => (
        <mesh key={`rebar-x-${i}`} position={[(i - Math.floor(length / 0.3)) * 0.15, 0.04, 0]}>
          <cylinderGeometry args={[0.006, 0.006, width - 0.1, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
      ))}
      {[...Array(Math.floor(width / 0.15))].map((_, i) => (
        <mesh key={`rebar-y-${i}`} position={[0, 0.05, (i - Math.floor(width / 0.3)) * 0.15]}>
          <boxGeometry args={[length - 0.1, 0.012, 0.012]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
      ))}

      {/* Soil indication */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[length + 0.5, 0.3, width + 0.5]} />
        <meshStandardMaterial color="#92400e" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#64748b" wireframe />
    </mesh>
  );
}

export function Structural3DViewer({ type, input, result }: Structural3DViewerProps) {
  const cameraPosition = useMemo(() => {
    switch (type) {
      case "beam":
        return [4, 2, 3] as [number, number, number];
      case "column":
        return [2, 2, 2] as [number, number, number];
      case "footing":
        return [2, 1.5, 2] as [number, number, number];
      default:
        return [3, 2, 3] as [number, number, number];
    }
  }, [type]);

  return (
    <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas shadows>
        <Suspense fallback={<LoadingFallback />}>
          <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1}
            maxDistance={10}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-3, 3, -3]} intensity={0.3} />
          
          {/* Grid */}
          <Grid 
            args={[10, 10]} 
            position={[0, -0.01, 0]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#475569"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#64748b"
            fadeDistance={15}
            fadeStrength={1}
          />

          {/* Render appropriate mesh */}
          {type === "beam" && <BeamMesh input={input as BeamInput} />}
          {type === "column" && <ColumnMesh input={input as ColumnInput} />}
          {type === "footing" && <FootingMesh input={input as FootingInput} result={result as FootingDesignResult} />}
        </Suspense>
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#94a3b8]" />
          <span className="text-white/70">Concrete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
          <span className="text-white/70">Main Steel</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <span className="text-white/70">Stirrups/Ties</span>
        </div>
      </div>
    </div>
  );
}
