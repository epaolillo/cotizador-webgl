import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const ACTIONS = {
  SET_PREVIEW_POSITION: 'SET_PREVIEW_POSITION',
  SET_FIRST_CLICK: 'SET_FIRST_CLICK',
  ADD_BLOCK: 'ADD_BLOCK',
  CLEAR_BLOCKS: 'CLEAR_BLOCKS',
  UNDO_LAST_BLOCK: 'UNDO_LAST_BLOCK',
  SET_INTERACTION_MODE: 'SET_INTERACTION_MODE',
  CLEAR_INTERACTION: 'CLEAR_INTERACTION',
  SET_TOOL_MODE: 'SET_TOOL_MODE',
  SET_OBJECT_TYPE: 'SET_OBJECT_TYPE',
  UPDATE_FOG_SETTINGS: 'UPDATE_FOG_SETTINGS',
  UPDATE_CAMERA_DATA: 'UPDATE_CAMERA_DATA',
  TOGGLE_DEBUG_UI: 'TOGGLE_DEBUG_UI',
  ANIMATE_TO_VIEW: 'ANIMATE_TO_VIEW',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  TOGGLE_TOOL_ACTIVE: 'TOGGLE_TOOL_ACTIVE'
};

// Interaction modes
export const INTERACTION_MODES = {
  NONE: 'none',
  PLACING_FIRST: 'placing_first',
  PLACING_SECOND: 'placing_second'
};

// Tool modes
export const TOOL_MODES = {
  BLOCK: 'block'
};

// Object types with their properties
// Each object can have:
// - id: unique identifier for the object type
// - color: base color for the object
// - name: display name (will be overridden by i18n translations)
// - component: name of the component that renders this object type
// - height: height in units (for tall objects like palm trees)
// - unique: if true, object is placed with single click instead of drag selection
// - description: additional metadata (optional)
export const OBJECT_TYPES = {
  POOL: {
    id: 'pool',
    color: '#00CED1', // Dark turquoise
    name: 'Pileta',
    component: 'Water', // Uses custom Water component with reflective surface
    height: 0.5, // Half height for water surface
    unique: false, // Can be placed with multi-block selection
    description: 'Swimming pool with reflective water surface'
  },
  TREE: {
    id: 'tree', 
    color: '#228B22', // Forest green
    name: 'Arbol',
    component: 'Tree', // Uses custom Tree component with GLB model
    height: 2, // Double height tree
    unique: true, // Single click placement - trees look better as individual objects
    description: 'Tree with 3D model'
  },
  FENCE: {
    id: 'fence',
    color: '#8B4513', // Saddle brown
    name: 'Cerco',
    component: 'Block', // Uses default Block component
    height: 1,
    unique: false, // Can be placed with multi-block selection
    description: 'Fence or barrier'
  },
  TERRAIN: {
    id: 'terrain',
    color: '#DEB887', // Burlywood
    name: 'Movimiento de suelo',
    component: 'Block', // Uses default Block component
    height: 1,
    unique: false, // Can be placed with multi-block selection
    description: 'Ground movement or earthwork'
  },
  PATH: {
    id: 'path',
    color: '#696969', // Dim gray
    name: 'Camino',
    component: 'Block', // Uses default Block component
    height: 1,
    unique: false, // Can be placed with multi-block selection
    description: 'Pathway or walkway'
  },
  BLOCK: {
    id: 'block',
    color: '#4a90e2', // Original block color
    name: 'Bloque',
    component: 'Block', // Uses default Block component
    height: 1,
    unique: false, // Can be placed with multi-block selection
    description: 'Generic block unit'
  }
};

// Camera views
export const CAMERA_VIEWS = {
  CENTER: {
    name: 'center',
    position: { x: 22.44, y: 6.49, z: 11.62 },
    target: { x: 3.56, y: -2.45, z: 11.07 }
  },
  LEFT: {
    name: 'left',
    position: { x: 9.49, y: 6.87, z: 22.86 },
    target: { x: 9.92, y: -0.88, z: 9.60 }
  },
  RIGHT: {
    name: 'right',
    position: { x: 11.04, y: 7.99, z: -1.56 },
    target: { x: 11.18, y: -0.65, z: 9.74 }
  }
};

// Initial state
const initialState = {
  blocks: [],
  previewPosition: null,
  firstClickPosition: null,
  interactionMode: INTERACTION_MODES.NONE,
  selectedBlockId: null,
  toolMode: TOOL_MODES.BLOCK,
  selectedObjectType: OBJECT_TYPES.BLOCK,
  toolActive: true, // Tool is active by default
  invalidPlacementReason: null, // Reason why current position is invalid
  fogSettings: {
    enabled: true,
    color: '#ffffff', // White fog color
    density: 0.02,
    near: 20,
    far: 80,
    affectSkybox: true // Always affect the skybox
  },
  cameraData: {
    position: CAMERA_VIEWS.CENTER.position, // Initial camera position
    target: CAMERA_VIEWS.CENTER.target, // Initial camera target
    distance: 0,
    fov: 60
  },
  debugUI: {
    showCameraInfo: false // Debug UI hidden by default
  },
  cameraView: {
    current: 'center',
    isAnimating: false,
    targetView: null
  }
};

// Utility functions for grid operations
const vectorsEqual = (v1, v2) => {
  if (!v1 || !v2) return false;
  return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
};

const isPositionOccupied = (position, blocks) => {
  return blocks.some(block => 
    block.positions.some(blockPos => vectorsEqual(blockPos, position))
  );
};

const generateBlockPositions = (start, end) => {
  const positions = [];
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);
  const minZ = Math.min(start.z, end.z);
  const maxZ = Math.max(start.z, end.z);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        positions.push({ x, y, z });
      }
    }
  }
  return positions;
};

const wouldCauseOverlap = (start, end, existingBlocks) => {
  const newPositions = generateBlockPositions(start, end);
  return newPositions.some(pos => isPositionOccupied(pos, existingBlocks));
};

// Terrain constants
const TERRAIN_MIN = 0.5;
const TERRAIN_MAX = 20.5;
const POOL_EDGE_MARGIN = 1; // Margen de 1 bloque para que quepa el antideslizante

// Calculate the bounding box for a pool block
const getPoolBounds = (block) => {
  if (!block || !block.positions || block.positions.length === 0) {
    return null;
  }

  const positions = block.positions;
  const xs = positions.map(p => p.x);
  const zs = positions.map(p => p.z);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs)
  };
};

// Calculate the anti-slip border area for a pool block
// This matches the actual border dimensions from Water.jsx:
// - borderWidth = 0.8
// - borderOffset = 0.4
// - Border extends approximately 1.2 units beyond pool edges
const getPoolBorderArea = (block) => {
  const bounds = getPoolBounds(block);
  if (!bounds) return null;

  // The anti-slip border extends approximately 1.2 units beyond the pool edges
  // This accounts for borderOffset (0.4) + borderWidth (0.8)
  const borderExtension = 1.2;
  
  return {
    minX: bounds.minX - borderExtension,
    maxX: bounds.maxX + borderExtension,
    minZ: bounds.minZ - borderExtension,
    maxZ: bounds.maxZ + borderExtension
  };
};

// Check if a position (block center) intersects with a pool's anti-slip border
const isPositionOnPoolBorder = (position, blocks) => {
  return blocks.some(block => {
    // Only check pool blocks
    if (!block.type || block.type.id !== 'pool') return false;

    const borderArea = getPoolBorderArea(block);
    if (!borderArea) return false;

    // A block at position (x, z) occupies space from (x-0.5, z-0.5) to (x+0.5, z+0.5)
    // Check if this block intersects with the border area
    const blockMinX = position.x - 0.5;
    const blockMaxX = position.x + 0.5;
    const blockMinZ = position.z - 0.5;
    const blockMaxZ = position.z + 0.5;
    
    // Check if block intersects with border area
    const intersectsX = blockMaxX >= borderArea.minX && blockMinX <= borderArea.maxX;
    const intersectsZ = blockMaxZ >= borderArea.minZ && blockMinZ <= borderArea.maxZ;
    
    // Now check if it's actually on the border (not inside the pool itself)
    const poolBounds = getPoolBounds(block);
    if (!poolBounds) return false;
    
    // A position is on the border if it intersects the border area but not the pool interior
    // Pool interior extends from minX-0.5 to maxX+0.5 (accounting for block size)
    const poolInteriorMinX = poolBounds.minX - 0.5;
    const poolInteriorMaxX = poolBounds.maxX + 0.5;
    const poolInteriorMinZ = poolBounds.minZ - 0.5;
    const poolInteriorMaxZ = poolBounds.maxZ + 0.5;
    
    const insidePool = blockMinX >= poolInteriorMinX && 
                       blockMaxX <= poolInteriorMaxX && 
                       blockMinZ >= poolInteriorMinZ && 
                       blockMaxZ <= poolInteriorMaxZ;
    
    // Return true if intersects border area but not completely inside pool
    return intersectsX && intersectsZ && !insidePool;
  });
};

// Check if a position is too close to terrain edge for pool placement
const isPositionTooCloseToEdge = (position, objectType) => {
  // Only check for pool objects
  if (objectType.id !== 'pool') return false;
  
  // Check if position is within valid area (at least 1 block away from edges)
  return position.x <= TERRAIN_MIN + POOL_EDGE_MARGIN ||
         position.x >= TERRAIN_MAX - POOL_EDGE_MARGIN ||
         position.z <= TERRAIN_MIN + POOL_EDGE_MARGIN ||
         position.z >= TERRAIN_MAX - POOL_EDGE_MARGIN;
};

// Reducer
const editorReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_PREVIEW_POSITION: {
      const position = action.payload;
      let reason = null;
      
      if (position) {
        // Check various invalid conditions in order of priority
        if (isPositionOccupied(position, state.blocks)) {
          reason = 'occupied';
        } else if (isPositionTooCloseToEdge(position, state.selectedObjectType)) {
          reason = 'tooCloseToEdge';
        } else if (isPositionOnPoolBorder(position, state.blocks)) {
          reason = 'onPoolBorder';
        }
      }
      
      return {
        ...state,
        previewPosition: position,
        invalidPlacementReason: reason
      };
    }

    case ACTIONS.SET_FIRST_CLICK: {
      const position = action.payload;
      
      // Don't allow first click if pool is too close to edge
      if (isPositionTooCloseToEdge(position, state.selectedObjectType)) {
        console.warn('No se puede colocar la pileta tan cerca del borde del terreno');
        return state; // Don't set first click
      }

      // Don't allow placement on pool borders
      if (isPositionOnPoolBorder(position, state.blocks)) {
        console.warn('No se puede colocar bloques sobre los antideslizantes de las piletas');
        return state; // Don't set first click
      }
      
      return {
        ...state,
        firstClickPosition: position,
        interactionMode: INTERACTION_MODES.PLACING_SECOND,
        invalidPlacementReason: null
      };
    }

    case ACTIONS.ADD_BLOCK: {
      const { start, end } = action.payload;
      
      // Check for overlaps
      if (wouldCauseOverlap(start, end, state.blocks)) {
        console.warn('Esta posición está ocupada');
        return state; // Don't add block if it would overlap
      }
      
      // Check if any position in the pool area is too close to edge
      const positions = generateBlockPositions(start, end);
      const tooCloseToEdge = positions.some(pos => 
        isPositionTooCloseToEdge(pos, state.selectedObjectType)
      );
      
      if (tooCloseToEdge) {
        console.warn('La pileta no puede estar tan cerca del borde (necesita al menos 1 bloque de separación)');
        return {
          ...state,
          firstClickPosition: null,
          interactionMode: INTERACTION_MODES.NONE,
          previewPosition: null,
          invalidPlacementReason: null
        };
      }

      // Check if any position is on a pool border
      const onPoolBorder = positions.some(pos => 
        isPositionOnPoolBorder(pos, state.blocks)
      );

      if (onPoolBorder) {
        console.warn('No se puede colocar bloques sobre los antideslizantes de las piletas');
        return {
          ...state,
          firstClickPosition: null,
          interactionMode: INTERACTION_MODES.NONE,
          previewPosition: null,
          invalidPlacementReason: null
        };
      }

      const newBlock = {
        id: `${state.selectedObjectType.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        positions,
        start,
        end,
        type: state.selectedObjectType,
        createdAt: Date.now()
      };

      return {
        ...state,
        blocks: [...state.blocks, newBlock],
        firstClickPosition: null,
        interactionMode: INTERACTION_MODES.NONE,
        previewPosition: null,
        invalidPlacementReason: null
      };
    }

    case ACTIONS.CLEAR_BLOCKS:
      return {
        ...state,
        blocks: [],
        firstClickPosition: null,
        interactionMode: INTERACTION_MODES.NONE,
        previewPosition: null
      };

    case ACTIONS.UNDO_LAST_BLOCK: {
      if (state.blocks.length === 0) {
        return state; // Nothing to undo
      }
      
      // Remove the last block (most recently added)
      const newBlocks = state.blocks.slice(0, -1);
      
      return {
        ...state,
        blocks: newBlocks
      };
    }

    case ACTIONS.SET_INTERACTION_MODE:
      return {
        ...state,
        interactionMode: action.payload
      };

    case ACTIONS.CLEAR_INTERACTION:
      return {
        ...state,
        firstClickPosition: null,
        interactionMode: INTERACTION_MODES.NONE,
        previewPosition: null,
        invalidPlacementReason: null
      };

    case ACTIONS.SET_TOOL_MODE:
      return {
        ...state,
        toolMode: action.payload,
        // Clear interaction when switching tools
        firstClickPosition: null,
        interactionMode: INTERACTION_MODES.NONE,
        previewPosition: null,
        invalidPlacementReason: null
      };

    case ACTIONS.SET_OBJECT_TYPE:
      return {
        ...state,
        selectedObjectType: action.payload,
        toolActive: true, // Activate tool when selecting an object type
        // Clear interaction when switching object types
        firstClickPosition: null,
        interactionMode: INTERACTION_MODES.NONE,
        previewPosition: null,
        invalidPlacementReason: null
      };

    case ACTIONS.UPDATE_FOG_SETTINGS:
      return {
        ...state,
        fogSettings: {
          ...state.fogSettings,
          ...action.payload
        }
      };

    case ACTIONS.UPDATE_CAMERA_DATA:
      return {
        ...state,
        cameraData: {
          ...state.cameraData,
          ...action.payload
        }
      };

    case ACTIONS.TOGGLE_DEBUG_UI:
      return {
        ...state,
        debugUI: {
          ...state.debugUI,
          showCameraInfo: !state.debugUI.showCameraInfo
        }
      };

    case ACTIONS.ANIMATE_TO_VIEW:
      return {
        ...state,
        cameraView: {
          current: state.cameraView.current,
          isAnimating: true,
          targetView: action.payload
        }
      };

    case ACTIONS.SET_CURRENT_VIEW:
      return {
        ...state,
        cameraView: {
          current: action.payload,
          isAnimating: false,
          targetView: null
        }
      };

    case ACTIONS.TOGGLE_TOOL_ACTIVE:
      return {
        ...state,
        toolActive: !state.toolActive,
        // Clear interaction when toggling tool
        firstClickPosition: null,
        interactionMode: INTERACTION_MODES.NONE,
        previewPosition: null,
        invalidPlacementReason: null
      };

    default:
      return state;
  }
};

// Create context
const EditorContext = createContext();

// Provider component
export const EditorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Action creators
  const setPreviewPosition = useCallback((position) => {
    dispatch({ type: ACTIONS.SET_PREVIEW_POSITION, payload: position });
  }, []);

  const handleFirstClick = useCallback((position) => {
    dispatch({ type: ACTIONS.SET_FIRST_CLICK, payload: position });
  }, []);

  const handleSecondClick = useCallback((position) => {
    // For unique objects (placed with single click), use same position for start and end
    const startPosition = state.firstClickPosition || position;
    
    dispatch({ 
      type: ACTIONS.ADD_BLOCK, 
      payload: { 
        start: startPosition, 
        end: position 
      } 
    });
  }, [state.firstClickPosition]);

  const clearBlocks = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_BLOCKS });
  }, []);

  const undoLastBlock = useCallback(() => {
    dispatch({ type: ACTIONS.UNDO_LAST_BLOCK });
  }, []);

  const clearInteraction = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_INTERACTION });
  }, []);

  const setToolMode = useCallback((mode) => {
    dispatch({ type: ACTIONS.SET_TOOL_MODE, payload: mode });
  }, []);

  const setObjectType = useCallback((objectType) => {
    dispatch({ type: ACTIONS.SET_OBJECT_TYPE, payload: objectType });
  }, []);

  const updateFogSettings = useCallback((settings) => {
    dispatch({ type: ACTIONS.UPDATE_FOG_SETTINGS, payload: settings });
  }, []);

  const updateCameraData = useCallback((data) => {
    dispatch({ type: ACTIONS.UPDATE_CAMERA_DATA, payload: data });
  }, []);

  const toggleDebugUI = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_DEBUG_UI });
  }, []);

  const animateToView = useCallback((viewName) => {
    console.log(`📹 Camera View: ${viewName.toUpperCase()}`);
    dispatch({ type: ACTIONS.ANIMATE_TO_VIEW, payload: viewName });
  }, []);

  const setCurrentView = useCallback((viewName) => {
    dispatch({ type: ACTIONS.SET_CURRENT_VIEW, payload: viewName });
  }, []);

  const toggleToolActive = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_TOOL_ACTIVE });
  }, []);

  // Helper functions
  const isPositionOccupiedByBlocks = useCallback((position) => {
    return isPositionOccupied(position, state.blocks);
  }, [state.blocks]);

  const getPreviewPositions = useCallback(() => {
    if (state.interactionMode === INTERACTION_MODES.PLACING_SECOND && 
        state.firstClickPosition && 
        state.previewPosition) {
      return generateBlockPositions(state.firstClickPosition, state.previewPosition);
    }
    return state.previewPosition ? [state.previewPosition] : [];
  }, [state.interactionMode, state.firstClickPosition, state.previewPosition]);

  // Helper to check if position is too close to edge (exported for CursorPreview)
  const isPositionTooCloseToEdgeHelper = useCallback((position) => {
    return isPositionTooCloseToEdge(position, state.selectedObjectType);
  }, [state.selectedObjectType]);

  // Helper to check if position is on a pool border (exported for CursorPreview)
  const isPositionOnPoolBorderHelper = useCallback((position) => {
    return isPositionOnPoolBorder(position, state.blocks);
  }, [state.blocks]);

  const contextValue = {
    // State
    ...state,
    
    // Actions
    setPreviewPosition,
    handleFirstClick,
    handleSecondClick,
    clearBlocks,
    undoLastBlock,
    clearInteraction,
    setToolMode,
    setObjectType,
    updateFogSettings,
    updateCameraData,
    toggleDebugUI,
    animateToView,
    setCurrentView,
    toggleToolActive,
    
    // Helpers
    isPositionOccupiedByBlocks,
    getPreviewPositions,
    isPositionTooCloseToEdge: isPositionTooCloseToEdgeHelper,
    isPositionOnPoolBorder: isPositionOnPoolBorderHelper,
    
    // Constants
    INTERACTION_MODES,
    TOOL_MODES,
    OBJECT_TYPES,
    CAMERA_VIEWS
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Hook to use context
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

export default EditorContext;
