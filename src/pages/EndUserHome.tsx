import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import { getGlobalPriceSummary, GlobalPriceEntry } from '../services/PriceService';
import { formatCurrency } from '../utils/format';

function PriceTable({ data }: { data: GlobalPriceEntry[] }) {
  if (data.length === 0) {
    return <p>No pricing data available. Seed sample data to get started.</p>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Best Price</th>
            <th>Best Shop</th>
            <th>Average Price</th>
            <th>Price Range</th>
          </tr>
        </thead>
        <tbody>
          {data.map(entry => (
            <tr key={entry.product.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{entry.product.name}</div>
                <div className="form-helper" style={{ marginTop: '0.25rem' }}>{entry.product.unit}</div>
              </td>
              <td>{entry.product.category.replace('_', ' ')}</td>
              <td>{formatCurrency(entry.minPrice)}</td>
              <td>{entry.bestShop ? entry.bestShop.shop_name : 'N/A'}</td>
              <td>{formatCurrency(entry.avgPrice)}</td>
              <td>
                {formatCurrency(entry.minPrice)} - {formatCurrency(entry.maxPrice)}
                <div className="form-helper" style={{ marginTop: '0.25rem' }}>{entry.shopCount} shops</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EndUserHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.75rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.5rem)', textAlign: 'left' }}>
                Market Yard Prices
                {(user?.user_type === 'admin' || user?.user_type === 'staff') && (
                  <span className="welcome-option__tag" style={{ marginLeft: '0.75rem', background: 'rgba(156, 39, 176, 0.15)', color: '#9c27b0' }}>
                    Admin
                  </span>
                )}
              </h1>
              <div className="form-helper" style={{ textAlign: 'left' }}>
                Welcome, {user?.name}!{' '}
                {user?.is_premium ? (
                  <span className="welcome-option__tag" style={{ background: 'rgba(76, 175, 80, 0.18)', color: colors.primary }}>
                    Premium
                  </span>
                ) : (
                  <span className="welcome-option__tag" style={{ background: 'rgba(255, 152, 0, 0.15)', color: colors.secondary }}>
                    Free
                  </span>
                )}
              </div>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              {(user?.user_type === 'admin' || user?.user_type === 'staff') && (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ width: 'auto' }}
                  onClick={() => navigate('/shop-owner/dashboard')}
                >
                  View as Shop Owner
                </button>
              )}
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/profile')}
              >
                Profile
              </button>
              <button type="button" className="button button--primary" style={{ width: 'auto' }} onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="surface-card surface-card--compact">
          <h2 style={{ marginBottom: '1rem' }}>Top Deals</h2>
          {bestDeals.length === 0 ? (
            <p>No deals available yet.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {bestDeals.map(deal => (
                <div key={deal.product.id} className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{deal.product.name}</div>
                  <div className="form-helper" style={{ marginBottom: '0.75rem' }}>
                    {deal.product.category.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary }}>{formatCurrency(deal.minPrice)}</div>
                  <div className="form-helper">Best from {deal.bestShop ? deal.bestShop.shop_name : 'N/A'}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="surface-card">
          <div className="action-row" style={{ marginBottom: '1rem' }}>
            <h2>Global Price Comparison</h2>
            <button type="button" className="button button--primary" style={{ width: 'auto' }} onClick={refreshData}>
              Refresh
            </button>
          </div>
          <PriceTable data={globalPrices} />
        </section>
      </div>
    </div>
  );
}

