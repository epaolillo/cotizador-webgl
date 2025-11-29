import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import tilesTexture from '../../assets/tiles.jpg';

/**
 * TilePath - Tile/venecita path component for walkways
 * Uses the same tile texture as pool floor
 * Positioned at pool border level (y = 0)
 */
const TilePath = ({ 
  block, 
  color = '#696969', 
  opacity = 1.0,
  selected = false,
}) => {
  // Load tiles texture
  const tilesTex = useLoader(THREE.TextureLoader, tilesTexture);
  
  // Configure tiles texture
  const tilesTextureConfigured = useMemo(() => {
    if (!tilesTex) return null;
    tilesTex.wrapS = tilesTex.wrapT = THREE.RepeatWrapping;
    tilesTex.anisotropy = 16;
    return tilesTex;
  }, [tilesTex]);

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
      y = pos.y;
    });
    
    return {
      minX, maxX, minZ, maxZ, y,
      width: maxX - minX + 1,
      depth: maxZ - minZ + 1,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2
    };
  }, [block.positions]);

  // Create material with tiles texture
  const tileMaterial = useMemo(() => {
    if (!tilesTextureConfigured || !bounds) return null;
    
    const tex = tilesTextureConfigured.clone();
    tex.needsUpdate = true;
    
    // Set texture repeat based on dimensions
    // Make tiles larger by reducing repeat (divide by 2 = tiles 2x bigger)
    tex.repeat.set(bounds.width / 2, bounds.depth / 2);
    
    const material = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.8,
      metalness: 0.05,
      fog: true
    });
    
    return material;
  }, [tilesTextureConfigured, bounds]);

  if (!bounds) {
    console.warn('TilePath: No bounds calculated');
    return null;
  }

  // Path configuration
  const pathHeight = 0.05; // Same thickness as anti-slip border
  const pathLevel = -0.2; // Same level as pool border (wallTop = bounds.y - 0.2)

  return (
    <group>
      {/* Main tile surface */}
      <mesh
        position={[bounds.centerX, pathLevel + pathHeight/2, bounds.centerZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[bounds.width, pathHeight, bounds.depth]} />
        {tileMaterial && tileMaterial.map ? (
          <meshStandardMaterial 
            map={tileMaterial.map}
            roughness={0.8}
            metalness={0.05}
          />
        ) : (
          <meshStandardMaterial 
            color="#D3D3D3"
            roughness={0.8}
            metalness={0.05}
          />
        )}
      </mesh>

      {/* Selection indicator (optional) */}
      {selected && (
        <mesh
          position={[bounds.centerX, pathLevel + pathHeight + 0.02, bounds.centerZ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[bounds.width, bounds.depth]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent 
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default TilePath;

