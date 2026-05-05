// src/components/TableMountainPanorama.jsx
import React from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function PanoramaSphere() {
  const texture = useLoader(THREE.TextureLoader, "/table-mountain.jpg");

  return (
    <mesh>
      <sphereGeometry args={[500, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

export default function TableMountainPanorama() {
  return (
    <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
      <PanoramaSphere />
      <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.2} />
    </Canvas>
  );
}


// import { Html } from "@react-three/drei";

// <mesh position={[50, 20, -100]} onClick={() => alert("Signal Hill!")}>
//   <sphereGeometry args={[5, 16, 16]} />
//   <meshBasicMaterial color="red" />
//   <Html>
//     <div className="bg-white p-1 rounded text-sm">Signal Hill</div>
//   </Html>
// </mesh>

// import TableMountainPanorama from "./components/TableMountainPanorama";

// function LandingPage() {
//   return (
//     <div style={{ width: "100vw", height: "100vh" }}>
//       <TableMountainPanorama />
//     </div>
//   );
// }

// export default LandingPage;