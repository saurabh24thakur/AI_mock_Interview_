import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Cylinder, MeshDistortMaterial } from "@react-three/drei";

function RobotHead() {
  const headRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Gentle floating animation
    headRef.current.position.y = Math.sin(t * 1) * 0.1;
    // Subtle rotation
    headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <group ref={headRef}>
      {/* Main Head */}
      <Sphere args={[1, 32, 32]} scale={[1, 1.2, 1]}>
        <MeshDistortMaterial
          color="#a3e635" // Lime 400
          attach="material"
          distort={0.3} // Low distortion for a sleek look
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Eyes (Glowing) */}
      <group position={[0, 0.1, 0.85]}>
        <Sphere args={[0.15, 32, 32]} position={[-0.35, 0, 0]}>
          <meshStandardMaterial color="#000000" roughness={0.1} />
        </Sphere>
        <Sphere args={[0.15, 32, 32]} position={[0.35, 0, 0]}>
          <meshStandardMaterial color="#000000" roughness={0.1} />
        </Sphere>
        
        {/* Pupils (Cyan Glow) */}
        <Sphere args={[0.05, 32, 32]} position={[-0.35, 0, 0.12]}>
          <meshBasicMaterial color="#00ffff" />
        </Sphere>
        <Sphere args={[0.05, 32, 32]} position={[0.35, 0, 0.12]}>
          <meshBasicMaterial color="#00ffff" />
        </Sphere>
      </group>

      {/* Ears (Antennae) */}
      <Cylinder args={[0.05, 0.05, 0.5]} position={[-1.1, 0.2, 0]} rotation={[0, 0, 0.5]}>
        <meshStandardMaterial color="#4b5563" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.5]} position={[1.1, 0.2, 0]} rotation={[0, 0, -0.5]}>
        <meshStandardMaterial color="#4b5563" metalness={0.8} />
      </Cylinder>
      
      {/* Ear Tips (Glowing) */}
      <Sphere args={[0.1, 16, 16]} position={[-1.3, 0.4, 0]}>
        <meshBasicMaterial color="#a3e635" />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[1.3, 0.4, 0]}>
        <meshBasicMaterial color="#a3e635" />
      </Sphere>

      {/* Neck */}
      <Cylinder args={[0.4, 0.4, 0.5]} position={[0, -1.2, 0]}>
         <meshStandardMaterial color="#374151" metalness={0.6} />
      </Cylinder>
    </group>
  );
}

export default function Avatar3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#a3e635" intensity={0.5} />
        
        <RobotHead />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
