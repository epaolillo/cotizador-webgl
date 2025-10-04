import React, { useMemo, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Plane, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useEditor } from '../context/EditorContext';
import GrassGround from './GrassGround';
import brickTexture from '../assets/uneven-brick-wall-light-colors.jpg';

// Grid configuration
const GRID_SIZE = 20; // Grid extends from -GRID_SIZE to +GRID_SIZE
const GRID_SPACING = 1;
const BLOCK_SIZE = 1;


const X_LINES = () => {


  let TotalLinesX = GRID_SIZE * 2;
  let LinesX = [];

  for (let i = 0; i < TotalLinesX; i++) {

    const x = ((i - GRID_SIZE) * GRID_SPACING ) + 0.5;
    LinesX.push( 
      <line key={`grid-x-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([
              x, -0.5, -GRID_SIZE,
              x, -0.5, GRID_SIZE
            ])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#333333" opacity={0.2} transparent />
      </line>
    )
  }

  return (
    <group>
      {LinesX}
    </group>
  )

}

const Y_LINES = () => {
  let TotalLinesY = GRID_SIZE * 2;
  let LinesY = [];

  for (let i = 0; i < TotalLinesY; i++) {

    const y = ((i - GRID_SIZE) * GRID_SPACING ) + 0.5;
    LinesY.push( 
      <line key={`grid-x-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([
              -GRID_SIZE, -0.5, y,
              GRID_SIZE, -0.5, y
            ])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#333333" opacity={0.2} transparent />
      </line>
    )
  }

  return (
    <group>
      {LinesY}
    </group>
  )

}

// Grid helper component (invisible but helps with positioning)
const GridHelper = () => {
  const gridRef = useRef();
  
  useFrame(() => {
    if (gridRef.current) {
      // Keep grid helper visible in development if needed
      gridRef.current.visible = false; // Hidden in production
    }
  });

  return (
    <gridHelper 
      ref={gridRef}
      args={[GRID_SIZE * 2, GRID_SIZE * 2, '#444444', '#222222']}
      position={[0, 0, 0]}
    />
  );
};

// Invisible plane for raycasting
const InteractionPlane = ({ onPointerMove, onPointerDown }) => {
  const planeRef = useRef();
  
  return (
    <Plane
      ref={planeRef}
      args={[GRID_SIZE, GRID_SIZE]}
      position={[GRID_SIZE / 2, 0, GRID_SIZE / 2]}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false} // Invisible plane
    >
      <meshBasicMaterial transparent opacity={0} />
    </Plane>
  );
};

// Main BlockGrid component
const BlockGrid = () => {
  const { 
    setPreviewPosition, 
    handleFirstClick, 
    handleSecondClick, 
    interactionMode, 
    INTERACTION_MODES,
    toolMode,
    TOOL_MODES,
    clearInteraction
  } = useEditor();
  
  const { camera, raycaster } = useThree();
  
  // Load brick texture for walls
  const brickTex = useLoader(THREE.TextureLoader, brickTexture);
  
  // Configure brick texture
  useMemo(() => {
    if (brickTex) {
      brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
      brickTex.repeat.set(4, 2); // Adjust repetition for good brick appearance
    }
  }, [brickTex]);
  
  // Convert world position to grid position (discrete/snap to grid)
  const worldToGrid = useMemo(() => {
    return (worldPos) => {
      return {
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        z: Math.round(worldPos.z)
      };
    };
  }, []);

  // Handle pointer movement for preview
  const handlePointerMove = (event) => {
    // Only show preview in block mode
    if (toolMode !== TOOL_MODES.BLOCK) {
      setPreviewPosition(null);
      return;
    }

    if (!event.intersections || event.intersections.length === 0) {
      setPreviewPosition(null);
      return;
    }

    const intersection = event.intersections[0];
    const worldPosition = intersection.point;
    
    // Convert to grid coordinates
    const gridPosition = worldToGrid(worldPosition);
    
    // Ensure we're above ground (y >= 0 for blocks)
    if (gridPosition.y < 0) {
      gridPosition.y = 0;
    }
    
    setPreviewPosition(gridPosition);
  };

  // Handle clicks for block placement
  const handlePointerDown = (event) => {
    // Only handle clicks in block mode
    if (toolMode !== TOOL_MODES.BLOCK) {
      return;
    }

    if (!event.intersections || event.intersections.length === 0) return;

    const intersection = event.intersections[0];
    const worldPosition = intersection.point;
    const gridPosition = worldToGrid(worldPosition);
    
    // Ensure we're above ground
    if (gridPosition.y < 0) {
      gridPosition.y = 0;
    }

    // Handle click based on current interaction mode
    switch (interactionMode) {
      case INTERACTION_MODES.NONE:
        handleFirstClick(gridPosition);
        break;
        
      case INTERACTION_MODES.PLACING_SECOND:
        handleSecondClick(gridPosition);
        break;
        
      default:
        break;
    }
  };

  // Handle escape key to cancel interaction
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        clearInteraction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearInteraction]);

  return (
    <group position={[0, 0, 0]}>
      {/* Grid visual helper (invisible in production) */}
      <GridHelper />
      
        {/* Grass ground with animated grass blades */}
        <GrassGround
          size={GRID_SIZE}
          grassCount={90000}
          position={[(GRID_SIZE / 2) + 0.5, -0.5, (GRID_SIZE / 2) + 0.5]}
        />

      
      {/* Interactive plane for mouse/touch input */}
      <group position={[0, 0, 0]}>
        <InteractionPlane 
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
        />
      </group>

      {/* Walls around the grid - using thin boxes for better visibility */}

      <Box
        args={[0.1, 3, GRID_SIZE]}
        position={[0.5, 1, (GRID_SIZE / 2) + 0.5]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial map={brickTex} />
      </Box>


      <Box
        args={[0.1, 3, GRID_SIZE]}
        position={[ (GRID_SIZE ) + 0.5, 1, (GRID_SIZE / 2) + 0.5]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial map={brickTex} />
      </Box>


      <Box
        args={[GRID_SIZE, 3, 0.1]}
        position={[ (GRID_SIZE / 2) + 0.5, 1, 0.5]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial map={brickTex} />
      </Box>

      <Box
        args={[GRID_SIZE, 3, 0.1]}
        position={[ (GRID_SIZE / 2) + 0.5, 1, (GRID_SIZE ) + 0.5]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial map={brickTex} />
      </Box>

      
        {/* Grid lines for visual reference (subtle) */}
        { /* 
        <X_LINES />
        <Y_LINES /> 
        */ }
        
        {/* Z-axis lines */}

    </group>
  );
};

export default BlockGrid;
