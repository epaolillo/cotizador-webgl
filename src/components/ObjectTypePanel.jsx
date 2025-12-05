import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';
import { useDeviceType } from '../hooks/useDeviceType';

const ObjectTypePanel = () => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isTouch } = useDeviceType();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { 
    selectedObjectType, 
    setObjectType, 
    OBJECT_TYPES
  } = useEditor();

  const handleTypeSelect = (objectType) => {
    setObjectType(objectType);
  };

  const styles = {
    container: {
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      padding: isMobile ? '12px' : '16px',
      borderRadius: '12px',
      minWidth: isMobile ? 'auto' : '280px',
      width: isMobile ? '100%' : 'auto',
      maxWidth: isMobile ? '100%' : '320px', // Limit max width to prevent overlap
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '600',
      marginBottom: isMobile ? '8px' : '12px',
      color: '#4a90e2',
      textAlign: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: isMobile ? '6px' : '8px'
    },
    typeButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: isMobile ? '10px 6px' : '12px 8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      minHeight: isMobile ? '50px' : '60px',
      textAlign: 'center',
      touchAction: 'manipulation' // Prevent double-tap zoom on mobile
    },
    activeButton: {
      background: 'rgba(74, 144, 226, 0.3)',
      border: '2px solid rgba(74, 144, 226, 0.6)',
      transform: 'scale(1.02)'
    },
    colorIndicator: {
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    buttonText: {
      fontSize: isMobile ? '10px' : '11px',
      lineHeight: '1.2'
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div style={styles.container}>
      {/* Header with title and collapse button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '12px' : '16px', // Add gap between title and button
        marginBottom: isCollapsed ? '0' : (isMobile ? '8px' : '12px')
      }}>
        <div style={{
          ...styles.title,
          flex: 1, // Take available space
          marginBottom: 0 // Remove margin since we're in flex container
        }}>
          {t('objectTypes.title')}
        </div>
        {/* Collapse button - show arrow */}
        <button
          onClick={toggleCollapse}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            padding: isMobile ? '6px 8px' : '6px 10px',
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: '1',
            transition: 'transform 0.2s ease',
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            touchAction: 'manipulation',
            flexShrink: 0 // Don't shrink the button
          }}
          title={isCollapsed ? t('objectTypes.expand') : t('objectTypes.collapse')}
        >
          ▼
        </button>
      </div>
      
      {/* Collapsible content */}
      {!isCollapsed && (
        <>
          <div style={styles.grid}>
            {Object.values(OBJECT_TYPES).map((objectType) => (
              <button
                key={objectType.id}
                style={{
                  ...styles.typeButton,
                  ...(selectedObjectType.id === objectType.id ? styles.activeButton : {})
                }}
                onClick={() => handleTypeSelect(objectType)}
                title={`${t(`objectTypes.${objectType.id}`)} - ${objectType.color}`}
              >
                <div 
                  style={{
                    ...styles.colorIndicator,
                    backgroundColor: objectType.color
                  }}
                />
                <div style={styles.buttonText}>
                  {t(`objectTypes.${objectType.id}`)}
                </div>
              </button>
            ))}
          </div>
          
          <div style={{
            marginTop: isMobile ? '8px' : '12px',
            fontSize: isMobile ? '11px' : '12px',
            opacity: 0.7,
            textAlign: 'center'
          }}>
            {t('objectTypes.selected')}: {t(`objectTypes.${selectedObjectType.id}`)}
          </div>
        </>
      )}
      
      {/* Show selected type even when collapsed */}
      {isCollapsed && (
        <div style={{
          fontSize: isMobile ? '11px' : '12px',
          opacity: 0.7,
          textAlign: 'center',
          padding: '4px 0'
        }}>
          {t(`objectTypes.${selectedObjectType.id}`)}
        </div>
      )}
    </div>
  );
};

export default ObjectTypePanel;
