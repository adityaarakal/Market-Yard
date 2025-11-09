import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, theme } from '../theme';

const styles: React.CSSProperties = {
  minHeight: '100vh',
  padding: theme.spacing.lg,
  backgroundColor: colors.background,
};

export default function EndUserHome() {
  const { user, logout } = useAuth();

  return (
    <div style={styles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
        <h1 style={{ color: colors.text }}>Market Yard</h1>
        <button
          onClick={logout}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: colors.error,
            color: colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
      <div style={{ backgroundColor: colors.white, padding: theme.spacing.lg, borderRadius: theme.borderRadius.md }}>
        <p>Welcome, {user?.name}!</p>
        <p>Premium Status: {user?.is_premium ? 'Premium' : 'Free'}</p>
        <p>This is the end user home page. Features will be implemented here.</p>
      </div>
    </div>
  );
}

