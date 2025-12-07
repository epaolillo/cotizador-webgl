import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import calleTexture from '../assets/calle.jpg';

/**
 * Roundabout - Creates a circular road (rotonda) around the editable area
 * The editable area is from 1 to 20 (20x20 units), centered at (10.5, 10.5)
 */
const Roundabout = ({ gridSize = 20, roadWidth = 5 }) => {
  // Load the street texture
  const calleTex = useLoader(THREE.TextureLoader, calleTexture);
  
  // Calculate center of editable area
  const centerX = gridSize / 2 + 0.5; // 10.5
  const centerZ = gridSize / 2 + 0.5; // 10.5
  
  // Calculate radius - larger to cover extensive area
  // Editable area: 1 to 20 (20x20 units), centered at (10.5, 10.5)
  // Making it larger to cover house, trees, and all editable blocks
  const innerRadius = 32; // Larger radius
  const outerRadius = innerRadius + roadWidth; // 37 units with roadWidth = 5
  
  // Configure street texture
  const streetTexture = useMemo(() => {
    if (!calleTex) return null;
    
    const tex = calleTex.clone();
    // Configure texture for seamless tiling
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    
    // For RingGeometry, UV coordinates:
    // - U (around the circle): 0 to 1 wraps around the circumference
    // - V (across the width): 0 to 1 from inner to outer radius
    const avgRadius = (innerRadius + outerRadius) / 2; // 34.5
    const circumference = 2 * Math.PI * avgRadius; // ~217 units
    
    // Adjust repeat: first value for around the circle, second for width
    // Experiment with these values to get the right scale
    tex.repeat.set(circumference / 8, roadWidth / 2);
    
    // Improve texture quality
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.flipY = false;
    
    return tex;
  }, [calleTex, innerRadius, outerRadius, roadWidth]);
  
  // Create ring geometry for the circular road
  const ringGeometry = useMemo(() => {
    // RingGeometry(innerRadius, outerRadius, thetaSegments)
    // thetaSegments: number of segments around the circle (more = smoother)
    return new THREE.RingGeometry(innerRadius, outerRadius, 256);
  }, [innerRadius, outerRadius]);
  
  // Create road material with street texture
  const roadMaterial = useMemo(() => {
    if (!streetTexture) {
      // Fallback to solid color if texture not loaded
      return new THREE.MeshStandardMaterial({
        color: '#4a4a4a',
        roughness: 0.9,
        metalness: 0.1,
        fog: true
      });
    }
    
    return new THREE.MeshStandardMaterial({
      map: streetTexture,
      roughness: 0.9,
      metalness: 0.1,
      fog: true
    });
  }, [streetTexture]);
  
  return (
    <mesh
      geometry={ringGeometry}
      material={roadMaterial}
      position={[centerX, -0.45, centerZ]} // Slightly above terrain (-0.5)
      rotation={[-Math.PI / 2, 0, 0]} // Rotate to be horizontal
      receiveShadow
      castShadow
    />
  );
};

export default Roundabout;
