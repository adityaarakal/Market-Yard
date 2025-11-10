import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function WelcomePage() {
  const navigate = useNavigate();
  const [hasData, setHasData] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'shop_owner' | 'end_user'>('shop_owner');

  useEffect(() => {
    const products = StorageService.getProducts();
    setHasData(products.length > 0);
  }, []);

  const userTypeDescriptions = useMemo(
    () => ({
      shop_owner: {
        title: 'Shop Owner',
        description: 'Manage your catalog, update daily prices, and track earnings from the market yard.',
      },
      end_user: {
        title: 'End User',
        description: 'Compare prices across shops, discover top deals, and plan your market purchases smartly.',
      },
    }),
    []
  );

  const handleContinue = () => {
    navigate('/register', {
      state: { userType: selectedUserType },
    });
  };

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
      <p
        style={{
          fontSize: theme.typography.body.fontSize,
          color: colors.textSecondary,
          marginBottom: theme.spacing.md,
          textAlign: 'center',
          maxWidth: '580px',
        }}
      >
        Transparent pricing for every market yard visit. Choose how you use Market Yard and get started in minutes.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.lg,
          width: '100%',
          maxWidth: '720px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: theme.spacing.md,
          }}
        >
          {(['shop_owner', 'end_user'] as Array<'shop_owner' | 'end_user'>).map(type => {
            const isSelected = selectedUserType === type;
            const content = userTypeDescriptions[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedUserType(type)}
                style={{
                  borderRadius: theme.borderRadius.lg,
                  border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                  backgroundColor: isSelected ? colors.surface : colors.white,
                  padding: theme.spacing.xl,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border 0.2s ease, transform 0.2s ease',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  boxShadow: isSelected ? '0 12px 24px rgba(33, 64, 118, 0.12)' : '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: isSelected ? colors.primary : colors.secondaryLight,
                    color: colors.white,
                    fontSize: '12px',
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {isSelected ? 'Selected' : 'Tap to select'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: theme.spacing.sm, color: colors.text }}>
                  {content.title}
                </div>
                <p style={{ color: colors.textSecondary, lineHeight: 1.5, marginBottom: theme.spacing.sm }}>
                  {content.description}
                </p>
                {type === 'shop_owner' ? (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '18px',
                      color: colors.textSecondary,
                      lineHeight: 1.4,
                      fontSize: '14px',
                    }}
                  >
                    <li>₹1 incentive per price update</li>
                    <li>Manage catalog and availability</li>
                    <li>Track earnings and payouts</li>
                  </ul>
                ) : (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '18px',
                      color: colors.textSecondary,
                      lineHeight: 1.4,
                      fontSize: '14px',
                    }}
                  >
                    <li>See best prices across shops</li>
                    <li>Discover top deals instantly</li>
                    <li>Upgrade for shop-level insights</li>
                  </ul>
                )}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
            marginTop: theme.spacing.md,
          }}
        >
          <button
            type="button"
            onClick={handleContinue}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              borderRadius: theme.borderRadius.md,
              border: 'none',
              fontSize: theme.typography.body.fontSize,
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: colors.primary,
              color: colors.white,
              boxShadow: '0 10px 20px rgba(33, 64, 118, 0.18)',
            }}
          >
            Continue as {userTypeDescriptions[selectedUserType].title}
          </button>
          <button
            type="button"
            onClick={() =>
              navigate('/login', {
                state: { userType: selectedUserType },
              })
            }
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${colors.primary}`,
              fontSize: theme.typography.body.fontSize,
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: colors.primary,
            }}
          >
            Already onboarded? Log in
          </button>
        </div>
      </div>

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
      <div
        style={{
          marginTop: theme.spacing.xl,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
          backgroundColor: colors.surface,
          border: `1px dashed ${colors.border}`,
          maxWidth: '640px',
          width: '100%',
        }}
      >
        <div style={{ fontWeight: 600, color: colors.textSecondary, marginBottom: theme.spacing.sm }}>
          Need demo data?
        </div>
        {!hasData && (
          <div style={{ color: colors.warning, marginBottom: theme.spacing.sm }}>
            No data found. Use the button below to load sample shops, products, and price updates.
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          <button
            type="button"
            onClick={handleSeed}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius.sm,
              border: 'none',
              backgroundColor: colors.secondary,
              color: colors.white,
              cursor: 'pointer',
            }}
          >
            Seed Sample Data
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${colors.error}`,
              backgroundColor: 'transparent',
              color: colors.error,
              cursor: 'pointer',
            }}
          >
            Clear Data
          </button>
          <Link
            to="/login"
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Quick Login
          </Link>
        </div>
      </div>
    </div>
  );
}

