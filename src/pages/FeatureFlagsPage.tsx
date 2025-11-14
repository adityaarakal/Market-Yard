/**
 * Feature Flags Management Page
 * Allows admins/developers to toggle feature flags
 */

import React from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { colors } from '../theme';
import { useAuth } from '../contexts/AuthContext';

export default function FeatureFlagsPage() {
  const { user } = useAuth();
  const {
    flags,
    setFlag,
    resetFlags,
    toggleApiMode,
    isApiModeEnabled,
    isLocalStorageModeEnabled,
  } = useFeatureFlags();

  // Only allow admins/staff to access
  if (user?.user_type !== 'admin' && user?.user_type !== 'staff') {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <h1>Access Denied</h1>
            <p>Only administrators can access feature flags.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact">
          <h1 className="page-heading__title">Feature Flags</h1>
          <p className="form-helper">
            Toggle features and switch between localStorage and API modes
          </p>
        </header>

        {/* API Mode Toggle */}
        <div className="surface-card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>API Mode</h2>
            <p className="form-helper" style={{ marginBottom: '1rem' }}>
              Switch between localStorage (development) and API (production) modes
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: isApiModeEnabled() ? colors.primary + '10' : colors.surface,
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${isApiModeEnabled() ? colors.primary : colors.border}`,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                {isApiModeEnabled() ? 'API Mode' : 'LocalStorage Mode'}
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                {isApiModeEnabled()
                  ? 'Using backend API for data operations'
                  : 'Using browser localStorage for data operations'}
              </div>
            </div>
            <button
              type="button"
              className="button"
              style={{
                background: isApiModeEnabled() ? colors.primary : colors.textSecondary,
                color: 'white',
                border: 'none',
              }}
              onClick={toggleApiMode}
            >
              {isApiModeEnabled() ? 'Switch to LocalStorage' : 'Switch to API'}
            </button>
          </div>

          {isApiModeEnabled() && (
            <div
              className="surface-card surface-card--compact"
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: colors.warning + '10',
                border: `1px solid ${colors.warning}`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚠️</span>
                <div>
                  <strong>API Mode Active</strong>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Make sure REACT_APP_API_URL is set in your environment variables
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Toggles */}
        <div className="surface-card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Feature Toggles</h2>
            <p className="form-helper">Enable or disable specific features</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(flags)
              .filter(([key]) => key !== 'useApiMode')
              .map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: colors.surface,
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .trim()}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                      {getFeatureDescription(key as keyof typeof flags)}
                    </div>
                  </div>
                  <label
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '3rem',
                      height: '1.5rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={e => setFlag(key as keyof typeof flags, e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: value ? colors.primary : colors.border,
                        borderRadius: '1.5rem',
                        transition: '0.3s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '1.25rem',
                          width: '1.25rem',
                          left: '0.125rem',
                          bottom: '0.125rem',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: '0.3s',
                          transform: value ? 'translateX(1.5rem)' : 'translateX(0)',
                        }}
                      />
                    </span>
                  </label>
                </div>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="surface-card">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button button--outline"
              onClick={resetFlags}
            >
              Reset to Defaults
            </button>
            <div style={{ flex: 1 }} />
            <div
              style={{
                padding: '1rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: colors.textSecondary,
              }}
            >
              <strong>Note:</strong> Changes are saved automatically and persist across sessions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFeatureDescription(key: string): string {
  const descriptions: Record<string, string> = {
    enableImageCache: 'Cache images in localStorage for faster loading',
    enableSearchHistory: 'Save and display search history',
    enableNotifications: 'Enable in-app notifications',
    enableFavorites: 'Allow users to favorite products and shops',
    enablePriceComparison: 'Enable price comparison features',
    enableAdvancedSearch: 'Enable advanced search with suggestions',
    enableImageCompression: 'Compress images before upload',
    enableOfflineMode: 'Enable offline functionality',
  };
  return descriptions[key] || 'Feature toggle';
}

