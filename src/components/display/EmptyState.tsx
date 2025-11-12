import React from 'react';
import { colors } from '../../theme';

export interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * EmptyState component for displaying empty states
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'medium',
  className = '',
}: EmptyStateProps) {
  const sizeStyles = {
    small: {
      icon: '3rem',
      title: '1rem',
      description: '0.875rem',
      padding: 'var(--spacing-lg)',
    },
    medium: {
      icon: '4rem',
      title: '1.25rem',
      description: '1rem',
      padding: 'var(--spacing-xxl)',
    },
    large: {
      icon: '5rem',
      title: '1.5rem',
      description: '1.125rem',
      padding: 'var(--spacing-xxl)',
    },
  };

  const config = sizeStyles[size];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: config.padding,
        color: colors.textSecondary,
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: config.icon,
            marginBottom: 'var(--spacing-md)',
            opacity: 0.5,
          }}
        >
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
      )}
      <h3
        style={{
          fontSize: config.title,
          fontWeight: 600,
          color: colors.text,
          margin: 0,
          marginBottom: description ? 'var(--spacing-sm)' : 'var(--spacing-md)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: config.description,
            color: colors.textSecondary,
            margin: 0,
            marginBottom: action ? 'var(--spacing-md)' : 0,
            maxWidth: '500px',
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 'var(--spacing-md)' }}>{action}</div>}
    </div>
  );
}

