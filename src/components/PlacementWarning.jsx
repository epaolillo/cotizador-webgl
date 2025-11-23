import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';

const PlacementWarning = () => {
  const { t } = useTranslation();
  const { invalidPlacementReason, previewPosition } = useEditor();

  if (!invalidPlacementReason || !previewPosition) {
    return null;
  }

  const getMessage = () => {
    const key = `placement.errors.${invalidPlacementReason}`;
    const message = t(key, t('placement.errors.invalid'));
    return `❌ ${message}`;
  };

  const styles = {
    container: {
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
      zIndex: 1000,
      animation: 'slideDown 0.3s ease-out'
    },
    warning: {
      background: 'rgba(220, 38, 38, 0.95)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      whiteSpace: 'nowrap',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }
  };

  // Add keyframe animation via style tag
  const keyframes = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.warning}>
          {getMessage()}
        </div>
      </div>
    </>
  );
};

export default PlacementWarning;

