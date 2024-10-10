import { CameraControls, ContactShadows, Environment, Text, RoundedBox, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";
import ThreeQRCode from "./ThreeQRCode";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { useSpring, animated } from '@react-spring/three';

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
  const qrData = "https://reservations.app.guesthub.io/#/properties/154"; //QR Link
  const texture = useTexture('../public/image.jpg'); //Image Link

  const AnimatedGroup = animated.group;
  const springProps = useSpring({
    scale: showQR ? 1 : 0,
    opacity: showQR ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  });

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
    }, 40000); // Hide QR code after 60 seconds
  }, []);
  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.07} />
      </Suspense>
      <Avatar thinking={thinking} onArmGesture={handleArmGesture} rotation={[.15, 0, 0]} />
      {showQR && (
        <AnimatedGroup rotation={[0, 0, 0]} position={[-0.8, 1.8, -0.4]} scale={springProps.scale} opacity={springProps.opacity}>
          <RoundedBox args={[0.60, 0.60, 0.01]} radius={0.02} smoothness={4}>
            <meshBasicMaterial color="white" />
          </RoundedBox>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.60, 0.60]} />
            <meshBasicMaterial color="white" transparent opacity={springProps.opacity} />
          </mesh>
          <ThreeQRCode
            value={qrData}
            size={0.55}
            position={[-0.8, 1.85, -0.579]}
            renderOrder={1}
          />
        </AnimatedGroup>
      )}
    </>
  );
};