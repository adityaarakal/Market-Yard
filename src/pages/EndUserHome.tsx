import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import { getGlobalPriceSummary, GlobalPriceEntry } from '../services/PriceService';
import { getProductsByCategory, getAllProducts } from '../services/ProductService';
import { formatCurrency } from '../utils/format';

interface CategoryInfo {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  productCount: number;
}

function PriceTable({ data, onProductClick }: { data: GlobalPriceEntry[]; onProductClick: (productId: string) => void }) {
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
            <tr
              key={entry.product.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onProductClick(entry.product.id)}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = colors.surface;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrices, setFilteredPrices] = useState<GlobalPriceEntry[]>([]);

  const refreshData = () => {
    const prices = getGlobalPriceSummary();
    setGlobalPrices(prices);
  };

  useEffect(() => {
    refreshData();
    const handleStorageChange = () => refreshData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPrices(globalPrices);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = globalPrices.filter(entry =>
        [entry.product.name, entry.product.category, entry.product.unit]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
      setFilteredPrices(filtered);
    }
  }, [searchQuery, globalPrices]);

  const categories: CategoryInfo[] = useMemo(() => {
    const allProducts = getAllProducts();
    const categoryData: Record<string, { name: string; displayName: string; icon: string; color: string }> = {
      fruits: {
        name: 'fruits',
        displayName: 'Fruits',
        icon: '🍎',
        color: '#FF6B6B',
      },
      vegetables: {
        name: 'vegetables',
        displayName: 'Vegetables',
        icon: '🥕',
        color: '#4ECDC4',
      },
      farming_materials: {
        name: 'farming_materials',
        displayName: 'Farming Materials',
        icon: '🌾',
        color: '#FFE66D',
      },
      farming_products: {
        name: 'farming_products',
        displayName: 'Farming Products',
        icon: '🌱',
        color: '#95E1D3',
      },
    };

    return Object.values(categoryData).map(cat => {
      const products = getProductsByCategory(cat.name as any);
      const categoryPrices = globalPrices.filter(p => p.product.category === cat.name);
      const availableProducts = categoryPrices.filter(p => p.minPrice != null);

      return {
        id: cat.name,
        name: cat.name,
        displayName: cat.displayName,
        icon: cat.icon,
        color: cat.color,
        productCount: availableProducts.length,
      };
    });
  }, [globalPrices]);

  const bestDeals = useMemo(() => {
    return globalPrices
      .filter(entry => entry.minPrice != null)
      .sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0))
      .slice(0, 3);
  }, [globalPrices]);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const handleUpgradeToPremium = () => {
    navigate('/premium/upgrade');
  };

  const isFreeUser = !user?.is_premium;

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.75rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.5rem)', textAlign: 'left' }}>
                {user?.name ? `Welcome, ${user.name}!` : 'Welcome to Market Yard'}
                {(user?.user_type === 'admin' || user?.user_type === 'staff') && (
                  <span className="welcome-option__tag" style={{ marginLeft: '0.75rem', background: 'rgba(156, 39, 176, 0.15)', color: '#9c27b0' }}>
                    Admin
                  </span>
                )}
              </h1>
              <p className="form-helper" style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                Discover the best prices across all Market Yard shops
                {user?.is_premium ? (
                  <span className="welcome-option__tag" style={{ marginLeft: '0.5rem', background: 'rgba(76, 175, 80, 0.18)', color: colors.primary }}>
                    Premium
                  </span>
                ) : (
                  <span className="welcome-option__tag" style={{ marginLeft: '0.5rem', background: 'rgba(255, 152, 0, 0.15)', color: colors.secondary }}>
                    Free
                  </span>
                )}
              </p>
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

          {/* Search Bar */}
          <div className="form-field" style={{ marginTop: '0.5rem' }}>
            <label htmlFor="product-search">Search Products</label>
            <input
              id="product-search"
              className="form-input"
              type="text"
              placeholder="Search products by name, category, or unit..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Upgrade to Premium CTA (for free users) */}
          {isFreeUser && (
            <div
              className="surface-card surface-card--compact"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                color: '#fff',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div className="action-row" style={{ alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#fff' }}>🚀 Upgrade to Premium</h3>
                  <p style={{ margin: 0, opacity: 0.95, fontSize: '0.95rem' }}>
                    Unlock shop-specific prices, detailed shop information, and advanced comparison features
                  </p>
                </div>
                <button
                  type="button"
                  className="button"
                  style={{
                    width: 'auto',
                    background: '#fff',
                    color: colors.primary,
                    border: 'none',
                    fontWeight: 600,
                  }}
                  onClick={handleUpgradeToPremium}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Premium Features Quick Access */}
          {!isFreeUser && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              <div
                className="surface-card surface-card--compact"
                style={{
                  padding: '1.25rem',
                  backgroundColor: colors.surface,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div className="action-row" style={{ alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>🔍 Advanced Price Comparison</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: colors.textSecondary }}>
                      Compare prices across multiple products and shops side-by-side.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ width: 'auto' }}
                    onClick={() => navigate('/end-user/price-comparison')}
                  >
                    Compare Prices
                  </button>
                </div>
              </div>
              <div
                className="surface-card surface-card--compact"
                style={{
                  padding: '1.25rem',
                  backgroundColor: colors.surface,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div className="action-row" style={{ alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>📊 Price History & Trends</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: colors.textSecondary }}>
                      Analyze price trends over time for products and shops.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ width: 'auto' }}
                    onClick={() => navigate('/end-user/price-history')}
                  >
                    View Trends
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Category Cards */}
        <section className="surface-card surface-card--compact">
          <div className="action-row" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>Browse by Category</h2>
            <button
              type="button"
              className="button button--ghost"
              style={{ width: 'auto', marginLeft: 'auto' }}
              onClick={() => navigate('/end-user/categories')}
            >
              View All Categories
            </button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                className="surface-card surface-card--compact"
                onClick={() => handleCategoryClick(category.id)}
                style={{
                  boxShadow: 'var(--shadow-soft)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '1.25rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  background: '#fff',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{category.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '1.1rem' }}>{category.displayName}</div>
                <div className="form-helper" style={{ fontSize: '0.9rem' }}>
                  {category.productCount} {category.productCount === 1 ? 'product' : 'products'} available
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Access: Top Deals */}
        <section className="surface-card surface-card--compact">
          <div className="action-row" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>Top Deals</h2>
            <button
              type="button"
              className="button button--ghost"
              style={{ width: 'auto', marginLeft: 'auto' }}
              onClick={handleViewAllProducts}
            >
              View All
            </button>
          </div>
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
                <div
                  key={deal.product.id}
                  className="surface-card surface-card--compact"
                  style={{
                    boxShadow: 'var(--shadow-soft)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                  onClick={() => navigate(`/end-user/product/${deal.product.id}`)}
                >
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

        {/* Global Price Comparison - Quick View */}
        <section className="surface-card">
          <div className="action-row" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>Global Price Comparison</h2>
            <button
              type="button"
              className="button button--primary"
              style={{ width: 'auto', marginLeft: 'auto' }}
              onClick={() => navigate('/end-user/global-prices')}
            >
              View Full Price List
            </button>
          </div>
          {filteredPrices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No pricing data available.</p>
              <button
                type="button"
                className="button button--primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/end-user/global-prices')}
              >
                View All Prices
              </button>
            </div>
          ) : (
            <>
              <PriceTable data={filteredPrices.slice(0, 10)} onProductClick={(productId) => navigate(`/end-user/product/${productId}`)} />
              {filteredPrices.length > 10 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="button button--outline"
                    onClick={() => navigate('/end-user/global-prices')}
                  >
                    View All {filteredPrices.length} Products
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
