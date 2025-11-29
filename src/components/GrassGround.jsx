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
  allBlocks = [],
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

  // Calculate bounds for ALL blocks to exclude grass
  // Wherever there's ANY block placed, remove the 3D animated grass
  const allExclusionBounds = useMemo(() => {
    const bounds = [];
    // No padding - only exclude the exact block area
    // Each block is 1x1, centered at integer coordinates, so extends from pos.x - 0.5 to pos.x + 0.5
    
    allBlocks.forEach(block => {
      if (block.positions && block.positions.length > 0) {
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        block.positions.forEach(pos => {
          // Block positions are integer grid coordinates (e.g., x=5)
          // Each block is 1x1 unit, so it extends from pos.x - 0.5 to pos.x + 0.5
          minX = Math.min(minX, pos.x - 0.5);
          maxX = Math.max(maxX, pos.x + 0.5);
          minZ = Math.min(minZ, pos.z - 0.5);
          maxZ = Math.max(maxZ, pos.z + 0.5);
        });
        
        // No padding - only exclude the exact block area
        bounds.push({
          minX: minX,
          maxX: maxX,
          minZ: minZ,
          maxZ: maxZ
        });
      }
    });
    
    return bounds;
  }, [allBlocks]);

  // Create grass material WITH block exclusion (for 3D grass blades)
  const grassMaterial = useMemo(() => {
    // Flatten bounds into array for shader (max 100 exclusion areas for all blocks)
    const boundsArray = new Float32Array(400); // 100 areas * 4 values (minX, maxX, minZ, maxZ)
    const exclusionCount = Math.min(allExclusionBounds.length, 100);
    
    for (let i = 0; i < exclusionCount; i++) {
      const b = allExclusionBounds[i];
      boundsArray[i * 4 + 0] = b.minX;
      boundsArray[i * 4 + 1] = b.maxX;
      boundsArray[i * 4 + 2] = b.minZ;
      boundsArray[i * 4 + 3] = b.maxZ;
    }
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uCloud: { value: cloudTex },
        uTime: { value: 0 },
        uPoolBounds: { value: boundsArray },
        uPoolCount: { value: exclusionCount },
        uGrassOffset: { value: new THREE.Vector2(position[0], position[2]) }
      },
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader
    });
    
    // Force material update
    material.needsUpdate = true;
    
    return material;
  }, [cloudTex, allExclusionBounds, position, vertexShader, fragmentShader]);

  // Create floor material WITHOUT pool exclusion (for flat grass plane)
  const floorMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uCloud: { value: cloudTex },
        uTime: { value: 0 },
        uPoolBounds: { value: new Float32Array(80) }, // Empty array (no exclusion)
        uPoolCount: { value: 0 }, // No pools to exclude
        uGrassOffset: { value: new THREE.Vector2(position[0], position[2]) }
      },
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader
    });
  }, [cloudTex, position]);

  // Update material uniforms when bounds change
  React.useEffect(() => {
    if (meshRef.current && meshRef.current.material && meshRef.current.material.uniforms) {
      // Update the bounds array in the material
      const boundsArray = new Float32Array(400);
      const exclusionCount = Math.min(allExclusionBounds.length, 100);
      
      for (let i = 0; i < exclusionCount; i++) {
        const b = allExclusionBounds[i];
        boundsArray[i * 4 + 0] = b.minX;
        boundsArray[i * 4 + 1] = b.maxX;
        boundsArray[i * 4 + 2] = b.minZ;
        boundsArray[i * 4 + 3] = b.maxZ;
      }
      
      meshRef.current.material.uniforms.uPoolBounds.value = boundsArray;
      meshRef.current.material.uniforms.uPoolCount.value = exclusionCount;
      meshRef.current.material.needsUpdate = true;
    }
  }, [allExclusionBounds]);

  // Animation loop
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 1000;
    
    if (meshRef.current && meshRef.current.material && meshRef.current.material.uniforms) {
      meshRef.current.material.uniforms.uTime.value = time;
    }
    
    if (floorRef.current && floorRef.current.material && floorRef.current.material.uniforms) {
      floorRef.current.material.uniforms.uTime.value = time;
    }
  });

  return (
    <group position={position} {...props}>
      {/* 3D Grass blades WITH pool exclusion */}
      <mesh
        ref={meshRef}
        geometry={grassGeometry}
        material={grassMaterial}
        castShadow
        receiveShadow
      />
      
      {/* Floor square plane WITHOUT pool exclusion */}
      <mesh
        ref={floorRef}
        geometry={floorGeometry}
        material={floorMaterial}
        position={[0, -Number.EPSILON, 0]}
        receiveShadow
      />
    </group>
  );
};

export default GrassGround;
