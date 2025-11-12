import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllProducts, getProductsByCategory, searchProducts } from '../services/ProductService';
import { Product } from '../types';
import { colors } from '../theme';

const categories: Product['category'][] = ['fruits', 'vegetables', 'farming_materials', 'farming_products'];

export default function ProductMasterListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Product['category'] | 'all'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    try {
      const allProducts = getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered: Product[] = [];

    // If search query exists, use search function
    if (searchQuery.trim()) {
      filtered = searchProducts(searchQuery.trim());
      // If category is selected, filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
    } else {
      // No search query, filter by category only
      if (selectedCategory === 'all') {
        filtered = products;
      } else {
        filtered = getProductsByCategory(selectedCategory);
      }
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchQuery, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    categories.forEach(cat => {
      counts[cat] = products.filter(p => p.category === cat).length;
    });
    return counts;
  }, [products]);

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Product Master List
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Browse and search all available products in the Market Yard.
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
              {(user?.user_type === 'admin' || user?.user_type === 'staff') && (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ width: 'auto' }}
                  onClick={loadProducts}
                >
                  Refresh
                </button>
              )}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="product-search">Search products</label>
            <input
              id="product-search"
              className="form-input"
              type="text"
              placeholder="Search by name, category, or description..."
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="segmented-control" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className={`segmented-control__button${selectedCategory === 'all' ? ' segmented-control__button--active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All ({categoryCounts.all})
            </button>
            {categories.map(category => (
              <button
                key={category}
                type="button"
                className={`segmented-control__button${selectedCategory === category ? ' segmented-control__button--active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.replace('_', ' ')} ({categoryCounts[category]})
              </button>
            ))}
          </div>
        </header>

        <section className="surface-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No products found.</p>
              {searchQuery && (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="action-row" style={{ marginBottom: '1rem' }}>
                <h2>Products ({filteredProducts.length})</h2>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="surface-card surface-card--compact"
                    style={{
                      boxShadow: 'var(--shadow-soft)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {product.image_url && (
                      <div
                        style={{
                          width: '100%',
                          height: '180px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          backgroundColor: colors.surface,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
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
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        {product.name}
                      </div>
                      <div className="form-helper" style={{ marginBottom: '0.5rem' }}>
                        <span
                          className="welcome-option__tag"
                          style={{
                            background: 'rgba(76, 175, 80, 0.1)',
                            color: colors.primary,
                            fontSize: '0.75rem',
                            marginRight: '0.5rem',
                          }}
                        >
                          {product.category.replace('_', ' ')}
                        </span>
                        <span>• {product.unit}</span>
                      </div>
                      {product.description && (
                        <div className="form-helper" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

