import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Header component with optional back button and actions
 */
export default function Header({
  title,
  subtitle,
  showBackButton = false,
  backButtonLabel = 'Back',
  onBack,
  actions,
  className = '',
  variant = 'default',
}: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const headerStyles: Record<string, React.CSSProperties> = {
    default: {
      padding: 'var(--spacing-md)',
      minHeight: '60px',
    },
    compact: {
      padding: 'var(--spacing-sm) var(--spacing-md)',
      minHeight: '48px',
    },
    detailed: {
      padding: 'var(--spacing-lg)',
      minHeight: '80px',
    },
  };

  const titleStyles: Record<string, React.CSSProperties> = {
    default: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    compact: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    detailed: {
      fontSize: '2rem',
      fontWeight: 700,
    },
  };

  return (
    <header
      className={`surface-card surface-card--compact ${className}`}
      style={{
        ...headerStyles[variant],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-md)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1, minWidth: 0 }}>
        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="button button--ghost"
            style={{
              width: 'auto',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              fontSize: '0.875rem',
              minWidth: 'auto',
            }}
            aria-label={backButtonLabel}
          >
            <span style={{ fontSize: '1.25rem' }}>←</span>
            {variant !== 'compact' && <span>{backButtonLabel}</span>}
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            className="page-heading__title"
            style={{
              ...titleStyles[variant],
              textAlign: 'left',
              margin: 0,
              color: colors.primaryDark,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && variant !== 'compact' && (
            <p
              className="form-helper"
              style={{
                textAlign: 'left',
                marginTop: 'var(--spacing-xs)',
                marginBottom: 0,
                fontSize: variant === 'detailed' ? '1rem' : '0.875rem',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            flexWrap: 'wrap',
          }}
        >
          {actions}
        </div>
      )}
    </header>
  );
}

