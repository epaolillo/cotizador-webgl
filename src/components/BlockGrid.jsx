import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useEditor } from '../context/EditorContext';
import GrassGround from './GrassGround';
import CountryGrid from './CountryGrid';
import CornerLights from './CornerLights';
import House from './House';
import LeftSideTrees from './LeftSideTrees';
import SecondTreeGroup from './SecondTreeGroup';

// Grid configuration
const GRID_SIZE = 20; // Grid extends from -GRID_SIZE to +GRID_SIZE
const GRID_SPACING = 1;
const BLOCK_SIZE = 1;
// Valid positions are from 1 to GRID_SIZE (one block inward from edges)
// Positions 0, 1, GRID_SIZE, and GRID_SIZE+1 are "on the boundary" (restricted)
const TERRAIN_MIN_GRID = 1;  // First valid grid position (one block inward)
const TERRAIN_MAX_GRID = GRID_SIZE; // Last valid grid position (one block inward)

// Check if a position is on the terrain boundary (restricted edges)
// With TERRAIN_MIN_GRID = 1 and TERRAIN_MAX_GRID = 20, positions 1 and 20 are on the boundary
const isOnTerrainBoundary = (position) => {
  return position.x === TERRAIN_MIN_GRID || 
         position.x === TERRAIN_MAX_GRID || 
         position.z === TERRAIN_MIN_GRID || 
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
  
  // Brick texture removed - walls replaced with white division lines
  
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
    
    // Validate position is within terrain bounds (one block inward from edges)
    if (gridPosition.x < TERRAIN_MIN_GRID || gridPosition.x > TERRAIN_MAX_GRID ||
        gridPosition.z < TERRAIN_MIN_GRID || gridPosition.z > TERRAIN_MAX_GRID) {
      setPreviewPosition(null);
      return;
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

    // Validate position is within terrain bounds (one block inward from edges)
    if (gridPosition.x < TERRAIN_MIN_GRID || gridPosition.x > TERRAIN_MAX_GRID ||
        gridPosition.z < TERRAIN_MIN_GRID || gridPosition.z > TERRAIN_MAX_GRID) {
      return; // Block placement outside valid area
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
      {/* Grid visual helper - HIDDEN */}
      {/* <GridHelper /> */}
      
      {/* Country grid with plots and white division lines */}
      <CountryGrid gridSize={GRID_SIZE} plotsAround={1} />
      
      {/* Corner lights - always present at the 4 corners of the central terrain */}
      <CornerLights gridSize={GRID_SIZE} />
      
      {/* House - always present in the scene */}
      <House gridSize={GRID_SIZE} position={{ x: -10, z: -10 }} />
      
      {/* Trees on the left side of the house */}
      <LeftSideTrees gridSize={GRID_SIZE} housePosition={{ x: -10, z: -10 }} />
      
      {/* Second group of trees */}
      <SecondTreeGroup gridSize={GRID_SIZE} />
      
        {/* Grass ground - HIDDEN (no longer needed) */}
        {/* <GrassGround
          size={GRID_SIZE}
          grassCount={90000}
          position={[(GRID_SIZE / 2) + 0.5, -0.5, (GRID_SIZE / 2) + 0.5]}
          allBlocks={blocks}
        /> */}

      
      {/* Interactive plane for mouse/touch input */}
      <group position={[0, 0, 0]}>
        <InteractionPlane 
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
        />
      </group>

      {/* Walls removed - replaced with white division lines in CountryGrid */}

      {/* Background trees/plants around the perimeter - REMOVED */}
      {/* <BackgroundTrees gridSize={GRID_SIZE} /> */}
      
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
