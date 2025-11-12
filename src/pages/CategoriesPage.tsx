import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllProducts, getProductsByCategory } from '../services/ProductService';
import { Product } from '../types';
import { colors } from '../theme';

const categories: Product['category'][] = ['fruits', 'vegetables', 'farming_materials', 'farming_products'];

interface CategoryInfo {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  productCount: number;
  imageUrl?: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const allProducts = getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading categories data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryData: Record<string, { displayName: string; icon: string; color: string; imageUrl?: string }> = useMemo(
    () => ({
      fruits: {
        displayName: 'Fruits',
        icon: '🍎',
        color: '#FF6B6B',
        imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
      },
      vegetables: {
        displayName: 'Vegetables',
        icon: '🥕',
        color: '#4ECDC4',
        imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
      },
      farming_materials: {
        displayName: 'Farming Materials',
        icon: '🌾',
        color: '#FFE66D',
        imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
      },
      farming_products: {
        displayName: 'Farming Products',
        icon: '🚜',
        color: '#95E1D3',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      },
    }),
    []
  );

  const categoriesWithCounts: CategoryInfo[] = useMemo(() => {
    if (!products.length) return [];

    return categories.map(categoryId => {
      const categoryProducts = getProductsByCategory(categoryId);

      const categoryInfo = categoryData[categoryId];
      return {
        id: categoryId,
        name: categoryId,
        displayName: categoryInfo.displayName,
        icon: categoryInfo.icon,
        color: categoryInfo.color,
        productCount: categoryProducts.length,
        imageUrl: categoryInfo.imageUrl,
      };
    });
  }, [products, categoryData]);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  };

  const totalProducts = useMemo(() => products.length, [products]);

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Categories
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Browse products by category. {totalProducts} products available across {categories.length} categories.
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate(user?.user_type === 'shop_owner' ? '/shop-owner/dashboard' : '/end-user/home')}
              >
                Back
              </button>
              <div className="segmented-control" style={{ width: 'auto' }}>
                <button
                  type="button"
                  className={`segmented-control__button${viewMode === 'grid' ? ' segmented-control__button--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  Grid
                </button>
                <button
                  type="button"
                  className={`segmented-control__button${viewMode === 'list' ? ' segmented-control__button--active' : ''}`}
                  onClick={() => setViewMode('list')}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Categories Grid/List View */}
        <section className="surface-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading categories...</div>
          ) : categoriesWithCounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No categories available.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {categoriesWithCounts.map(category => (
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
                    padding: 0,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    background: '#fff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
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
                  {/* Category Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      overflow: 'hidden',
                      backgroundColor: category.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.displayName}
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
                            const fallback = parent.querySelector('.category-icon-fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="category-icon-fallback"
                      style={{
                        display: category.imageUrl ? 'none' : 'flex',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '5rem',
                        backgroundColor: category.color + '20',
                      }}
                    >
                      {category.icon}
                    </div>
                    {/* Category Icon Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      {category.icon}
                    </div>
                  </div>

                  {/* Category Info */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.25rem', color: colors.text }}>
                        {category.displayName}
                      </div>
                      <div className="form-helper" style={{ fontSize: '0.9rem' }}>
                        {category.productCount} {category.productCount === 1 ? 'product' : 'products'} available
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: colors.surface,
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        color: colors.textSecondary,
                      }}
                    >
                      Browse {category.productCount} {category.productCount === 1 ? 'product' : 'products'} in this category
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categoriesWithCounts.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className="surface-card surface-card--compact"
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    boxShadow: 'var(--shadow-soft)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '1.25rem',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                >
                  {/* Category Icon */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: category.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {category.icon}
                  </div>

                  {/* Category Image (small) */}
                  {category.imageUrl && (
                    <div
                      style={{
                        width: '100px',
                        height: '80px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        backgroundColor: colors.surface,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={category.imageUrl}
                        alt={category.displayName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Category Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: colors.text }}>
                      {category.displayName}
                    </div>
                    <div className="form-helper" style={{ fontSize: '0.9rem' }}>
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'} available
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div style={{ fontSize: '1.5rem', color: colors.textSecondary, flexShrink: 0 }}>→</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* All Categories Summary */}
        <section className="surface-card surface-card--compact">
          <h2 style={{ marginBottom: '1rem' }}>All Categories Summary</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {categoriesWithCounts.map(category => (
              <div
                key={category.id}
                className="surface-card surface-card--compact"
                style={{
                  boxShadow: 'var(--shadow-soft)',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{category.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{category.displayName}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: category.color, marginBottom: '0.25rem' }}>
                  {category.productCount}
                </div>
                <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                  {category.productCount === 1 ? 'product' : 'products'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

