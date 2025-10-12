import React, { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEditor } from '../context/EditorContext';

/**
 * AtmosphericFog component - Handles exponential fog for depth simulation
 * Provides realistic atmospheric depth cues for the 3D scene
 */
const AtmosphericFog = () => {
  const { scene } = useThree();
  const { fogSettings } = useEditor();

  // Create fog instance with memoization for performance
  const fog = useMemo(() => {
    if (!fogSettings.enabled) return null;
    
    const fogColor = new THREE.Color(fogSettings.color);
    return new THREE.FogExp2(fogColor, fogSettings.density);
  }, [fogSettings.enabled, fogSettings.color, fogSettings.density]);

  // Update scene fog when settings change
  useEffect(() => {
    if (scene) {
      scene.fog = fog;
      
      // Also update the renderer clear color to match fog for seamless horizon
      const clearColor = fog ? new THREE.Color(fogSettings.color) : new THREE.Color('#87CEEB');
      // Note: We can't directly access renderer here, but the Canvas background handles this
    }

    // Cleanup fog when component unmounts or fog is disabled
    return () => {
      if (scene && !fogSettings.enabled) {
        scene.fog = null;
      }
    };
  }, [scene, fog, fogSettings.enabled, fogSettings.color]);

  // This component doesn't render anything visible itself
  return null;
};

export default AtmosphericFog;
