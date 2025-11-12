import React from 'react';
import { colors } from '../../theme';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

/**
 * LoadingSpinner component for displaying loading states
 */
export default function LoadingSpinner({
  size = 'medium',
  color = colors.primary,
  fullScreen = false,
  message,
  className = '',
}: LoadingSpinnerProps) {
  const sizeStyles = {
    small: { width: '24px', height: '24px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '3px' },
    large: { width: '64px', height: '64px', borderWidth: '4px' },
  };

  const sizeConfig = sizeStyles[size];

  const spinner = (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: message ? 'var(--spacing-md)' : 0,
        ...(fullScreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 10000,
            }
          : {}),
      }}
    >
      <div
        style={{
          width: sizeConfig.width,
          height: sizeConfig.height,
          border: `${sizeConfig.borderWidth} solid ${colors.surface}`,
          borderTop: `${sizeConfig.borderWidth} solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      >
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
      {message && (
        <p
          style={{
            fontSize: size === 'large' ? '1rem' : size === 'medium' ? '0.875rem' : '0.75rem',
            color: colors.textSecondary,
            margin: 0,
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );

  return spinner;
}

/**
 * LoadingOverlay component for displaying loading overlay
 */
export interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ loading, message, children }: LoadingOverlayProps) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <LoadingSpinner size="medium" message={message} />
        </div>
      )}
    </div>
  );
}

