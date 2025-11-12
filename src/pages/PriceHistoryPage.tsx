import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { getShopProductsForOwner } from '../services/PriceService';
import { getPriceHistory } from '../services/PriceUpdateService';
import { PriceUpdate } from '../types';
import { formatCurrency } from '../utils/format';
import { colors } from '../theme/index';

interface ShopProductWithDetails {
  id: string;
  product_id: string;
  productName: string;
  unit: string;
  current_price?: number;
  is_available: boolean;
}

interface ChartDataPoint {
  date: Date;
  price: number;
  label: string;
}

// Simple SVG Line Chart Component
function SimpleLineChart({ data, width = 600, height = 200 }: { data: ChartDataPoint[]; width?: number; height?: number }) {
  if (data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
        No data available for chart
      </div>
    );
  }

  const padding = 50;
  const chartWidth = Math.max(width - padding * 2, 200);
  const chartHeight = Math.max(height - padding * 2, 150);

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  // Add some padding to price range for better visualization
  const pricePadding = (maxPrice - minPrice) * 0.1 || minPrice * 0.1 || 1;
  const priceRange = maxPrice - minPrice + pricePadding * 2 || 1;
  const adjustedMinPrice = minPrice - pricePadding;

  const maxDate = Math.max(...data.map(d => d.date.getTime()));
  const minDate = Math.min(...data.map(d => d.date.getTime()));
  // Add padding to date range if single point
  const datePadding = data.length === 1 ? 86400000 : 0; // 1 day in milliseconds
  const dateRange = (maxDate - minDate) + datePadding * 2 || 1;
  const adjustedMinDate = minDate - datePadding;

  const points = data.map((point, index) => {
    const x = padding + (chartWidth * (point.date.getTime() - adjustedMinDate)) / dateRange;
    const y = padding + chartHeight - (chartHeight * (point.price - adjustedMinPrice)) / priceRange;
    return { x, y, point };
  });

  const path = points.map(({ x, y }, index) => {
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const yTicks = Math.min(5, data.length + 2);
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    const value = adjustedMinPrice + (priceRange * i) / (yTicks - 1);
    return value;
  });

  // Format date labels for x-axis
  const xTickValues = data.length <= 10 
    ? data.map(d => d.date) 
    : data.filter((_, index) => index % Math.ceil(data.length / 10) === 0).map(d => d.date);

  return (
    <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      <svg width={width} height={height} style={{ display: 'block', maxWidth: '100%', minWidth: '100%' }} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yTickValues.map((value, index) => {
          const y = padding + chartHeight - (chartHeight * (value - adjustedMinPrice)) / priceRange;
          return (
            <g key={`grid-${index}`}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={colors.border}
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.3"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill={colors.textSecondary}
              >
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}

        {/* Chart line */}
        {points.length > 1 && (
          <path
            d={path}
            fill="none"
            stroke={colors.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map(({ x, y, point }, index) => (
          <g key={`point-${index}`}>
            <circle
              cx={x}
              cy={y}
              r="5"
              fill={colors.primary}
              stroke={colors.white}
              strokeWidth="2"
            />
            {/* Tooltip on hover */}
            <title>
              {point.label}: {formatCurrency(point.price)}
            </title>
          </g>
        ))}

        {/* X-axis date labels */}
        {xTickValues.map((date, index) => {
          const correspondingPoint = points.find(p => 
            p.point.date.getTime() === date.getTime()
          );
          if (!correspondingPoint) return null;
          return (
            <text
              key={`date-${index}`}
              x={correspondingPoint.x}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="10"
              fill={colors.textSecondary}
              transform={`rotate(-45 ${correspondingPoint.x} ${height - padding + 20})`}
            >
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          );
        })}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke={colors.border}
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke={colors.border}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export default function PriceHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shopProducts, setShopProducts] = useState<ShopProductWithDetails[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceUpdate[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const shop = useMemo(() => (user ? StorageService.getShopByOwnerId(user.id) : null), [user]);

  useEffect(() => {
    if (user && shop) {
      loadProducts();
      const productIdFromUrl = searchParams.get('productId');
      if (productIdFromUrl) {
        setSelectedProductId(productIdFromUrl);
      }
    }
  }, [user, shop?.id, searchParams]);

  useEffect(() => {
    if (selectedProductId) {
      loadPriceHistory(selectedProductId);
    } else {
      setPriceHistory([]);
    }
  }, [selectedProductId, startDate, endDate]);

  const loadProducts = () => {
    if (!user) return;
    const products = getShopProductsForOwner(user.id);
    setShopProducts(products);
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  };

  const loadPriceHistory = (shopProductId: string) => {
    setLoading(true);
    try {
      let history = getPriceHistory(shopProductId);

      // Filter by date range if provided
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        history = history.filter(update => new Date(update.created_at) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        history = history.filter(update => new Date(update.created_at) <= end);
      }

      // Sort by date (oldest first for chart)
      history.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    return priceHistory.map(update => ({
      date: new Date(update.created_at),
      price: update.price,
      label: new Date(update.created_at).toLocaleDateString(),
    }));
  }, [priceHistory]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return shopProducts.find(p => p.id === selectedProductId) || null;
  }, [shopProducts, selectedProductId]);

  const handleExport = () => {
    if (!selectedProduct || priceHistory.length === 0) {
      alert('No data to export');
      return;
    }

    const csvHeaders = ['Date', 'Price', 'Payment Status', 'Payment Amount'];
    const csvRows = priceHistory.map(update => [
      new Date(update.created_at).toLocaleString(),
      update.price.toString(),
      update.payment_status,
      update.payment_amount?.toString() || '0',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `price_history_${selectedProduct?.productName || 'product'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDateRangeReset = () => {
    setStartDate('');
    setEndDate('');
  };

  if (!shop) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">No shop found for this account.</div>
            <button
              type="button"
              className="button button--primary"
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/shop-owner/register')}
            >
              Register your shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Price History
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                View price trends and history for your products.
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/shop-owner/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="product-select">Select Product</label>
            <select
              id="product-select"
              className="form-select"
              value={selectedProductId || ''}
              onChange={e => {
                setSelectedProductId(e.target.value);
                setSearchParams({ productId: e.target.value });
              }}
            >
              <option value="">-- Select a product --</option>
              {shopProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.productName} ({product.unit})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="action-row" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-field" style={{ flex: 1, minWidth: '180px' }}>
                <label htmlFor="start-date">Start Date</label>
                <input
                  id="start-date"
                  className="form-input"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-field" style={{ flex: 1, minWidth: '180px' }}>
                <label htmlFor="end-date">End Date</label>
                <input
                  id="end-date"
                  className="form-input"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              <div className="action-row" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
                {(startDate || endDate) && (
                  <button
                    type="button"
                    className="button button--outline"
                    style={{ width: 'auto' }}
                    onClick={handleDateRangeReset}
                  >
                    Reset
                  </button>
                )}
                {priceHistory.length > 0 && (
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ width: 'auto' }}
                    onClick={handleExport}
                  >
                    Export CSV
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {selectedProduct && (
          <>
            <section className="surface-card">
              <div className="action-row" style={{ marginBottom: '1rem' }}>
                <h2>Price Trend: {selectedProduct.productName}</h2>
                {priceHistory.length > 0 && (
                  <span className="form-helper">
                    {priceHistory.length} {priceHistory.length === 1 ? 'update' : 'updates'}
                  </span>
                )}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading price history...</div>
              ) : priceHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>No price history available for this product.</p>
                  <p className="form-helper">Update prices to see history.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)', padding: '1.5rem', overflowX: 'auto' }}>
                    <div style={{ minWidth: '600px', width: '100%' }}>
                      <SimpleLineChart data={chartData} width={800} height={250} />
                    </div>
                  </div>

                  <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div className="form-helper">
                      Min: {formatCurrency(Math.min(...priceHistory.map(u => u.price)))}
                    </div>
                    <div className="form-helper">
                      Max: {formatCurrency(Math.max(...priceHistory.map(u => u.price)))}
                    </div>
                    <div className="form-helper">
                      Avg: {formatCurrency(
                        priceHistory.reduce((sum, u) => sum + u.price, 0) / priceHistory.length
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {priceHistory.length > 0 && (
              <section className="surface-card">
                <h2 style={{ marginBottom: '1rem' }}>Price History Details</h2>
                <div className="table-container">
                  <table className="data-table" style={{ minWidth: '600px' }}>
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Price</th>
                        <th>Payment Status</th>
                        <th>Payment Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistory.map(update => (
                        <tr key={update.id}>
                          <td>{new Date(update.created_at).toLocaleString()}</td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(update.price)}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor:
                                  update.payment_status === 'paid'
                                    ? colors.success
                                    : update.payment_status === 'pending'
                                    ? colors.warning
                                    : colors.error,
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {update.payment_status}
                            </span>
                          </td>
                          <td>{formatCurrency(update.payment_amount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {!selectedProduct && shopProducts.length === 0 && (
          <section className="surface-card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No products in your catalog. Add products to view price history.</p>
              <button
                type="button"
                className="button button--primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/shop-owner/products')}
              >
                Manage Products
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

