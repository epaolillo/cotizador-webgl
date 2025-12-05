import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CornerLights - Automatically places light posts at the 4 corners of the central terrain
 * The central terrain extends from 1 to GRID_SIZE (20) in both X and Z directions
 * These lights are always present in the scene, not user-placed objects
 */
const CornerLights = ({ gridSize = 20 }) => {
  // Load the GLB model
  const modelPath = `${import.meta.env.BASE_URL}glb/poste_de_luz.glb`;
  const { scene } = useGLTF(modelPath);
  
  if (!scene) {
    console.warn('CornerLights: Model not loaded');
    return null;
  }
  
  console.log('CornerLights: Model loaded successfully', scene);

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
    console.log(`CornerLights: Found ${meshCount} meshes in model`);
  }, [scene]);

  // Define the 4 corners of the central terrain
  // Terrain goes from 1 to gridSize (20) in both X and Z
  // Using 0.5 offset to position at the exact corner edges
  const cornerPositions = useMemo(() => {
    return [
      { x: -1.0, z: -9.0 },      // Southwest corner (exact edge)
      { x: gridSize + 1.9, z: -9.0 },  // Southeast corner (exact edge)
      { x: -1.0, z: gridSize + -2.5 },   // Northwest corner (exact edge)
      { x: gridSize + 1.8, z: gridSize + -2.5 } // Northeast corner (exact edge)
    ];
  }, [gridSize]);

  return (
    <group>
      {cornerPositions.map((pos, index) => {
        // Clone the scene for each light post
        const instanceScene = scene.clone();
        
        // Calculate bounding box to properly position and scale the model
        const box = new THREE.Box3().setFromObject(instanceScene);
        const size = box.getSize(new THREE.Vector3());
        const min = box.min; // Get minimum Y (bottom of model)
        
        // Calculate scale to make the model a reasonable size (target height ~10-12 units for street lights)
        const targetHeight = 12;
        const scale = size.y > 0 ? targetHeight / size.y : 1;
        
        // Position so the bottom of the model is at ground level (Y = -0.5)
        const groundLevel = -0.5;
        const bottomY = min.y * scale;
        const yPosition = groundLevel - bottomY;
        
        console.log(`CornerLights: Light ${index} - Size:`, size, `Scale:`, scale, `Min Y:`, min.y);
        
        return (
          <group key={`corner_light_${index}`} position={[pos.x, yPosition, pos.z]}>
            <primitive
              object={instanceScene}
              rotation={[0, 0, 0]}
              scale={[scale, scale, scale]}
            />
          </group>
        );
      })}
    </group>
  );
};

// Preload the model
useGLTF.preload(`${import.meta.env.BASE_URL}glb/poste_de_luz.glb`);

export default CornerLights;
