import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, OrbitControls } from '@react-three/drei';

// Component to play 360 video on inside of a sphere
function VideoSphere({ videoSrc }) {
  const meshRef = useRef();
  const videoRef = useRef(document.createElement('video'));

  useEffect(() => {
    const video = videoRef.current;
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {
      // auto play policy might block, user interaction needed
      console.log('Video autoplay blocked, user interaction required');
    });

    return () => {
      video.pause();
      video.src = '';
    };
  }, [videoSrc]);

  const texture = new THREE.VideoTexture(videoRef.current);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;

  // Invert sphere geometry to view from inside
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function VRButton() {
  // Standard WebXR button with fallback
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then(setIsSupported);
    }
  }, []);

  const startVR = () => {
    if (!navigator.xr) {
      alert('WebXR not supported on this browser/device');
      return;
    }
    navigator.xr.requestSession('immersive-vr').then((session) => {
      const canvas = document.querySelector('canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.xr.enabled = true;
      renderer.xr.setSession(session);
    });
  };

  if (!isSupported) return <p>VR not supported on this device/browser.</p>;

  return (
    <button
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        padding: '12px 20px',
        fontSize: 16,
        zIndex: 1000,
      }}
      onClick={startVR}
    >
      Enter VR
    </button>
  );
}

function App() {
  const videoUrl = 'https://cdn.glitch.global/4d68b686-4a94-4e74-b4bb-1e4ff63f7aee/sunset360.mp4?v=1686438100382'; // Replace with your own 360 video URL

  return (
    <>
      <VRButton />
      <Canvas
        style={{ height: '100vh', background: 'black' }}
        camera={{ position: [0, 0, 0.1] }}
        vr
      >
        <VideoSphere videoSrc={videoUrl} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <Html
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: 'white',
          fontSize: 18,
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: 5,
          maxWidth: 300,
        }}
      >
        <p>Use mouse drag or VR headset to look around the 360 video.</p>
        <p>Click "Enter VR" if you have a compatible VR headset.</p>
      </Html>
    </>
  );
}

export default App;
