import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { useEditor } from '../context/EditorContext';
import Block from './Block';
import CursorPreview from './CursorPreview';
import BlockGrid from './BlockGrid';
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
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Main directional light (sun-like) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.0}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-10, 8, -5]}
        intensity={0.3}
        color="#b4c8ff"
      />
      
      {/* Top light for better visibility */}
      <directionalLight
        position={[0, 20, 0]}
        intensity={0.2}
        color="#ffffff"
      />
    </>
  );
};

// Scene content component
const SceneContent = () => {
  const { blocks, toolMode, TOOL_MODES } = useEditor();

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
        maxDistance={100}
        minPolarAngle={0}
        target={[0, 0, 0]}
        panSpeed={toolMode === TOOL_MODES.MOVE ? 2.0 : 0.8}
        rotateSpeed={toolMode === TOOL_MODES.MOVE ? 1.5 : 0.8}
        zoomSpeed={toolMode === TOOL_MODES.MOVE ? 1.5 : 1.0}
        makeDefault
      />

      {/* Lighting */}
      <Lighting />

      {/* Environment for reflections and ambient lighting */}
      <Environment preset="sunset" />

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
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: [15, 12, 15], fov: 60 }}
          style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%)'
          }}
          gl={{
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true
          }}
          dpr={[1, 2]} // Device pixel ratio for better quality on high-DPI screens
        >
          <SceneContent />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene;
