import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import { getGlobalPriceSummary, GlobalPriceEntry } from '../services/PriceService';
import { getProductById, getProductsByCategory } from '../services/ProductService';
import { isProductFavorite, toggleProductFavorite } from '../services/FavoritesService';
import { Product } from '../types';
import { formatCurrency } from '../utils/format';

export default function ProductDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [priceEntry, setPriceEntry] = useState<GlobalPriceEntry | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<GlobalPriceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const isFreeUser = !user?.is_premium;

  const loadProductDetails = () => {
    if (!productId) return;

    setLoading(true);
    try {
      // Get product details
      const productData = getProductById(productId);
      if (!productData) {
        console.error('Product not found');
        setLoading(false);
        return;
      }

      setProduct(productData);

      // Check if product is favorited
      if (user) {
        setIsFavorite(isProductFavorite(user.id, productId));
      }

      // Get price information for this product
      const globalPrices = getGlobalPriceSummary();
      const entry = globalPrices.find(p => p.product.id === productId);
      setPriceEntry(entry || null);

      // Get related products (same category, excluding current product)
      if (productData.category) {
        const categoryProducts = getProductsByCategory(productData.category);
        const relatedProductIds = categoryProducts
          .filter(p => p.id !== productId)
          .slice(0, 6)
          .map(p => p.id);

        const related = globalPrices
          .filter(p => relatedProductIds.includes(p.product.id) && p.minPrice != null)
          .slice(0, 6);

        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPremium = () => {
    navigate('/premium/upgrade');
  };

  const handleRelatedProductClick = (relatedProductId: string) => {
    navigate(`/end-user/product/${relatedProductId}`);
  };

  const handleFavoriteToggle = () => {
    if (!user || !productId) return;
    const newFavoriteState = toggleProductFavorite(user.id, productId);
    setIsFavorite(newFavoriteState);
  };

  useEffect(() => {
    if (productId) {
      // Reset state when productId changes
      setProduct(null);
      setPriceEntry(null);
      setRelatedProducts([]);
      loadProductDetails();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">Product not found</div>
            <button
              type="button"
              className="button button--primary"
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/end-user/home')}
            >
              Back to Home
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
            <button
              type="button"
              className="button button--outline"
              style={{ width: 'auto' }}
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
            <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left', flex: 1 }}>
              {product.name}
            </h1>
            {user && (
              <button
                type="button"
                onClick={handleFavoriteToggle}
                style={{
                  background: isFavorite ? colors.primary : 'transparent',
                  color: isFavorite ? 'white' : colors.text,
                  border: `2px solid ${isFavorite ? colors.primary : colors.border}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '❤️' : '🤍'}
                <span style={{ fontSize: '0.875rem' }}>{isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Product Image Gallery */}
        <section className="surface-card">
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              margin: '0 auto',
              aspectRatio: '4/3',
              overflow: 'hidden',
              backgroundColor: colors.surface,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.image-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="image-fallback"
              style={{
                display: product.image_url ? 'none' : 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '6rem',
                color: colors.textSecondary,
                backgroundColor: colors.surface,
              }}
            >
              🛒
            </div>
          </div>
        </section>

        {/* Product Information */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Product Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Category</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                <span
                  className="welcome-option__tag"
                  style={{
                    background: 'rgba(76, 175, 80, 0.1)',
                    color: colors.primary,
                    fontSize: '0.9rem',
                    padding: '0.5rem 1rem',
                  }}
                >
                  {product.category.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Unit</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{product.unit}</div>
            </div>

            {product.description && (
              <div>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Description</div>
                <div style={{ lineHeight: 1.6 }}>{product.description}</div>
              </div>
            )}
          </div>
        </section>

        {/* Price Range Display */}
        {priceEntry && priceEntry.minPrice != null && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>Pricing Information</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Best Price</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: colors.primary }}>{formatCurrency(priceEntry.minPrice)}</div>
              </div>

              {priceEntry.minPrice !== priceEntry.maxPrice && (
                <>
                  <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Price Range</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                      {formatCurrency(priceEntry.minPrice)} - {formatCurrency(priceEntry.maxPrice)}
                    </div>
                  </div>

                  {priceEntry.avgPrice && (
                    <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                      <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Average Price</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{formatCurrency(priceEntry.avgPrice)}</div>
                    </div>
                  )}
                </>
              )}

              <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Available at</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{priceEntry.shopCount}</div>
                <div className="form-helper" style={{ marginTop: '0.25rem' }}>{priceEntry.shopCount === 1 ? 'shop' : 'shops'}</div>
              </div>
            </div>
          </section>
        )}

        {/* Best Value Shop (Name Only) */}
        {priceEntry && priceEntry.bestShop && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>Best Value Shop</h2>
            <div
              className="surface-card surface-card--compact"
              style={{
                padding: '1.25rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${colors.primary}`,
              }}
            >
              <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.5rem' }}>🏪 Shop Name</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: colors.primary, marginBottom: '0.75rem' }}>
                {priceEntry.bestShop.shop_name}
              </div>
              {!isFreeUser && priceEntry.shopCount > 1 && (
                <button
                  type="button"
                  className="button button--primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => navigate(`/end-user/product/${productId}/shops`)}
                >
                  View All Shops ({priceEntry.shopCount})
                </button>
              )}
              {isFreeUser && (
                <div
                  className="surface-card surface-card--compact"
                  style={{
                    padding: '1rem',
                    background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primaryDark}15 100%)`,
                    borderRadius: 'var(--radius-md)',
                    marginTop: '1rem',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🔒 Premium Feature</div>
                  <p style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Upgrade to Premium to view shop details, address, contact information, and compare prices across all shops.
                  </p>
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ width: '100%' }}
                    onClick={handleUpgradeToPremium}
                  >
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Premium Users: View All Shops Button */}
        {!isFreeUser && priceEntry && priceEntry.shopCount > 0 && (
          <section className="surface-card">
            <div
              className="surface-card surface-card--compact"
              style={{
                padding: '1.5rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: 0, marginBottom: '0.75rem' }}>Compare Prices Across All Shops</h3>
              <p style={{ margin: 0, marginBottom: '1rem', fontSize: '0.95rem', color: colors.textSecondary }}>
                View detailed shop information, prices, ratings, and contact details for all {priceEntry.shopCount}{' '}
                {priceEntry.shopCount === 1 ? 'shop' : 'shops'} selling this product.
              </p>
              <button
                type="button"
                className="button button--primary"
                style={{ width: '100%', maxWidth: '400px' }}
                onClick={() => navigate(`/end-user/product/${productId}/shops`)}
              >
                View All Shops & Compare Prices
              </button>
            </div>
          </section>
        )}

        {/* Upgrade to Premium CTA (for free users without best shop) */}
        {isFreeUser && (!priceEntry || !priceEntry.bestShop) && priceEntry && priceEntry.shopCount > 0 && (
          <section className="surface-card">
            <div
              className="surface-card surface-card--compact"
              style={{
                padding: '1.5rem',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#fff' }}>🚀 Upgrade to Premium</h3>
              <p style={{ margin: 0, marginBottom: '1rem', opacity: 0.95, fontSize: '0.95rem' }}>
                View shop-specific prices, shop details, contact information, and compare prices across all {priceEntry.shopCount}{' '}
                {priceEntry.shopCount === 1 ? 'shop' : 'shops'} for this product.
              </p>
              <button
                type="button"
                className="button"
                style={{
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
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>Related Products</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              {relatedProducts.map(entry => (
                <div
                  key={entry.product.id}
                  className="surface-card surface-card--compact"
                  style={{
                    boxShadow: 'var(--shadow-soft)',
                    display: 'flex',
                    flexDirection: 'column',
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
                  onClick={() => handleRelatedProductClick(entry.product.id)}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '120px',
                      overflow: 'hidden',
                      backgroundColor: colors.surface,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {entry.product.image_url ? (
                      <img
                        src={entry.product.image_url}
                        alt={entry.product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.image-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="image-fallback"
                      style={{
                        display: entry.product.image_url ? 'none' : 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        color: colors.textSecondary,
                        backgroundColor: colors.surface,
                      }}
                    >
                      🛒
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{entry.product.name}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.primary }}>
                      {formatCurrency(entry.minPrice)}
                    </div>
                    {entry.bestShop && (
                      <div className="form-helper" style={{ fontSize: '0.8rem' }}>Best: {entry.bestShop.shop_name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No pricing data available */}
        {(!priceEntry || priceEntry.minPrice == null) && (
          <section className="surface-card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No pricing data available for this product yet.</p>
              <button
                type="button"
                className="button button--outline"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/end-user/global-prices')}
              >
                View All Products
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

