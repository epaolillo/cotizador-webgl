import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import cloudTexture from '../assets/fluffy-white-clouds-blue-sky.jpg';

const Skybox = () => {
  // Load the cloud texture
  const cloudTex = useLoader(THREE.TextureLoader, cloudTexture);
  
  // Configure texture for skybox
  const skyboxTexture = useMemo(() => {
    if (!cloudTex) return null;
    
    // Configure texture properties for skybox
    cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
    cloudTex.repeat.set(1, 1); // No repeat for skybox
    cloudTex.anisotropy = 16; // Better texture quality
    
    return cloudTex;
  }, [cloudTex]);

  // Create skybox geometry and material
  const skyboxGeometry = useMemo(() => {
    return new THREE.SphereGeometry(1000, 32, 32);
  }, []);

  const skyboxMaterial = useMemo(() => {
    if (!skyboxTexture) return null;
    
    return new THREE.MeshBasicMaterial({
      map: skyboxTexture,
      side: THREE.BackSide, // Render inside of sphere
      fog: true, // Enable fog for skybox to blend with environment
      transparent: true,
      opacity: 0.8 // Slightly transparent to blend with gradient
    });
  }, [skyboxTexture]);

  if (!skyboxMaterial) {
    return null;
  }

  return (
    <mesh geometry={skyboxGeometry} material={skyboxMaterial} />
  );
};

export default Skybox;
