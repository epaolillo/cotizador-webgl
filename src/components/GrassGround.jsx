import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GrassGeometry, createGrassMaterial } from '../utils/Grass';
import { vertexShader, fragmentShader } from '../shaders/grassShaders';
import cloudTexture from '../assets/cloud.jpg';

const GrassGround = ({ 
  size = 20, 
  grassCount = 50000, 
  position = [0, -0.5, 0],
  ...props 
}) => {
  const meshRef = useRef();
  const floorRef = useRef();
  
  // Load cloud texture
  const cloudTex = useLoader(THREE.TextureLoader, cloudTexture);
  
  // Configure texture
  useMemo(() => {
    if (cloudTex) {
      cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
    }
  }, [cloudTex]);

  // Create grass geometry
  const grassGeometry = useMemo(() => {
    return new GrassGeometry(size, grassCount);
  }, [size, grassCount]);

  // Create floor geometry - square plane
  const floorGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(size, size);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, [size]);

  // Create material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uCloud: { value: cloudTex },
        uTime: { value: 0 }
      },
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader
    });
  }, [cloudTex]);

  // Animation loop
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 1000;
    
    if (meshRef.current && meshRef.current.material.uniforms) {
      meshRef.current.material.uniforms.uTime.value = time;
    }
    
    if (floorRef.current && floorRef.current.material.uniforms) {
      floorRef.current.material.uniforms.uTime.value = time;
    }
  });

  return (
    <group position={position} {...props}>
      {/* Grass blades */}
      <mesh
        ref={meshRef}
        geometry={grassGeometry}
        material={material}
        castShadow
        receiveShadow
      />
      
      {/* Floor square plane */}
      <mesh
        ref={floorRef}
        geometry={floorGeometry}
        material={material}
        position={[0, -Number.EPSILON, 0]}
        receiveShadow
      />
    </group>
  );
};

export default GrassGround;
