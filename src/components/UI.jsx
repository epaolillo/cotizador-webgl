import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';
import { useToast } from '../context/ToastContext';
import { useInvalidPlacementToast } from '../hooks/useInvalidPlacementToast';
import ViewPanel from './ViewPanel';
import CameraInfo from './CameraInfo';
import ObjectTypePanel from './ObjectTypePanel';
import Toast from './Toast';

const UI = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { 
    blocks, 
    clearBlocks, 
    undoLastBlock,
    interactionMode, 
    INTERACTION_MODES,
    clearInteraction,
    debugUI,
    selectedObjectType,
    toolActive,
    toggleToolActive
  } = useEditor();
  
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Auto-show toasts for invalid placement attempts
  useInvalidPlacementToast();

  const handleClearBlocks = () => {
    if (blocks.length > 0) {
      clearBlocks();
      showToast(t('toast.allBlocksCleared'), 'success');
    }
  };

  const handleUndo = () => {
    undoLastBlock();
    showToast(t('toast.blockRemoved'), 'info');
  };

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  // Keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (blocks.length > 0) {
          undoLastBlock();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blocks.length, undoLastBlock]);

  const getInteractionModeText = () => {
    // For unique objects, show single-click instruction
    if (selectedObjectType && selectedObjectType.unique) {
      return t('controls.singleClick');
    }
    
    // For multi-block objects, show multi-step instructions
    switch (interactionMode) {
      case INTERACTION_MODES.PLACING_FIRST:
        return t('controls.firstClick');
      case INTERACTION_MODES.PLACING_SECOND:
        return t('controls.secondClick');
      default:
        return t('controls.ready');
    }
  };

  const styles = {
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      zIndex: 10
    },
    topLeft: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      pointerEvents: 'auto'
    },
    topRight: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    bottomLeft: {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      pointerEvents: 'auto',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '14px'
    },
    button: {
      background: 'rgba(74, 144, 226, 0.9)',
      color: 'white',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    buttonHover: {
      background: 'rgba(74, 144, 226, 1)',
      transform: 'translateY(-1px)'
    },
    dangerButton: {
      background: 'rgba(255, 107, 107, 0.9)',
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#4a90e2'
    },
    subtitle: {
      fontSize: '14px',
      marginBottom: '16px',
      opacity: 0.8,
      lineHeight: '1.4'
    },
    instructionItem: {
      fontSize: '13px',
      marginBottom: '8px',
      paddingLeft: '16px',
      position: 'relative',
      lineHeight: '1.3'
    },
    instructionBullet: {
      position: 'absolute',
      left: '0',
      color: '#4a90e2'
    },
    statsText: {
      fontSize: '14px',
      fontWeight: '500'
    },
    toggleButton: {
      background: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s ease'
    },
    toolToggleActive: {
      background: 'rgba(34, 197, 94, 0.9)',
      border: '2px solid rgba(34, 197, 94, 1)',
      color: '#ffffff',
      fontWeight: '600',
      boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)'
    },
    toolToggleInactive: {
      background: 'rgba(239, 68, 68, 0.9)',
      border: '2px solid rgba(239, 68, 68, 1)',
      color: '#ffffff',
      fontWeight: '600',
      boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
    }
  };

  return (
    <div style={styles.container}>
      {/* Toast Notifications */}
      <Toast />
      
      {/* Object Type Panel - top left */}
      <div style={styles.topLeft}>
        <ObjectTypePanel />
      </div>

      {/* Control buttons - top right */}
      <div style={styles.topRight}>
        
        {/* Show Undo button only when NOT placing a block */}
        {interactionMode === INTERACTION_MODES.NONE && (
          <button
            style={styles.button}
            onClick={handleUndo}
            disabled={blocks.length === 0}
          >
            ↩️ {t('blocks.undo')}
          </button>
        )}
        
        <button
          style={{...styles.button, ...styles.dangerButton}}
          onClick={handleClearBlocks}
          disabled={blocks.length === 0}
        >
          {t('blocks.clear')}
        </button>
        
        {/* Tool Toggle Button - below Clear All */}
        <button
          style={{
            ...styles.button,
            ...(toolActive ? styles.toolToggleActive : styles.toolToggleInactive)
          }}
          onClick={toggleToolActive}
          title={t('objectTypes.toggleTool')}
        >
          <span style={{ fontSize: '16px', marginRight: '6px' }}>
            {toolActive ? '🔧' : '⏸️'}
          </span>
          <span>
            {toolActive ? t('objectTypes.toolActive') : t('objectTypes.toolInactive')}
          </span>
        </button>
        
        {/* Show Cancel button only when placing a block */}
        {interactionMode !== INTERACTION_MODES.NONE && (
          <button
            style={styles.button}
            onClick={clearInteraction}
          >
            Cancel (ESC)
          </button>
        )}
      </div>

      {/* Stats - bottom left */}
      <div style={styles.bottomLeft}>
        <div style={styles.statsText}>
          {t('blocks.count', { count: blocks.length })}
        </div>
        {interactionMode !== INTERACTION_MODES.NONE && (
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
            Press ESC to cancel
          </div>
        )}
      </div>

      {/* View Panel - bottom right */}
      <ViewPanel />
      
      {/* Camera Information Panel - bottom center (debug only) */}
      {debugUI.showCameraInfo && <CameraInfo />}
    </div>
  );
};

export default UI;
