import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Fence - Wooden fence component with vertical posts and horizontal rails
 * Creates a realistic fence along the placed blocks
 */
const Fence = ({ 
  block, 
  color = '#8B4513', 
  opacity = 1.0,
  selected = false,
}) => {
  if (!block || !block.positions || block.positions.length === 0) {
    return null;
  }

  // Calculate bounding box for fence placement
  const bounds = useMemo(() => {
    if (!block.positions || block.positions.length === 0) return null;
    
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let y = block.positions[0].y;
    
    block.positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minZ = Math.min(minZ, pos.z);
      maxZ = Math.max(maxZ, pos.z);
      y = pos.y;
    });
    
    return {
      minX, maxX, minZ, maxZ, y,
      width: maxX - minX + 1,
      depth: maxZ - minZ + 1,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2
    };
  }, [block.positions]);

  if (!bounds) return null;

  // Fence configuration
  const fenceHeight = 1.0;     // Total height of fence
  const postWidth = 0.08;       // Thickness of vertical posts
  const postDepth = 0.08;       // Depth of vertical posts
  const railHeight = 0.06;      // Thickness of horizontal rails
  const railDepth = 0.06;       // Depth of horizontal rails
  const postSpacing = 0.5;      // Distance between posts
  const groundLevel = bounds.y; // Base at block level

  // Material for wooden fence
  const woodMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.1,
      fog: true
    });
  }, [color]);

  // Generate posts along the perimeter
  const posts = useMemo(() => {
    const postList = [];
    let id = 0;

    // Determine if fence is more horizontal (X-axis) or vertical (Z-axis)
    const isHorizontal = bounds.width >= bounds.depth;

    if (isHorizontal) {
      // Fence along X-axis (horizontal)
      const fenceLength = bounds.width;
      const numPosts = Math.ceil(fenceLength / postSpacing) + 1;
      
      for (let i = 0; i < numPosts; i++) {
        const x = bounds.minX + (i * postSpacing);
        if (x <= bounds.maxX + 0.01) { // Small tolerance
          postList.push({
            id: id++,
            position: [x, groundLevel + fenceHeight / 2, bounds.centerZ],
            size: [postWidth, fenceHeight, postDepth]
          });
        }
      }
    } else {
      // Fence along Z-axis (vertical)
      const fenceLength = bounds.depth;
      const numPosts = Math.ceil(fenceLength / postSpacing) + 1;
      
      for (let i = 0; i < numPosts; i++) {
        const z = bounds.minZ + (i * postSpacing);
        if (z <= bounds.maxZ + 0.01) { // Small tolerance
          postList.push({
            id: id++,
            position: [bounds.centerX, groundLevel + fenceHeight / 2, z],
            size: [postDepth, fenceHeight, postWidth]
          });
        }
      }
    }

    return postList;
  }, [bounds, postSpacing, fenceHeight, postWidth, postDepth, groundLevel]);

  // Generate horizontal rails
  const rails = useMemo(() => {
    const railList = [];
    const isHorizontal = bounds.width >= bounds.depth;

    // Two horizontal rails: one at 1/3 height, one at 2/3 height
    const railHeights = [fenceHeight * 0.3, fenceHeight * 0.7];

    railHeights.forEach((height, index) => {
      if (isHorizontal) {
        // Rail along X-axis
        railList.push({
          id: index,
          position: [bounds.centerX, groundLevel + height, bounds.centerZ],
          size: [bounds.width, railHeight, railDepth]
        });
      } else {
        // Rail along Z-axis
        railList.push({
          id: index,
          position: [bounds.centerX, groundLevel + height, bounds.centerZ],
          size: [railDepth, railHeight, bounds.depth]
        });
      }
    });

    return railList;
  }, [bounds, fenceHeight, railHeight, railDepth, groundLevel]);

  return (
    <group>
      {/* Vertical posts */}
      {posts.map(post => (
        <mesh
          key={`post-${post.id}`}
          position={post.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={post.size} />
          <primitive object={woodMaterial} attach="material" />
        </mesh>
      ))}

      {/* Horizontal rails */}
      {rails.map(rail => (
        <mesh
          key={`rail-${rail.id}`}
          position={rail.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={rail.size} />
          <primitive object={woodMaterial} attach="material" />
        </mesh>
      ))}

      {/* Selection indicator */}
      {selected && (
        <mesh
          position={[bounds.centerX, groundLevel + fenceHeight / 2, bounds.centerZ]}
        >
          <boxGeometry args={[bounds.width, fenceHeight, bounds.depth]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

export default Fence;

