import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import {
  getFavoriteProductsWithDetails,
  getFavoriteShopsWithDetails,
  toggleProductFavorite,
  toggleShopFavorite,
} from '../services/FavoritesService';
import { getGlobalPriceSummary, GlobalPriceEntry } from '../services/PriceService';
import ProductCard from '../components/display/ProductCard';
import ShopCard from '../components/display/ShopCard';
import EmptyState from '../components/display/EmptyState';

export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState<(import('../types').Product & { favorited_at: string })[]>([]);
  const [favoriteShops, setFavoriteShops] = useState<(import('../types').Shop & { favorited_at: string })[]>([]);
  const [globalPrices, setGlobalPrices] = useState<GlobalPriceEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'shops' | 'all'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = () => {
    if (!user) return;

    setLoading(true);
    try {
      const products = getFavoriteProductsWithDetails(user.id);
      const shops = getFavoriteShopsWithDetails(user.id);
      const prices = getGlobalPriceSummary();

      setFavoriteProducts(products);
      setFavoriteShops(shops);
      setGlobalPrices(prices);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductFavoriteToggle = (productId: string) => {
    if (!user) return;

    toggleProductFavorite(user.id, productId);
    loadFavorites();
  };

  const handleShopFavoriteToggle = (shopId: string) => {
    if (!user) return;

    toggleShopFavorite(user.id, shopId);
    loadFavorites();
  };

  const getProductPriceInfo = (productId: string): { minPrice: number | null; maxPrice: number | null; bestShop: string | null; shopCount: number } => {
    const entry = globalPrices.find(p => p.product.id === productId);
    if (!entry) {
      return { minPrice: null, maxPrice: null, bestShop: null, shopCount: 0 };
    }
    return {
      minPrice: entry.minPrice,
      maxPrice: entry.maxPrice,
      bestShop: entry.bestShop?.shop_name || null,
      shopCount: entry.shopCount,
    };
  };

  if (!user) {
    return null;
  }

  const filteredProducts = activeTab === 'all' || activeTab === 'products' ? favoriteProducts : [];
  const filteredShops = activeTab === 'all' || activeTab === 'shops' ? favoriteShops : [];

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        {/* Header */}
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title">My Favorites</h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Your saved products and shops
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate(user.user_type === 'shop_owner' ? '/shop-owner/dashboard' : '/end-user/home')}
              >
                Back
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-control__button${activeTab === 'all' ? ' segmented-control__button--active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({favoriteProducts.length + favoriteShops.length})
            </button>
            <button
              type="button"
              className={`segmented-control__button${activeTab === 'products' ? ' segmented-control__button--active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products ({favoriteProducts.length})
            </button>
            <button
              type="button"
              className={`segmented-control__button${activeTab === 'shops' ? ' segmented-control__button--active' : ''}`}
              onClick={() => setActiveTab('shops')}
            >
              Shops ({favoriteShops.length})
            </button>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            {/* Favorite Products Section */}
            {(activeTab === 'all' || activeTab === 'products') && (
              <section className="surface-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0 }}>Favorite Products ({favoriteProducts.length})</h2>
                </div>

                {filteredProducts.length === 0 ? (
                  <EmptyState
                    icon="🛒"
                    title="No favorite products"
                    description="Start adding products to your favorites to see them here."
                    action={
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => navigate('/end-user/global-prices')}
                      >
                        Browse Products
                      </button>
                    }
                  />
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {filteredProducts.map(product => {
                      const priceInfo = getProductPriceInfo(product.id);
                      return (
                        <div key={product.id} style={{ position: 'relative' }}>
                          <ProductCard
                            product={product}
                            minPrice={priceInfo.minPrice}
                            maxPrice={priceInfo.maxPrice}
                            bestShop={priceInfo.bestShop || undefined}
                            shopCount={priceInfo.shopCount}
                            onClick={() => navigate(`/end-user/product/${product.id}`)}
                            variant="default"
                          />
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleProductFavoriteToggle(product.id);
                            }}
                            style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              background: colors.primary,
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '2rem',
                              height: '2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              boxShadow: 'var(--shadow-soft)',
                            }}
                            title="Remove from favorites"
                          >
                            ❤️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Favorite Shops Section */}
            {(activeTab === 'all' || activeTab === 'shops') && (
              <section className="surface-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0 }}>Favorite Shops ({favoriteShops.length})</h2>
                </div>

                {filteredShops.length === 0 ? (
                  <EmptyState
                    icon="🏪"
                    title="No favorite shops"
                    description="Start adding shops to your favorites to see them here."
                    action={
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => navigate('/end-user/global-prices')}
                      >
                        Browse Shops
                      </button>
                    }
                  />
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {filteredShops.map(shop => (
                      <ShopCard
                        key={shop.id}
                        shop={shop}
                        onClick={() => {
                          // Navigate to shop details if available
                          navigate(`/end-user/product/${shop.id}/shops`);
                        }}
                        variant="default"
                        isFavorite={true}
                        showFavoriteButton={true}
                        onFavoriteToggle={handleShopFavoriteToggle}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Empty State for All */}
            {activeTab === 'all' && favoriteProducts.length === 0 && favoriteShops.length === 0 && (
              <EmptyState
                icon="⭐"
                title="No favorites yet"
                description="Start adding products and shops to your favorites to see them here."
                action={
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => navigate('/end-user/global-prices')}
                  >
                    Browse Products
                  </button>
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

