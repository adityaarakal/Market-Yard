import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllProducts, getProductsByCategory, searchProducts } from '../services/ProductService';
import { getGlobalPriceSummary, GlobalPriceEntry } from '../services/PriceService';
import { Product } from '../types';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';

const categories: Product['category'][] = ['fruits', 'vegetables', 'farming_materials', 'farming_products'];
const units: Product['unit'][] = ['kg', 'piece', 'pack', 'dozen', 'bunch', 'litre', 'gram'];

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'category_asc' | 'category_desc';
type FilterOption = {
  category?: Product['category'] | 'all';
  unit?: Product['unit'] | 'all';
  hasPrice?: boolean | 'all';
};

export default function ProductMasterListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [globalPrices, setGlobalPrices] = useState<GlobalPriceEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<FilterOption>({
    category: 'all',
    unit: 'all',
    hasPrice: 'all',
  });
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.includes(categoryParam as Product['category'])) {
      setFilters(prev => ({ ...prev, category: categoryParam as Product['category'] }));
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
    loadGlobalPrices();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const suggestions = searchProducts(searchQuery.trim()).slice(0, 5);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

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

  const loadGlobalPrices = () => {
    try {
      const prices = getGlobalPriceSummary();
      setGlobalPrices(prices);
    } catch (error) {
      console.error('Error loading global prices:', error);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    if (user?.user_type === 'end_user') {
      navigate(`/end-user/product/${product.id}`);
    }
  };

  const getProductPrice = (productId: string): GlobalPriceEntry | null => {
    return globalPrices.find(p => p.product.id === productId) || null;
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({ category: 'all', unit: 'all', hasPrice: 'all' });
    setSortOption('name_asc');
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    let filtered: Product[] = [];

    // If search query exists, use search function
    if (searchQuery.trim()) {
      filtered = searchProducts(searchQuery.trim());
    } else {
      // No search query, get all products or filter by category
      if (filters.category === 'all') {
        filtered = products;
      } else if (filters.category) {
        filtered = getProductsByCategory(filters.category);
      } else {
        filtered = products;
      }
    }

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.unit !== 'all') {
      filtered = filtered.filter(p => p.unit === filters.unit);
    }

    if (filters.hasPrice === true) {
      const productIdsWithPrice = new Set(globalPrices.filter(p => p.minPrice != null).map(p => p.product.id));
      filtered = filtered.filter(p => productIdsWithPrice.has(p.id));
    } else if (filters.hasPrice === false) {
      const productIdsWithPrice = new Set(globalPrices.filter(p => p.minPrice != null).map(p => p.product.id));
      filtered = filtered.filter(p => !productIdsWithPrice.has(p.id));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'category_asc':
          if (a.category === b.category) {
            return a.name.localeCompare(b.name);
          }
          return a.category.localeCompare(b.category);
        case 'category_desc':
          if (a.category === b.category) {
            return a.name.localeCompare(b.name);
          }
          return b.category.localeCompare(a.category);
        case 'price_asc':
          const aPrice = globalPrices.find(p => p.product.id === a.id)?.minPrice ?? Number.POSITIVE_INFINITY;
          const bPrice = globalPrices.find(p => p.product.id === b.id)?.minPrice ?? Number.POSITIVE_INFINITY;
          if (aPrice === bPrice) {
            return a.name.localeCompare(b.name);
          }
          return aPrice - bPrice;
        case 'price_desc':
          const aPriceDesc = globalPrices.find(p => p.product.id === a.id)?.minPrice ?? Number.NEGATIVE_INFINITY;
          const bPriceDesc = globalPrices.find(p => p.product.id === b.id)?.minPrice ?? Number.NEGATIVE_INFINITY;
          if (aPriceDesc === bPriceDesc) {
            return a.name.localeCompare(b.name);
          }
          return bPriceDesc - aPriceDesc;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, globalPrices, searchQuery, filters, sortOption]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    categories.forEach(cat => {
      counts[cat] = products.filter(p => p.category === cat).length;
    });
    return counts;
  }, [products]);

  const unitCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    units.forEach(unit => {
      counts[unit] = products.filter(p => p.unit === unit).length;
    });
    return counts;
  }, [products]);

  const hasActiveFilters = filters.category !== 'all' || filters.unit !== 'all' || filters.hasPrice !== 'all' || searchQuery.trim().length > 0;

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
              {hasActiveFilters && (
                <button
                  type="button"
                  className="button button--ghost"
                  style={{ width: 'auto' }}
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
              {(user?.user_type === 'admin' || user?.user_type === 'staff') && (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ width: 'auto' }}
                  onClick={() => {
                    loadProducts();
                    loadGlobalPrices();
                  }}
                >
                  Refresh
                </button>
              )}
            </div>
          </div>

          {/* Search Bar with Suggestions */}
          <div className="form-field" style={{ position: 'relative' }}>
            <label htmlFor="product-search">Search products</label>
            <input
              ref={searchInputRef}
              id="product-search"
              className="form-input"
              type="text"
              placeholder="Search by name, category, or description..."
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              onFocus={() => {
                if (searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="surface-card surface-card--compact"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  marginTop: '0.25rem',
                  boxShadow: 'var(--shadow-md)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {searchSuggestions.map(product => {
                  const priceEntry = getProductPrice(product.id);
                  return (
                    <div
                      key={product.id}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = colors.surface;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => handleSuggestionClick(product)}
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)',
                          }}
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</div>
                        <div className="form-helper" style={{ fontSize: '0.8rem' }}>
                          {product.category.replace('_', ' ')} • {product.unit}
                        </div>
                      </div>
                      {priceEntry && priceEntry.minPrice != null && (
                        <div style={{ fontWeight: 700, color: colors.primary, fontSize: '0.9rem' }}>
                          {formatCurrency(priceEntry.minPrice)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
              Category
            </label>
            <div className="segmented-control" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className={`segmented-control__button${filters.category === 'all' ? ' segmented-control__button--active' : ''}`}
                onClick={() => {
                  setFilters(prev => ({ ...prev, category: 'all' }));
                  setSearchParams({});
                }}
              >
                All ({categoryCounts.all})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  className={`segmented-control__button${filters.category === category ? ' segmented-control__button--active' : ''}`}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category }));
                    setSearchParams({ category });
                  }}
                >
                  {category.replace('_', ' ')} ({categoryCounts[category]})
                </button>
              ))}
            </div>
          </div>

          {/* Filter Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Unit Filter */}
            <div className="form-field">
              <label htmlFor="unit-filter">Filter by Unit</label>
              <select
                id="unit-filter"
                className="form-select"
                value={filters.unit || 'all'}
                onChange={e => setFilters(prev => ({ ...prev, unit: e.target.value === 'all' ? 'all' : (e.target.value as Product['unit']) }))}
              >
                <option value="all">All Units ({unitCounts.all})</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit} ({unitCounts[unit]})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Availability Filter */}
            <div className="form-field">
              <label htmlFor="price-filter">Price Availability</label>
              <select
                id="price-filter"
                className="form-select"
                value={filters.hasPrice === true ? 'yes' : filters.hasPrice === false ? 'no' : 'all'}
                onChange={e => {
                  const value = e.target.value;
                  setFilters(prev => ({
                    ...prev,
                    hasPrice: value === 'yes' ? true : value === 'no' ? false : 'all',
                  }));
                }}
              >
                <option value="all">All Products</option>
                <option value="yes">With Prices</option>
                <option value="no">Without Prices</option>
              </select>
            </div>

            {/* Sort Option */}
            <div className="form-field">
              <label htmlFor="sort-option">Sort By</label>
              <select
                id="sort-option"
                className="form-select"
                value={sortOption}
                onChange={e => setSortOption(e.target.value as SortOption)}
              >
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="category_asc">Category: A to Z</option>
                <option value="category_desc">Category: Z to A</option>
              </select>
            </div>
          </div>
        </header>

        <section className="surface-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No products found matching your criteria.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ marginTop: '1rem' }}
                  onClick={handleClearFilters}
                >
                  Clear Filters
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
                  gap: '1.5rem',
                }}
              >
                {filteredProducts.map(product => {
                  const priceEntry = getProductPrice(product.id);
                  return (
                    <div
                      key={product.id}
                      className="surface-card surface-card--compact"
                      style={{
                        boxShadow: 'var(--shadow-soft)',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                      }}
                      onClick={() => {
                        if (user?.user_type === 'end_user') {
                          navigate(`/end-user/product/${product.id}`);
                        }
                      }}
                    >
                      {/* Product Image */}
                      <div
                        style={{
                          width: '100%',
                          height: '200px',
                          overflow: 'hidden',
                          backgroundColor: colors.surface,
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
                            fontSize: '4rem',
                            color: colors.textSecondary,
                            backgroundColor: colors.surface,
                          }}
                        >
                          🛒
                        </div>
                      </div>

                      {/* Product Info */}
                      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
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
                        </div>

                        {/* Price Information */}
                        {priceEntry && priceEntry.minPrice != null ? (
                          <div>
                            <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                              Best Price
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary }}>
                              {formatCurrency(priceEntry.minPrice)}
                            </div>
                            {priceEntry.minPrice !== priceEntry.maxPrice && (
                              <div className="form-helper" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                Range: {formatCurrency(priceEntry.minPrice)} - {formatCurrency(priceEntry.maxPrice)}
                              </div>
                            )}
                            {priceEntry.bestShop && (
                              <div className="form-helper" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                Best: {priceEntry.bestShop.shop_name}
                              </div>
                            )}
                            {priceEntry.shopCount > 0 && (
                              <div className="form-helper" style={{ fontSize: '0.8rem' }}>
                                Available at {priceEntry.shopCount} {priceEntry.shopCount === 1 ? 'shop' : 'shops'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                            No pricing data available
                          </div>
                        )}

                        {/* Description */}
                        {product.description && (
                          <div className="form-helper" style={{ fontSize: '0.85rem', lineHeight: 1.5, marginTop: 'auto' }}>
                            {product.description.length > 100
                              ? product.description.substring(0, 100) + '...'
                              : product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

