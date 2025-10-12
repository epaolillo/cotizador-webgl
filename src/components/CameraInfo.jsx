import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';

/**
 * CameraInfo component - Displays real-time camera information
 * Shows camera position, target, and zoom/distance data
 */
const CameraInfo = () => {
  const { t } = useTranslation();
  const { cameraData } = useEditor();

  // Format number to 2 decimal places
  const formatNumber = (num) => {
    return Number(num).toFixed(2);
  };

  const styles = {
    container: {
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      pointerEvents: 'auto',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      fontFamily: 'system-ui, -apple-system, monospace',
      fontSize: '12px',
      color: 'white',
      minWidth: '320px',
      maxWidth: '400px',
      zIndex: 1000
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '8px',
      fontSize: '13px',
      fontWeight: '600',
      color: '#4a90e2',
      opacity: 0.9
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px'
    },
    infoSection: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '6px',
      padding: '8px 10px',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    },
    sectionTitle: {
      fontSize: '11px',
      fontWeight: '600',
      color: '#87CEEB',
      marginBottom: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    coordRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2px'
    },
    coordLabel: {
      fontSize: '11px',
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '500',
      minWidth: '15px'
    },
    coordValue: {
      fontSize: '11px',
      color: 'white',
      fontFamily: 'monospace',
      fontWeight: '600',
      textAlign: 'right'
    },
    metricRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2px'
    },
    metricLabel: {
      fontSize: '11px',
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '500'
    },
    metricValue: {
      fontSize: '11px',
      color: 'white',
      fontFamily: 'monospace',
      fontWeight: '600'
    },
    icon: {
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>📹</span>
        <span>{t('camera.info')}</span>
      </div>
      
      <div style={styles.infoGrid}>
        {/* Camera Position */}
        <div style={styles.infoSection}>
          <div style={styles.sectionTitle}>
            {t('camera.position')}
          </div>
          <div style={styles.coordRow}>
            <span style={styles.coordLabel}>X:</span>
            <span style={styles.coordValue}>{formatNumber(cameraData.position.x)}</span>
          </div>
          <div style={styles.coordRow}>
            <span style={styles.coordLabel}>Y:</span>
            <span style={styles.coordValue}>{formatNumber(cameraData.position.y)}</span>
          </div>
          <div style={styles.coordRow}>
            <span style={styles.coordLabel}>Z:</span>
            <span style={styles.coordValue}>{formatNumber(cameraData.position.z)}</span>
          </div>
        </div>

        {/* Camera Target */}
        <div style={styles.infoSection}>
          <div style={styles.sectionTitle}>
            {t('camera.target')}
          </div>
          <div style={styles.coordRow}>
            <span style={styles.coordLabel}>X:</span>
            <span style={styles.coordValue}>{formatNumber(cameraData.target.x)}</span>
          </div>
          <div style={styles.coordRow}>
            <span style={styles.coordLabel}>Y:</span>
            <span style={styles.coordValue}>{formatNumber(cameraData.target.y)}</span>
          </div>
          <div style={styles.coordRow}>
            <span style={styles.coordLabel}>Z:</span>
            <span style={styles.coordValue}>{formatNumber(cameraData.target.z)}</span>
          </div>
        </div>

        {/* Camera Metrics */}
        <div style={styles.infoSection}>
          <div style={styles.sectionTitle}>
            {t('camera.metrics')}
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>{t('camera.distance')}:</span>
            <span style={styles.metricValue}>{formatNumber(cameraData.distance)}</span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>{t('camera.fov')}:</span>
            <span style={styles.metricValue}>{formatNumber(cameraData.fov)}°</span>
          </div>
        </div>

        {/* Additional Info */}
        <div style={styles.infoSection}>
          <div style={styles.sectionTitle}>
            {t('camera.additional')}
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>{t('camera.zoom')}:</span>
            <span style={styles.metricValue}>
              {formatNumber((1 / cameraData.distance) * 100)}%
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>{t('camera.height')}:</span>
            <span style={styles.metricValue}>{formatNumber(cameraData.position.y)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraInfo;
