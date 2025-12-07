import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import loteGramarTexture from '../assets/lote-gramar.png';

const InfiniteGround = () => {
  // Load the same texture as CountryGrid
  const loteGramarTex = useLoader(THREE.TextureLoader, loteGramarTexture);
  
  // Configure texture to show country pattern with streets and lots
  const groundTexture = useMemo(() => {
    if (!loteGramarTex) return null;
    
    // Clone texture to avoid modifying the original
    const tex = loteGramarTex.clone();
    
    // Configure texture properties for country pattern
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    
    // Use a repeat that shows lots and streets clearly
    // Each lot in the texture is 1/3 of the texture (3x3 grid)
    // We want each lot to be approximately 20 units (same as gridSize)
    // For a 2000x2000 plane, we want: 2000/20 = 100 lots per side
    // Since texture has 3 lots per side, we need: 100/3 ≈ 33.3 repeats
    // But we want streets visible, so let's use a smaller repeat like 10-15
    // This will make each lot larger and streets more visible
    tex.repeat.set(12, 12); // Shows lots and streets clearly
    
    // Offset to align the center lot with the editable area
    // Editable area center is at (10.5, 10.5) in world coordinates
    // We want this to align with the center of a lot in the texture
    // The texture has 3x3 lots, center lot is at [1/3, 2/3] = [0.333, 0.667]
    // With repeat 12, we need to calculate offset
    // For a 2000x2000 plane centered at origin: world coords go from -1000 to 1000
    // World coord 10.5 maps to UV: (10.5 + 1000) / 2000 = 0.50525
    // We want this to align with lot center at 0.5 (center of texture)
    // Small offset adjustment needed
    tex.offset.set(0.0, 0.0); // Can be fine-tuned
    
    // Match CountryGrid orientation
    tex.flipY = false;
    
    // Match CountryGrid quality settings
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    
    return tex;
  }, [loteGramarTex]);

  // Create ground geometry - very large plane
  const groundGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    geometry.rotateX(-Math.PI / 2); // Rotate to be horizontal
    return geometry;
  }, []);

  // Create ground material - matching CountryGrid material properties
  const groundMaterial = useMemo(() => {
    if (!groundTexture) return null;
    
    return new THREE.MeshStandardMaterial({
      map: groundTexture,
      side: THREE.DoubleSide,
      transparent: false,
      roughness: 0.8,
      metalness: 0.05,
      fog: true
    });
  }, [groundTexture]);

  if (!groundMaterial) {
    return null;
  }

  return (
    <mesh 
      geometry={groundGeometry} 
      material={groundMaterial}
      position={[0, -0.6, 0]} // Slightly lower to avoid z-fighting with CountryGrid
      receiveShadow
    />
  );
};

export default InfiniteGround;
