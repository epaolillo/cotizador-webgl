import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import grassTexture from '../assets/grass_seamless_texture_1418.jpg';

const InfiniteGround = () => {
  // Load the grass texture
  const grassTex = useLoader(THREE.TextureLoader, grassTexture);
  
  // Configure grass texture
  const groundTexture = useMemo(() => {
    if (!grassTex) return null;
    
    // Configure texture properties for seamless tiling
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(400, 400); // Much smaller repeat for realistic grass scale
    grassTex.anisotropy = 16; // Better texture quality
    
    return grassTex;
  }, [grassTex]);

  // Create ground geometry - very large plane
  const groundGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    geometry.rotateX(-Math.PI / 2); // Rotate to be horizontal
    return geometry;
  }, []);

  // Create ground material
  const groundMaterial = useMemo(() => {
    if (!groundTexture) return null;
    
    return new THREE.MeshLambertMaterial({
      map: groundTexture,
      side: THREE.DoubleSide,
      transparent: false,
      fog: true // Enable fog for this material
    });
  }, [groundTexture]);

  if (!groundMaterial) {
    return null;
  }

  return (
    <mesh 
      geometry={groundGeometry} 
      material={groundMaterial}
      position={[0, -0.6, 0]} // Slightly lower to avoid z-fighting with GrassGround
      receiveShadow
    />
  );
};

export default InfiniteGround;
