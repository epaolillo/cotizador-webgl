import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Water Component - Reflective water surface for pools
 * Features:
 * - Only top surface visible (no side or bottom faces)
 * - Turquoise reflective material
 * - Half height (0.5 units instead of 1.0)
 * - Receives shadows from other objects
 * - Solid body with mirror-like top surface
 */
const WaterUnit = ({ position, color = '#00CED1', opacity = 1.0, selected = false }) => {
  const waterHeight = 0.5; // Half the height of normal blocks
  
  // Adjust Y position to account for lower height
  const adjustedPosition = [
    position.x, 
    position.y - 0.25, // Lower by 0.25 to keep bottom aligned with grid
    position.z
  ];

  const waterColor = useMemo(() => {
    return selected ? '#ff6b6b' : color;
  }, [selected, color]);

  return (
    <group>
      {/* Solid water body - transparent turquoise */}
      <Box 
        position={adjustedPosition}
        args={[1, waterHeight, 1]}
        castShadow={false}
        receiveShadow={true}
      >
        <meshPhysicalMaterial 
          color={waterColor}
          transparent={true}
          opacity={0.6}
          roughness={0.1}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          transmission={0.3}
          thickness={0.5}
          envMapIntensity={1.5}
          fog={true}
          side={THREE.FrontSide}
        />
      </Box>

      {/* Top reflective surface - mirror-like turquoise finish */}
      <mesh
        position={[position.x, position.y + 0.01, position.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={true}
        castShadow={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshPhysicalMaterial 
          color={waterColor}
          transparent={true}
          opacity={0.85}
          roughness={0.05}
          metalness={0.9}
          reflectivity={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={2.0}
          fog={true}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
};

/**
 * Water - Multi-position water component
 * Renders water blocks without visible seams between adjacent blocks
 */
const Water = ({ 
  block, 
  color = '#00CED1', 
  opacity = 1.0,
  selected = false,
}) => {
  const waterColor = useMemo(() => {
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
        <WaterUnit
          key={`water_${block.id}_${position.x}_${position.y}_${position.z}_${index}`}
          position={position}
          color={waterColor}
          opacity={opacity}
          selected={selected}
        />
      ))}
    </group>
  );
};

export default Water;

