import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Tree Component - Uses 3D GLB model
 * Represents a tree using a loaded 3D model from GLB file
 */
const Tree = ({ block, opacity = 1.0, selected = false }) => {
  // Load the GLB model
  const { scene } = useGLTF('/glb/tree2.glb');
  
  if (!scene) {
    console.error('Tree model scene is undefined');
    return null;
  }

  // Prepare the model for rendering (setup materials once)
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Ensure material exists
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({ color: '#228B22' });
        }
        
        // Clone material to avoid sharing between instances
        if (!child.material.userData.processed) {
          child.material = child.material.clone();
          
          // Enable double-sided rendering for leaves/foliage
          child.material.side = THREE.DoubleSide;
          
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
          
          // If material has transparency, ensure it's configured properly
          if (child.material.transparent || child.material.alphaTest > 0) {
            child.material.transparent = true;
            child.material.alphaTest = 0.5; // Helps with leaf transparency
            child.material.depthWrite = true;
          }
          
          // Enable fog for depth perception
          child.material.fog = true;
          
          // Mark as processed to avoid re-processing
          child.material.userData.processed = true;
          
          // Debug: log mesh information
          console.log('Tree mesh:', child.name || 'unnamed', {
            material: child.material.type,
            transparent: child.material.transparent,
            hasMap: !!child.material.map,
            color: child.material.color
          });
        }
      }
    });
  }, [scene]);
  
  if (!block || !block.positions || block.positions.length === 0) {
    return null;
  }

  return (
    <group>
      {block.positions.map((position, index) => {
        // Clone the entire scene for each position
        const instanceScene = scene.clone();
        
        // Generate random rotation for Y axis (vertical) for variety
        // Use position-based seed for consistency (same position = same rotation)
        const rotationSeed = position.x * 1000 + position.y * 100 + position.z * 10;
        const randomRotation = (Math.sin(rotationSeed) * Math.PI * 2);
        
        // Apply selection color if needed
        if (selected) {
          instanceScene.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material = child.material.clone();
              child.material.color.set('#ff6b6b');
            }
          });
        }
        
        // Apply opacity if needed
        if (opacity < 1.0) {
          instanceScene.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material = child.material.clone();
              child.material.opacity = opacity;
              child.material.transparent = true;
            }
          });
        }
        
        return (
          <primitive
            key={`tree_${block.id}_${position.x}_${position.y}_${position.z}_${index}`}
            object={instanceScene}
            position={[position.x, position.y -1, position.z]}
            rotation={[0, randomRotation, 0]} // Random rotation on Y axis (vertical)
            scale={[0.6, 0.6, 0.6]}
          />
        );
      })}
    </group>
  );
};

// Preload the model for better performance
useGLTF.preload('/glb/tree2.glb');

export default Tree;
