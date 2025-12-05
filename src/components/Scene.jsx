import React, { Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useEditor } from '../context/EditorContext';
import ObjectRenderer from './ObjectRenderer';
import CursorPreview from './CursorPreview';
import BlockGrid from './BlockGrid';
import Skybox from './Skybox';
import InfiniteGround from './InfiniteGround';
import AtmosphericFog from './AtmosphericFog';
import CameraTracker from './CameraTracker';
import CameraAnimator from './CameraAnimator';
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

// Component to restrict camera pan to stay near the editable lot
const CameraPanRestrictor = ({ gridSize = 20 }) => {
  const { controls } = useThree();
  const lotCenter = React.useRef(new THREE.Vector3(
    gridSize / 2 + 0.5, 
    -0.5, 
    gridSize / 2 + 0.5
  ));
  const maxPanDistance = gridSize * 0.3; // Allow panning up to 30% of grid size from center
  
  useFrame(() => {
    if (!controls || !controls.target) return;
    
    const target = controls.target;
    const dx = target.x - lotCenter.current.x;
    const dz = target.z - lotCenter.current.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > maxPanDistance) {
      // Clamp target to max distance from lot center
      const angle = Math.atan2(dz, dx);
      target.x = lotCenter.current.x + Math.cos(angle) * maxPanDistance;
      target.z = lotCenter.current.z + Math.sin(angle) * maxPanDistance;
      // Keep Y at ground level
      target.y = lotCenter.current.y;
      controls.update();
    }
  });
  
  return null;
};

// Scene content component
const SceneContent = ({ blocks, cameraData, cameraView, interactionMode, INTERACTION_MODES }) => {
  // Initial camera configuration from context
  const initialCameraPosition = [cameraData.position.x, cameraData.position.y, cameraData.position.z];
  const initialCameraTarget = [cameraData.target.x, cameraData.target.y, cameraData.target.z];
  const GRID_SIZE = 20; // Match BlockGrid.jsx

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera 
        makeDefault 
        position={initialCameraPosition} 
        fov={60}
        near={0.1}
        far={1000}
      />

      {/* Camera controls - disabled during animation and block insertion */}
      <OrbitControls
        enablePan={!cameraView.isAnimating && interactionMode === INTERACTION_MODES.NONE}
        enableZoom={true} // Zoom enabled with mouse wheel
        enableRotate={!cameraView.isAnimating && interactionMode === INTERACTION_MODES.NONE}
        minDistance={5}
        maxDistance={25} // Limited to prevent excessive zoom out
        minPolarAngle={Math.PI * 0.15} // Prevent rotating too far up
        maxPolarAngle={Math.PI * 0.4} // Prevent rotating too far down (can't see under the ground)
        target={initialCameraTarget}
        panSpeed={1.5}
        rotateSpeed={1.5}
        zoomSpeed={1.5} // Zoom speed with mouse wheel
        makeDefault
      />
      
      {/* Restrict camera pan to stay near the editable lot */}
      <CameraPanRestrictor gridSize={GRID_SIZE} />

      {/* Atmospheric Fog System */}
      <AtmosphericFog />

      {/* Lighting */}
      <Lighting />

      {/* Skybox for infinite sky */}
      <Skybox />

      {/* Infinite ground - HIDDEN to see division lines */}
      {/* <InfiniteGround /> */}

      {/* Block grid (handles interaction) */}
      <BlockGrid />

      <Box position={[0, 0, 0]} args={[1, 1, 1]} />

      {/* Render all blocks using ObjectRenderer for type-specific components */}
      {blocks.map((block) => (
        <ObjectRenderer
          key={block.id}
          block={block}
          opacity={1.0}
          selected={false}
        />
      ))}

      {/* Cursor preview */}
      <CursorPreview />

      {/* Camera data tracker (invisible) */}
      <CameraTracker />
      
      {/* Camera animation handler (invisible) */}
      <CameraAnimator />

      {/* <Pasto /> */}


    </>
  );
};

// Main Scene component
const Scene = () => {
  const { fogSettings, cameraData, cameraView, interactionMode, INTERACTION_MODES, blocks } = useEditor();
  
  // Dynamic background color based on fog settings
  const backgroundColor = fogSettings.enabled ? fogSettings.color : '#87CEEB';
  
  // Initial camera configuration
  const initialCameraPosition = [cameraData.position.x, cameraData.position.y, cameraData.position.z];
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: initialCameraPosition, fov: 60 }}
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
          <SceneContent 
            blocks={blocks}
            cameraData={cameraData}
            cameraView={cameraView}
            interactionMode={interactionMode}
            INTERACTION_MODES={INTERACTION_MODES}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Scene;
