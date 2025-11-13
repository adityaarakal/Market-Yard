import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme';
import { getUnreadNotificationCount } from '../../services/NotificationService';

export interface NotificationBellProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function NotificationBell({ className = '', size = 'medium' }: NotificationBellProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = () => {
    if (!user) return;
    try {
      const count = getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleClick = () => {
    navigate('/notifications');
  };

  if (!user) {
    return null;
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      fontSize: '1.25rem',
      width: '2rem',
      height: '2rem',
    },
    medium: {
      fontSize: '1.5rem',
      width: '2.5rem',
      height: '2.5rem',
    },
    large: {
      fontSize: '2rem',
      width: '3rem',
      height: '3rem',
    },
  };

  const badgeSize = size === 'small' ? '0.75rem' : size === 'large' ? '1.25rem' : '1rem';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={{
        position: 'relative',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        ...sizeStyles[size],
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = colors.surface;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'Notifications'}
    >
      <span style={{ fontSize: 'inherit' }}>🔔</span>
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: colors.error,
            color: 'white',
            borderRadius: '50%',
            width: badgeSize,
            height: badgeSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size === 'small' ? '0.625rem' : size === 'large' ? '0.875rem' : '0.75rem',
            fontWeight: 700,
            border: `2px solid white`,
            minWidth: badgeSize,
            padding: '0.125rem',
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

