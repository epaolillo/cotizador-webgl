import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * House - Automatically places a house model in the scene
 * The house is always present in the scene, not a user-placed object
 */
const House = ({ gridSize = 20, position = { x: 10, z: 10 } }) => {
  // Load the GLB model
  const modelPath = `${import.meta.env.BASE_URL}glb/architecture_house.glb`;
  const { scene } = useGLTF(modelPath);
  
  if (!scene) {
    console.warn('House: Model not loaded');
    return null;
  }
  
  console.log('House: Model loaded successfully', scene);

  // Prepare the model for rendering
  useMemo(() => {
    let meshCount = 0;
    scene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({ color: '#CCCCCC' });
        }
        
        if (!child.material.userData.processed) {
          child.material = child.material.clone();
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
    console.log(`House: Found ${meshCount} meshes in model`);
  }, [scene]);

  // Clone the scene for the house
  const houseScene = scene.clone();
  
  // Calculate bounding box to properly position and scale the model
  const box = new THREE.Box3().setFromObject(houseScene);
  const size = box.getSize(new THREE.Vector3());
  const min = box.min; // Get minimum Y (bottom of model)
  
  // Calculate scale - houses are typically larger, target width ~12-15 units for better visibility
  const targetWidth = 15;
  const scale = size.x > 0 ? targetWidth / size.x : 1;
  
  // Position so the bottom of the model is at ground level (Y = -0.5)
  const groundLevel = -0.5;
  const bottomY = min.y * scale;
  const yPosition = groundLevel - bottomY;
  
  console.log(`House: Size:`, size, `Scale:`, scale, `Min Y:`, min.y);

  return (
    <group position={[position.x, yPosition, position.z]}>
      <primitive
        object={houseScene}
        rotation={[0, 0, 0]} // Can adjust rotation if needed
        scale={[scale, scale, scale]}
      />
    </group>
  );
};

// Preload the model
useGLTF.preload(`${import.meta.env.BASE_URL}glb/architecture_house.glb`);

export default House;

