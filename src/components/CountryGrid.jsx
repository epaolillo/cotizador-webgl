import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import loteGramarTexture from '../assets/lote-gramar.png';

/**
 * CountryGrid - Creates a country-style subdivision with multiple plots
 * The editable terrain is one plot, surrounded by other plots with white division lines
 */
const CountryGrid = ({ gridSize = 20, plotsAround = 2 }) => {
  // Load textures
  const loteGramarTex = useLoader(THREE.TextureLoader, loteGramarTexture);

  // The texture already contains 9 lots (3x3) with divisions
  // We just need to scale it to fit the grid size
  
  // Calculate total size to show exactly 9 lots (3x3 grid)
  // Each lot should be gridSize units (20x20), so 3 lots = 3 * gridSize = 60x60
  const totalPlotsPerSide = plotsAround * 2 + 1; // 3 plots per side (1 on each side + center)
  const baseSize = gridSize * totalPlotsPerSide; // 60x60 units base
  // Aumentar un 5% el tamaño para asegurar que todos los lotes se vean completos sin cortes
  const totalSize = baseSize * 1.05; // 63x63 units para mejor visibilidad
  
  // Material for ALL plots (using lote-gramar.png - texture already includes divisions)
  const plotMaterial = useMemo(() => {
    if (!loteGramarTex) {
      return new THREE.MeshStandardMaterial({
        color: '#6B8E6B', // Darker green fallback
        roughness: 0.8,
        metalness: 0.05,
        fog: true
      });
    }
    
    const tex = loteGramarTex.clone();
    // Usar RepeatWrapping para tener control total
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    
    // Ajustar repeat para que la textura cubra exactamente el área de 60x60 en el plano de 63x63
    // Esto asegura que los 9 lotes se vean completos y proporcionales
    const textureScale = baseSize / totalSize; // 60 / 63 ≈ 0.952
    tex.repeat.set(textureScale, textureScale);
    
    // Offset para alinear el lote central con el área editable
    // Cálculo: Plano 63x63 centrado en (10.5, 10.5) va de -21 a 42
    // Área editable: 1 a 20 → UV: (1-(-21))/63 = 0.349, (20-(-21))/63 = 0.651
    // Lote central textura: [1/3, 2/3] = [0.333, 0.667]
    // Con repeat 0.952, el lote central está en [0.333*0.952, 0.667*0.952] = [0.317, 0.635]
    // Offset necesario: 0.349 - 0.317 = 0.032
    // Ajuste fino para mejor alineación
    tex.offset.set(-0.005, 0.239);
    
    // Asegurar orientación correcta (Three.js por defecto invierte Y)
    tex.flipY = false;
    
    // Mejorar calidad de la textura
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.8,
      metalness: 0.05,
      fog: true
    });
  }, [loteGramarTex, baseSize, totalSize]);

  // Single large plane showing exactly 9 lots from the texture
  // The texture lote-gramar.png contains 9 lots (3x3), and we show it without repeating
  const allPlots = useMemo(() => {
    // Position the plane so ALL 9 lots are visible and the center lot aligns with editable area
    // The editable area goes from 1 to 20 (20 units)
    // The plane is 60x60, and we want to show all 9 lots complete
    // If the plane is 60x60, it should go from 0 to 60 in world coordinates
    // But we want the center lot (middle third: 20-40) to align with area 1-20
    // So we position the plane starting at -10 (so it goes from -10 to 50)
    // This way: center lot is at 10-30, which aligns with editable area 1-20 (shifted by 9)
    // Actually, let's position it so the center is at 10.5 (center of editable area)
    // Plane 60x60 centered at 10.5 goes from -19.5 to 40.5
    // But we want to see all 9 lots, so let's position it differently
    
    // Better approach: position plane so it starts at a point where all 9 lots are visible
    // If each lot is 20 units, and we have 3x3, the plane should be 60x60
    // Position it so the center lot (positions 20-40) aligns with editable area (1-20)
    // That means we need to shift: editable area 1-20 should map to lot center 20-40
    // So plane should start at: 1 - 20 = -19, but we want center at 10.5
    // Let's try: position plane at (10.5, -0.5, 10.5) with size 60x60
    // This gives us range: X from -19.5 to 40.5, Z from -19.5 to 40.5
    // Editable area 1-20 is within this range, so should be visible
    
    const centerX = gridSize / 2 + 0.5; // 10.5 - center of editable area
    const centerZ = gridSize / 2 + 0.5; // 10.5 - center of editable area
    const plotY = -0.5;
    
    return (
      <mesh
        position={[centerX, plotY, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[totalSize, totalSize]} />
        <primitive object={plotMaterial} attach="material" />
      </mesh>
    );
  }, [totalSize, plotMaterial, gridSize]);

  return (
    <group>
      {/* All 9 lots from texture (includes divisions) */}
      {allPlots}
    </group>
  );
};

export default CountryGrid;

