import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SecondTreeGroup - A second group of trees in a different location
 * These trees are always present in the scene, not user-placed objects
 */
const SecondTreeGroup = ({ gridSize = 20 }) => {
  // Load the GLB model
  const modelPath = `${import.meta.env.BASE_URL}glb/realistic_europan_tree.glb`;
  const { scene } = useGLTF(modelPath);
  
  if (!scene) {
    console.warn('SecondTreeGroup: Model not loaded');
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

  // Define tree positions for the second group
  // Position them in the LEFT CORNER of the central terrain (bottom-left corner)
  const treePositions = useMemo(() => {
    const positions = [];
    
    // Position the second group in the LEFT CORNER (bottom-left)
    // Terrain central goes from 1 to 20, so left corner is around X=1-3, Z=1-3
    const cornerX = -10.5;  // Left edge of central terrain
    const cornerZ = 29.5;  // Bottom edge of central terrain
    const groupSize = 6;  // Size of the group
    const spacing = 3;    // Space between trees (closer for corner grouping)
    
    const startX = cornerX;
    const endX = cornerX + groupSize;
    const startZ = cornerZ;
    const endZ = cornerZ + groupSize;
    
    // Create a grid of trees
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
    
    return positions;
  }, [gridSize]);

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
            key={`second_tree_${index}`}
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

export default SecondTreeGroup;

