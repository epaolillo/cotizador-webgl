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
  poolBlocks = [],
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

  // Calculate pool bounds for grass exclusion (more efficient than individual positions)
  const poolBounds = useMemo(() => {
    const bounds = [];
    const borderPadding = 0.8; // Ancho del borde antideslizante
    poolBlocks.forEach(block => {
      if (block.positions && block.positions.length > 0) {
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        block.positions.forEach(pos => {
          minX = Math.min(minX, pos.x);
          maxX = Math.max(maxX, pos.x);
          minZ = Math.min(minZ, pos.z);
          maxZ = Math.max(maxZ, pos.z);
        });
        
        // Add padding for walls + antideslizante border
        bounds.push({
          minX: minX - 0.5 - borderPadding,
          maxX: maxX + 0.5 + borderPadding,
          minZ: minZ - 0.5 - borderPadding,
          maxZ: maxZ + 0.5 + borderPadding
        });
      }
    });
    return bounds;
  }, [poolBlocks]);

  // Create material with pool exclusion
  const material = useMemo(() => {
    // Flatten bounds into array for shader (max 20 pools)
    const boundsArray = new Float32Array(80); // 20 pools * 4 values (minX, maxX, minZ, maxZ)
    for (let i = 0; i < Math.min(poolBounds.length, 20); i++) {
      const b = poolBounds[i];
      boundsArray[i * 4 + 0] = b.minX;
      boundsArray[i * 4 + 1] = b.maxX;
      boundsArray[i * 4 + 2] = b.minZ;
      boundsArray[i * 4 + 3] = b.maxZ;
    }
    
    return new THREE.ShaderMaterial({
      uniforms: {
        uCloud: { value: cloudTex },
        uTime: { value: 0 },
        uPoolBounds: { value: boundsArray },
        uPoolCount: { value: Math.min(poolBounds.length, 20) },
        uGrassOffset: { value: new THREE.Vector2(position[0], position[2]) }
      },
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader
    });
  }, [cloudTex, poolBounds, position]);

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
