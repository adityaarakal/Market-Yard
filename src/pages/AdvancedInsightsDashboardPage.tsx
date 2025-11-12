import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getMostPopularShops,
  getTrendingProducts,
  getBestDeals,
  getUserPurchasingPatterns,
  getRecommendations,
  getCategoryDistribution,
  getMonthlySpendingTrend,
  PopularShop,
  TrendingProduct,
  BestDeal,
  Recommendation,
} from '../services/InsightsService';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';

// Simple Bar Chart Component
function SimpleBarChart({
  data,
  width = 600,
  height = 300,
  color = colors.primary,
}: {
  data: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
        No data available for chart
      </div>
    );
  }

  const padding = 60;
  const chartWidth = Math.max(width - padding * 2, 200);
  const chartHeight = Math.max(height - padding * 2, 200);

  const maxValue = Math.max(...data.map(d => d.value), 100);
  const barWidth = chartWidth / data.length / 1.5;
  const barSpacing = chartWidth / data.length - barWidth;

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
        {[0, 25, 50, 75, 100].map(value => {
          const y = padding + chartHeight - (chartHeight * value) / 100;
          return (
            <g key={`grid-${value}`}>
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
                {value}%
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (chartHeight * item.value) / maxValue;
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = padding + chartHeight - barHeight;

          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity="0.8"
                rx="4"
              />
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10"
                fill={colors.text}
                fontWeight="600"
              >
                {item.value.toFixed(0)}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - padding + 20}
                textAnchor="middle"
                fontSize="10"
                fill={colors.textSecondary}
                transform={`rotate(-45 ${x + barWidth / 2} ${height - padding + 20})`}
              >
                {item.label}
              </text>
            </g>
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

// Simple Line Chart Component for spending trend
function SimpleSpendingLineChart({
  data,
  width = 600,
  height = 200,
}: {
  data: Array<{ month: string; amount: number }>;
  width?: number;
  height?: number;
}) {
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

  const amounts = data.map(d => d.amount);
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  const amountPadding = (maxAmount - minAmount) * 0.1 || minAmount * 0.1 || 1;
  const amountRange = maxAmount - minAmount + amountPadding * 2 || 1;
  const adjustedMinAmount = minAmount - amountPadding;

  const points = data.map((item, index) => {
    const x = padding + (chartWidth * index) / (data.length - 1 || 1);
    const y = padding + chartHeight - (chartHeight * (item.amount - adjustedMinAmount)) / amountRange;
    return { x, y, item };
  });

  const path = points.map(({ x, y }, index) => (index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return adjustedMinAmount + (amountRange * i) / (yTicks - 1);
  });

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
          const y = padding + chartHeight - (chartHeight * (value - adjustedMinAmount)) / amountRange;
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
        {points.map(({ x, y, item }, idx) => (
          <g key={idx}>
            <circle cx={x} cy={y} r="4" fill={colors.primary} stroke={colors.white} strokeWidth="2" />
            <title>
              {item.month}: {formatCurrency(item.amount)}
            </title>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map(({ x, item }, idx) => (
          <text
            key={`label-${idx}`}
            x={x}
            y={height - padding + 20}
            textAnchor="middle"
            fontSize="10"
            fill={colors.textSecondary}
          >
            {item.month}
          </text>
        ))}

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

export default function AdvancedInsightsDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [popularShops, setPopularShops] = useState<PopularShop[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [bestDeals, setBestDeals] = useState<BestDeal[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userPatterns, setUserPatterns] = useState<ReturnType<typeof getUserPurchasingPatterns> | null>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<Record<string, number>>({});
  const [monthlySpending, setMonthlySpending] = useState<Array<{ month: string; amount: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is premium
  const isPremium = user?.is_premium ?? false;

  // Load insights data
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    try {
      setPopularShops(getMostPopularShops(10));
      setTrendingProducts(getTrendingProducts(10));
      setBestDeals(getBestDeals(10));
      setRecommendations(getRecommendations(user.id));
      setUserPatterns(getUserPurchasingPatterns(user.id));
      setCategoryDistribution(getCategoryDistribution(user.id));
      setMonthlySpending(getMonthlySpendingTrend(user.id));
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Prepare category distribution chart data
  const categoryChartData = useMemo(() => {
    return Object.entries(categoryDistribution).map(([category, value]) => ({
      label: category.replace('_', ' '),
      value,
    }));
  }, [categoryDistribution]);

  // Handle recommendation click
  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (recommendation.type === 'product' && recommendation.productId) {
      navigate(`/end-user/product/${recommendation.productId}`);
    } else if (recommendation.type === 'shop' && recommendation.shopId) {
      // Navigate to shop details or shop-specific price view
      navigate(`/end-user/product/${recommendation.productId || ''}/shops`);
    } else if (recommendation.type === 'deal' && recommendation.productId) {
      navigate(`/end-user/product/${recommendation.productId}`);
    }
  };

  // Redirect if not premium
  if (!isPremium) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">
              <h2>Premium Feature</h2>
              <p>Advanced insights are only available for Premium users.</p>
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading insights...</div>
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
                Advanced Insights Dashboard
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Discover trends, popular shops, best deals, and personalized recommendations.
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
        </header>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>💡 Personalized Recommendations</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
              }}
            >
              {recommendations.slice(0, 6).map((recommendation, index) => (
                <div
                  key={index}
                  className="surface-card surface-card--compact"
                  style={{
                    padding: '1.25rem',
                    border: `2px solid ${recommendation.priority === 'high' ? colors.primary : colors.border}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-soft)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                  onClick={() => handleRecommendationClick(recommendation)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor:
                          recommendation.priority === 'high'
                            ? `${colors.primary}20`
                            : `${colors.textSecondary}20`,
                      }}
                    >
                      {recommendation.type === 'product' && '🛒'}
                      {recommendation.type === 'shop' && '🏪'}
                      {recommendation.type === 'deal' && '💰'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{recommendation.title}</div>
                        {recommendation.priority === 'high' && (
                          <div
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: `${colors.primary}20`,
                              color: colors.primary,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            High Priority
                          </div>
                        )}
                      </div>
                      <div
                        className="form-helper"
                        style={{
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          color: colors.textSecondary,
                        }}
                      >
                        {recommendation.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Most Popular Shops */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>🏆 Most Popular Shops</h2>
          {popularShops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>No popular shops found.</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {popularShops.map((popularShop, index) => (
                <div
                  key={popularShop.shop.id}
                  className="surface-card surface-card--compact"
                  style={{
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-soft)',
                    border: index < 3 ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                    borderRadius: 'var(--radius-md)',
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
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                    {index < 3 && (
                      <div
                        style={{
                          fontSize: '2rem',
                          width: '50px',
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: `${colors.primary}20`,
                          color: colors.primary,
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        {popularShop.shop.shop_name}
                      </div>
                      <div className="form-helper" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {popularShop.shop.category.replace('_', ' ')} • {popularShop.shop.city || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.75rem',
                      marginTop: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                        Rating
                      </div>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ⭐ {popularShop.averageRating.toFixed(1)}
                        <span className="form-helper" style={{ fontSize: '0.75rem' }}>
                          ({popularShop.shop.total_ratings})
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                        Products
                      </div>
                      <div style={{ fontWeight: 600 }}>{popularShop.productCount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                        Goodwill
                      </div>
                      <div style={{ fontWeight: 600 }}>{popularShop.goodwillScore}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                        Updates
                      </div>
                      <div style={{ fontWeight: 600 }}>{popularShop.totalPriceUpdates}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                      Popularity Score
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: colors.surface,
                          borderRadius: 'var(--radius-pill)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${popularShop.popularityScore}%`,
                            height: '100%',
                            backgroundColor: colors.primary,
                            borderRadius: 'var(--radius-pill)',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.primary }}>
                        {popularShop.popularityScore.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trending Products */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>📈 Trending Products</h2>
          {trendingProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>No trending products found.</div>
          ) : (
            <div className="table-container">
              <table className="data-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Product</th>
                    <th style={{ textAlign: 'center' }}>Price Range</th>
                    <th style={{ textAlign: 'center' }}>Price Change</th>
                    <th style={{ textAlign: 'center' }}>Shops</th>
                    <th style={{ textAlign: 'center' }}>Trend Score</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingProducts.map(trending => (
                    <tr key={trending.product.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{trending.product.name}</div>
                        <div className="form-helper" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {trending.product.category.replace('_', ' ')} • {trending.product.unit}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {trending.minPrice != null && trending.maxPrice != null ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{formatCurrency(trending.minPrice)}</div>
                            {trending.minPrice !== trending.maxPrice && (
                              <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                                - {formatCurrency(trending.maxPrice)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="form-helper">N/A</div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {trending.priceChange !== 0 ? (
                          <div
                            style={{
                              fontWeight: 600,
                              color:
                                trending.priceChangeDirection === 'down'
                                  ? colors.success
                                  : trending.priceChangeDirection === 'up'
                                  ? colors.error
                                  : colors.textSecondary,
                            }}
                          >
                            {trending.priceChangeDirection === 'down' ? '↓' : trending.priceChangeDirection === 'up' ? '↑' : '→'}{' '}
                            {Math.abs(trending.priceChange).toFixed(1)}%
                          </div>
                        ) : (
                          <div className="form-helper">Stable</div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{trending.shopCount}</div>
                        <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                          {trending.shopCount === 1 ? 'shop' : 'shops'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, color: colors.primary }}>{trending.trendScore.toFixed(0)}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="button button--primary"
                          style={{ width: 'auto', padding: '0.5rem 1rem' }}
                          onClick={() => navigate(`/end-user/product/${trending.product.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Best Deals */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>💰 Best Deals</h2>
          {bestDeals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>No deals found.</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {bestDeals.map(deal => (
                <div
                  key={`${deal.product.id}-${deal.shop.id}`}
                  className="surface-card surface-card--compact"
                  style={{
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-soft)',
                    border: `2px solid ${colors.success}`,
                    borderRadius: 'var(--radius-md)',
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{deal.product.name}</div>
                      <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                        {deal.product.category.replace('_', ' ')} • {deal.product.unit}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: `${colors.success}20`,
                        color: colors.success,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      Save {deal.savingsPercentage.toFixed(0)}%
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Price</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary }}>
                      {formatCurrency(deal.price)}
                    </div>
                    <div className="form-helper" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Save {formatCurrency(deal.savings)} compared to average
                    </div>
                  </div>
                  <div style={{ paddingTop: '0.75rem', borderTop: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Shop</div>
                    <div style={{ fontWeight: 600 }}>{deal.shop.shop_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* User Purchasing Patterns */}
        {userPatterns && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>📊 Your Purchasing Patterns</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Total Purchases</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{userPatterns.purchaseCount}</div>
              </div>
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Total Spent</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: colors.primary }}>
                  {formatCurrency(userPatterns.totalSpent)}
                </div>
              </div>
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Average Price</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatCurrency(userPatterns.averagePrice)}</div>
              </div>
            </div>

            {/* Category Distribution Chart */}
            {categoryChartData.length > 0 && (
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Category Distribution</h3>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: '600px', width: '100%' }}>
                    <SimpleBarChart data={categoryChartData} width={800} height={300} color={colors.primary} />
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Spending Trend */}
            {monthlySpending.length > 0 && (
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Monthly Spending Trend</h3>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: '600px', width: '100%' }}>
                    <SimpleSpendingLineChart data={monthlySpending} width={800} height={250} />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

