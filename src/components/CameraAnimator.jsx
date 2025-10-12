import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useEditor } from '../context/EditorContext';
import * as THREE from 'three';

const CameraAnimator = () => {
  const { camera, controls } = useThree();
  const { cameraView, CAMERA_VIEWS, setCurrentView } = useEditor();
  
  const animationRef = useRef({
    isAnimating: false,
    startTime: 0,
    startPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endPosition: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    duration: 300
  });

  useEffect(() => {
    if (cameraView.isAnimating && cameraView.targetView && camera && controls) {
      const targetViewData = CAMERA_VIEWS[cameraView.targetView.toUpperCase()];
      
      if (targetViewData) {
        const animation = animationRef.current;
        
        animation.startPosition.copy(camera.position);
        animation.startTarget.copy(controls.target);
        
        animation.endPosition.set(
          targetViewData.position.x,
          targetViewData.position.y,
          targetViewData.position.z
        );
        animation.endTarget.set(
          targetViewData.target.x,
          targetViewData.target.y,
          targetViewData.target.z
        );
        
        animation.isAnimating = true;
        animation.startTime = Date.now();
      }
    }
  }, [cameraView.isAnimating, cameraView.targetView, camera, controls, CAMERA_VIEWS]);

  useFrame(() => {
    const animation = animationRef.current;
    
    if (animation.isAnimating && camera && controls) {
      const currentTime = Date.now();
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      camera.position.lerpVectors(
        animation.startPosition,
        animation.endPosition,
        easedProgress
      );
      
      controls.target.lerpVectors(
        animation.startTarget,
        animation.endTarget,
        easedProgress
      );
      
      controls.update();
      
      if (progress >= 1) {
        animation.isAnimating = false;
        
        camera.position.copy(animation.endPosition);
        controls.target.copy(animation.endTarget);
        controls.update();
        
        if (cameraView.targetView) {
          setCurrentView(cameraView.targetView);
        }
      }
    }
  });

  return null;
};

export default CameraAnimator;
