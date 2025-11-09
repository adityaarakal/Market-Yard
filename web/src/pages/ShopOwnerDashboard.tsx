import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, theme } from '../theme';

const styles: React.CSSProperties = {
  minHeight: '100vh',
  padding: theme.spacing.lg,
  backgroundColor: colors.background,
};

export default function ShopOwnerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={styles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
        <h1 style={{ color: colors.text }}>Shop Owner Dashboard</h1>
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
        <p>This is the shop owner dashboard. Features will be implemented here.</p>
      </div>
    </div>
  );
}

