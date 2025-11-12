import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getShopPricesForProduct, ShopPriceEntry } from '../services/ShopPriceService';
import { getProductById } from '../services/ProductService';
import { Product } from '../types';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';
import { formatDistance } from '../utils/distance';

type SortOption = 'price' | 'distance' | 'rating' | 'name';
type SortOrder = 'asc' | 'desc';

export default function ShopSpecificPriceViewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [shopPrices, setShopPrices] = useState<ShopPriceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [locationFilter, setLocationFilter] = useState<{ latitude: number; longitude: number; radiusKm: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10); // Default 10km radius

  // Check if user is premium
  const isPremium = user?.is_premium ?? false;

  // Request user location
  useEffect(() => {
    if (isPremium && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.warn('Geolocation error:', error);
          // Location not available, continue without it
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }, [isPremium]);

  // Load product and shop prices
  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

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

      // Get shop prices
      const prices = getShopPricesForProduct({
        productId,
        userLatitude: userLocation?.latitude,
        userLongitude: userLocation?.longitude,
        filterByLocation: locationFilter || undefined,
        sortBy,
        sortOrder,
      });

      setShopPrices(prices);
    } catch (error) {
      console.error('Error loading shop prices:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, userLocation, locationFilter, sortBy, sortOrder]);

  // Filter by location handler
  const handleFilterByLocation = () => {
    if (userLocation) {
      setLocationFilter({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radiusKm,
      });
    }
  };

  const handleClearLocationFilter = () => {
    setLocationFilter(null);
  };

  const handleContactShop = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleSort = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
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
              <p>This feature is only available for Premium users.</p>
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
                onClick={() => navigate(-1)}
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
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading shop prices...</div>
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

  const minPrice = shopPrices.length > 0 ? Math.min(...shopPrices.map(sp => sp.price)) : null;
  const maxPrice = shopPrices.length > 0 ? Math.max(...shopPrices.map(sp => sp.price)) : null;

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Shop Prices: {product.name}
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Compare prices across all shops selling this product.
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate(`/end-user/product/${productId}`)}
              >
                ← Back to Product
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div
            className="surface-card surface-card--compact"
            style={{
              padding: '1rem',
              backgroundColor: colors.surface,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                }}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{product.name}</div>
              <div className="form-helper">
                {product.category.replace('_', ' ')} • {product.unit}
              </div>
            </div>
            {minPrice != null && maxPrice != null && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary }}>Price Range</div>
                <div style={{ fontWeight: 700, fontSize: '1.3rem', color: colors.primary }}>
                  {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
                </div>
                <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                  {shopPrices.length} {shopPrices.length === 1 ? 'shop' : 'shops'}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Filters and Sort */}
        <section className="surface-card surface-card--compact">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Location Filter */}
            {userLocation && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filter by Location</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="form-field" style={{ flex: 1, minWidth: '150px' }}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Radius (km)"
                      value={radiusKm}
                      onChange={e => setRadiusKm(parseFloat(e.target.value) || 10)}
                      min="1"
                      max="100"
                      step="1"
                      style={{ width: '100%', marginBottom: 0 }}
                    />
                  </div>
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ width: 'auto' }}
                    onClick={handleFilterByLocation}
                  >
                    Filter by Location
                  </button>
                  {locationFilter && (
                    <button
                      type="button"
                      className="button button--ghost"
                      style={{ width: 'auto' }}
                      onClick={handleClearLocationFilter}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                {locationFilter && (
                  <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                    Showing shops within {locationFilter.radiusKm} km of your location
                  </div>
                )}
              </div>
            )}

            {/* Sort Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sort By</label>
              <div className="segmented-control" style={{ flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`segmented-control__button${sortBy === 'price' ? ' segmented-control__button--active' : ''}`}
                  onClick={() => handleSort('price')}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                {userLocation && (
                  <button
                    type="button"
                    className={`segmented-control__button${sortBy === 'distance' ? ' segmented-control__button--active' : ''}`}
                    onClick={() => handleSort('distance')}
                  >
                    Distance {sortBy === 'distance' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                )}
                <button
                  type="button"
                  className={`segmented-control__button${sortBy === 'rating' ? ' segmented-control__button--active' : ''}`}
                  onClick={() => handleSort('rating')}
                >
                  Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  className={`segmented-control__button${sortBy === 'name' ? ' segmented-control__button--active' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Shop Price Table */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Shops Selling {product.name}</h2>
          {shopPrices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No shops found selling this product.</p>
              {locationFilter && (
                <button
                  type="button"
                  className="button button--ghost"
                  style={{ marginTop: '1rem' }}
                  onClick={handleClearLocationFilter}
                >
                  Clear Location Filter
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table" style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Shop Name</th>
                    <th style={{ textAlign: 'left' }}>Address</th>
                    <th style={{ textAlign: 'center' }}>Price</th>
                    {userLocation && <th style={{ textAlign: 'center' }}>Distance</th>}
                    <th style={{ textAlign: 'center' }}>Rating</th>
                    <th style={{ textAlign: 'center' }}>Contact</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shopPrices.map((entry, index) => (
                    <tr
                      key={entry.shop.id}
                      style={{
                        backgroundColor: index === 0 && sortBy === 'price' && sortOrder === 'asc' ? `${colors.success}15` : 'transparent',
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{entry.shop.shop_name}</div>
                        {entry.shop.category && (
                          <div className="form-helper" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            {entry.shop.category.replace('_', ' ')}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{entry.shop.address}</div>
                        {(entry.shop.city || entry.shop.state || entry.shop.pincode) && (
                          <div className="form-helper" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            {[entry.shop.city, entry.shop.state, entry.shop.pincode].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: colors.primary }}>
                        {formatCurrency(entry.price)}
                      </td>
                      {userLocation && (
                        <td style={{ textAlign: 'center' }}>
                          {entry.distance != null ? (
                            <div style={{ fontWeight: 600 }}>{formatDistance(entry.distance)}</div>
                          ) : (
                            <div className="form-helper">N/A</div>
                          )}
                        </td>
                      )}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 600 }}>⭐</span>
                          <span style={{ fontWeight: 600 }}>
                            {entry.shop.average_rating > 0 ? entry.shop.average_rating.toFixed(1) : 'N/A'}
                          </span>
                          {entry.shop.total_ratings > 0 && (
                            <span className="form-helper" style={{ fontSize: '0.8rem' }}>
                              ({entry.shop.total_ratings})
                            </span>
                          )}
                        </div>
                        {entry.shop.goodwill_score > 0 && (
                          <div className="form-helper" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            Goodwill: {entry.shop.goodwill_score}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {entry.shop.phone_number ? (
                          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{entry.shop.phone_number}</div>
                        ) : (
                          <div className="form-helper">N/A</div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {entry.shop.phone_number && (
                            <button
                              type="button"
                              className="button button--primary"
                              style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                              onClick={() => handleContactShop(entry.shop.phone_number)}
                            >
                              📞 Call
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Summary */}
        {shopPrices.length > 0 && (
          <section className="surface-card surface-card--compact">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Total Shops</div>
                <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>{shopPrices.length}</div>
              </div>
              {minPrice != null && (
                <div>
                  <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Lowest Price</div>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', color: colors.success }}>{formatCurrency(minPrice)}</div>
                </div>
              )}
              {maxPrice != null && (
                <div>
                  <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Highest Price</div>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem', color: colors.error }}>{formatCurrency(maxPrice)}</div>
                </div>
              )}
              {minPrice != null && maxPrice != null && (
                <div>
                  <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Price Difference</div>
                  <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>{formatCurrency(maxPrice - minPrice)}</div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

