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
  UPDATE_FOG_SETTINGS: 'UPDATE_FOG_SETTINGS',
  UPDATE_CAMERA_DATA: 'UPDATE_CAMERA_DATA',
  TOGGLE_DEBUG_UI: 'TOGGLE_DEBUG_UI'
};

// Interaction modes
export const INTERACTION_MODES = {
  NONE: 'none',
  PLACING_FIRST: 'placing_first',
  PLACING_SECOND: 'placing_second'
};

// Tool modes
export const TOOL_MODES = {
  BLOCK: 'block',
  MOVE: 'move'
};

// Initial state
const initialState = {
  blocks: [],
  previewPosition: null,
  firstClickPosition: null,
  interactionMode: INTERACTION_MODES.NONE,
  selectedBlockId: null,
  toolMode: TOOL_MODES.BLOCK,
  fogSettings: {
    enabled: true,
    color: '#ffffff', // White fog color
    density: 0.02,
    near: 20,
    far: 80,
    affectSkybox: true // Always affect the skybox
  },
  cameraData: {
    position: { x: 22.44, y: 6.49, z: 11.62 }, // Initial camera position
    target: { x: 3.56, y: -2.45, z: 11.07 }, // Initial camera target
    distance: 0,
    fov: 60
  },
  debugUI: {
    showCameraInfo: false // Debug UI hidden by default
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
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        positions,
        start,
        end,
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
    if (state.firstClickPosition) {
      dispatch({ 
        type: ACTIONS.ADD_BLOCK, 
        payload: { 
          start: state.firstClickPosition, 
          end: position 
        } 
      });
    }
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

  const updateFogSettings = useCallback((settings) => {
    dispatch({ type: ACTIONS.UPDATE_FOG_SETTINGS, payload: settings });
  }, []);

  const updateCameraData = useCallback((data) => {
    dispatch({ type: ACTIONS.UPDATE_CAMERA_DATA, payload: data });
  }, []);

  const toggleDebugUI = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_DEBUG_UI });
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
    updateFogSettings,
    updateCameraData,
    toggleDebugUI,
    
    // Helpers
    isPositionOccupiedByBlocks,
    getPreviewPositions,
    
    // Constants
    INTERACTION_MODES,
    TOOL_MODES
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
