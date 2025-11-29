import React, { useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';
import { useDeviceType } from '../hooks/useDeviceType';

/**
 * ViewButton component - Optimized individual button
 */
const ViewButton = memo(({ view, children, isActive, isDisabled, onViewChange, styles }) => {
  const handleClick = useCallback(() => {
    onViewChange(view);
  }, [view, onViewChange]);

  const handleMouseEnter = useCallback((e) => {
    if (!isActive && !isDisabled) {
      e.target.style.background = styles.viewButtonHover.background;
      e.target.style.border = styles.viewButtonHover.border;
      e.target.style.transform = styles.viewButtonHover.transform;
    }
  }, [isActive, isDisabled, styles.viewButtonHover]);

  const handleMouseLeave = useCallback((e) => {
    if (!isActive && !isDisabled) {
      e.target.style.background = styles.viewButton.background;
      e.target.style.border = styles.viewButton.border;
      e.target.style.transform = 'none';
    }
  }, [isActive, isDisabled, styles.viewButton]);

  const buttonStyle = useMemo(() => ({
    ...styles.viewButton,
    ...(isActive ? styles.viewButtonActive : {}),
    ...(isDisabled ? styles.viewButtonDisabled : {})
  }), [isActive, isDisabled, styles]);

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      disabled={isDisabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
});

ViewButton.displayName = 'ViewButton';

/**
 * ViewPanel component - Clean panel for camera view switching
 * Provides Left, Center, Right view buttons with smooth animations
 */
const ViewPanel = memo(() => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isTouch } = useDeviceType();
  const { cameraView, animateToView } = useEditor();

  const handleViewChange = useCallback((viewName) => {
    // Only animate if not currently animating and view is different
    if (!cameraView.isAnimating && cameraView.current !== viewName) {
      animateToView(viewName);
    }
  }, [cameraView.isAnimating, cameraView.current, animateToView]);

  const styles = useMemo(() => ({
    container: {
      position: 'absolute',
      bottom: isMobile ? '10px' : '20px',
      right: isMobile ? '10px' : '20px',
      pointerEvents: 'auto',
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(15px)',
      borderRadius: '12px',
      padding: isMobile ? '12px' : '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      minWidth: isMobile ? 'auto' : '140px',
      width: isMobile ? 'auto' : 'auto'
    },
    title: {
      color: 'white',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '600',
      marginBottom: isMobile ? '8px' : '12px',
      textAlign: 'center',
      opacity: 0.9
    },
    viewGrid: {
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      gap: isMobile ? '6px' : '8px',
      flexWrap: isMobile ? 'wrap' : 'nowrap'
    },
    viewButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: isMobile || isTouch ? '12px 14px' : '12px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      letterSpacing: '0.3px',
      minHeight: isMobile || isTouch ? '44px' : 'auto',
      minWidth: isMobile ? '60px' : 'auto',
      touchAction: 'manipulation',
      flex: isMobile ? '1 1 auto' : 'none'
    },
    viewButtonActive: {
      background: 'rgba(74, 144, 226, 0.8)',
      border: '2px solid rgba(74, 144, 226, 1)',
      boxShadow: '0 0 15px rgba(74, 144, 226, 0.3)',
      transform: 'scale(1.02)'
    },
    viewButtonDisabled: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.4)',
      cursor: 'not-allowed',
      transform: 'none'
    },
    viewButtonHover: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.4)',
      transform: 'translateY(-1px)'
    }
  }), [isMobile, isTablet, isTouch]);

  // Memoize button states to prevent unnecessary re-renders
  const isAnimating = cameraView.isAnimating;
  const currentView = cameraView.current;

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        {t('views.title')}
      </div>
      
      <div style={styles.viewGrid}>
        <ViewButton 
          view="left" 
          isActive={currentView === 'left'}
          isDisabled={isAnimating}
          onViewChange={handleViewChange}
          styles={styles}
        >
          {t('views.left')}
        </ViewButton>
        
        <ViewButton 
          view="center"
          isActive={currentView === 'center'}
          isDisabled={isAnimating}
          onViewChange={handleViewChange}
          styles={styles}
        >
          {t('views.center')}
        </ViewButton>
        
        <ViewButton 
          view="right"
          isActive={currentView === 'right'}
          isDisabled={isAnimating}
          onViewChange={handleViewChange}
          styles={styles}
        >
          {t('views.right')}
        </ViewButton>
      </div>
    </div>
  );
});

ViewPanel.displayName = 'ViewPanel';

export default ViewPanel;
