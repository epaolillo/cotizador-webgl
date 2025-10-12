import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useEditor } from '../context/EditorContext';
import Block from './Block';
import CursorPreview from './CursorPreview';
import BlockGrid from './BlockGrid';
import Skybox from './Skybox';
import InfiniteGround from './InfiniteGround';
import AtmosphericFog from './AtmosphericFog';
import { Box } from '@react-three/drei';

// Loading fallback component
const LoadingFallback = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontSize: '18px',
      fontFamily: 'monospace'
    }}>
      Loading 3D Scene...
    </div>
  );
};

// Lighting setup
const Lighting = () => {
  return (
    <>
      {/* Ambient light for overall illumination - increased for skybox */}
      <ambientLight intensity={0.8} color="#ffffff" />
      
      {/* Main directional light (sun-like) - positioned to work with skybox */}
      <directionalLight
        position={[20, 25, 15]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-20, 20, -15]}
        intensity={0.6}
        color="#87CEEB"
      />
      
      {/* Top light for better visibility */}
      <directionalLight
        position={[0, 30, 0]}
        intensity={0.4}
        color="#ffffff"
      />
    </>
  );
};

// Scene content component
const SceneContent = () => {
  const { blocks, toolMode, TOOL_MODES, fogSettings } = useEditor();

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera 
        makeDefault 
        position={[15, 12, 15]} 
        fov={60}
        near={0.1}
        far={1000}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={toolMode === TOOL_MODES.MOVE}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={150} // Increased for better fog effect visibility
        minPolarAngle={0}
        target={[0, 0, 0]}
        panSpeed={toolMode === TOOL_MODES.MOVE ? 2.0 : 0.8}
        rotateSpeed={toolMode === TOOL_MODES.MOVE ? 1.5 : 0.8}
        zoomSpeed={toolMode === TOOL_MODES.MOVE ? 1.5 : 1.0}
        makeDefault
      />

      {/* Atmospheric Fog System */}
      <AtmosphericFog />

      {/* Lighting */}
      <Lighting />

      {/* Skybox for infinite sky */}
      <Skybox />

      {/* Infinite ground */}
      <InfiniteGround />

      {/* Block grid (handles interaction) */}
      <BlockGrid />

      <Box position={[0, 0, 0]} args={[1, 1, 1]} />

      {/* Render all blocks */}
      {blocks.map((block) => (
        <Block
          key={block.id}
          block={block}
          color="#4a90e2"
          opacity={1.0}
        />
      ))}

      {/* Cursor preview */}
      <CursorPreview />


      {/* <Pasto /> */}


    </>
  );
};

// Main Scene component
const Scene = () => {
  const { fogSettings } = useEditor();
  
  // Dynamic background color based on fog settings
  const backgroundColor = fogSettings.enabled ? fogSettings.color : '#87CEEB';
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: [15, 12, 15], fov: 60 }}
          style={{ 
            background: `linear-gradient(to bottom, ${backgroundColor} 0%, ${backgroundColor}CC 50%, ${backgroundColor}AA 100%)`
          }}
          gl={{
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true
          }}
          dpr={[1, 2]} // Device pixel ratio for better quality on high-DPI screens
          // Fog is now handled by AtmosphericFog component for better control
        >
          <SceneContent />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene;
