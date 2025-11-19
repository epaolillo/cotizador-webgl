import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import { waterVertexShader, waterFragmentShader } from '../../shaders/waterShaders';
import cloudTexture from '../../assets/fluffy-white-clouds-blue-sky.jpg';
import tilesTexture from '../../assets/tiles.jpg';

/**
 * Water Component - Reflective water surface for pools with animated waves
 * Features:
 * - Animated water surface with wave shaders
 * - Turquoise reflective material
 * - Half height (0.5 units instead of 1.0)
 * - Receives shadows from other objects
 * - Solid body with animated top surface
 */
const WaterUnit = ({ position, color = '#00CED1', opacity = 1.0, selected = false }) => {
  const waterHeight = 0.5; // Half the height of normal blocks
  const surfaceRef = useRef();
  
  // Adjust Y position to account for lower height
  const adjustedPosition = [
    position.x, 
    position.y - 0.25, // Lower by 0.25 to keep bottom aligned with grid
    position.z
  ];

  // Convert color hex to RGB
  const waterColorRGB = useMemo(() => {
    if (selected) {
      return new THREE.Color('#ff6b6b');
    }
    return new THREE.Color(color);
  }, [selected, color]);

  // Create animated shader material for water surface
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPosition: { value: new THREE.Vector2(position.x, position.z) },
        uColor: { value: waterColorRGB },
        uOpacity: { value: selected ? 0.9 : 0.85 },
        uCameraPosition: { value: new THREE.Vector3() }
      },
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      fog: false // Disable fog for custom shader to avoid uniform conflicts
    });
  }, [waterColorRGB, position, selected]);

  // Update time uniform for animation
  useFrame(({ clock, camera }) => {
    if (surfaceRef.current && surfaceRef.current.material.uniforms) {
      const time = clock.getElapsedTime() * 1000; // Time in milliseconds
      surfaceRef.current.material.uniforms.uTime.value = time;
      surfaceRef.current.material.uniforms.uCameraPosition.value.copy(camera.position);
    }
  });

  return (
    <group>
      {/* Solid water body - transparent turquoise */}
      <Box 
        position={adjustedPosition}
        args={[1, waterHeight, 1]}
        castShadow={false}
        receiveShadow={true}
      >
        <meshPhysicalMaterial 
          color={waterColorRGB}
          transparent={true}
          opacity={0.6}
          roughness={0.1}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          transmission={0.3}
          thickness={0.5}
          envMapIntensity={1.5}
          fog={true}
          side={THREE.FrontSide}
        />
      </Box>

      {/* Top animated reflective surface with wave shader */}
      <mesh
        ref={surfaceRef}
        position={[position.x, position.y + 0.01, position.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={true}
        castShadow={false}
      >
        <planeGeometry args={[1, 1, 64, 64]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>
    </group>
  );
};

/**
 * Water - Multi-position water component
 * Renders water blocks with a unified animated surface
 */
const Water = ({ 
  block, 
  color = '#00CED1', 
  opacity = 1.0,
  selected = false,
}) => {
  const surfaceRef = useRef();
  const envMapRef = useRef(null);
  
  // Load tiles texture for pool walls
  const tilesTex = useLoader(THREE.TextureLoader, tilesTexture);
  
  // Configure tiles texture
  const tilesTextureConfigured = useMemo(() => {
    if (!tilesTex) return null;
    tilesTex.wrapS = tilesTex.wrapT = THREE.RepeatWrapping;
    tilesTex.repeat.set(2, 2); // Repeat pattern for better tile visibility
    tilesTex.anisotropy = 16;
    return tilesTex;
  }, [tilesTex]);
  
  const waterColor = useMemo(() => {
    if (selected) return '#ff6b6b';
    // Use the block's type color if available, otherwise use the provided color
    if (block && block.type && block.type.color) {
      return block.type.color;
    }
    return color;
  }, [selected, color, block]);

  // Convert color hex to RGB
  const waterColorRGB = useMemo(() => {
    return new THREE.Color(waterColor);
  }, [waterColor]);

  // Create environment map from skybox texture for reflections (lazy initialization)
  useFrame((state) => {
    if (envMapRef.current) return;
    
    try {
      const gl = state.gl;
      if (!gl) return;
      
      const loader = new THREE.TextureLoader();
      const texture = loader.load(cloudTexture);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      
      // Create PMREM (Pre-filtered, Mipmapped Radiance Environment Map) for realistic reflections
      const pmremGenerator = new THREE.PMREMGenerator(gl);
      pmremGenerator.compileEquirectangularShader();
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      pmremGenerator.dispose();
      texture.dispose();
      
      envMapRef.current = envMap;
      
      // Update material if it exists
      if (surfaceRef.current && surfaceRef.current.material && surfaceRef.current.material.uniforms) {
        surfaceRef.current.material.uniforms.uEnvironmentMap.value = envMap;
      }
    } catch (error) {
      console.warn('Failed to create environment map:', error);
      // Create a simple fallback
      const loader = new THREE.TextureLoader();
      const texture = loader.load(cloudTexture);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      envMapRef.current = texture;
      
      if (surfaceRef.current && surfaceRef.current.material && surfaceRef.current.material.uniforms) {
        surfaceRef.current.material.uniforms.uEnvironmentMap.value = texture;
      }
    }
  });

  if (!block || !block.positions || block.positions.length === 0) {
    return null;
  }

  // Calculate bounding box for unified surface
  const bounds = useMemo(() => {
    if (!block.positions || block.positions.length === 0) return null;
    
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let y = block.positions[0].y;
    
    block.positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minZ = Math.min(minZ, pos.z);
      maxZ = Math.max(maxZ, pos.z);
      y = pos.y; // All should have same Y
    });
    
    return {
      minX, maxX, minZ, maxZ, y,
      width: maxX - minX + 1,
      depth: maxZ - minZ + 1,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2
    };
  }, [block.positions]);

  // Create unified shader material for entire pool with advanced wave system
  const waterMaterial = useMemo(() => {
    if (!bounds) return null;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: waterColorRGB },
        uOpacity: { value: selected ? 0.6 : 0.5 }, // More transparent surface
        uCameraPosition: { value: new THREE.Vector3() },
        uEnvironmentMap: { value: envMapRef.current || null }, // Environment map for reflections
        // Advanced wave parameters
        uAmplitude: { value: 0.15 }, // Base wave amplitude
        uAmplitudeFactor: { value: 0.85 }, // Amplitude reduction per iteration
        uFrequency: { value: 0.8 }, // Base wave frequency
        uFrequencyFactor: { value: 1.15 }, // Frequency increase per iteration
        uLambda: { value: 8.0 }, // Base wavelength
        uLambdaFactor: { value: 0.9 }, // Wavelength reduction per iteration
        uIterations: { value: 12 }, // Number of wave iterations
        uRandom: { value: Math.random() } // Random seed for wave directions
      },
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      fog: false,
      depthWrite: false
    });
  }, [waterColorRGB, bounds, selected]);

  // Update time uniform for animation
  useFrame(({ clock, camera }) => {
    if (surfaceRef.current && surfaceRef.current.material && surfaceRef.current.material.uniforms) {
      const time = clock.getElapsedTime() * 1000; // Time in milliseconds
      surfaceRef.current.material.uniforms.uTime.value = time;
      surfaceRef.current.material.uniforms.uCameraPosition.value.copy(camera.position);
    }
  });

  if (!bounds || !waterMaterial) return null;

  // Create geometry for unified surface with high resolution
  const surfaceGeometry = useMemo(() => {
    // Higher resolution for better wave quality
    const segmentsX = Math.max(128, Math.floor(bounds.width * 32));
    const segmentsZ = Math.max(128, Math.floor(bounds.depth * 32));
    return new THREE.PlaneGeometry(bounds.width, bounds.depth, segmentsX, segmentsZ);
  }, [bounds]);

  // Create unified water body geometry (no individual blocks)
  const waterBodyGeometry = useMemo(() => {
    if (!bounds) return null;
    // Create a box that covers the entire pool area
    const geometry = new THREE.BoxGeometry(
      bounds.width, 
      0.5, // Water height
      bounds.depth
    );
    return geometry;
  }, [bounds]);

  // Create unified water body material
  const waterBodyMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: waterColorRGB,
      transparent: true,
      opacity: 0.4, // More transparent to reduce visibility of divisions
      roughness: 0.05,
      metalness: 0.05,
      clearcoat: 0.5,
      clearcoatRoughness: 0.05,
      transmission: 0.8, // Higher transmission for more transparency
      thickness: 0.5,
      envMapIntensity: 1.5,
      fog: true,
      side: THREE.DoubleSide
    });
  }, [waterColorRGB]);

  // Create pool walls with tiles texture
  const wallHeight = 1.0; // Height of pool walls above water level
  const wallThickness = 0.1; // Thickness of walls
  const groundLevel = bounds ? bounds.y - 0.5 : 0; // Ground level (bottom of pool)
  const wallBottom = groundLevel; // Walls start from ground
  const wallTop = bounds ? bounds.y + wallHeight : wallHeight; // Top of walls
  
  // Create wall material with tiles texture
  const wallMaterial = useMemo(() => {
    if (!tilesTextureConfigured) return null;
    
    return new THREE.MeshStandardMaterial({
      map: tilesTextureConfigured,
      roughness: 0.7,
      metalness: 0.1,
      fog: true
    });
  }, [tilesTextureConfigured]);

  return (
    <group>
      {/* Pool walls with tiles texture - extending from ground to top */}
      {wallMaterial && bounds && (
        <>
          {/* North wall (positive Z) */}
          <mesh
            position={[bounds.centerX, (wallBottom + wallTop) / 2, bounds.maxZ + 0.5]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[bounds.width, wallTop - wallBottom, wallThickness]} />
            <primitive object={wallMaterial} attach="material" />
          </mesh>
          
          {/* South wall (negative Z) */}
          <mesh
            position={[bounds.centerX, (wallBottom + wallTop) / 2, bounds.minZ - 0.5]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[bounds.width, wallTop - wallBottom, wallThickness]} />
            <primitive object={wallMaterial} attach="material" />
          </mesh>
          
          {/* East wall (positive X) */}
          <mesh
            position={[bounds.maxX + 0.5, (wallBottom + wallTop) / 2, bounds.centerZ]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[wallThickness, wallTop - wallBottom, bounds.depth]} />
            <primitive object={wallMaterial} attach="material" />
          </mesh>
          
          {/* West wall (negative X) */}
          <mesh
            position={[bounds.minX - 0.5, (wallBottom + wallTop) / 2, bounds.centerZ]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[wallThickness, wallTop - wallBottom, bounds.depth]} />
            <primitive object={wallMaterial} attach="material" />
          </mesh>
          
          {/* Pool floor with tiles texture */}
          <mesh
            position={[bounds.centerX, groundLevel, bounds.centerZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[bounds.width, bounds.depth]} />
            <primitive object={wallMaterial} attach="material" />
          </mesh>
        </>
      )}
      
      {/* Unified water body - single block covering entire pool */}
      {waterBodyGeometry && (
        <mesh
          position={[bounds.centerX, bounds.y - 0.25, bounds.centerZ]}
          geometry={waterBodyGeometry}
          material={waterBodyMaterial}
          castShadow={false}
          receiveShadow={true}
        />
      )}
      
      {/* Unified animated surface covering entire pool */}
      <mesh
        ref={surfaceRef}
        position={[bounds.centerX, bounds.y + 0.01, bounds.centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={true}
        castShadow={false}
        geometry={surfaceGeometry}
        material={waterMaterial}
      />
    </group>
  );
};

export default Water;

