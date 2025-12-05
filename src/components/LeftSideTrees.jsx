import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * LeftSideTrees - Automatically places trees on the left side of the house
 * These trees are always present in the scene, not user-placed objects
 */
const LeftSideTrees = ({ gridSize = 20, housePosition = { x: 10.5, z: 15 } }) => {
  // Load the GLB model
  const modelPath = `${import.meta.env.BASE_URL}glb/realistic_europan_tree.glb`;
  const { scene } = useGLTF(modelPath);
  
  if (!scene) {
    console.warn('LeftSideTrees: Model not loaded');
    return null;
  }

  // Prepare the model for rendering
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({ color: '#228B22' });
        }
        
        if (!child.material.userData.processed) {
          child.material = child.material.clone();
          child.material.side = THREE.DoubleSide;
          child.castShadow = true;
          child.receiveShadow = true;
          
          if (child.material.transparent || child.material.alphaTest > 0) {
            child.material.transparent = true;
            child.material.alphaTest = 0.5;
            child.material.depthWrite = true;
          }
          
          child.material.fog = true;
          child.material.userData.processed = true;
        }
      }
    });
  }, [scene]);

  // Define tree positions in the LEFT terrain (not near the house)
  // The central terrain is from 1 to 20, left terrain would be around -20 to 0 in X
  const treePositions = useMemo(() => {
    const positions = [];
    // Position trees in the LEFT terrain (negative X values)
    // Center of left terrain would be around X = -10 (left of center terrain)
    const terrainCenterX = -10; // Left terrain center
    const terrainCenterZ = gridSize / 2 + 0.5; // Same Z as center terrain (10.5)
    
    // Create trees in a grid pattern in the left terrain
    const startX = terrainCenterX - 5; // Left side of left terrain
    const endX = terrainCenterX + 5;   // Right side of left terrain
    const startZ = terrainCenterZ - 5; // Back of left terrain
    const endZ = terrainCenterZ + 4;   // Front of left terrain
    const spacing = 5; // Space between trees
    
    const sideOffset = 1.5; // Distance to the sides for additional trees
    
    // Create a grid of trees in the left terrain
    for (let x = startX; x <= endX; x += spacing) {
      for (let z = startZ; z <= endZ; z += spacing) {
        // Add slight variation for more natural look
        const xVariation = (Math.sin(x * 10 + z * 5) * 0.3);
        const zVariation = (Math.cos(x * 5 + z * 10) * 0.3);
        
        positions.push({
          x: x + xVariation,
          z: z + zVariation
        });
      }
    }
    
    // Add extra trees in the left corner (leftmost and backmost area)
    const cornerStartX = terrainCenterX - 8; // Further left
    const cornerEndX = terrainCenterX - 4;   // Left area
    const cornerStartZ = terrainCenterZ - 8; // Further back
    const cornerEndZ = terrainCenterZ - 4;   // Back area
    const cornerSpacing = 2.5; // Closer spacing for denser grouping
    
    for (let x = cornerStartX; x <= cornerEndX; x += cornerSpacing) {
      for (let z = cornerStartZ; z <= cornerEndZ; z += cornerSpacing) {
        // Add slight variation for more natural look
        const xVariation = (Math.sin(x * 15 + z * 7) * 0.4);
        const zVariation = (Math.cos(x * 7 + z * 15) * 0.4);
        
        positions.push({
          x: x + xVariation,
          z: z + zVariation
        });
      }
    }
    
    return positions;
  }, [housePosition]);

  return (
    <group>
      {treePositions.map((pos, index) => {
        // Clone the scene for each tree
        const instanceScene = scene.clone();
        
        // Generate random rotation for variety
        const rotationSeed = pos.x * 1000 + pos.z * 100;
        const randomRotation = (Math.sin(rotationSeed) * Math.PI * 2);
        
        // Random scale variation
        const scaleVariation = 0.5 + (Math.sin(rotationSeed * 1.5) * 0.15); // 0.5 to 0.65
        
        return (
          <primitive
            key={`left_tree_${index}`}
            object={instanceScene}
            position={[pos.x, -1, pos.z]}
            rotation={[0, randomRotation, 0]}
            scale={[scaleVariation, scaleVariation, scaleVariation]}
          />
        );
      })}
    </group>
  );
};

// Preload the model
useGLTF.preload(`${import.meta.env.BASE_URL}glb/realistic_europan_tree.glb`);

export default LeftSideTrees;

