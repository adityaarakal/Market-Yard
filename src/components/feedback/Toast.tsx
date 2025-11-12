import React, { useEffect, useState } from 'react';
import { colors } from '../../theme';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string | React.ReactNode;
}

/**
 * Toast component for displaying temporary notifications
 */
export default function Toast({
  message,
  variant = 'info',
  duration = 3000,
  position = 'top-right',
  onClose,
  action,
  icon,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const variantStyles = {
    success: {
      backgroundColor: colors.success,
      color: colors.white,
      icon: icon || '✓',
    },
    error: {
      backgroundColor: colors.error,
      color: colors.white,
      icon: icon || '✕',
    },
    warning: {
      backgroundColor: colors.warning,
      color: colors.white,
      icon: icon || '⚠',
    },
    info: {
      backgroundColor: colors.info,
      color: colors.white,
      icon: icon || 'ℹ',
    },
  };

  const positionStyles: Record<ToastPosition, React.CSSProperties> = {
    'top-left': { top: 'var(--spacing-md)', left: 'var(--spacing-md)' },
    'top-center': { top: 'var(--spacing-md)', left: '50%', transform: 'translateX(-50%)' },
    'top-right': { top: 'var(--spacing-md)', right: 'var(--spacing-md)' },
    'bottom-left': { bottom: 'var(--spacing-md)', left: 'var(--spacing-md)' },
    'bottom-center': { bottom: 'var(--spacing-md)', left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: 'var(--spacing-md)', right: 'var(--spacing-md)' },
  };

  const style = variantStyles[variant];
  const positionStyle = positionStyles[position];

  return (
    <div
      style={{
        ...positionStyle,
        position: 'fixed',
        zIndex: 10000,
        minWidth: '300px',
        maxWidth: '500px',
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-md)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--spacing-sm)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting
          ? position.includes('top')
            ? 'translateY(-20px)'
            : 'translateY(20px)'
          : 'translateY(0)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {icon !== null && (
        <span style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '0.125rem' }}>
          {typeof style.icon === 'string' ? <span>{style.icon}</span> : icon || style.icon}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 }}>
          {message}
        </p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              marginTop: 'var(--spacing-xs)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: style.color,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: style.color,
          fontSize: '1.25rem',
          cursor: 'pointer',
          padding: '0',
          marginLeft: 'var(--spacing-xs)',
          flexShrink: 0,
          opacity: 0.8,
          transition: 'opacity 0.2s',
          lineHeight: 1,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = '0.8';
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

/**
 * ToastContainer component for managing multiple toasts
 */
export interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onRemove: (id: string) => void;
  position?: ToastPosition;
}

export function ToastContainer({ toasts, onRemove, position = 'top-right' }: ToastContainerProps) {
  // Calculate stacking position for each toast
  const getStackPosition = (index: number) => {
    if (position.includes('top')) {
      return { top: `calc(var(--spacing-md) + ${index * 80}px)` };
    }
    return { bottom: `calc(var(--spacing-md) + ${(toasts.length - 1 - index) * 80}px)` };
  };

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            zIndex: 10000 + index,
            pointerEvents: 'auto',
            ...(position.includes('left') ? { left: 'var(--spacing-md)' } : position.includes('right') ? { right: 'var(--spacing-md)' } : { left: '50%', transform: 'translateX(-50%)' }),
            ...getStackPosition(index),
          }}
        >
          <Toast
            {...toast}
            position={position}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </>
  );
}
