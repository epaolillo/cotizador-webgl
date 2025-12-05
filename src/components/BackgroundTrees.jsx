import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * BackgroundTrees - Automatically places trees/plants around the perimeter
 * Creates a natural background with trees behind the terrain walls
 */
const BackgroundTrees = ({ gridSize = 20 }) => {
  // Load the GLB model
  const modelPath = `${import.meta.env.BASE_URL}glb/realistic_europan_tree.glb`;
  const { scene } = useGLTF(modelPath);
  
  if (!scene) {
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

  // Generate tree positions around the perimeter
  // Trees are placed outside the terrain boundaries (behind walls)
  const treePositions = useMemo(() => {
    const positions = [];
    const spacing = 3.0; // Space between trees
    const offset = 18.0; // Distance from wall (much further away from terrain)
    const terrainMin = 0.5;
    const terrainMax = gridSize + 0.5;
    
    // Left side (negative X)
    for (let z = terrainMin; z <= terrainMax; z += spacing) {
      positions.push({
        x: terrainMin - offset,
        z: z,
        rotation: Math.PI / 2 // Face towards terrain
      });
    }
    
    // Right side (positive X)
    for (let z = terrainMin; z <= terrainMax; z += spacing) {
      positions.push({
        x: terrainMax + offset,
        z: z,
        rotation: -Math.PI / 2 // Face towards terrain
      });
    }
    
    // Front side (negative Z)
    for (let x = terrainMin; x <= terrainMax; x += spacing) {
      positions.push({
        x: x,
        z: terrainMin - offset,
        rotation: 0 // Face towards terrain
      });
    }
    
    // Back side (positive Z)
    for (let x = terrainMin; x <= terrainMax; x += spacing) {
      positions.push({
        x: x,
        z: terrainMax + offset,
        rotation: Math.PI // Face towards terrain
      });
    }
    
    return positions;
  }, [gridSize]);

  return (
    <group>
      {treePositions.map((pos, index) => {
        // Clone the scene for each tree
        const instanceScene = scene.clone();
        
        // Add some random variation for natural look
        const seed = pos.x * 1000 + pos.z * 100;
        const randomRotation = pos.rotation + (Math.sin(seed) * 0.3); // Small random variation
        const randomScale = 0.5 + (Math.sin(seed * 2) * 0.2); // Scale between 0.5 and 0.7
        
        return (
          <primitive
            key={`background_tree_${index}`}
            object={instanceScene}
            position={[pos.x, -1, pos.z]} // Y: -1 to align with ground
            rotation={[0, randomRotation, 0]}
            scale={[randomScale, randomScale, randomScale]}
          />
        );
      })}
    </group>
  );
};

// Preload the model
useGLTF.preload(`${import.meta.env.BASE_URL}glb/realistic_europan_tree.glb`);

export default BackgroundTrees;

