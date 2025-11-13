import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  isNotificationTypeEnabled,
} from '../services/NotificationService';
import { Notification } from '../types';

interface NotificationTypeConfig {
  type: Notification['type'];
  label: string;
  description: string;
  icon: string;
}

const notificationTypes: NotificationTypeConfig[] = [
  {
    type: 'price_drop',
    label: 'Price Drop Alerts',
    description: 'Get notified when prices drop for your favorite products',
    icon: '📉',
  },
  {
    type: 'price_increase',
    label: 'Price Increase Alerts',
    description: 'Get notified when prices increase for products you follow',
    icon: '📈',
  },
  {
    type: 'new_product',
    label: 'New Product Notifications',
    description: 'Be the first to know about new products in your area',
    icon: '🆕',
  },
  {
    type: 'payment_received',
    label: 'Payment Notifications',
    description: 'Get notified when you receive payments for price updates',
    icon: '💰',
  },
  {
    type: 'subscription_expiring',
    label: 'Subscription Reminders',
    description: 'Reminders before your premium subscription expires',
    icon: '⏰',
  },
  {
    type: 'subscription_expired',
    label: 'Subscription Expired',
    description: 'Notifications when your subscription expires',
    icon: '⚠️',
  },
  {
    type: 'system',
    label: 'System Notifications',
    description: 'Important updates and announcements from Market Yard',
    icon: 'ℹ️',
  },
  {
    type: 'promotion',
    label: 'Promotions & Offers',
    description: 'Special offers, discounts, and promotional notifications',
    icon: '🎁',
  },
];

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = () => {
    if (!user) return;
    const prefs = getNotificationPreferences(user.id);
    setPreferences(prefs);
  };

  const handleToggle = (type: Notification['type']) => {
    setPreferences(prev => ({
      ...prev,
      [type]: !isNotificationTypeEnabled(user?.id || '', type),
    }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!user) return;

    setSaving(true);
    try {
      saveNotificationPreferences(user.id, preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all notification preferences to default (all enabled)?')) {
      setPreferences({});
      if (user) {
        saveNotificationPreferences(user.id, {});
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        {/* Header */}
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title">Notification Preferences</h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Choose which notifications you want to receive
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </div>
        </header>

        {/* Preferences List */}
        <section className="surface-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notificationTypes.map(config => {
              const isEnabled = isNotificationTypeEnabled(user.id, config.type);
              return (
                <div
                  key={config.type}
                  className="surface-card surface-card--compact"
                  style={{
                    padding: '1.25rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>{config.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1rem', fontWeight: 600, color: colors.text }}>
                          {config.label}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: colors.textSecondary, lineHeight: 1.5 }}>
                          {config.description}
                        </p>
                      </div>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggle(config.type)}
                          style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="surface-card">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button button--primary"
              onClick={handleSave}
              disabled={saving}
              style={{ flex: 1, minWidth: '200px' }}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
            <button
              type="button"
              className="button button--outline"
              onClick={handleReset}
              style={{ flex: 1, minWidth: '200px' }}
            >
              Reset to Default
            </button>
          </div>
          {saved && (
            <div
              className="form-info"
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: `${colors.success}15`,
                borderRadius: 'var(--radius-md)',
                color: colors.success,
              }}
            >
              ✓ Preferences saved successfully!
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

