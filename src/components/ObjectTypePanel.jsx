import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';

const ObjectTypePanel = () => {
  const { t } = useTranslation();
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
      padding: '16px',
      borderRadius: '12px',
      minWidth: '280px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#4a90e2',
      textAlign: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px'
    },
    typeButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '12px 8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      minHeight: '60px',
      textAlign: 'center'
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
      fontSize: '11px',
      lineHeight: '1.2'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        {t('objectTypes.title')}
      </div>
      
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
        marginTop: '12px',
        fontSize: '12px',
        opacity: 0.7,
        textAlign: 'center'
      }}>
        {t('objectTypes.selected')}: {t(`objectTypes.${selectedObjectType.id}`)}
      </div>
    </div>
  );
};

export default ObjectTypePanel;
