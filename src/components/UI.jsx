import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';
import ToolPanel from './ToolPanel';

const UI = () => {
  const { t, i18n } = useTranslation();
  const { 
    blocks, 
    clearBlocks, 
    interactionMode, 
    INTERACTION_MODES,
    toolMode,
    TOOL_MODES,
    clearInteraction 
  } = useEditor();
  
  const [showInstructions, setShowInstructions] = useState(true);

  const handleClearBlocks = () => {
    if (blocks.length > 0) {
      const confirmed = window.confirm(t('blocks.clearConfirm'));
      if (confirmed) {
        clearBlocks();
      }
    }
  };

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const getInteractionModeText = () => {
    if (toolMode === TOOL_MODES.MOVE) {
      return t('tools.moveMode');
    }
    
    switch (interactionMode) {
      case INTERACTION_MODES.PLACING_FIRST:
        return t('controls.firstClick');
      case INTERACTION_MODES.PLACING_SECOND:
        return t('controls.secondClick');
      default:
        return t('tools.blockMode');
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
      pointerEvents: 'auto',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      minWidth: '250px',
      maxWidth: '350px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
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
      border: 'none',
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
    }
  };

  return (
    <div style={styles.container}>
      {/* Main panel - top left */}
      <div style={styles.topLeft}>
        <div style={styles.title}>
          {t('app.title')}
        </div>
        
        <div style={styles.subtitle}>
          {getInteractionModeText()}
        </div>

        {showInstructions && (
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              {t('controls.instructions')}:
            </div>
            
            <div style={styles.instructionItem}>
              <span style={styles.instructionBullet}>•</span>
              {t('controls.firstClick')}
            </div>
            
            <div style={styles.instructionItem}>
              <span style={styles.instructionBullet}>•</span>
              {t('controls.secondClick')}
            </div>
            
            <div style={styles.instructionItem}>
              <span style={styles.instructionBullet}>•</span>
              {t('controls.samePoint')}
            </div>
            
            <div style={styles.instructionItem}>
              <span style={styles.instructionBullet}>•</span>
              {t('controls.rotate')}
            </div>
            
            <div style={styles.instructionItem}>
              <span style={styles.instructionBullet}>•</span>
              {t('controls.zoom')}
            </div>
          </div>
        )}
        
        <button
          style={styles.toggleButton}
          onClick={() => setShowInstructions(!showInstructions)}
        >
          {showInstructions ? 'Hide' : 'Show'} Instructions
        </button>
      </div>

      {/* Control buttons - top right */}
      <div style={styles.topRight}>
        <button
          style={styles.button}
          onClick={toggleLanguage}
          title="Change Language / Cambiar Idioma"
        >
          {i18n.language === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
        </button>
        
        <button
          style={{...styles.button, ...styles.dangerButton}}
          onClick={handleClearBlocks}
          disabled={blocks.length === 0}
        >
          {t('blocks.clear')}
        </button>
        
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

      {/* Tool Panel - bottom right */}
      <ToolPanel />
    </div>
  );
};

export default UI;
