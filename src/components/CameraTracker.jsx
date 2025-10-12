import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditor } from '../context/EditorContext';
import * as THREE from 'three';

/**
 * CameraTracker component - Optimized camera data tracking
 * Only updates when debug UI is visible and values change significantly
 */
const CameraTracker = () => {
  const { camera, controls } = useThree();
  const { updateCameraData, debugUI } = useEditor();
  
  const lastUpdateRef = useRef({
    position: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    distance: 0,
    fov: 60,
    lastTime: 0
  });

  // Helper function to check if values changed significantly
  const hasSignificantChange = (current, last, threshold = 0.01) => {
    return (
      Math.abs(current.position.x - last.position.x) > threshold ||
      Math.abs(current.position.y - last.position.y) > threshold ||
      Math.abs(current.position.z - last.position.z) > threshold ||
      Math.abs(current.target.x - last.target.x) > threshold ||
      Math.abs(current.target.y - last.target.y) > threshold ||
      Math.abs(current.target.z - last.target.z) > threshold ||
      Math.abs(current.distance - last.distance) > threshold ||
      Math.abs(current.fov - last.fov) > 0.1
    );
  };

  // Optimized frame update - only when debug UI is visible
  useFrame(() => {
    // Only track when debug UI is visible
    if (!debugUI.showCameraInfo || !camera || !controls) {
      return;
    }

    const currentTime = Date.now();
    const lastUpdate = lastUpdateRef.current;
    
    // Throttle updates to maximum 10fps when debug UI is visible
    if (currentTime - lastUpdate.lastTime < 100) {
      return;
    }

    const position = camera.position;
    const target = controls.target || new THREE.Vector3(0, 0, 0);
    const distance = camera.position.distanceTo(target);
    const fov = camera.fov || 60;

    const currentData = {
      position: {
        x: position.x,
        y: position.y,
        z: position.z
      },
      target: {
        x: target.x,
        y: target.y,
        z: target.z
      },
      distance: distance,
      fov: fov
    };

    // Only update if values changed significantly
    if (hasSignificantChange(currentData, lastUpdate)) {
      updateCameraData(currentData);
      
      // Update the reference
      lastUpdateRef.current = {
        ...currentData,
        lastTime: currentTime
      };
    }
  });

  // This component doesn't render anything
  return null;
};

export default CameraTracker;
