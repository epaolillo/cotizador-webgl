import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import { useEditor } from '../context/EditorContext';

const CursorPreview = () => {
  const { 
    previewPosition, 
    firstClickPosition, 
    interactionMode, 
    INTERACTION_MODES,
    getPreviewPositions,
    isPositionOccupiedByBlocks
  } = useEditor();

  const previewPositions = useMemo(() => {
    return getPreviewPositions();
  }, [getPreviewPositions]);

  // Determine if any preview position would cause an overlap
  const hasOverlap = useMemo(() => {
    return previewPositions.some(pos => isPositionOccupiedByBlocks(pos));
  }, [previewPositions, isPositionOccupiedByBlocks]);

  // Color based on state
  const previewColor = useMemo(() => {
    if (hasOverlap) return '#ff4444'; // Red for invalid placement
    if (interactionMode === INTERACTION_MODES.PLACING_SECOND) return '#44ff44'; // Green for second click
    return '#ffaa44'; // Orange for first click
  }, [hasOverlap, interactionMode, INTERACTION_MODES]);

  const previewOpacity = useMemo(() => {
    if (hasOverlap) return 0.3;
    return 0.6;
  }, [hasOverlap]);

  if (previewPositions.length === 0) {
    return null;
  }

  return (
    <group>
      {/* Preview blocks */}
      {previewPositions.map((position, index) => (
        <Box 
          key={`preview_${position.x}_${position.y}_${position.z}_${index}`}
          position={[position.x, position.y, position.z]}
          args={[1, 1, 1]}
        >
          <meshStandardMaterial 
            color={previewColor}
            opacity={previewOpacity}
            transparent={true}
            wireframe={false}
          />
        </Box>
      ))}
      
      {/* Wireframe outline */}
      {previewPositions.map((position, index) => (
        <Box 
          key={`preview_wireframe_${position.x}_${position.y}_${position.z}_${index}`}
          position={[position.x, position.y, position.z]}
          args={[1.0, 1.0, 1.0]}
        >
          <meshBasicMaterial 
            color={previewColor}
            wireframe={false}
            opacity={0.8}
            transparent={true}
          />
        </Box>
      ))}

      {/* First click indicator */}
      {firstClickPosition && (
        <Box 
          position={[firstClickPosition.x, firstClickPosition.y, firstClickPosition.z]}
          args={[1, 1, 1]}
        >
          <meshBasicMaterial 
            color="#ffffff"
            wireframe={false}
            opacity={0.9}
            transparent={true}
          />
        </Box>
      )}
    </group>
  );
};

export default CursorPreview;
