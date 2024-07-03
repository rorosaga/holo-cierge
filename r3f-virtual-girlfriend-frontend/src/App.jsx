import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
// import { XR, VRButton } from "@react-three/xr";
// import { LookingGlassWebXRPolyfill, LookingGlassConfig } from "@lookingglass/webxr";
// const config = LookingGlassConfig
// config.tileHeight = 512
// config.numViews = 45
// config.targetY = 0
// config.targetZ = 0
// config.targetDiam = 3
// config.fovy = (40 * Math.PI) / 180
// new LookingGlassWebXRPolyfill()


function App() {
  return (
    <>
      <Loader />
      <Leva />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        {/* <XR> */}
        <Experience />
        {/* </XR> */}
        {/* <VRButton /> */}
      </Canvas>
    </>
  );
}

export default App;
