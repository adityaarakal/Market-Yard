import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getProductPriceHistory,
  getShopPriceHistory,
  getProductPriceHistoryByShop,
  getShopPriceHistoryByProduct,
  calculatePriceStats,
  getShopsWithPriceHistory,
  getProductsWithPriceHistory,
  PriceHistoryEntry,
  PriceHistoryStats,
} from '../services/PriceHistoryService';
import { getAllProducts } from '../services/ProductService';
import { getAllShops } from '../services/ShopService';
import { Product, Shop } from '../types';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';

interface ChartDataPoint {
  date: Date;
  price: number;
  label: string;
  shopId?: string;
  shopName?: string;
}

// Simple SVG Line Chart Component (reused from PriceHistoryPage)
function SimpleLineChart({
  data,
  width = 800,
  height = 300,
  showMultipleLines = false,
  lineColors = [colors.primary],
}: {
  data: ChartDataPoint[] | Record<string, ChartDataPoint[]>;
  width?: number;
  height?: number;
  showMultipleLines?: boolean;
  lineColors?: string[];
}) {
  // Handle both single line and multiple lines
  const dataArray = showMultipleLines && typeof data === 'object' && !Array.isArray(data)
    ? Object.values(data).flat()
    : Array.isArray(data)
    ? data
    : [];

  if (dataArray.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
        No data available for chart
      </div>
    );
  }

  const padding = 60;
  const chartWidth = Math.max(width - padding * 2, 200);
  const chartHeight = Math.max(height - padding * 2, 200);

  const allPrices = Array.isArray(data)
    ? data.map(d => d.price)
    : Object.values(data)
        .flat()
        .map(d => d.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const pricePadding = (maxPrice - minPrice) * 0.1 || minPrice * 0.1 || 1;
  const priceRange = maxPrice - minPrice + pricePadding * 2 || 1;
  const adjustedMinPrice = minPrice - pricePadding;

  const allDates = Array.isArray(data)
    ? data.map(d => d.date.getTime())
    : Object.values(data)
        .flat()
        .map(d => d.date.getTime());
  const maxDate = Math.max(...allDates);
  const minDate = Math.min(...allDates);
  const datePadding = allDates.length === 1 ? 86400000 : 0;
  const dateRange = (maxDate - minDate) + datePadding * 2 || 1;
  const adjustedMinDate = minDate - datePadding;

  // Render multiple lines if data is grouped by shop/product
  const renderMultipleLines = () => {
    if (!showMultipleLines || Array.isArray(data)) {
      return null;
    }

    const shops = Object.keys(data);
    return shops.map((shopId, index) => {
      const shopData = data[shopId];
      if (shopData.length === 0) return null;

      const points = shopData.map(point => {
        const x = padding + (chartWidth * (point.date.getTime() - adjustedMinDate)) / dateRange;
        const y = padding + chartHeight - (chartHeight * (point.price - adjustedMinPrice)) / priceRange;
        return { x, y, point };
      });

      const path = points.map(({ x, y }, idx) => (idx === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
      const color = lineColors[index % lineColors.length];

      return (
        <g key={shopId}>
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          {points.map(({ x, y }, idx) => (
            <circle key={idx} cx={x} cy={y} r="4" fill={color} stroke={colors.white} strokeWidth="2" />
          ))}
        </g>
      );
    });
  };

  // Render single line
  const renderSingleLine = () => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const points = data.map(point => {
      const x = padding + (chartWidth * (point.date.getTime() - adjustedMinDate)) / dateRange;
      const y = padding + chartHeight - (chartHeight * (point.price - adjustedMinPrice)) / priceRange;
      return { x, y, point };
    });

    const path = points.map(({ x, y }, idx) => (idx === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');

    return (
      <g>
        <path
          d={path}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map(({ x, y }, idx) => (
          <circle key={idx} cx={x} cy={y} r="4" fill={colors.primary} stroke={colors.white} strokeWidth="2" />
        ))}
      </g>
    );
  };

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return adjustedMinPrice + (priceRange * i) / (yTicks - 1);
  });

  const xTickValues = Array.isArray(data)
    ? (data.length <= 10
        ? data.map(d => d.date)
        : data.filter((_, idx) => idx % Math.ceil(data.length / 10) === 0).map(d => d.date))
    : [];

  return (
    <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      <svg
        width={width}
        height={height}
        style={{ display: 'block', maxWidth: '100%', minWidth: '100%' }}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTickValues.map((value, idx) => {
          const y = padding + chartHeight - (chartHeight * (value - adjustedMinPrice)) / priceRange;
          return (
            <g key={`grid-${idx}`}>
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
              <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="11" fill={colors.textSecondary}>
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}

        {/* Chart lines */}
        {showMultipleLines ? renderMultipleLines() : renderSingleLine()}

        {/* X-axis date labels */}
        {xTickValues.map((date, idx) => {
          const dateTime = date.getTime();
          const x = padding + (chartWidth * (dateTime - adjustedMinDate)) / dateRange;
          return (
            <text
              key={`date-${idx}`}
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="10"
              fill={colors.textSecondary}
              transform={`rotate(-45 ${x} ${height - padding + 20})`}
            >
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          );
        })}

        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={colors.border} strokeWidth="2" />
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

type ViewMode = 'product' | 'shop';
type ViewType = 'global' | 'specific';

export default function PriceHistoryTrendsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('product');
  const [viewType, setViewType] = useState<ViewType>('global');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [priceHistoryByShop, setPriceHistoryByShop] = useState<Record<string, PriceHistoryEntry[]>>({});
  const [priceHistoryByProduct, setPriceHistoryByProduct] = useState<Record<string, PriceHistoryEntry[]>>({});
  const [stats, setStats] = useState<PriceHistoryStats>({ min: 0, max: 0, avg: 0, count: 0 });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Check if user is premium
  const isPremium = user?.is_premium ?? false;

  // Load initial data
  useEffect(() => {
    try {
      const products = getAllProducts().filter(p => p.is_active);
      const shops = getAllShops().filter(s => s.is_active);
      setAllProducts(products);
      setAllShops(shops);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Load price history when selections change
  useEffect(() => {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (viewMode === 'product' && selectedProductId) {
      if (viewType === 'global') {
        // Load all shops' price history for this product
        const byShop = getProductPriceHistoryByShop(selectedProductId, start, end);
        setPriceHistoryByShop(byShop);
        const allEntries = Object.values(byShop).flat();
        setPriceHistory(allEntries);
        setStats(calculatePriceStats(allEntries));
      } else {
        // Load specific shop's price history for this product
        if (selectedShopId) {
          const entries = getProductPriceHistory({
            productId: selectedProductId,
            shopId: selectedShopId,
            startDate: start,
            endDate: end,
          });
          setPriceHistory(entries);
          setStats(calculatePriceStats(entries));
          setPriceHistoryByShop({});
        } else {
          setPriceHistory([]);
          setStats({ min: 0, max: 0, avg: 0, count: 0 });
        }
      }
    } else if (viewMode === 'shop' && selectedShopId) {
      if (viewType === 'global') {
        // Load all products' price history for this shop
        const byProduct = getShopPriceHistoryByProduct(selectedShopId, start, end);
        setPriceHistoryByProduct(byProduct);
        const allEntries = Object.values(byProduct).flat();
        setPriceHistory(allEntries);
        setStats(calculatePriceStats(allEntries));
      } else {
        // Load specific product's price history for this shop
        if (selectedProductId) {
          const entries = getShopPriceHistory({
            shopId: selectedShopId,
            productId: selectedProductId,
            startDate: start,
            endDate: end,
          });
          setPriceHistory(entries);
          setStats(calculatePriceStats(entries));
          setPriceHistoryByProduct({});
        } else {
          setPriceHistory([]);
          setStats({ min: 0, max: 0, avg: 0, count: 0 });
        }
      }
    } else {
      setPriceHistory([]);
      setPriceHistoryByShop({});
      setPriceHistoryByProduct({});
      setStats({ min: 0, max: 0, avg: 0, count: 0 });
    }
  }, [viewMode, viewType, selectedProductId, selectedShopId, startDate, endDate]);


  // Prepare chart data
  const chartData = useMemo(() => {
    if (viewMode === 'product' && viewType === 'global' && Object.keys(priceHistoryByShop).length > 0) {
      // Multiple lines for multiple shops
      const shopData: Record<string, ChartDataPoint[]> = {};
      Object.keys(priceHistoryByShop).forEach(shopId => {
        const shop = allShops.find(s => s.id === shopId);
        shopData[shopId] = priceHistoryByShop[shopId].map(entry => ({
          date: entry.date,
          price: entry.price,
          label: `${shop?.shop_name || 'Unknown'} - ${entry.date.toLocaleDateString()}`,
          shopId: entry.shopId,
          shopName: entry.shopName,
        }));
      });
      return shopData;
    } else if (viewMode === 'shop' && viewType === 'global' && Object.keys(priceHistoryByProduct).length > 0) {
      // Multiple lines for multiple products
      const productData: Record<string, ChartDataPoint[]> = {};
      Object.keys(priceHistoryByProduct).forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        productData[productId] = priceHistoryByProduct[productId].map(entry => ({
          date: entry.date,
          price: entry.price,
          label: `${product?.name || 'Unknown'} - ${entry.date.toLocaleDateString()}`,
          shopId: entry.shopId,
          shopName: entry.shopName,
        }));
      });
      return productData;
    } else {
      // Single line
      return priceHistory.map(entry => ({
        date: entry.date,
        price: entry.price,
        label: `${entry.productName} at ${entry.shopName} - ${entry.date.toLocaleDateString()}`,
        shopId: entry.shopId,
        shopName: entry.shopName,
      }));
    }
  }, [priceHistory, priceHistoryByShop, priceHistoryByProduct, allShops, allProducts, viewMode, viewType]);

  // Get available shops/products based on selection
  const availableShops = useMemo(() => {
    if (viewMode === 'product' && selectedProductId) {
      return getShopsWithPriceHistory(selectedProductId);
    }
    return allShops;
  }, [viewMode, selectedProductId, allShops]);

  const availableProducts = useMemo(() => {
    if (viewMode === 'shop' && selectedShopId) {
      return getProductsWithPriceHistory(selectedShopId);
    }
    return allProducts;
  }, [viewMode, selectedShopId, allProducts]);

  // Redirect if not premium
  if (!isPremium) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">
              <h2>Premium Feature</h2>
              <p>Price history and trends are only available for Premium users.</p>
              <button
                type="button"
                className="button button--primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/premium/upgrade')}
              >
                Upgrade to Premium
              </button>
              <button
                type="button"
                className="button button--outline"
                style={{ marginTop: '0.5rem' }}
                onClick={() => navigate('/end-user/home')}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showMultipleLines =
    (viewMode === 'product' && viewType === 'global' && Object.keys(priceHistoryByShop).length > 1) ||
    (viewMode === 'shop' && viewType === 'global' && Object.keys(priceHistoryByProduct).length > 1);

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Price History & Trends
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Analyze price trends over time for products and shops.
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/end-user/home')}
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="segmented-control" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className={`segmented-control__button${viewMode === 'product' ? ' segmented-control__button--active' : ''}`}
              onClick={() => {
                setViewMode('product');
                setSelectedShopId('');
                setViewType('global');
              }}
            >
              By Product
            </button>
            <button
              type="button"
              className={`segmented-control__button${viewMode === 'shop' ? ' segmented-control__button--active' : ''}`}
              onClick={() => {
                setViewMode('shop');
                setSelectedProductId('');
                setViewType('global');
              }}
            >
              By Shop
            </button>
          </div>

          {/* View Type Selector */}
          <div className="segmented-control" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className={`segmented-control__button${viewType === 'global' ? ' segmented-control__button--active' : ''}`}
              onClick={() => {
                setViewType('global');
                if (viewMode === 'product') {
                  setSelectedShopId('');
                } else {
                  setSelectedProductId('');
                }
              }}
            >
              {viewMode === 'product' ? 'All Shops' : 'All Products'}
            </button>
            <button
              type="button"
              className={`segmented-control__button${viewType === 'specific' ? ' segmented-control__button--active' : ''}`}
              onClick={() => setViewType('specific')}
            >
              Specific {viewMode === 'product' ? 'Shop' : 'Product'}
            </button>
          </div>

          {/* Selection Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {viewMode === 'product' ? (
              <>
                <div className="form-field">
                  <label htmlFor="product-select">Select Product</label>
                  <select
                    id="product-select"
                    className="form-select"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- Select a product --</option>
                    {availableProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.unit})
                      </option>
                    ))}
                  </select>
                </div>
                {viewType === 'specific' && (
                  <div className="form-field">
                    <label htmlFor="shop-select">Select Shop</label>
                    <select
                      id="shop-select"
                      className="form-select"
                      value={selectedShopId}
                      onChange={e => setSelectedShopId(e.target.value)}
                    >
                      <option value="">-- Select a shop --</option>
                      {availableShops.map(shop => (
                        <option key={shop.id} value={shop.id}>
                          {shop.shop_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="form-field">
                  <label htmlFor="shop-select">Select Shop</label>
                  <select
                    id="shop-select"
                    className="form-select"
                    value={selectedShopId}
                    onChange={e => setSelectedShopId(e.target.value)}
                  >
                    <option value="">-- Select a shop --</option>
                    {availableShops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.shop_name}
                      </option>
                    ))}
                  </select>
                </div>
                {viewType === 'specific' && (
                  <div className="form-field">
                    <label htmlFor="product-select">Select Product</label>
                    <select
                      id="product-select"
                      className="form-select"
                      value={selectedProductId}
                      onChange={e => setSelectedProductId(e.target.value)}
                    >
                      <option value="">-- Select a product --</option>
                      {availableProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Date Range Filters */}
            <div className="form-field">
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                className="form-input"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="end-date">End Date</label>
              <input
                id="end-date"
                className="form-input"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            {(startDate || endDate) && (
              <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  className="button button--ghost"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Clear Dates
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Price Statistics */}
        {stats.count > 0 && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>Price Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Minimum Price</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: colors.success }}>{formatCurrency(stats.min)}</div>
              </div>
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Maximum Price</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: colors.error }}>{formatCurrency(stats.max)}</div>
              </div>
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Average Price</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: colors.primary }}>{formatCurrency(stats.avg)}</div>
              </div>
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Data Points</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.count}</div>
              </div>
            </div>
          </section>
        )}

        {/* Price Trend Chart */}
        {priceHistory.length > 0 && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>Price Trend</h2>
            <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)', padding: '1.5rem', overflowX: 'auto' }}>
              <div style={{ minWidth: '800px', width: '100%' }}>
                <SimpleLineChart
                  data={chartData}
                  width={1000}
                  height={400}
                  showMultipleLines={showMultipleLines}
                  lineColors={[
                    colors.primary,
                    colors.success,
                    colors.warning,
                    colors.error,
                    colors.info,
                    '#9c27b0',
                    '#ff9800',
                    '#00bcd4',
                  ]}
                />
              </div>
            </div>

            {/* Legend for multiple lines */}
            {showMultipleLines && (
              <div
                className="surface-card surface-card--compact"
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: colors.surface,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Legend</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {viewMode === 'product' && viewType === 'global'
                    ? Object.keys(priceHistoryByShop).map((shopId, idx) => {
                        const shop = allShops.find(s => s.id === shopId);
                        const lineColors = [
                          colors.primary,
                          colors.success,
                          colors.warning,
                          colors.error,
                          colors.info,
                          '#9c27b0',
                          '#ff9800',
                          '#00bcd4',
                        ];
                        return (
                          <div key={shopId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '3px',
                                backgroundColor: lineColors[idx % lineColors.length],
                                borderRadius: '2px',
                              }}
                            />
                            <span className="form-helper" style={{ fontSize: '0.85rem' }}>
                              {shop?.shop_name || 'Unknown Shop'}
                            </span>
                          </div>
                        );
                      })
                    : viewMode === 'shop' &&
                      viewType === 'global' &&
                      Object.keys(priceHistoryByProduct).map((productId, idx) => {
                        const product = allProducts.find(p => p.id === productId);
                        const lineColors = [
                          colors.primary,
                          colors.success,
                          colors.warning,
                          colors.error,
                          colors.info,
                          '#9c27b0',
                          '#ff9800',
                          '#00bcd4',
                        ];
                        return (
                          <div key={productId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '3px',
                                backgroundColor: lineColors[idx % lineColors.length],
                                borderRadius: '2px',
                              }}
                            />
                            <span className="form-helper" style={{ fontSize: '0.85rem' }}>
                              {product?.name || 'Unknown Product'}
                            </span>
                          </div>
                        );
                      })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Price History Table */}
        {priceHistory.length > 0 && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>Price History Details</h2>
            <div className="table-container">
              <table className="data-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    {viewType === 'global' && <th>{viewMode === 'product' ? 'Shop' : 'Product'}</th>}
                    <th>Price</th>
                    {viewMode === 'product' && <th>Shop Name</th>}
                    {viewMode === 'shop' && <th>Product Name</th>}
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.map(entry => (
                    <tr key={entry.updateId}>
                      <td>{entry.date.toLocaleString()}</td>
                      {viewType === 'global' && (
                        <td>
                          {viewMode === 'product' ? (
                            <div style={{ fontWeight: 600 }}>{entry.shopName}</div>
                          ) : (
                            <div style={{ fontWeight: 600 }}>{entry.productName}</div>
                          )}
                        </td>
                      )}
                      <td style={{ fontWeight: 600, color: colors.primary }}>{formatCurrency(entry.price)}</td>
                      {viewMode === 'product' && <td>{entry.shopName}</td>}
                      {viewMode === 'shop' && <td>{entry.productName}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!selectedProductId && viewMode === 'product') || (!selectedShopId && viewMode === 'shop') ? (
          <section className="surface-card">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>No Selection Made</h3>
              <p style={{ marginBottom: '1.5rem', color: colors.textSecondary }}>
                Please select a {viewMode === 'product' ? 'product' : 'shop'} to view price history and trends.
              </p>
            </div>
          </section>
        ) : priceHistory.length === 0 &&
          ((viewMode === 'product' && selectedProductId) || (viewMode === 'shop' && selectedShopId)) ? (
          <section className="surface-card">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>No Price History Found</h3>
              <p style={{ marginBottom: '1.5rem', color: colors.textSecondary }}>
                No price history available for the selected {viewMode === 'product' ? 'product' : 'shop'}
                {viewType === 'specific' && viewMode === 'product' && ` and shop`}
                {viewType === 'specific' && viewMode === 'shop' && ` and product`}
                {startDate || endDate ? ' within the selected date range' : ''}.
              </p>
              {(startDate || endDate) && (
                <button
                  type="button"
                  className="button button--ghost"
                  style={{ marginTop: '1rem' }}
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Clear Date Filters
                </button>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

