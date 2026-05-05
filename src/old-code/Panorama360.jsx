// Panorama.jsx
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";

const PanoramaScene = ({ image }) => {
  const sphereRef = useRef();

  const texture = useTexture(image);
  console.log("Texture loaded:", texture);

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight intensity={0} position={[10, 10, 10]} />

      <Sphere args={[50, 64, 64]}>
        <meshBasicMaterial attach="material" map={texture} side={THREE.BackSide} />
      </Sphere>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        rotateSpeed={0.4}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    </>
  );
};

export default function Panorama360({ image }) {
  return (
    <Canvas 
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 0.1], fov: 75 }}
    >
      <Suspense fallback={null}>
        <PanoramaScene image={image} />
      </Suspense>
    </Canvas>
  );
}