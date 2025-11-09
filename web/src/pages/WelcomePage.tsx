import React from 'react';
import { Link } from 'react-router-dom';
import { colors, theme } from '../theme';

const styles: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.lg,
  backgroundColor: colors.background,
};

const titleStyle: React.CSSProperties = {
  fontSize: theme.typography.h1.fontSize,
  fontWeight: theme.typography.h1.fontWeight,
  color: colors.primary,
  marginBottom: theme.spacing.md,
  textAlign: 'center',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: theme.typography.body.fontSize,
  color: colors.textSecondary,
  marginBottom: theme.spacing.xl,
  textAlign: 'center',
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.md,
  width: '100%',
  maxWidth: '400px',
};

const buttonStyle: React.CSSProperties = {
  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
  borderRadius: theme.borderRadius.md,
  border: 'none',
  fontSize: theme.typography.body.fontSize,
  fontWeight: '600',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'block',
  textAlign: 'center',
  transition: 'opacity 0.2s',
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: colors.primary,
  color: colors.white,
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: 'transparent',
  color: colors.primary,
  border: `1px solid ${colors.primary}`,
};

export default function WelcomePage() {
  return (
    <div style={styles}>
      <h1 style={titleStyle}>Market Yard</h1>
      <p style={subtitleStyle}>Compare prices across market yard shops</p>
      <div style={buttonContainerStyle}>
        <Link to="/login" style={primaryButtonStyle}>
          Login
        </Link>
        <Link to="/register" style={secondaryButtonStyle}>
          Register
        </Link>
      </div>
    </div>
  );
}

