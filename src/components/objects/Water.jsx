import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { waterVertexShader, waterFragmentShader } from '../../shaders/waterShaders';
import { poolFloorVertexShader, poolFloorFragmentShader } from '../../shaders/poolFloorShaders';
import cloudTexture from '../../assets/fluffy-white-clouds-blue-sky.jpg';
import tilesTexture from '../../assets/tiles.jpg';

/**
 * Water - Multi-position water component
 * Renders water blocks with a unified animated surface
 * Only ONE shader material for the top animated surface
 */
const Water = ({ 
  block, 
  color = '#00CED1', 
  opacity = 1.0,
  selected = false,
}) => {
  const surfaceRef = useRef();
  const floorRef = useRef();
  const envMapRef = useRef(null);
  
  // Load tiles texture for pool walls
  const tilesTex = useLoader(THREE.TextureLoader, tilesTexture);
  
  // Configure base tiles texture
  const tilesTextureBase = useMemo(() => {
    if (!tilesTex) return null;
    tilesTex.wrapS = tilesTex.wrapT = THREE.RepeatWrapping;
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
        // Wave parameters - matching threejs-water defaults, scaled for pool
        // Wave parameters - simulating gentle wind effect on pool
        uAmplitude: { value: 0.1 }, // Olas más sutiles (reducido de 0.3)
        uAmplitudeFactor: { value: 0.9 }, // Mantener igual
        uFrequency: { value: 0.5 }, // Movimiento más lento (reducido de 0.5)
        uFrequencyFactor: { value: 0.8 }, // Mantener igual
        uLambda: { value: 20.0 }, // Olas más separadas (aumentado de 8.0)
        uLambdaFactor: { value: 0.85 }, // Mantener similar
        uIterations: { value: 8 }, // Menos ondas superpuestas (reducido de 18)
        uRandom: { value: Math.random() }
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
    const time = clock.getElapsedTime(); // Time in seconds
    
    // Update water surface
    if (surfaceRef.current && surfaceRef.current.material && surfaceRef.current.material.uniforms) {
      surfaceRef.current.material.uniforms.uTime.value = time;
      surfaceRef.current.material.uniforms.uCameraPosition.value.copy(camera.position);
    }
    
    // Update floor caustics
    if (floorRef.current && floorRef.current.material && floorRef.current.material.uniforms) {
      floorRef.current.material.uniforms.uTime.value = time;
    }
  });

  if (!bounds || !waterMaterial) return null;

  // Create geometry for unified surface with high resolution
  // Make it slightly smaller than pool bounds to prevent water from going through walls
  const surfaceGeometry = useMemo(() => {
    // Higher resolution for better wave quality
    const segmentsX = Math.max(128, Math.floor(bounds.width * 32));
    const segmentsZ = Math.max(128, Math.floor(bounds.depth * 32));
    // Reduce size by 0.1 units on each side to ensure water stays within bounds
    const surfaceWidth = Math.max(0.1, bounds.width - 0.1);
    const surfaceDepth = Math.max(0.1, bounds.depth - 0.1);
    return new THREE.PlaneGeometry(surfaceWidth, surfaceDepth, segmentsX, segmentsZ);
  }, [bounds]);


  // Create pool walls with tiles texture
  const poolDepth = 0.8; // Profundidad de la pileta (qué tan enterrada está)
  const wallHeight = -0.2 // Height of pool walls above water level
  const wallThickness = 0.1; // Thickness of walls
  const groundLevel = bounds ? bounds.y - poolDepth : 0.01; // Ground level (bottom of pool)
  const wallBottom = groundLevel; // Walls start from ground
  const wallTop = bounds ? bounds.y + wallHeight : wallHeight; // Top of walls
  
  // Calculate tile size based on floor dimensions (floor uses repeat 2,2)
  // Floor has dimensions bounds.width x bounds.depth with repeat (2, 2)
  // So each tile is bounds.width/2 x bounds.depth/2
  // Use average tile size to keep tiles square on all surfaces
  const tileSizeX = bounds ? bounds.width / 2 : 1;
  const tileSizeZ = bounds ? bounds.depth / 2 : 1;
  const avgTileSize = (tileSizeX + tileSizeZ) / 2;
  const wallHeightTotal = wallTop - wallBottom;
  
  // Create floor material with tiles texture and caustics shader
  const floorMaterial = useMemo(() => {
    if (!tilesTextureBase) return null;
    
    const floorTex = tilesTextureBase.clone();
    floorTex.repeat.set(2, 2); // Tile repeat
    
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: floorTex },
        uTime: { value: 0 }
      },
      vertexShader: poolFloorVertexShader,
      fragmentShader: poolFloorFragmentShader
    });
  }, [tilesTextureBase]);
  
  // Create materials for different wall types with adjusted repeat
  // North/South walls: width = bounds.width, height = wallHeightTotal
  const northSouthWallMaterial = useMemo(() => {
    if (!tilesTextureBase || !bounds) return null;
    
    const wallTex = tilesTextureBase.clone();
    const horizontalRepeat = bounds.width / avgTileSize;
    const verticalRepeat = wallHeightTotal / avgTileSize;
    wallTex.repeat.set(horizontalRepeat, verticalRepeat);
    
    return new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.7,
      metalness: 0.1,
      fog: true
    });
  }, [tilesTextureBase, bounds, wallHeightTotal, avgTileSize]);
  
  // East/West walls: width = bounds.depth, height = wallHeightTotal
  const eastWestWallMaterial = useMemo(() => {
    if (!tilesTextureBase || !bounds) return null;
    
    const wallTex = tilesTextureBase.clone();
    const horizontalRepeat = bounds.depth / avgTileSize;
    const verticalRepeat = wallHeightTotal / avgTileSize;
    wallTex.repeat.set(horizontalRepeat, verticalRepeat);
    
    return new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.7,
      metalness: 0.1,
      fog: true
    });
  }, [tilesTextureBase, bounds, wallHeightTotal, avgTileSize]);
  
  // Terrain limits
  const TERRAIN_MIN = 0.5;
  const TERRAIN_MAX = 20.5;
  
  // Antideslizante border material (same tiles texture for the border around pool)
  const borderWidth = 0.8; // Ancho del borde antideslizante en metros
  const borderHeight = 0.05; // Grosor del borde antideslizante
  
  // Material para bordes Norte/Sur (horizontal largo)
  const borderNorthSouthMaterial = useMemo(() => {
    if (!tilesTextureBase || !bounds) return null;
    
    const borderTex = tilesTextureBase.clone();
    
    // El piso tiene repeat (2, 2) sobre (bounds.width, bounds.depth)
    // Tamaño de baldosa = bounds.width / 2
    const tileSize = bounds.width / 2;
    
    // Dimensiones del borde Norte/Sur: (bounds.width + borderWidth * 2) x borderWidth
    const repeatX = (bounds.width + borderWidth * 2) / tileSize;
    const repeatY = borderWidth / tileSize;
    
    borderTex.repeat.set(repeatX, repeatY);
    
    return new THREE.MeshStandardMaterial({
      map: borderTex,
      roughness: 0.8,
      metalness: 0.05,
      fog: true
    });
  }, [tilesTextureBase, bounds]);
  
  // Material para bordes Este/Oeste (vertical)
  const borderEastWestMaterial = useMemo(() => {
    if (!tilesTextureBase || !bounds) return null;
    
    const borderTex = tilesTextureBase.clone();
    
    const tileSize = bounds.width / 2;
    
    // Dimensiones del borde Este/Oeste: borderWidth x bounds.depth
    const repeatX = borderWidth / tileSize;
    const repeatY = bounds.depth / tileSize;
    
    borderTex.repeat.set(repeatX, repeatY);
    
    return new THREE.MeshStandardMaterial({
      map: borderTex,
      roughness: 0.8,
      metalness: 0.05,
      fog: true
    });
  }, [tilesTextureBase, bounds]);
  
  // Calculate adjusted border positions and dimensions to keep them within terrain
  const adjustedBorders = useMemo(() => {
    if (!bounds) return null;
    
    const borderOffset = 0.4;
    
    // Calculate ideal dimensions
    const idealNorthSouthWidth = bounds.width + borderWidth * 1.75;
    const idealEastWestDepth = bounds.depth - borderWidth * 0.25;
    
    // Calculate ideal positions
    const idealNorthZ = bounds.maxZ + borderOffset + borderWidth/2;
    const idealSouthZ = bounds.minZ - borderOffset - borderWidth/2;
    const idealEastX = bounds.maxX + borderOffset + borderWidth/2;
    const idealWestX = bounds.minX - borderOffset - borderWidth/2;
    
    // --- NORTH BORDER ---
    const northOuterZ = idealNorthZ + borderWidth/2;
    let northVisible = true;
    let northZ = idealNorthZ;
    
    if (northOuterZ > TERRAIN_MAX) {
      const northInnerZ = idealNorthZ - borderWidth/2;
      if (northInnerZ >= TERRAIN_MAX) {
        northVisible = false;
      } else {
        northZ = TERRAIN_MAX - borderWidth/2;
      }
    }
    
    // --- SOUTH BORDER ---
    const southOuterZ = idealSouthZ - borderWidth/2;
    let southVisible = true;
    let southZ = idealSouthZ;
    
    if (southOuterZ < TERRAIN_MIN) {
      const southInnerZ = idealSouthZ + borderWidth/2;
      if (southInnerZ <= TERRAIN_MIN) {
        southVisible = false;
      } else {
        southZ = TERRAIN_MIN + borderWidth/2;
      }
    }
    
    // --- EAST BORDER ---
    const eastOuterX = idealEastX + borderWidth/2;
    let eastVisible = true;
    let eastX = idealEastX;
    
    if (eastOuterX > TERRAIN_MAX) {
      const eastInnerX = idealEastX - borderWidth/2;
      if (eastInnerX >= TERRAIN_MAX) {
        eastVisible = false;
      } else {
        eastX = TERRAIN_MAX - borderWidth/2;
      }
    }
    
    // --- WEST BORDER ---
    const westOuterX = idealWestX - borderWidth/2;
    let westVisible = true;
    let westX = idealWestX;
    
    if (westOuterX < TERRAIN_MIN) {
      const westInnerX = idealWestX + borderWidth/2;
      if (westInnerX <= TERRAIN_MIN) {
        westVisible = false;
      } else {
        westX = TERRAIN_MIN + borderWidth/2;
      }
    }
    
    // Adjust North/South width if it extends beyond terrain in X direction
    const nsLeftEdge = bounds.centerX - idealNorthSouthWidth/2;
    const nsRightEdge = bounds.centerX + idealNorthSouthWidth/2;
    let nsWidth = idealNorthSouthWidth;
    let nsCenterX = bounds.centerX;
    
    if (nsLeftEdge < TERRAIN_MIN || nsRightEdge > TERRAIN_MAX) {
      const leftClamp = Math.max(nsLeftEdge, TERRAIN_MIN);
      const rightClamp = Math.min(nsRightEdge, TERRAIN_MAX);
      nsWidth = rightClamp - leftClamp;
      nsCenterX = (leftClamp + rightClamp) / 2;
    }
    
    // Adjust East/West depth if it extends beyond terrain in Z direction
    const ewTopEdge = bounds.centerZ + idealEastWestDepth/2;
    const ewBottomEdge = bounds.centerZ - idealEastWestDepth/2;
    let ewDepth = idealEastWestDepth;
    let ewCenterZ = bounds.centerZ;
    
    if (ewBottomEdge < TERRAIN_MIN || ewTopEdge > TERRAIN_MAX) {
      const bottomClamp = Math.max(ewBottomEdge, TERRAIN_MIN);
      const topClamp = Math.min(ewTopEdge, TERRAIN_MAX);
      ewDepth = topClamp - bottomClamp;
      ewCenterZ = (bottomClamp + topClamp) / 2;
    }
    
    return {
      north: {
        visible: northVisible,
        position: [nsCenterX, wallTop, northZ],
        width: nsWidth
      },
      south: {
        visible: southVisible,
        position: [nsCenterX, wallTop, southZ],
        width: nsWidth
      },
      east: {
        visible: eastVisible,
        position: [eastX, wallTop, ewCenterZ],
        depth: ewDepth
      },
      west: {
        visible: westVisible,
        position: [westX, wallTop, ewCenterZ],
        depth: ewDepth
      }
    };
  }, [bounds, borderWidth, wallTop]);

  return (
    <group>
      {/* Pool walls with tiles texture - extending from ground to top */}
      {northSouthWallMaterial && eastWestWallMaterial && bounds && (
        <>
          {/* North wall (positive Z) */}
          <mesh
            position={[bounds.centerX, (wallBottom + wallTop) / 2, bounds.maxZ + 0.5]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[bounds.width, wallTop - wallBottom, wallThickness]} />
            <primitive object={northSouthWallMaterial} attach="material" />
          </mesh>
          
          {/* South wall (negative Z) */}
          <mesh
            position={[bounds.centerX, (wallBottom + wallTop) / 2, bounds.minZ - 0.5]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[bounds.width, wallTop - wallBottom, wallThickness]} />
            <primitive object={northSouthWallMaterial} attach="material" />
          </mesh>
          
          {/* East wall (positive X) */}
          <mesh
            position={[bounds.maxX + 0.5, (wallBottom + wallTop) / 2, bounds.centerZ]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[wallThickness, wallTop - wallBottom, bounds.depth]} />
            <primitive object={eastWestWallMaterial} attach="material" />
          </mesh>
          
          {/* West wall (negative X) */}
          <mesh
            position={[bounds.minX - 0.5, (wallBottom + wallTop) / 2, bounds.centerZ]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[wallThickness, wallTop - wallBottom, bounds.depth]} />
            <primitive object={eastWestWallMaterial} attach="material" />
          </mesh>
          
          {/* Pool floor with tiles texture and animated caustics */}
          <mesh
            ref={floorRef}
            position={[bounds.centerX, groundLevel + 0.25, bounds.centerZ]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[bounds.width, 0.11, bounds.depth]} />
            <primitive object={floorMaterial} attach="material" />
          </mesh>
          
          {/* Antideslizante border - 4 rectangles around the pool at ground level */}
          {borderNorthSouthMaterial && borderEastWestMaterial && adjustedBorders && (
            <>
              {/* North border (positive Z) */}
              {adjustedBorders.north.visible && (
                <mesh
                  position={adjustedBorders.north.position}
                  receiveShadow
                  castShadow
                >
                  <boxGeometry args={[adjustedBorders.north.width, borderHeight, borderWidth]} />
                  <primitive object={borderNorthSouthMaterial} attach="material" />
                </mesh>
              )}
              
              {/* South border (negative Z) */}
              {adjustedBorders.south.visible && (
                <mesh
                  position={adjustedBorders.south.position}
                  receiveShadow
                  castShadow
                >
                  <boxGeometry args={[adjustedBorders.south.width, borderHeight, borderWidth]} />
                  <primitive object={borderNorthSouthMaterial} attach="material" />
                </mesh>
              )}
              
              {/* East border (positive X) */}
              {adjustedBorders.east.visible && (
                <mesh
                  position={adjustedBorders.east.position}
                  receiveShadow
                  castShadow
                >
                  <boxGeometry args={[borderWidth, borderHeight, adjustedBorders.east.depth]} />
                  <primitive object={borderEastWestMaterial} attach="material" />
                </mesh>
              )}
              
              {/* West border (negative X) */}
              {adjustedBorders.west.visible && (
                <mesh
                  position={adjustedBorders.west.position}
                  receiveShadow
                  castShadow
                >
                  <boxGeometry args={[borderWidth, borderHeight, adjustedBorders.west.depth]} />
                  <primitive object={borderEastWestMaterial} attach="material" />
                </mesh>
              )}
            </>
          )}
        </>
      )}
      
      {/* Unified animated surface covering entire pool - ONLY ONE SHADER SURFACE */}
      <mesh
        ref={surfaceRef}
        position={[bounds.centerX, bounds.y - 0.2, bounds.centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={true}
        castShadow={false}
        geometry={surfaceGeometry}
        material={waterMaterial}
        renderOrder={1}
      />
    </group>
  );
};

export default Water;

