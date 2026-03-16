"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Building({ position, height, width, depth, color, speed = 1 }: {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const windowCount = Math.floor(height * 2.5);
  const windowCols = Math.max(2, Math.floor(width * 3));

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + position[0] * 2) * 0.06;
    }
  });

  return (
    <group position={position}>
      <Float speed={speed * 0.5} rotationIntensity={0.02} floatIntensity={0.15}>
        <mesh ref={ref} castShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={color} metalness={0.05} roughness={0.7} />
        </mesh>

        {/* Windows - front face */}
        {Array.from({ length: windowCount }).map((_, row) =>
          Array.from({ length: windowCols }).map((_, col) => (
            <mesh key={`f${row}-${col}`} position={[
              -width / 2 + (col + 0.5) * (width / windowCols),
              -height / 2 + (row + 0.5) * (height / windowCount),
              depth / 2 + 0.005,
            ]}>
              <planeGeometry args={[width / windowCols * 0.55, height / windowCount * 0.45]} />
              <meshStandardMaterial color="#e0e7ff" emissive="#6366f1" emissiveIntensity={0.15 + Math.random() * 0.2} />
            </mesh>
          ))
        )}

        {/* Roof line */}
        <mesh position={[0, height / 2 + 0.015, 0]}>
          <boxGeometry args={[width + 0.03, 0.03, depth + 0.03]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

function FloatingParticle({ position, speed, size }: {
  position: [number, number, number]; speed: number; size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.4;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={1.5} transparent opacity={0.6} />
    </mesh>
  );
}

function Particles({ count = 30 }: { count?: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      position: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 4] as [number, number, number],
      speed: 0.3 + Math.random() * 0.4,
      size: 0.015 + Math.random() * 0.025,
    })), [count]);
  return <>{particles.map((p, i) => <FloatingParticle key={i} {...p} />)}</>;
}

function CityScene() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Row 1 — front */}
      <Building position={[-2.2, 0.5, 0.3]} height={1.0} width={0.55} depth={0.5} color="#dbeafe" speed={0.7} />
      <Building position={[-1.3, 0.8, 0]} height={1.6} width={0.5} depth={0.45} color="#c7d2fe" speed={1.1} />
      <Building position={[-0.4, 0.45, 0.4]} height={0.9} width={0.65} depth={0.5} color="#e0e7ff" speed={0.6} />
      <Building position={[0.5, 1.0, -0.1]} height={2.0} width={0.5} depth={0.5} color="#bfdbfe" speed={0.9} />
      <Building position={[1.4, 0.6, 0.3]} height={1.2} width={0.55} depth={0.45} color="#c7d2fe" speed={1.0} />
      <Building position={[2.2, 0.4, 0]} height={0.8} width={0.5} depth={0.45} color="#ddd6fe" speed={0.8} />

      {/* Row 2 — back */}
      <Building position={[-1.7, 0.35, -1.0]} height={0.7} width={0.45} depth={0.4} color="#e0e7ff" speed={0.65} />
      <Building position={[-0.3, 0.6, -0.9]} height={1.2} width={0.4} depth={0.4} color="#bfdbfe" speed={1.2} />
      <Building position={[0.9, 0.5, -0.8]} height={1.0} width={0.45} depth={0.4} color="#c7d2fe" speed={0.75} />
      <Building position={[2.0, 0.3, -0.7]} height={0.6} width={0.4} depth={0.4} color="#ddd6fe" speed={0.9} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.1} roughness={0.9} />
      </mesh>

      <Particles count={25} />
      <ContactShadows position={[0, -0.04, 0]} opacity={0.3} scale={8} blur={2.5} color="#94a3b8" />
    </group>
  );
}

export default function Scene3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2.8, 5.5], fov: 42 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} color="#ffffff" />
        <pointLight position={[-3, 3, 2]} intensity={0.4} color="#93c5fd" />
        <pointLight position={[3, 4, -1]} intensity={0.3} color="#a5b4fc" />

        <CityScene />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
}
