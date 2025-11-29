import React, { useMemo, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Plane, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useEditor } from '../context/EditorContext';
import GrassGround from './GrassGround';
import BackgroundTrees from './BackgroundTrees';
import brickTexture from '../assets/uneven-brick-wall-light-colors.jpg';

// Grid configuration
const GRID_SIZE = 20; // Grid extends from -GRID_SIZE to +GRID_SIZE
const GRID_SPACING = 1;
const BLOCK_SIZE = 1;
// Walls are at 0.5 and 20.5, but grid positions are integers (0, 1, 2... 20, 21)
// So positions 0, 1, 20, and 21 are "on the boundary" (next to walls)
const TERRAIN_MIN_GRID = 0;  // First grid position (next to wall at 0.5)
const TERRAIN_MAX_GRID = GRID_SIZE + 1; // Last grid position (next to wall at 20.5)

// Check if a position is on the terrain boundary (where walls are)
// Since walls are at 0.5 and 20.5, and grid positions are integers,
// positions 0, 1, 20, and 21 are considered "on boundary"
const isOnTerrainBoundary = (position) => {
  return position.x === TERRAIN_MIN_GRID || 
         position.x === TERRAIN_MIN_GRID + 1 ||
         position.x === TERRAIN_MAX_GRID - 1 ||
         position.x === TERRAIN_MAX_GRID || 
         position.z === TERRAIN_MIN_GRID || 
         position.z === TERRAIN_MIN_GRID + 1 ||
         position.z === TERRAIN_MAX_GRID - 1 ||
         position.z === TERRAIN_MAX_GRID;
};


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
  
  // Terrain extends from 0.5 to 20.5, so we need a larger plane to ensure edge clicks work
  // Make it 22x22 centered at 10.5 to cover 0 to 21 (with margin on all sides)
  const PLANE_SIZE = 22;
  const PLANE_CENTER = 10.5;
  
  return (
    <Plane
      ref={planeRef}
      args={[PLANE_SIZE, PLANE_SIZE]}
      position={[PLANE_CENTER, 0, PLANE_CENTER]}
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
    clearInteraction,
    selectedObjectType,
    toolActive,
    toggleToolActive,
    blocks,
    invalidPlacementReason,
    firstClickPosition
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
    // Only show preview when tool is active and in block mode
    if (!toolActive || toolMode !== TOOL_MODES.BLOCK) {
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
    // Only handle left mouse button (button === 0)
    // button 0 = left, button 1 = middle, button 2 = right
    if (event.button !== 0) {
      return;
    }

    // Only handle clicks when tool is active and in block mode
    if (!toolActive || toolMode !== TOOL_MODES.BLOCK) {
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

    // Check if pool/water is being placed on boundary
    const isPool = selectedObjectType && 
                  (selectedObjectType.id === 'pool' || selectedObjectType.id === 'water');
    
    if (isPool) {
      // For first click, check if position is on boundary
      if (interactionMode === INTERACTION_MODES.NONE && isOnTerrainBoundary(gridPosition)) {
        return; // Block the click
      }
      
      // For second click, check if any position in the selection would be on boundary
      if (interactionMode === INTERACTION_MODES.PLACING_SECOND && firstClickPosition) {
        const minX = Math.min(firstClickPosition.x, gridPosition.x);
        const maxX = Math.max(firstClickPosition.x, gridPosition.x);
        const minZ = Math.min(firstClickPosition.z, gridPosition.z);
        const maxZ = Math.max(firstClickPosition.z, gridPosition.z);
        
        // Check if any position in the range is on boundary
        for (let x = minX; x <= maxX; x++) {
          for (let z = minZ; z <= maxZ; z++) {
            if (isOnTerrainBoundary({ x, y: gridPosition.y, z })) {
              return; // Block the click
            }
          }
        }
      }
    }

    // Don't allow clicks if placement is invalid
    if (invalidPlacementReason) {
      return; // Block the click
    }

    // Handle click based on current interaction mode
    switch (interactionMode) {
      case INTERACTION_MODES.NONE:
        // For unique objects, place immediately with single click
        if (selectedObjectType && selectedObjectType.unique) {
          // Place single block at clicked position
          handleSecondClick(gridPosition);
        } else {
          // For multi-block objects, start selection
          handleFirstClick(gridPosition);
        }
        break;
        
      case INTERACTION_MODES.PLACING_SECOND:
        handleSecondClick(gridPosition);
        break;
        
      default:
        break;
    }
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        clearInteraction();
      } else if (event.key === 'q' || event.key === 'Q') {
        toggleToolActive();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearInteraction, toggleToolActive]);

  return (
    <group position={[0, 0, 0]}>
      {/* Grid visual helper (invisible in production) */}
      <GridHelper />
      
        {/* Grass ground with animated grass blades */}
        <GrassGround
          size={GRID_SIZE}
          grassCount={90000}
          position={[(GRID_SIZE / 2) + 0.5, -0.5, (GRID_SIZE / 2) + 0.5]}
          allBlocks={blocks}
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

      {/* Background trees/plants around the perimeter */}
      <BackgroundTrees gridSize={GRID_SIZE} />
      
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
