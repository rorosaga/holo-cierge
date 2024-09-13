import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";
import ThreeQRCode from "./ThreeQRCode";

//This code initially had 3 black dots display on top of the avatar while thinking.
const Dots = (props) => {
  const { thinking } = useChat();
  const [loadingText, setLoadingText] = useState("");
  useEffect(() => {
    if (thinking) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return ".";
          }
          return loadingText + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [thinking]);
  if (!thinking) return null;
  /*return (
    <group {...props} position={[0, 1, 0]}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );*/
};

export const Experience = () => {
  const cameraControls = useRef();
  const { cameraZoomed, thinking } = useChat();
  const [showQR, setShowQR] = useState(false);
  const qrData = "http://linktr.ee/DLMSolucionesInmobiliarias";

  useEffect(() => {
    cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);

  const handleArmGesture = useCallback(() => {
    setShowQR(true);
    setTimeout(() => {
      setShowQR(false);
    }, 10000); // Hide QR code after 10 seconds
  }, []);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.07} />
      </Suspense>
      <Avatar thinking={thinking} onArmGesture={handleArmGesture} />
      <ContactShadows opacity={0.7} />
      {showQR && (<ThreeQRCode value={qrData} size={.4} position={[-0.8, 1.8, -.2]} />
      )}
    </>
  );
};
