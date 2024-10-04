import { Loader } from "@react-three/drei";
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { LookingGlassWebXRPolyfill, LookingGlassConfig } from "@lookingglass/webxr";
import { XR, VRButton } from '@react-three/xr'

const config = LookingGlassConfig
config.tileHeight = 455
config.numViews = 24
config.trackballX = 0
config.trackballY = 0
config.targetX = 0.2
config.targetY = -0.3
config.targetZ = 0.79
config.targetDiam = 3
config.fovy = (13 * Math.PI) / 180
new LookingGlassWebXRPolyfill()

function Box(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef()
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}>
      <boxGeometry args={[.001, .001, .001]} />
      <meshStandardMaterial color={'black'} />
    </mesh>
  )
}

function App() {
  return (
    <>
      <Loader />
      <Leva collapsed />
      <UI />
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 45 }}>
        <XR >
          <Box position={[0, -1, -1]} />
          <group scale={[4, 4, 4]} position={[0, -5, -1]}>
            <Experience />
          </group>
        </XR>
      </Canvas>
      <VRButton />
    </>
  );
}

export default App;