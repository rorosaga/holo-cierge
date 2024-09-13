import React, { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import QRCode from 'qrcode';
import { CameraControls, ContactShadows, Environment, Text, Plane } from "@react-three/drei";

const ThreeQRCode = ({ value, size = 1, position = [0, 0, 0] }) => {
    const { scene } = useThree();

    const qrCodeTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        QRCode.toCanvas(canvas, value, { width: 256, height: 256 });
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, [value]);

    useEffect(() => {
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({
            map: qrCodeTexture,
            transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        scene.add(mesh);

        return () => {
            scene.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [scene, size, position, qrCodeTexture]);

    return null;
};

export default ThreeQRCode;