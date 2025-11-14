import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

interface SettingsItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  onClick: () => void;
  showArrow?: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const settingsSections: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Notification Preferences',
          description: 'Manage notification settings',
          icon: '🔔',
          onClick: () => navigate('/notifications/preferences'),
          showArrow: true,
        },
        {
          id: 'language',
          title: 'Language',
          description: 'English (Coming soon)',
          icon: '🌐',
          onClick: () => {
            // Placeholder for language selection
            alert('Language selection coming soon!');
          },
          showArrow: true,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile',
          description: 'View and edit your profile',
          icon: '👤',
          onClick: () => navigate('/profile'),
          showArrow: true,
        },
        {
          id: 'favorites',
          title: 'Favorites',
          description: 'View your favorite products and shops',
          icon: '⭐',
          onClick: () => navigate('/end-user/favorites'),
          showArrow: true,
        },
        {
          id: 'subscription',
          title: 'Subscription',
          description: user?.is_premium ? 'Manage your premium subscription' : 'Upgrade to premium',
          icon: '💎',
          onClick: () => {
            if (user?.is_premium) {
              navigate('/subscription/manage');
            } else {
              navigate('/premium/upgrade');
            }
          },
          showArrow: true,
        },
      ],
    },
    {
      title: 'Information',
      items: [
        {
          id: 'about',
          title: 'About',
          description: 'App version and information',
          icon: 'ℹ️',
          onClick: () => navigate('/settings/about'),
          showArrow: true,
        },
        {
          id: 'help',
          title: 'Help & Support',
          description: 'Get help and contact support',
          icon: '❓',
          onClick: () => navigate('/settings/help'),
          showArrow: true,
        },
      ],
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        {/* Header */}
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title">Settings</h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Manage your app preferences and account settings
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

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="surface-card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: colors.textSecondary }}>
              {section.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {section.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="surface-card surface-card--compact"
                  style={{
                    padding: '1rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    background: 'transparent',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = colors.surface;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: colors.text, marginBottom: '0.25rem' }}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>{item.description}</div>
                    )}
                  </div>
                  {item.showArrow && (
                    <div style={{ fontSize: '1.25rem', color: colors.textSecondary, flexShrink: 0 }}>→</div>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

