import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, theme } from '../theme';
import { getGlobalPriceSummary, GlobalPriceEntry } from '../services/PriceService';
import { formatCurrency } from '../utils/format';

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: theme.spacing.lg,
  backgroundColor: colors.background,
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: colors.white,
  borderRadius: theme.borderRadius.md,
  overflow: 'hidden',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: theme.spacing.md,
  backgroundColor: colors.primary,
  color: colors.white,
};

const tdStyle: React.CSSProperties = {
  padding: theme.spacing.md,
  borderBottom: `1px solid ${colors.border}`,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing.lg,
};

const tagStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  borderRadius: theme.borderRadius.sm,
  backgroundColor: colors.secondaryLight,
  color: colors.white,
  fontSize: '12px',
};

const refreshButtonStyle: React.CSSProperties = {
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  backgroundColor: colors.primary,
  color: colors.white,
  border: 'none',
  borderRadius: theme.borderRadius.md,
  cursor: 'pointer',
};

function PriceTable({ data }: { data: GlobalPriceEntry[] }) {
  if (data.length === 0) {
    return <p>No pricing data available. Seed sample data to get started.</p>;
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Product</th>
          <th style={thStyle}>Category</th>
          <th style={thStyle}>Best Price</th>
          <th style={thStyle}>Best Shop</th>
          <th style={thStyle}>Average Price</th>
          <th style={thStyle}>Price Range</th>
        </tr>
      </thead>
      <tbody>
        {data.map(entry => (
          <tr key={entry.product.id}>
            <td style={tdStyle}>
              <div style={{ fontWeight: 600 }}>{entry.product.name}</div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>{entry.product.unit}</div>
            </td>
            <td style={tdStyle}>{entry.product.category.replace('_', ' ')}</td>
            <td style={tdStyle}>{formatCurrency(entry.minPrice)}</td>
            <td style={tdStyle}>{entry.bestShop ? entry.bestShop.shop_name : 'N/A'}</td>
            <td style={tdStyle}>{formatCurrency(entry.avgPrice)}</td>
            <td style={tdStyle}>
              {formatCurrency(entry.minPrice)} - {formatCurrency(entry.maxPrice)}
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>{entry.shopCount} shops</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function EndUserHome() {
  const { user, logout } = useAuth();
  const [globalPrices, setGlobalPrices] = useState<GlobalPriceEntry[]>([]);

  const refreshData = () => {
    setGlobalPrices(getGlobalPriceSummary());
  };

  useEffect(() => {
    refreshData();
    const handleStorageChange = () => refreshData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const bestDeals = useMemo(() => {
    return globalPrices
      .filter(entry => entry.minPrice != null)
      .sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0))
      .slice(0, 3);
  }, [globalPrices]);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ color: colors.text, marginBottom: theme.spacing.sm }}>Market Yard Prices</h1>
          <div style={{ color: colors.textSecondary }}>
            Welcome, {user?.name}! {user?.is_premium ? <span style={tagStyle}>Premium</span> : <span style={tagStyle}>Free</span>}
          </div>
        </div>
        <button type="button" style={refreshButtonStyle} onClick={logout}>
          Logout
        </button>
      </div>

      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Top Deals</h2>
        {bestDeals.length === 0 ? (
          <p>No deals available yet.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: theme.spacing.md,
            }}
          >
            {bestDeals.map(deal => (
              <div
                key={deal.product.id}
                style={{
                  backgroundColor: colors.white,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: theme.spacing.sm }}>{deal.product.name}</div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: theme.spacing.sm }}>
                  {deal.product.category.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: colors.primary }}>
                  {formatCurrency(deal.minPrice)}
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  Best from {deal.bestShop ? deal.bestShop.shop_name : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <h2>Global Price Comparison</h2>
          <button type="button" style={refreshButtonStyle} onClick={refreshData}>
            Refresh
          </button>
        </div>
        <PriceTable data={globalPrices} />
      </section>
    </div>
  );
}

