import React from 'react';
import Block from './Block';
import Palm from './objects/Palm';

/**
 * Component Registry - Maps object type IDs to their JSX components
 * This allows each object type to have its own custom 3D representation
 * 
 * To add a new object type:
 * 1. Create the component in src/components/objects/YourObject.jsx
 * 2. Import it here
 * 3. Add it to the COMPONENT_REGISTRY with the corresponding type ID
 */
const COMPONENT_REGISTRY = {
  block: Block,    // Default block component
  pool: Block,     // Pool uses default Block for now (placeholder for future custom component)
  palm: Palm,      // Palm uses custom Palm component (double height)
  fence: Block,    // Fence uses default Block for now (placeholder for future custom component)
  terrain: Block,  // Terrain uses default Block for now (placeholder for future custom component)
  path: Block,     // Path uses default Block for now (placeholder for future custom component)
};

/**
 * ObjectRenderer - Smart component that renders the appropriate 3D object
 * based on the block's type property
 * 
 * @param {Object} block - The block object with positions and type
 * @param {number} opacity - Opacity of the object (0-1)
 * @param {boolean} selected - Whether the object is selected
 */
const ObjectRenderer = ({ block, opacity = 1.0, selected = false }) => {
  if (!block || !block.type) {
    // Fallback to default Block component if type is missing
    console.warn('ObjectRenderer: Block missing type, using default Block component', block);
    return <Block block={block} opacity={opacity} selected={selected} />;
  }

  // Get the component for this object type from the registry
  const Component = COMPONENT_REGISTRY[block.type.id];
  
  if (!Component) {
    // If component not found in registry, use default Block
    console.warn(`ObjectRenderer: No component registered for type "${block.type.id}", using default Block component`);
    return <Block block={block} opacity={opacity} selected={selected} />;
  }
  
  // Render the appropriate component
  return (
    <Component 
      block={block} 
      opacity={opacity} 
      selected={selected}
    />
  );
};

export default ObjectRenderer;

