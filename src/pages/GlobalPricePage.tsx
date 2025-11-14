import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import { getGlobalPriceSummary, GlobalPriceEntry } from '../services/PriceService';
import { Product } from '../types';
import { formatCurrency } from '../utils/format';
import SearchInput from '../components/forms/SearchInput';
import { saveSearchHistory } from '../services/SearchService';

type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
type CategoryFilter = Product['category'] | 'all';

export default function GlobalPricePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [globalPrices, setGlobalPrices] = useState<GlobalPriceEntry[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<GlobalPriceEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('price_asc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories: Product['category'][] = ['fruits', 'vegetables', 'farming_materials', 'farming_products'];

  const loadPrices = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      // Clear cache and reload
      const prices = getGlobalPriceSummary();
      setGlobalPrices(prices);
    } catch (error) {
      console.error('Error loading prices:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrices();
    const handleStorageChange = () => loadPrices();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter and sort prices
  useEffect(() => {
    let filtered = [...globalPrices];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        [entry.product.name, entry.product.category, entry.product.unit]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
    }

    // Filter out products with no pricing data
    filtered = filtered.filter(entry => entry.minPrice != null);

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'price_asc':
          const aPrice = a.minPrice ?? Number.POSITIVE_INFINITY;
          const bPrice = b.minPrice ?? Number.POSITIVE_INFINITY;
          if (aPrice === bPrice) {
            return a.product.name.localeCompare(b.product.name);
          }
          return aPrice - bPrice;
        case 'price_desc':
          const aPriceDesc = a.minPrice ?? Number.NEGATIVE_INFINITY;
          const bPriceDesc = b.minPrice ?? Number.NEGATIVE_INFINITY;
          if (aPriceDesc === bPriceDesc) {
            return a.product.name.localeCompare(b.product.name);
          }
          return bPriceDesc - aPriceDesc;
        case 'name_asc':
          return a.product.name.localeCompare(b.product.name);
        case 'name_desc':
          return b.product.name.localeCompare(a.product.name);
        default:
          return 0;
      }
    });

    setFilteredPrices(filtered);
  }, [globalPrices, selectedCategory, searchQuery, sortOption]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: globalPrices.filter(p => p.minPrice != null).length };
    categories.forEach(cat => {
      counts[cat] = globalPrices.filter(p => p.product.category === cat && p.minPrice != null).length;
    });
    return counts;
  }, [globalPrices]);

  const handleRefresh = () => {
    loadPrices();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortOption('price_asc');
  };

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'price_asc':
        return 'Price: Low to High';
      case 'price_desc':
        return 'Price: High to Low';
      case 'name_asc':
        return 'Name: A to Z';
      case 'name_desc':
        return 'Name: Z to A';
      default:
        return 'Sort';
    }
  };

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Global Prices
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Compare prices across all Market Yard shops
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/end-user/home')}
              >
                Back
              </button>
              <button
                type="button"
                className="button button--primary"
                style={{ width: 'auto' }}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="form-field">
            <label htmlFor="price-search">Search Products</label>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(query) => {
                if (user) {
                  saveSearchHistory(user.id, query, filteredPrices.length);
                }
              }}
              placeholder="Search products by name, category, or unit..."
              showSuggestions={true}
              showHistory={true}
              showPopular={true}
            />
          </div>

          {/* Category Filter */}
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

          {/* Sort Options */}
          <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label htmlFor="sort-select" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Sort by:
            </label>
            <select
              id="sort-select"
              className="form-select"
              value={sortOption}
              onChange={e => setSortOption(e.target.value as SortOption)}
              style={{ flex: 1, minWidth: '180px', maxWidth: '250px' }}
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
            {(searchQuery || selectedCategory !== 'all' || sortOption !== 'price_asc') && (
              <button
                type="button"
                className="button button--ghost"
                style={{ width: 'auto' }}
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </header>

        {/* Results Count */}
        {filteredPrices.length > 0 && (
          <div className="surface-card surface-card--compact">
            <div className="form-helper" style={{ textAlign: 'left' }}>
              Showing {filteredPrices.length} {filteredPrices.length === 1 ? 'product' : 'products'}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory.replace('_', ' ')}`}
            </div>
          </div>
        )}

        {/* Product Cards */}
        <section className="surface-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading prices...</div>
          ) : filteredPrices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No products found matching your criteria.</p>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  type="button"
                  className="button button--ghost"
                  style={{ marginTop: '1rem' }}
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {filteredPrices.map(entry => (
                <div
                  key={entry.product.id}
                  className="surface-card surface-card--compact"
                  style={{
                    boxShadow: 'var(--shadow-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
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
                  onClick={() => {
                    navigate(`/end-user/product/${entry.product.id}`);
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
                        fontSize: '3rem',
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
                        {entry.product.name}
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
                          {entry.product.category.replace('_', ' ')}
                        </span>
                        <span>• {entry.product.unit}</span>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                          Best Price
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary }}>
                          {formatCurrency(entry.minPrice)}
                        </div>
                      </div>

                      {entry.minPrice !== entry.maxPrice && (
                        <div>
                          <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                            Price Range
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                            {formatCurrency(entry.minPrice)} - {formatCurrency(entry.maxPrice)}
                          </div>
                        </div>
                      )}

                      {entry.avgPrice && entry.minPrice !== entry.maxPrice && (
                        <div>
                          <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                            Average Price
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                            {formatCurrency(entry.avgPrice)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Best Shop */}
                    {entry.bestShop && (
                      <div
                        style={{
                          padding: '0.75rem',
                          backgroundColor: colors.surface,
                          borderRadius: 'var(--radius-md)',
                          marginTop: 'auto',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                          Best Value Shop
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{entry.bestShop.shop_name}</div>
                        {entry.shopCount > 1 && (
                          <div className="form-helper" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            +{entry.shopCount - 1} more {entry.shopCount - 1 === 1 ? 'shop' : 'shops'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Shop Count */}
                    {!entry.bestShop && entry.shopCount > 0 && (
                      <div className="form-helper" style={{ fontSize: '0.85rem', marginTop: 'auto' }}>
                        Available at {entry.shopCount} {entry.shopCount === 1 ? 'shop' : 'shops'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

