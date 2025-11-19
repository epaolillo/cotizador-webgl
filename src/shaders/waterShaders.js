export const waterVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAmplitude;
  uniform float uAmplitudeFactor;
  uniform float uFrequency;
  uniform float uFrequencyFactor;
  uniform float uLambda;
  uniform float uLambdaFactor;
  uniform int uIterations;
  uniform float uRandom;

  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vDz;

  const float PI = 3.14159;

  // Simplex 2D Noise by Ian McEwan, Stefan Gustavson
  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    vPosition = position;
    
    float timeInSeconds = uTime / 1000.0;
    
    // Calculate edge fade to keep waves within pool boundaries
    // UV coordinates go from 0 to 1, we want to fade near edges
    float edgeFade = 1.0;
    float edgeDistance = 0.05; // Distance from edge to start fading (5% of size)
    
    // Fade on all edges
    float fadeX = min(uv.x / edgeDistance, (1.0 - uv.x) / edgeDistance);
    float fadeZ = min(uv.y / edgeDistance, (1.0 - uv.y) / edgeDistance);
    edgeFade = min(fadeX, fadeZ);
    edgeFade = clamp(edgeFade, 0.0, 1.0);
    // Smooth fade curve
    edgeFade = smoothstep(0.0, 1.0, edgeFade);
    
    float dz = 0.0;
    float dzdx = 0.0;
    float dzdy = 0.0;

    float a = uAmplitude;
    float w = uFrequency;
    float lambda = uLambda;

    // Multiple wave iterations with random directions
    for (int i = 0; i < uIterations; i++) {
      // Generate random direction for each wave using Simplex Noise
      float angle = snoise(vec2(float(i), uRandom)) * 2.0 * PI;
      float kx = cos(angle);
      float ky = sin(angle);

      float k = 2.0 * PI / lambda;

      kx *= k;
      ky *= k;

      float phase = kx * position.x + ky * position.z - w * timeInSeconds;
      float sinPhase = sin(phase);
      float cosPhase = cos(phase);
      
      // Apply edge fade to wave amplitude
      float waveAmplitude = a * edgeFade;
      
      dz += waveAmplitude * sinPhase;
      dzdx += waveAmplitude * kx * cosPhase;
      dzdy += waveAmplitude * ky * cosPhase;
      
      // Update parameters for next iteration
      a = a * uAmplitudeFactor;
      w = w * uFrequencyFactor;
      lambda *= uLambdaFactor;
    }

    // Calculate normal from derivatives
    vec3 x = vec3(1, 0, dzdx);
    vec3 y = vec3(0, 1, dzdy);
    vec3 n = normalize(cross(x, y));
    vNormal = normalize(normalMatrix * n);
    
    vec3 newPosition = position;
    newPosition.y += dz;
    
    vDz = dz;
    vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const waterFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform vec3 uCameraPosition;
  uniform float uAmplitude;
  uniform samplerCube uEnvironmentMap;

  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vDz;

  void main() {
    vec3 color = uColor;
    vec3 n = normalize(gl_FrontFacing ? vNormal : -vNormal);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    
    // Adjust brightness according to wave height (caustics effect)
    vec3 baseColor = color * clamp((vDz + uAmplitude) / (2.0 * uAmplitude), 0.4, 1.0);
    
    // Calculate reflection direction for environment mapping
    vec3 reflectDir = reflect(-viewDir, n);
    // Flip X for correct cubemap sampling (Three.js convention)
    reflectDir.x = -reflectDir.x;
    
    // Sample environment map for realistic reflections
    vec3 reflectedColor = texture(uEnvironmentMap, reflectDir).rgb;
    
    // Enhanced Fresnel effect
    float F0 = 0.04;
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - dot(n, viewDir), 5.0);
    
    // Only apply fresnel when reflection points upward (towards sky) and front-facing
    fresnel = fresnel * step(0.0, reflectDir.y) * float(gl_FrontFacing);
    
    // Mix base color with reflected environment color based on fresnel
    vec3 finalColor = mix(baseColor, reflectedColor, fresnel);
    
    // Add subtle specular highlights
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 halfVector = normalize(lightDir + viewDir);
    float specular = pow(max(dot(n, halfVector), 0.0), 128.0);
    finalColor += specular * vec3(1.0, 1.0, 1.0) * 0.3;
    
    // Add subtle color variation based on wave height
    float heightVariation = sin(vDz * 10.0 + uTime * 0.001) * 0.05;
    finalColor += vec3(heightVariation * 0.1, heightVariation * 0.15, heightVariation * 0.08);
    
    // Reduce opacity near edges for smoother fade
    float edgeAlpha = 1.0;
    float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    edgeAlpha = smoothstep(0.0, 0.1, edgeDist);
    
    gl_FragColor = vec4(finalColor, uOpacity * edgeAlpha);
  }
`;
