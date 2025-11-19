export const poolFloorVertexShader = /* glsl */ `
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const poolFloorFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;

  varying vec2 vUv;

  void main() {
    // Simple texture rendering - no caustics, no animation, no flickering
    vec4 texColor = texture2D(uTexture, vUv);
    gl_FragColor = vec4(texColor.xyz, 1.0);
  }
`;
