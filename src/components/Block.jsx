import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';

// Individual block unit component
const BlockUnit = ({ position, color = '#4a90e2', opacity = 1.0 }) => {
  return (
    <Box 
      position={[position.x, position.y, position.z]}
      args={[1, 1, 1]} // Slightly smaller than 1 to show grid gaps
    >
      <meshStandardMaterial 
        color={color}
        opacity={opacity}
        transparent={opacity < 1.0}
        wireframe={false}
        fog={true} // Enable fog response for better depth perception
      />
    </Box>
  );
};

// Multi-position block component
const Block = ({ 
  block, 
  color = '#4a90e2', 
  opacity = 1.0,
  selected = false,
}) => {
  const blockColor = useMemo(() => {
    if (selected) return '#ff6b6b';
    // Use the block's type color if available, otherwise use the provided color
    if (block && block.type && block.type.color) {
      return block.type.color;
    }
    return color;
  }, [selected, color, block]);

  if (!block || !block.positions || block.positions.length === 0) {
    return null;
  }

  return (
    <group>
      {block.positions.map((position, index) => (
        <BlockUnit
          key={`${block.id}_${position.x}_${position.y}_${position.z}_${index}`}
          position={position}
          color={blockColor}
          opacity={opacity}
        />
      ))}
      {/* Optional wireframe outline for multi-block structures */}
      {block.positions.length > 1 && (
        <group>
          {block.positions.map((position, index) => (
            <Box 
              key={`outline_${block.id}_${position.x}_${position.y}_${position.z}_${index}`}
              position={[position.x, position.y, position.z]}
              args={[1.0, 1.0, 1.0]}
            >
              <meshBasicMaterial 
                color={blockColor}
                wireframe={false}
                opacity={0.3}
                transparent={true}
                fog={true} // Enable fog response for outlines
              />
            </Box>
          ))}
        </group>
      )}
    </group>
  );
};

export default Block;
