import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const ACTIONS = {
  SET_PREVIEW_POSITION: 'SET_PREVIEW_POSITION',
  SET_FIRST_CLICK: 'SET_FIRST_CLICK',
  ADD_BLOCK: 'ADD_BLOCK',
  CLEAR_BLOCKS: 'CLEAR_BLOCKS',
  SET_INTERACTION_MODE: 'SET_INTERACTION_MODE',
  CLEAR_INTERACTION: 'CLEAR_INTERACTION',
  SET_TOOL_MODE: 'SET_TOOL_MODE',
  SET_OBJECT_TYPE: 'SET_OBJECT_TYPE',
  UPDATE_FOG_SETTINGS: 'UPDATE_FOG_SETTINGS',
  UPDATE_CAMERA_DATA: 'UPDATE_CAMERA_DATA',
  TOGGLE_DEBUG_UI: 'TOGGLE_DEBUG_UI',
  ANIMATE_TO_VIEW: 'ANIMATE_TO_VIEW',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW'
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

// Reducer
const editorReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_PREVIEW_POSITION:
      return {
        ...state,
        previewPosition: action.payload
      };

    case ACTIONS.SET_FIRST_CLICK:
      return {
        ...state,
        firstClickPosition: action.payload,
        interactionMode: INTERACTION_MODES.PLACING_SECOND
      };

    case ACTIONS.ADD_BLOCK: {
      const { start, end } = action.payload;
      
      // Check for overlaps
      if (wouldCauseOverlap(start, end, state.blocks)) {
        return state; // Don't add block if it would overlap
      }

      const positions = generateBlockPositions(start, end);
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
        previewPosition: null
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
        previewPosition: null
      };

    case ACTIONS.SET_TOOL_MODE:
      return {
        ...state,
        toolMode: action.payload,
        // Clear interaction when switching tools
        firstClickPosition: null,
        interactionMode: INTERACTION_MODES.NONE,
        previewPosition: null
      };

    case ACTIONS.SET_OBJECT_TYPE:
      return {
        ...state,
        selectedObjectType: action.payload,
        // Clear interaction when switching object types
        firstClickPosition: null,
        interactionMode: INTERACTION_MODES.NONE,
        previewPosition: null
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

  const contextValue = {
    // State
    ...state,
    
    // Actions
    setPreviewPosition,
    handleFirstClick,
    handleSecondClick,
    clearBlocks,
    clearInteraction,
    setToolMode,
    setObjectType,
    updateFogSettings,
    updateCameraData,
    toggleDebugUI,
    animateToView,
    setCurrentView,
    
    // Helpers
    isPositionOccupiedByBlocks,
    getPreviewPositions,
    
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
