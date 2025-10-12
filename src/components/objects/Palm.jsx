import React from 'react';
import { Box } from '@react-three/drei';

/**
 * Palm Tree Component - Tall object (2 units high)
 * Represents a palm tree with trunk and leaves
 */
const Palm = ({ block, opacity = 1.0, selected = false }) => {
  const palmColor = selected ? '#ff6b6b' : '#228B22';
  const trunkColor = '#8B4513'; // Brown trunk
  
  if (!block || !block.positions || block.positions.length === 0) {
    return null;
  }

  return (
    <group>
      {block.positions.map((position, index) => (
        <group 
          key={`palm_${block.id}_${position.x}_${position.y}_${position.z}_${index}`}
          position={[position.x, position.y, position.z]}
        >
          {/* Trunk - double height (2 units tall) */}
          <Box 
            position={[0, 0.5, 0]} // Offset to start from ground
            args={[0.3, 2, 0.3]} // Thin trunk, 2 units tall
          >
            <meshStandardMaterial 
              color={trunkColor}
              opacity={opacity}
              transparent={opacity < 1.0}
              roughness={0.8}
              fog={true}
            />
          </Box>
          
          {/* Palm leaves - top layer */}
          <Box 
            position={[0, 1.8, 0]} // Near the top
            args={[1.5, 0.2, 1.5]} // Wide flat leaves
          >
            <meshStandardMaterial 
              color={palmColor}
              opacity={opacity}
              transparent={opacity < 1.0}
              roughness={0.6}
              fog={true}
            />
          </Box>
          
          {/* Second leaf layer - rotated for visual interest */}
          <Box 
            position={[0, 1.9, 0]}
            args={[1.2, 0.1, 1.2]}
            rotation={[0, Math.PI / 4, 0]} // Rotated 45 degrees
          >
            <meshStandardMaterial 
              color={palmColor}
              opacity={opacity * 0.9}
              transparent={true}
              roughness={0.5}
              fog={true}
            />
          </Box>

          {/* Third leaf layer - more rotation for fuller look */}
          <Box 
            position={[0, 2.0, 0]}
            args={[1.0, 0.08, 1.0]}
            rotation={[0, Math.PI / 8, 0]} // Different rotation
          >
            <meshStandardMaterial 
              color={palmColor}
              opacity={opacity * 0.8}
              transparent={true}
              roughness={0.5}
              fog={true}
            />
          </Box>
        </group>
      ))}
    </group>
  );
};

export default Palm;

