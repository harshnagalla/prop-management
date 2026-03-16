"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment, ContactShadows } from "@react-three/drei";
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

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.08;
    }
  });

  // Window pattern
  const windowCount = Math.floor(height * 2);
  const windowRows = Math.floor(width * 2);

  return (
    <group position={position}>
      <Float speed={speed} rotationIntensity={0.05} floatIntensity={0.3}>
        {/* Main building */}
        <mesh ref={ref} castShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={color}
            metalness={0.1}
            roughness={0.6}
          />
        </mesh>

        {/* Windows */}
        {Array.from({ length: windowCount }).map((_, row) =>
          Array.from({ length: windowRows }).map((_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[
                -width / 2 + (col + 0.5) * (width / windowRows),
                -height / 2 + (row + 0.5) * (height / windowCount),
                depth / 2 + 0.01,
              ]}
            >
              <planeGeometry args={[width / windowRows * 0.6, height / windowCount * 0.5]} />
              <meshStandardMaterial
                color="#f0f4ff"
                emissive="#4477ff"
                emissiveIntensity={0.3 + Math.random() * 0.4}
              />
            </mesh>
          ))
        )}

        {/* Roof accent */}
        <mesh position={[0, height / 2 + 0.02, 0]}>
          <boxGeometry args={[width + 0.05, 0.04, depth + 0.05]} />
          <meshStandardMaterial color="#1e40af" metalness={0.5} roughness={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

function GlassOrb({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={0.5}
        chromaticAberration={0.2}
        anisotropy={0.3}
        distortion={0.2}
        distortionScale={0.3}
        temporalDistortion={0.1}
        color="#6366f1"
        transmission={0.95}
      />
    </mesh>
  );
}

function Particles({ count = 50 }: { count?: number }) {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
        ] as [number, number, number],
        speed: 0.2 + Math.random() * 0.5,
        size: 0.01 + Math.random() * 0.03,
      });
    }
    return temp;
  }, [count]);

  return (
    <>
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}
    </>
  );
}

function FloatingParticle({ position, speed, size }: {
  position: [number, number, number];
  speed: number;
  size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.5;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={2} />
    </mesh>
  );
}

function CityScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Buildings - create a mini city */}
      <Building position={[-2, 0.6, 0]} height={1.2} width={0.6} depth={0.6} color="#3b82f6" speed={0.8} />
      <Building position={[-1.2, 0.9, -0.5]} height={1.8} width={0.5} depth={0.5} color="#6366f1" speed={1.2} />
      <Building position={[-0.4, 0.5, 0.3]} height={1.0} width={0.7} depth={0.5} color="#8b5cf6" speed={0.6} />
      <Building position={[0.5, 1.1, -0.2]} height={2.2} width={0.55} depth={0.55} color="#4f46e5" speed={1.0} />
      <Building position={[1.3, 0.7, 0.4]} height={1.4} width={0.6} depth={0.5} color="#3b82f6" speed={0.9} />
      <Building position={[2.1, 0.45, -0.3]} height={0.9} width={0.5} depth={0.5} color="#7c3aed" speed={1.1} />

      {/* Second row */}
      <Building position={[-1.5, 0.4, -1.2]} height={0.8} width={0.5} depth={0.5} color="#2563eb" speed={0.7} />
      <Building position={[0, 0.65, -1.0]} height={1.3} width={0.45} depth={0.45} color="#4338ca" speed={1.3} />
      <Building position={[1.5, 0.55, -0.9]} height={1.1} width={0.5} depth={0.5} color="#6d28d9" speed={0.8} />

      {/* Glass orb */}
      <GlassOrb position={[0, 2.5, 0]} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Particles */}
      <Particles count={40} />

      <ContactShadows position={[0, -0.09, 0]} opacity={0.4} scale={10} blur={2} />
    </group>
  );
}

export default function Scene3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 3, 6], fov: 45 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-3, 4, -2]} intensity={0.5} color="#818cf8" />
        <pointLight position={[3, 3, 2]} intensity={0.3} color="#3b82f6" />

        <CityScene />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
