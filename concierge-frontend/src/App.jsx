import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { LookingGlassWebXRPolyfill } from "@lookingglass/webxr";
import { XR, VRButton } from '@react-three/xr'

new LookingGlassWebXRPolyfill({
  tileHeight: 512,
  numViews: 45,
  targetY: 0,
  targetZ: 0,
  targetDiam: 3,
  fovy: (14 * Math.PI) / 180
})

function App() {
  return (
    <>
      <Loader />
      <Leva />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <XR>
          <Experience />
        </XR>
      </Canvas>
      <VRButton />
    </>
  );
}

export default App;
