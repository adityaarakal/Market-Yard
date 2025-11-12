import React from 'react';
import { colors } from '../../theme';

export interface TabItem {
  id: string;
  label: string;
  icon?: string | React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

/**
 * TabBar component for horizontal tab navigation
 */
export default function TabBar({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  className = '',
}: TabBarProps) {
  const sizeStyles = {
    small: {
      padding: 'var(--spacing-xs) var(--spacing-sm)',
      fontSize: '0.875rem',
      minHeight: '36px',
    },
    medium: {
      padding: 'var(--spacing-sm) var(--spacing-md)',
      fontSize: '1rem',
      minHeight: '44px',
    },
    large: {
      padding: 'var(--spacing-md) var(--spacing-lg)',
      fontSize: '1.125rem',
      minHeight: '52px',
    },
  };

  const getVariantStyles = (isActive: boolean) => {
    switch (variant) {
      case 'pills':
        return {
          borderRadius: 'var(--radius-pill)',
          backgroundColor: isActive ? colors.primary : 'transparent',
          color: isActive ? colors.white : colors.text,
          fontWeight: isActive ? 600 : 500,
        };
      case 'underline':
        return {
          borderRadius: 0,
          backgroundColor: 'transparent',
          color: isActive ? colors.primary : colors.textSecondary,
          fontWeight: isActive ? 600 : 500,
          borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
        };
      case 'default':
      default:
        return {
          borderRadius: 'var(--radius-md)',
          backgroundColor: isActive ? colors.surface : 'transparent',
          color: isActive ? colors.primary : colors.textSecondary,
          fontWeight: isActive ? 600 : 500,
        };
    }
  };

  return (
    <div
      className={`surface-card surface-card--compact ${className}`}
      style={{
        display: 'flex',
        gap: variant === 'pills' ? 'var(--spacing-xs)' : variant === 'underline' ? 0 : 'var(--spacing-sm)',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
        padding: variant === 'underline' ? 0 : 'var(--spacing-sm)',
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const variantStyles = getVariantStyles(isActive);
        const sizeConfig = sizeStyles[size];

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            style={{
              ...sizeConfig,
              ...variantStyles,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              border: 'none',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flex: fullWidth ? 1 : 'none',
              minWidth: fullWidth ? 0 : 'auto',
              opacity: tab.disabled ? 0.5 : 1,
              position: 'relative',
            }}
            onMouseEnter={e => {
              if (!tab.disabled && !isActive) {
                e.currentTarget.style.backgroundColor = variant === 'pills' ? colors.surface : variant === 'underline' ? 'transparent' : colors.surface;
                e.currentTarget.style.color = variant === 'pills' ? colors.text : colors.primary;
              }
            }}
            onMouseLeave={e => {
              if (!tab.disabled && !isActive) {
                e.currentTarget.style.backgroundColor = variantStyles.backgroundColor;
                e.currentTarget.style.color = variantStyles.color;
              }
            }}
          >
            {tab.icon && (
              <span style={{ fontSize: sizeConfig.fontSize, display: 'flex', alignItems: 'center' }}>
                {typeof tab.icon === 'string' ? <span>{tab.icon}</span> : tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge != null && (
              <span
                style={{
                  backgroundColor: isActive ? (variant === 'pills' ? colors.white : colors.primary) : colors.error,
                  color: isActive && variant === 'pills' ? colors.primary : colors.white,
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.125rem 0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  minWidth: '1.25rem',
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

