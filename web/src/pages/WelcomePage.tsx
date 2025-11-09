import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, theme } from '../theme';
import SeedDataService from '../services/SeedDataService';
import StorageService from '../services/StorageService';

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

const tertiaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: colors.surface,
  color: colors.text,
  border: `1px solid ${colors.border}`,
};

export default function WelcomePage() {
  const [hasData, setHasData] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const products = StorageService.getProducts();
    setHasData(products.length > 0);
  }, []);

  const handleSeed = () => {
    SeedDataService.seedAll(true);
    setHasData(true);
    setMessage('Sample data seeded. You can log in with phone 9876543210 and password password123.');
  };

  const handleReset = () => {
    SeedDataService.clearAll();
    setHasData(false);
    setMessage('All data cleared. Seed sample data to get started.');
  };

  return (
    <div style={styles}>
      <h1 style={titleStyle}>Market Yard</h1>
      <p style={subtitleStyle}>Compare prices across market yard shops</p>
      {message && (
        <div
          style={{
            marginBottom: theme.spacing.lg,
            maxWidth: '400px',
            textAlign: 'center',
            color: colors.text,
          }}
        >
          {message}
        </div>
      )}
      {!hasData && (
        <div
          style={{
            marginBottom: theme.spacing.lg,
            maxWidth: '400px',
            textAlign: 'center',
            color: colors.warning,
          }}
        >
          No data found. Use "Seed Sample Data" to load demo content.
        </div>
      )}
      <div style={buttonContainerStyle}>
        <Link to="/login" style={primaryButtonStyle}>
          Login
        </Link>
        <Link to="/register" style={secondaryButtonStyle}>
          Register
        </Link>
        <button type="button" style={tertiaryButtonStyle} onClick={handleSeed}>
          Seed Sample Data
        </button>
        <button
          type="button"
          style={{ ...tertiaryButtonStyle, color: colors.error, border: `1px solid ${colors.error}` }}
          onClick={handleReset}
        >
          Clear Data
        </button>
      </div>
    </div>
  );
}

