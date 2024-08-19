import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { LookingGlassWebXRPolyfill, LookingGlassConfig } from "@lookingglass/webxr";
import { XR, VRButton } from '@react-three/xr'

const config = LookingGlassConfig
config.tileHeight = 1024
config.numViews = 45
config.targetX = -0.2
config.trackballX = 0
config.trackballY = 0.4
config.targetX = 0.2
config.targetY = 0.3
config.targetZ = 0.79
config.targetDiam = 3
config.fovy = (13 * Math.PI) / 180
new LookingGlassWebXRPolyfill()

function App() {
  return (
    <>
      <Loader />
      <Leva />
      <UI />
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 45 }}>
        <XR>
          <Experience />
        </XR>
      </Canvas>
      <VRButton hidden/>
    </>
  );
}

export default App;
