import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../../theme';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: string | React.ReactNode;
  path: string;
  badge?: number | string;
  disabled?: boolean;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  className?: string;
  showLabels?: boolean;
}

/**
 * BottomNavigation component for bottom navigation bar (mobile-style)
 */
export default function BottomNavigation({
  items,
  className = '',
  showLabels = true,
}: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTop: `1px solid ${colors.border}`,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 'var(--spacing-xs) 0',
        zIndex: 1000,
        minHeight: showLabels ? '64px' : '56px',
        paddingBottom: 'max(var(--spacing-xs), env(safe-area-inset-bottom))',
      }}
    >
      {items.map(item => {
        const active = isActive(item.path);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => !item.disabled && navigate(item.path)}
            disabled={item.disabled}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              padding: 'var(--spacing-xs)',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              color: active ? colors.primary : colors.textSecondary,
              transition: 'color 0.2s',
              opacity: item.disabled ? 0.5 : 1,
              flex: 1,
              maxWidth: '120px',
              position: 'relative',
              minHeight: showLabels ? '64px' : '56px',
            }}
            onMouseEnter={e => {
              if (!item.disabled && !active) {
                e.currentTarget.style.color = colors.text;
              }
            }}
            onMouseLeave={e => {
              if (!item.disabled && !active) {
                e.currentTarget.style.color = colors.textSecondary;
              }
            }}
            aria-label={item.label}
          >
            <span
              style={{
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {typeof item.icon === 'string' ? <span>{item.icon}</span> : item.icon}
              {item.badge != null && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: colors.error,
                    color: colors.white,
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.125rem 0.375rem',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    minWidth: '1rem',
                    textAlign: 'center',
                    lineHeight: 1,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </span>
            {showLabels && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: active ? 600 : 400,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * BottomNavigationSpacer component to add spacing for fixed bottom navigation
 */
export function BottomNavigationSpacer() {
  return <div style={{ height: '64px' }} />;
}

