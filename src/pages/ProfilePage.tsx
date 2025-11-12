import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { colors, theme } from '../theme';

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: theme.spacing.lg,
  backgroundColor: colors.background,
  display: 'flex',
  justifyContent: 'center',
};

const contentStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '720px',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.lg,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  padding: theme.spacing.xl,
  borderRadius: theme.borderRadius.lg,
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
};

const sectionHeadingStyle: React.CSSProperties = {
  marginBottom: theme.spacing.md,
  color: colors.text,
  fontSize: theme.typography.h3.fontSize,
  fontWeight: 600,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: theme.spacing.xs,
  color: colors.textSecondary,
  fontSize: '14px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.md,
  border: `1px solid ${colors.border}`,
  fontSize: theme.typography.body.fontSize,
  marginBottom: theme.spacing.md,
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing.md,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  borderRadius: theme.borderRadius.md,
  border: 'none',
  backgroundColor: colors.primary,
  color: colors.white,
  cursor: 'pointer',
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  color: colors.text,
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const subscription = useMemo(() => {
    if (!user) {
      return null;
    }
    return StorageService.getSubscriptionByUserId(user.id);
  }, [user]);

  if (!user) {
    return null;
  }

  const userDashboardPath = user.user_type === 'shop_owner' ? '/shop-owner/dashboard' : '/end-user/home';

  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();

    if (!trimmedName) {
      setProfileMessage('Name is required.');
      return;
    }

    const updatedUser = {
      ...user,
      name: trimmedName,
      email: trimmedEmail || undefined,
      updated_at: new Date().toISOString(),
    };

    updateUser(updatedUser);
    setProfileMessage('Profile updated successfully.');
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.currentPassword !== user.password_hash) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    const updatedUser = {
      ...user,
      password_hash: passwordForm.newPassword,
      updated_at: new Date().toISOString(),
    };

    updateUser(updatedUser);
    setPasswordMessage('Password updated successfully.');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const statusTagStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: user.is_premium ? colors.success : colors.warning,
    color: colors.white,
    fontSize: '12px',
    fontWeight: 600,
    marginLeft: theme.spacing.sm,
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: colors.text, marginBottom: theme.spacing.xs }}>Profile</h1>
            <div style={{ color: colors.textSecondary }}>
              Manage your personal information, password, and subscription status.
              <span style={statusTagStyle}>{user.is_premium ? 'Premium' : 'Free'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <button type="button" style={secondaryButtonStyle} onClick={() => navigate(userDashboardPath)}>
              Back to Dashboard
            </button>
            <button type="button" style={secondaryButtonStyle} onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <form onSubmit={handleProfileSubmit}>
            <h2 style={sectionHeadingStyle}>Profile Information</h2>
            {profileMessage && (
              <div style={{ marginBottom: theme.spacing.md, color: colors.primary }}>{profileMessage}</div>
            )}
            <label style={labelStyle} htmlFor="profile-name">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={profileForm.name}
              onChange={event => setProfileForm({ ...profileForm, name: event.target.value })}
              style={inputStyle}
              required
            />
            <label style={labelStyle} htmlFor="profile-email">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={profileForm.email}
              onChange={event => setProfileForm({ ...profileForm, email: event.target.value })}
              style={inputStyle}
              placeholder="Optional"
            />
            <label style={labelStyle} htmlFor="profile-phone">
              Phone Number
            </label>
            <input id="profile-phone" type="tel" value={user.phone_number} style={inputStyle} disabled />
            <div style={buttonRowStyle}>
              <button type="submit" style={primaryButtonStyle}>
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div style={cardStyle}>
          <form onSubmit={handlePasswordSubmit}>
            <h2 style={sectionHeadingStyle}>Password</h2>
            {passwordError && <div style={{ marginBottom: theme.spacing.md, color: colors.error }}>{passwordError}</div>}
            {passwordMessage && (
              <div style={{ marginBottom: theme.spacing.md, color: colors.primary }}>{passwordMessage}</div>
            )}
            <label style={labelStyle} htmlFor="current-password">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={event => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              style={inputStyle}
              required
            />
            <label style={labelStyle} htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={event => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              style={inputStyle}
              required
            />
            <label style={labelStyle} htmlFor="confirm-password">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={event => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              style={inputStyle}
              required
            />
            <div style={buttonRowStyle}>
              <button type="submit" style={primaryButtonStyle}>
                Update Password
              </button>
            </div>
          </form>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Subscription</h2>
          <div style={{ color: colors.text, marginBottom: theme.spacing.sm }}>
            Status:{' '}
            <span style={{ fontWeight: 600 }}>
              {user.is_premium ? 'Active Premium Subscriber' : 'Free Plan'}
            </span>
          </div>
          {subscription ? (
            <div style={{ color: colors.textSecondary, marginBottom: theme.spacing.sm }}>
              <div>Expires On: {new Date(subscription.expires_at).toLocaleDateString()}</div>
              <div>Amount: ₹{subscription.amount}/month</div>
              <div>Auto Renew: {subscription.auto_renew ? 'Enabled' : 'Disabled'}</div>
            </div>
          ) : user.is_premium && user.subscription_expires_at ? (
            <div style={{ color: colors.textSecondary, marginBottom: theme.spacing.sm }}>
              <div>Expires On: {new Date(user.subscription_expires_at).toLocaleDateString()}</div>
            </div>
          ) : (
            <div style={{ color: colors.textSecondary, marginBottom: theme.spacing.sm }}>
              No active subscription found.
            </div>
          )}
          {(user.user_type === 'end_user' || user.user_type === 'admin' || user.user_type === 'staff') && (
            <div style={{ marginTop: theme.spacing.md }}>
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={() => navigate('/subscription/manage')}
              >
                Manage Subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


