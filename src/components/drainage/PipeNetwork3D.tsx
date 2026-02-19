import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Text } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type DrainageNetwork } from "@/lib/drainage-calculations";

interface PipeNetwork3DProps {
  network: DrainageNetwork;
}

// Animated flow particle inside a pipe segment
function FlowParticle({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(Math.random());

  useFrame((_, delta) => {
    if (!ref.current) return;
    progress.current = (progress.current + delta * 0.6) % 1;
    const pos = new THREE.Vector3().lerpVectors(start, end, progress.current);
    ref.current.position.copy(pos);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
    </mesh>
  );
}

function PipeMesh({ fromPos, toPos, diameter, velocity, riskScore, pipeId }: {
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  diameter: number;
  velocity: number;
  riskScore: number;
  pipeId: string;
}) {
  const dir = toPos.clone().sub(fromPos);
  const length = dir.length();
  const mid = fromPos.clone().add(toPos).multiplyScalar(0.5);

  const quaternion = useMemo(() => {
    const axis = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(axis, dir.clone().normalize());
    return q;
  }, [dir]);

  const radiusScale = diameter / 600; // normalize around 600mm
  const pipeRadius = Math.max(0.05, radiusScale * 0.18);

  const pipeColor = riskScore < 40 ? "#22c55e" : riskScore < 65 ? "#f59e0b" : "#ef4444";
  const flowColor = velocity < 0.6 ? "#ef4444" : velocity > 2.5 ? "#a855f7" : "#00d4ff";

  // Particle count proportional to velocity
  const particleCount = Math.max(2, Math.min(6, Math.floor(velocity * 2)));

  return (
    <group>
      {/* Pipe body */}
      <mesh position={mid} quaternion={quaternion} castShadow>
        <cylinderGeometry args={[pipeRadius, pipeRadius, length, 12]} />
        <meshStandardMaterial
          color={pipeColor}
          transparent
          opacity={0.75}
          roughness={0.3}
          metalness={0.4}
          emissive={pipeColor}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Flow particles */}
      {Array.from({ length: particleCount }, (_, i) => (
        <FlowParticle
          key={`fp-${pipeId}-${i}`}
          start={fromPos.clone().add(new THREE.Vector3(0, 0.001 * i, 0))}
          end={toPos.clone().add(new THREE.Vector3(0, 0.001 * i, 0))}
          color={flowColor}
        />
      ))}

      {/* Diameter label */}
      <Text
        position={[mid.x, mid.y + pipeRadius + 0.1, mid.z]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        {`Ø${diameter}`}
      </Text>
    </group>
  );
}

function ManholeNode({ position, id, floodRisk, type }: {
  position: THREE.Vector3;
  id: string;
  floodRisk: number;
  type: "inlet" | "junction" | "outlet";
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
    if (floodRisk > 60) {
      ref.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.08);
    }
  });

  const color = floodRisk < 40 ? "#22c55e" : floodRisk < 65 ? "#f59e0b" : "#ef4444";
  const size = type === "outlet" ? 0.18 : type === "inlet" ? 0.14 : 0.11;

  return (
    <group position={position}>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size + 0.06, 0.015, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.6} />
      </mesh>

      {/* Main node */}
      <mesh ref={ref}>
        <boxGeometry args={[size, size * 0.5, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Label */}
      <Text position={[0, size + 0.12, 0]} fontSize={0.07} color="white" anchorX="center">
        {id}
      </Text>
      <Text position={[0, size + 0.22, 0]} fontSize={0.055} color={color} anchorX="center">
        {`Risk:${floodRisk}`}
      </Text>
    </group>
  );
}

function NetworkScene({ network }: { network: DrainageNetwork }) {
  // Normalize manhole positions to a 3D scene (0-5 range)
  const maxX = Math.max(...network.manholes.map((m) => m.x));
  const maxY = Math.max(...network.manholes.map((m) => m.y));
  const scale = 4 / Math.max(maxX, maxY, 1);

  const positions = useMemo(
    () =>
      network.manholes.map((mh) => ({
        ...mh,
        vec: new THREE.Vector3(mh.x * scale - 2, 0, mh.y * scale - 2),
      })),
    [network.manholes, scale]
  );

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow />
      <pointLight position={[-3, 4, -3]} intensity={0.4} color="#00d4ff" />
      <pointLight position={[3, 3, 3]} intensity={0.3} color="#f59e0b" />

      <Grid
        args={[10, 10]}
        position={[0, -0.02, 0]}
        cellColor="#1e293b"
        sectionColor="#334155"
        cellSize={0.5}
        sectionSize={2}
        fadeDistance={12}
        fadeStrength={1}
        cellThickness={0.4}
        sectionThickness={0.8}
      />

      {/* Pipes */}
      {network.pipes.map((pipe, i) => {
        const from = positions[i];
        const to = positions[i + 1];
        if (!from || !to) return null;
        return (
          <PipeMesh
            key={pipe.id}
            fromPos={from.vec}
            toPos={to.vec}
            diameter={pipe.diameter}
            velocity={pipe.velocity}
            riskScore={pipe.riskScore}
            pipeId={pipe.id}
          />
        );
      })}

      {/* Manholes */}
      {positions.map((pos) => (
        <ManholeNode
          key={pos.id}
          position={pos.vec}
          id={pos.id}
          floodRisk={pos.floodRisk}
          type={pos.type}
        />
      ))}
    </>
  );
}

export function PipeNetwork3D({ network }: PipeNetwork3DProps) {
  return (
    <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden border border-border/50 bg-[#0d1117]">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[4, 4, 4]} fov={50} />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={2}
            maxDistance={12}
            autoRotate
            autoRotateSpeed={0.4}
          />
          <NetworkScene network={network} />
        </Suspense>
      </Canvas>

      {/* Overlay legend */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg p-2 text-[10px] space-y-1 border border-white/10">
        {[
          { c: "#22c55e", l: "Low Risk / Optimal v" },
          { c: "#f59e0b", l: "Medium Risk" },
          { c: "#ef4444", l: "High Risk / Flooding" },
          { c: "#00d4ff", l: "Flow Direction" },
        ].map((e) => (
          <div key={e.l} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: e.c }} />
            <span className="text-white/60">{e.l}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-3 right-3 text-[10px] text-white/40">
        Drag · Scroll · Auto-rotate
      </div>
    </div>
  );
}
