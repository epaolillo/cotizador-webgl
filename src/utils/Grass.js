import * as THREE from 'three';
import { vertexShader, fragmentShader } from '../shaders/grassShaders';
import cloudTexture from '../assets/cloud.jpg';

const BLADE_WIDTH = 0.03;
const BLADE_HEIGHT = 0.2;
const BLADE_HEIGHT_VARIATION = 0.25;
const BLADE_VERTEX_COUNT = 5;
const BLADE_TIP_OFFSET = 0.1;

function interpolate(val, oldMin, oldMax, newMin, newMax) {
  return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

export class GrassGeometry extends THREE.BufferGeometry {
  constructor(size, count) {
    super();

    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i < count; i++) {
      const surfaceMin = (size / 2) * -1;
      const surfaceMax = size / 2;
      
      // Generate random position within square area instead of circular
      const x = surfaceMin + Math.random() * (surfaceMax - surfaceMin);
      const y = surfaceMin + Math.random() * (surfaceMax - surfaceMin);

      uvs.push(
        ...Array.from({ length: BLADE_VERTEX_COUNT }).flatMap(() => [
          interpolate(x, surfaceMin, surfaceMax, 0, 1),
          interpolate(y, surfaceMin, surfaceMax, 0, 1)
        ])
      );

      const blade = this.computeBlade([x, 0, y], i);
      positions.push(...blade.positions);
      indices.push(...blade.indices);
    }

    this.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), 3)
    );
    this.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    this.setIndex(indices);
    this.computeVertexNormals();
  }

  // Grass blade generation, covered in https://smythdesign.com/blog/stylized-grass-webgl
  // TODO: reduce vertex count, optimize & possibly move to GPU
  computeBlade(center, index = 0) {
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION;
    const vIndex = index * BLADE_VERTEX_COUNT;

    // Randomize blade orientation and tip angle
    const yaw = Math.random() * Math.PI * 2;
    const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)];
    const bend = Math.random() * Math.PI * 2;
    const bendVec = [Math.sin(bend), 0, -Math.cos(bend)];

    // Calc bottom, middle, and tip vertices
    const bl = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * 1 + center[i]);
    const br = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * -1 + center[i]);
    const tl = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * 1 + center[i]);
    const tr = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * -1 + center[i]);
    const tc = bendVec.map((n, i) => n * BLADE_TIP_OFFSET + center[i]);

    // Attenuate height
    tl[1] += height / 2;
    tr[1] += height / 2;
    tc[1] += height;

    return {
      positions: [...bl, ...br, ...tr, ...tl, ...tc],
      indices: [
        vIndex,
        vIndex + 1,
        vIndex + 2,
        vIndex + 2,
        vIndex + 4,
        vIndex + 3,
        vIndex + 3,
        vIndex,
        vIndex + 2
      ]
    };
  }
}

// Create and configure cloud texture
export const createCloudTexture = () => {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(cloudTexture);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Create grass material
export const createGrassMaterial = (cloudTexture) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCloud: { value: cloudTexture },
      uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    vertexShader,
    fragmentShader
  });
};

class Grass extends THREE.Mesh {
  constructor(size, count) {
    const geometry = new GrassGeometry(size, count);
    const cloudTex = createCloudTexture();
    const material = createGrassMaterial(cloudTex);
    
    super(geometry, material);

    // Create floor geometry (square plane)
    const floorGeometry = new THREE.PlaneGeometry(size, size);
    floorGeometry.rotateX(-Math.PI / 2);
    
    const floor = new THREE.Mesh(floorGeometry, material);
    floor.position.y = -Number.EPSILON;
    this.add(floor);
  }

  update(time) {
    this.material.uniforms.uTime.value = time;
    
    // Update floor material if it exists
    if (this.children.length > 0) {
      this.children[0].material.uniforms.uTime.value = time;
    }
  }
}

export default Grass;
