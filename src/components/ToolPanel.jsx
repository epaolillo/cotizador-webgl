import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';

const ToolPanel = () => {
  const { t } = useTranslation();
  const { toolMode, setToolMode, TOOL_MODES } = useEditor();

  const handleToolChange = (mode) => {
    setToolMode(mode);
  };

  const styles = {
    container: {
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      pointerEvents: 'auto',
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(15px)',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      minWidth: '140px'
    },
    title: {
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '12px',
      textAlign: 'center',
      opacity: 0.9
    },
    toolGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    toolButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      position: 'relative'
    },
    toolButtonActive: {
      background: 'rgba(74, 144, 226, 0.8)',
      border: '2px solid rgba(74, 144, 226, 1)',
      boxShadow: '0 0 20px rgba(74, 144, 226, 0.4)',
      transform: 'scale(1.02)'
    },
    toolButtonHover: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.4)',
      transform: 'translateY(-1px)'
    },
    icon: {
      fontSize: '16px',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    tooltip: {
      position: 'absolute',
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      whiteSpace: 'nowrap',
      marginRight: '10px',
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.2s ease',
      pointerEvents: 'none',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000
    },
    tooltipVisible: {
      opacity: 1,
      visibility: 'visible'
    }
  };

  const ToolButton = ({ mode, icon, children, tooltip }) => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const isActive = toolMode === mode;

    return (
      <button
        style={{
          ...styles.toolButton,
          ...(isActive ? styles.toolButtonActive : {})
        }}
        onClick={() => handleToolChange(mode)}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.target.style.background = styles.toolButtonHover.background;
            e.target.style.border = styles.toolButtonHover.border;
            e.target.style.transform = styles.toolButtonHover.transform;
          }
          setShowTooltip(true);
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.target.style.background = styles.toolButton.background;
            e.target.style.border = styles.toolButton.border;
            e.target.style.transform = 'none';
          }
          setShowTooltip(false);
        }}
        title={tooltip}
      >
        <div style={styles.icon}>{icon}</div>
        <span>{children}</span>
        
        <div 
          style={{
            ...styles.tooltip,
            ...(showTooltip ? styles.tooltipVisible : {})
          }}
        >
          {tooltip}
        </div>
      </button>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        Tools
      </div>
      
      <div style={styles.toolGrid}>
        <ToolButton 
          mode={TOOL_MODES.BLOCK} 
          icon="🟦"
          tooltip={t('tools.blockMode')}
        >
          {t('tools.block')}
        </ToolButton>
        
        <ToolButton 
          mode={TOOL_MODES.MOVE} 
          icon="✋"
          tooltip={t('tools.moveMode')}
        >
          {t('tools.move')}
        </ToolButton>
      </div>
    </div>
  );
};

export default ToolPanel;
