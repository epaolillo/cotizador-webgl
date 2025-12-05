import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import pasto1Texture from '../assets/pasto1.jpg';

const InfiniteGround = () => {
  // Load the pasto1 texture
  const pasto1Tex = useLoader(THREE.TextureLoader, pasto1Texture);
  
  // Configure pasto1 texture
  const groundTexture = useMemo(() => {
    if (!pasto1Tex) return null;
    
    // Configure texture properties for seamless tiling
    pasto1Tex.wrapS = pasto1Tex.wrapT = THREE.RepeatWrapping;
    pasto1Tex.repeat.set(400, 400); // Much smaller repeat for realistic grass scale
    pasto1Tex.anisotropy = 16; // Better texture quality
    
    return pasto1Tex;
  }, [pasto1Tex]);

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
