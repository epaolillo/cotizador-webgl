import React from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { useDeviceType } from '../hooks/useDeviceType';

const Toast = () => {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  const getToastStyle = (type) => {
    const baseStyle = {
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      padding: isMobile ? '10px 16px' : '12px 20px',
      borderRadius: '8px',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: isMobile ? 'auto' : '200px',
      maxWidth: isMobile ? 'calc(100vw - 40px)' : '400px',
      width: isMobile ? 'auto' : 'auto',
      marginBottom: '10px',
      animation: 'slideDown 0.3s ease-out',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      border: '2px solid'
    };

    const typeStyles = {
      success: {
        borderColor: 'rgba(34, 197, 94, 0.8)',
        background: 'rgba(34, 197, 94, 0.15)'
      },
      error: {
        borderColor: 'rgba(239, 68, 68, 0.8)',
        background: 'rgba(239, 68, 68, 0.15)'
      },
      warning: {
        borderColor: 'rgba(251, 191, 36, 0.8)',
        background: 'rgba(251, 191, 36, 0.15)'
      },
      info: {
        borderColor: 'rgba(59, 130, 246, 0.8)',
        background: 'rgba(59, 130, 246, 0.15)'
      }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const getIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  };

  const styles = {
    container: {
      position: 'fixed',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  };

  const keyframes = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideOut {
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{ ...getToastStyle(toast.type), pointerEvents: 'auto' }}
            onClick={() => hideToast(toast.id)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '18px' }}>{getIcon(toast.type)}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Toast;

