import { Loader, OrbitControls, useTexture } from "@react-three/drei";;
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { LookingGlassWebXRPolyfill, LookingGlassConfig } from "@lookingglass/webxr";
import { XR, VRButton, Controllers, Hands } from '@react-three/xr';
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const config = LookingGlassConfig
config.tileHeight = 455
config.numViews = 24
config.targetX = -0.2
config.trackballX = 0
config.trackballY = 0
config.targetX = 0.2
config.targetY = -0.3
config.targetZ = 0.79
config.targetDiam = 3
config.fovy = (13 * Math.PI) / 180
new LookingGlassWebXRPolyfill()

function FlatCubeBackground() {
  const texture = useTexture('/textures/tama-frontdesk.jpg');
  const size = 10; // Adjust this value to change the size of the cube
  const depth = 0.01; // Very small depth to make it appear flat

  return (
    <>
      <mesh position={[0, 0, -3.5]}>
        <boxGeometry args={[size, size, depth]} />
        <meshBasicMaterial map={texture} side={2} /> {/* Side: 2 for double-sided material */}
      </mesh>
    </>
  );
}

function App() {
  //Cajita escondida dentro del avatar
  return (
    <>
      <UI />
      <Leva collapsed />
      <VRButton />
      <Canvas>
        <XR>
          <Controllers />
          <Hands />
          <OrbitControls />
          <FlatCubeBackground />
          <group scale={[4, 4, 4]} position={[0, -5, -1]}>
            <Experience />
          </group>
        </XR>
      </Canvas>
      <Loader />
    </>
  );
}
export default App;
