# Custom 3D Object Components

This directory contains custom 3D object components that can be used in the scene. Each object type can have its own unique geometry, materials, and behavior.

## Available Components

### Tree (Tree.jsx)
- **Height**: 2 units (double height)
- **Description**: Tree with 3D GLB model
- **Features**: 
  - Uses loaded 3D model (tree2.glb) with proper instancing
  - Random Y-axis rotation for natural variety (each tree looks different)
  - Position-based rotation seed for consistency across reloads
- **Model**: Located at `/public/glb/tree2.glb`
- **Unique**: true - Placed with single click instead of drag selection

### Water (Water.jsx)
- **Height**: 0.5 units (half height)
- **Description**: Reflective water surface for pools
- **Features**: 
  - Only top surface visible (no side faces to avoid visible seams)
  - Turquoise reflective material with mirror-like finish
  - Physical-based material with high metalness and low roughness
  - Receives shadows from other objects
  - Transparent with clearcoat for realistic water appearance
  - Solid body with reflective top surface
- **Used by**: Pool object type
- **Unique**: false - Placed with drag selection for pool areas

## How to Add a New Custom Object

### Step 1: Create the Component

Create a new file in this directory (e.g., `Pool.jsx`):

```jsx
import React from 'react';
import { Box } from '@react-three/drei';

const Pool = ({ block, opacity = 1.0, selected = false }) => {
  const poolColor = selected ? '#ff6b6b' : '#00bfff';
  
  if (!block || !block.positions || block.positions.length === 0) {
    return null;
  }

  return (
    <group>
      {block.positions.map((position, index) => (
        <group key={`pool_${block.id}_${position.x}_${position.y}_${position.z}_${index}`}>
          {/* Your custom 3D geometry here */}
          <Box 
            position={[position.x, position.y, position.z]}
            args={[1, 0.3, 1]} // Shallow pool
          >
            <meshStandardMaterial 
              color={poolColor}
              opacity={opacity}
              transparent={opacity < 1.0}
              roughness={0.1}
              metalness={0.5}
              fog={true}
            />
          </Box>
        </group>
      ))}
    </group>
  );
};

export default Pool;
```

### Step 2: Register in ObjectRenderer

Add your component to `src/components/ObjectRenderer.jsx`:

```jsx
import Pool from './objects/Pool';

const COMPONENT_REGISTRY = {
  // ... existing entries
  pool: Pool,  // Add your component here
};
```

### Step 3: Update OBJECT_TYPES (Optional)

Update the metadata in `src/context/EditorContext.jsx`:

```jsx
export const OBJECT_TYPES = {
  POOL: {
    id: 'pool',
    color: '#00bfff',
    name: 'Pileta',
    component: 'Pool',   // Reference to your component
    height: 0.3,         // Custom property
    unique: false,       // true = single click placement, false = drag selection
    description: 'Swimming pool with water effect'
  },
  // ... other types
};
```

#### The `unique` Property

- **`unique: true`**: Object is placed with a single click. Perfect for complex 3D models like trees, furniture, or decorative elements that look better as individual objects.
- **`unique: false`**: Object can be placed with drag selection (click and drag to define area). Ideal for walls, floors, paths, or any object that makes sense in rectangular patterns.

**When to use `unique: true`:**
- Complex 3D models (trees, furniture, vehicles)
- Objects that look unnatural when repeated in patterns
- Decorative or standalone elements
- Objects where precise positioning is more important than area coverage

### Step 4: Done!

The system will automatically:
- Use your custom component when rendering objects of that type
- Show the correct color in the preview
- Handle translations via i18n
- Support selection and opacity

## Component Props

All object components receive these props:

- `block`: Object with positions array and type information
- `opacity`: Number between 0-1 for transparency
- `selected`: Boolean indicating if the object is selected

## Best Practices

1. **Always check if block exists**: Validate `block` and `block.positions` before rendering
2. **Use group positioning**: Position objects relative to their base position
3. **Enable fog**: Set `fog={true}` on materials for depth perception
4. **Unique keys**: Use block.id and position in keys for React optimization
5. **Performance**: Keep geometry simple for smooth interaction with many objects

## Tips

- Use `@react-three/drei` components like `Box`, `Sphere`, `Cylinder` for basic shapes
- Load custom 3D models with `useGLTF` from `@react-three/drei`
- Add animations with `useFrame` from `@react-three/fiber`
- Consider object scale when designing (1 unit = 1 meter in the scene)

## Loading GLB/GLTF Models

To use 3D models (GLB/GLTF format):

```jsx
import { useGLTF } from '@react-three/drei';

const MyObject = ({ block, opacity, selected }) => {
  // Load the model
  const { scene } = useGLTF('/glb/your-model.glb');
  
  // Clone for each instance
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  return (
    <group>
      {block.positions.map((position, index) => (
        <primitive
          key={`myobj_${index}`}
          object={clonedScene.clone()}
          position={[position.x, position.y, position.z]}
          scale={[1, 1, 1]}
        />
      ))}
    </group>
  );
};

// Preload for better performance
useGLTF.preload('/glb/your-model.glb');
```

### GLB Model Guidelines

1. **Place models** in `public/glb/` directory (Vite will copy them to dist automatically)
2. **Optimize models** before importing (reduce polygons, compress textures)
3. **Test scale** - adjust the `scale` prop on `primitive` as needed
4. **Clone scenes** to avoid material sharing between instances
5. **Preload models** using `useGLTF.preload()` for better performance
6. **Reference models** using `/glb/model-name.glb` (path relative to public folder)

