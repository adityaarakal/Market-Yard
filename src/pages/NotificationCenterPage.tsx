import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import {
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadNotificationCount,
} from '../services/NotificationService';
import { Notification } from '../types';
import EmptyState from '../components/display/EmptyState';

const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'price_drop':
      return '📉';
    case 'price_increase':
      return '📈';
    case 'new_product':
      return '🆕';
    case 'payment_received':
      return '💰';
    case 'subscription_expiring':
      return '⏰';
    case 'subscription_expired':
      return '⚠️';
    case 'system':
      return 'ℹ️';
    case 'promotion':
      return '🎁';
    default:
      return '🔔';
  }
};

const getNotificationColor = (type: Notification['type']): string => {
  switch (type) {
    case 'price_drop':
      return colors.success;
    case 'price_increase':
      return colors.warning;
    case 'payment_received':
      return colors.success;
    case 'subscription_expiring':
    case 'subscription_expired':
      return colors.error;
    case 'promotion':
      return colors.primary;
    default:
      return colors.textSecondary;
  }
};

export default function NotificationCenterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = () => {
    if (!user) return;

    setLoading(true);
    try {
      const allNotifications = getUserNotifications(user.id);
      const unread = getUnreadNotificationCount(user.id);

      setNotifications(allNotifications);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAsUnread = (notificationId: string) => {
    markAsUnread(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    markAllAsRead(user.id);
    loadNotifications();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
    loadNotifications();
  };

  const handleDeleteAll = () => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      deleteAllNotifications(user.id);
      loadNotifications();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  if (!user) {
    return null;
  }

  const filteredNotifications =
    activeTab === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        {/* Header */}
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title">Notifications</h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ width: 'auto' }}
                  onClick={handleMarkAllAsRead}
                >
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ width: 'auto', color: colors.error }}
                  onClick={handleDeleteAll}
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/notifications/preferences')}
              >
                Preferences
              </button>
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

          {/* Tabs */}
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-control__button${activeTab === 'all' ? ' segmented-control__button--active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`segmented-control__button${activeTab === 'unread' ? ' segmented-control__button--active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title={activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
            message={
              activeTab === 'unread'
                ? 'You have no unread notifications. Great job staying on top of things!'
                : 'You don\'t have any notifications yet. They will appear here when you receive updates.'
            }
          />
        ) : (
          <section className="surface-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className="surface-card surface-card--compact"
                  style={{
                    padding: '1rem',
                    borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                    backgroundColor: notification.is_read ? colors.surface : `${colors.primary}08`,
                    cursor: notification.action_url ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={e => {
                    if (notification.action_url) {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (notification.action_url) {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {/* Icon */}
                    <div
                      style={{
                        fontSize: '2rem',
                        flexShrink: 0,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              margin: 0,
                              marginBottom: '0.25rem',
                              fontSize: '1rem',
                              fontWeight: notification.is_read ? 500 : 700,
                              color: colors.text,
                            }}
                          >
                            {notification.title}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.9rem',
                              color: colors.textSecondary,
                              lineHeight: 1.5,
                            }}
                          >
                            {notification.message}
                          </p>
                          <div
                            style={{
                              marginTop: '0.5rem',
                              fontSize: '0.75rem',
                              color: colors.textSecondary,
                            }}
                          >
                            {new Date(notification.created_at).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                          {notification.is_read ? (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleMarkAsUnread(notification.id);
                              }}
                              style={{
                                background: 'transparent',
                                border: `1px solid ${colors.border}`,
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: colors.textSecondary,
                              }}
                              title="Mark as unread"
                            >
                              Mark Unread
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              style={{
                                background: colors.primary,
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: 'white',
                              }}
                              title="Mark as read"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              color: colors.textSecondary,
                            }}
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

