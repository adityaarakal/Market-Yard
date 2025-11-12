import React from 'react';
import { colors } from '../../theme';

export interface SuccessMessageProps {
  message: string;
  title?: string;
  icon?: string | React.ReactNode;
  onClose?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  fullWidth?: boolean;
}

/**
 * SuccessMessage component for displaying success messages
 */
export default function SuccessMessage({
  message,
  title,
  icon,
  onClose,
  variant = 'default',
  className = '',
  fullWidth = true,
}: SuccessMessageProps) {
  const variantStyles = {
    default: {
      padding: 'var(--spacing-md)',
      fontSize: '0.875rem',
    },
    compact: {
      padding: 'var(--spacing-sm)',
      fontSize: '0.75rem',
    },
    detailed: {
      padding: 'var(--spacing-lg)',
      fontSize: '1rem',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`form-info ${className}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--spacing-sm)',
        backgroundColor: `${colors.success}15`,
        border: `1px solid ${colors.success}40`,
        borderRadius: 'var(--radius-md)',
        color: colors.success,
        ...style,
      }}
    >
      {icon !== null && (
        <span
          style={{
            fontSize: variant === 'detailed' ? '1.5rem' : variant === 'compact' ? '1rem' : '1.25rem',
            flexShrink: 0,
            marginTop: '0.125rem',
          }}
        >
          {typeof icon === 'string' ? <span>{icon}</span> : icon || '✓'}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <h3
            style={{
              fontSize: variant === 'detailed' ? '1.125rem' : variant === 'compact' ? '0.875rem' : '1rem',
              fontWeight: 600,
              margin: 0,
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            {title}
          </h3>
        )}
        <p
          style={{
            margin: 0,
            lineHeight: 1.5,
            fontSize: style.fontSize,
            color: colors.text,
          }}
        >
          {message}
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.success,
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: 0,
            marginLeft: 'var(--spacing-xs)',
            flexShrink: 0,
            opacity: 0.7,
            transition: 'opacity 0.2s',
            lineHeight: 1,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '0.7';
          }}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}

