import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditor } from '../context/EditorContext';
import * as THREE from 'three';

/**
 * CameraTracker component - Invisible component that tracks camera data
 * Updates camera information in the global context for UI display
 */
const CameraTracker = () => {
  const { camera, controls } = useThree();
  const { updateCameraData } = useEditor();

  // Update camera information on each frame
  useFrame(() => {
    if (camera && controls) {
      const position = camera.position;
      const target = controls.target || new THREE.Vector3(0, 0, 0);
      const distance = camera.position.distanceTo(target);
      const fov = camera.fov || 60;

      // Update context with current camera data
      updateCameraData({
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
      });
    }
  });

  // This component doesn't render anything
  return null;
};

export default CameraTracker;
