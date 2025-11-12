import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPriceComparison, getShopsSellingProducts, getProductsAvailableAtShops } from '../services/PriceComparisonService';
import { getAllProducts } from '../services/ProductService';
import { getAllShops } from '../services/ShopService';
import { Product, Shop } from '../types';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';

export default function AdvancedPriceComparisonPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedShopIds, setSelectedShopIds] = useState<Set<string>>(new Set());
  const [comparisonData, setComparisonData] = useState<ReturnType<typeof getPriceComparison> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [searchShopQuery, setSearchShopQuery] = useState('');
  const [productFilter, setProductFilter] = useState<Product['category'] | 'all'>('all');

  // Check if user is premium
  const isPremium = user?.is_premium ?? false;

  // Load initial data
  useEffect(() => {
    setLoading(true);
    try {
      const products = getAllProducts().filter(p => p.is_active);
      const shops = getAllShops().filter(s => s.is_active);
      setAllProducts(products);
      setAllShops(shops);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update comparison when selection changes
  useEffect(() => {
    if (selectedProductIds.size > 0 && selectedShopIds.size > 0) {
      const data = getPriceComparison(Array.from(selectedProductIds), Array.from(selectedShopIds));
      setComparisonData(data);
    } else {
      setComparisonData(null);
    }
  }, [selectedProductIds, selectedShopIds]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by category
    if (productFilter !== 'all') {
      filtered = filtered.filter(p => p.category === productFilter);
    }

    // Filter by search query
    if (searchProductQuery.trim()) {
      const query = searchProductQuery.toLowerCase();
      filtered = filtered.filter(p =>
        [p.name, p.category, p.unit, p.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
    }

    return filtered;
  }, [allProducts, productFilter, searchProductQuery]);

  // Filter shops
  const filteredShops = useMemo(() => {
    let filtered = allShops;

    // Filter by search query
    if (searchShopQuery.trim()) {
      const query = searchShopQuery.toLowerCase();
      filtered = filtered.filter(s =>
        [s.shop_name, s.address, s.city, s.state, s.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
    }

    // If products are selected, show only shops that sell at least one selected product
    if (selectedProductIds.size > 0) {
      const shopsSellingProducts = getShopsSellingProducts(Array.from(selectedProductIds));
      const shopIds = new Set(shopsSellingProducts.map(s => s.id));
      filtered = filtered.filter(s => shopIds.has(s.id));
    }

    return filtered;
  }, [allShops, searchShopQuery, selectedProductIds]);

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProductIds(newSelected);
  };

  // Toggle shop selection
  const toggleShop = (shopId: string) => {
    const newSelected = new Set(selectedShopIds);
    if (newSelected.has(shopId)) {
      newSelected.delete(shopId);
    } else {
      newSelected.add(shopId);
    }
    setSelectedShopIds(newSelected);
  };

  // Select all filtered products
  const selectAllProducts = () => {
    const newSelected = new Set(selectedProductIds);
    filteredProducts.forEach(p => newSelected.add(p.id));
    setSelectedProductIds(newSelected);
  };

  // Deselect all products
  const deselectAllProducts = () => {
    setSelectedProductIds(new Set());
  };

  // Select all filtered shops
  const selectAllShops = () => {
    const newSelected = new Set(selectedShopIds);
    filteredShops.forEach(s => newSelected.add(s.id));
    setSelectedShopIds(newSelected);
  };

  // Deselect all shops
  const deselectAllShops = () => {
    setSelectedShopIds(new Set());
  };

  // Get cell data for a product-shop combination
  const getCellData = (productId: string, shopId: string) => {
    if (!comparisonData) return null;
    return comparisonData.cells.find(c => c.productId === productId && c.shopId === shopId);
  };

  // Export comparison to CSV
  const handleExport = () => {
    if (!comparisonData) return;

    const headers = ['Product', 'Unit', ...comparisonData.shops.map(s => s.shop_name)];
    const rows = comparisonData.products.map(product => {
      const row = [product.name, product.unit];
      comparisonData.shops.forEach(shop => {
        const cell = getCellData(product.id, shop.id);
        if (cell && cell.price !== null) {
          row.push(formatCurrency(cell.price));
        } else {
          row.push('N/A');
        }
      });
      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `price_comparison_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  // Redirect if not premium
  if (!isPremium) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">
              <h2>Premium Feature</h2>
              <p>Advanced price comparison is only available for Premium users.</p>
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

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Advanced Price Comparison
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Compare prices across multiple products and shops side-by-side.
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

        {/* Product Selection */}
        <section className="surface-card">
          <div className="action-row" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>Select Products ({selectedProductIds.size} selected)</h2>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
              <button
                type="button"
                className="button button--ghost"
                style={{ width: 'auto' }}
                onClick={selectAllProducts}
              >
                Select All
              </button>
              <button
                type="button"
                className="button button--ghost"
                style={{ width: 'auto' }}
                onClick={deselectAllProducts}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Product Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-field">
              <label htmlFor="product-search">Search Products</label>
              <input
                id="product-search"
                className="form-input"
                type="text"
                placeholder="Search by name, category, or description..."
                value={searchProductQuery}
                onChange={e => setSearchProductQuery(e.target.value)}
              />
            </div>

            <div className="segmented-control" style={{ flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`segmented-control__button${productFilter === 'all' ? ' segmented-control__button--active' : ''}`}
                onClick={() => setProductFilter('all')}
              >
                All Categories
              </button>
              {(['fruits', 'vegetables', 'farming_materials', 'farming_products'] as Product['category'][]).map(category => (
                <button
                  key={category}
                  type="button"
                  className={`segmented-control__button${productFilter === category ? ' segmented-control__button--active' : ''}`}
                  onClick={() => setProductFilter(category)}
                >
                  {category.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Product List */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '0.75rem',
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '0.5rem',
            }}
          >
            {filteredProducts.map(product => (
              <label
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedProductIds.has(product.id) ? colors.primary : colors.border}`,
                  backgroundColor: selectedProductIds.has(product.id) ? `${colors.primary}15` : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProductIds.has(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                    {product.category.replace('_', ' ')} • {product.unit}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary }}>
              No products found matching your criteria.
            </div>
          )}
        </section>

        {/* Shop Selection */}
        <section className="surface-card">
          <div className="action-row" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>Select Shops ({selectedShopIds.size} selected)</h2>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
              <button
                type="button"
                className="button button--ghost"
                style={{ width: 'auto' }}
                onClick={selectAllShops}
              >
                Select All
              </button>
              <button
                type="button"
                className="button button--ghost"
                style={{ width: 'auto' }}
                onClick={deselectAllShops}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Shop Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <div className="form-field">
              <label htmlFor="shop-search">Search Shops</label>
              <input
                id="shop-search"
                className="form-input"
                type="text"
                placeholder="Search by name, address, or category..."
                value={searchShopQuery}
                onChange={e => setSearchShopQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Shop List */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '0.75rem',
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '0.5rem',
            }}
          >
            {filteredShops.map(shop => (
              <label
                key={shop.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedShopIds.has(shop.id) ? colors.primary : colors.border}`,
                  backgroundColor: selectedShopIds.has(shop.id) ? `${colors.primary}15` : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedShopIds.has(shop.id)}
                  onChange={() => toggleShop(shop.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{shop.shop_name}</div>
                  <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                    {shop.category.replace('_', ' ')} • {shop.city || 'N/A'}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {filteredShops.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary }}>
              {selectedProductIds.size > 0
                ? 'No shops found selling the selected products.'
                : 'No shops found matching your criteria.'}
            </div>
          )}
        </section>

        {/* Comparison Table */}
        {comparisonData && comparisonData.products.length > 0 && comparisonData.shops.length > 0 && (
          <section className="surface-card">
            <div className="action-row" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>
                Price Comparison ({comparisonData.products.length} products × {comparisonData.shops.length} shops)
              </h2>
              <button
                type="button"
                className="button button--primary"
                style={{ width: 'auto', marginLeft: 'auto' }}
                onClick={handleExport}
              >
                Export CSV
              </button>
            </div>

            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '600px' }}>
              <table className="data-table" style={{ minWidth: '800px' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: colors.white, zIndex: 10 }}>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, backgroundColor: colors.white, zIndex: 11, textAlign: 'left' }}>
                      Product
                    </th>
                    <th style={{ textAlign: 'center' }}>Unit</th>
                    {comparisonData.shops.map(shop => (
                      <th key={shop.id} style={{ textAlign: 'center', minWidth: '150px' }}>
                        <div style={{ fontWeight: 600 }}>{shop.shop_name}</div>
                        <div className="form-helper" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {shop.category.replace('_', ' ')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.products.map(product => (
                    <tr key={product.id}>
                      <td
                        style={{
                          position: 'sticky',
                          left: 0,
                          backgroundColor: colors.white,
                          zIndex: 9,
                          fontWeight: 600,
                        }}
                      >
                        {product.name}
                      </td>
                      <td style={{ textAlign: 'center' }}>{product.unit}</td>
                      {comparisonData.shops.map(shop => {
                        const cell = getCellData(product.id, shop.id);
                        if (!cell) {
                          return (
                            <td key={shop.id} style={{ textAlign: 'center' }}>
                              <div className="form-helper">N/A</div>
                            </td>
                          );
                        }

                        const isBestPrice = cell.isBestPrice && cell.price !== null;
                        const backgroundColor = isBestPrice ? `${colors.success}20` : 'transparent';
                        const borderColor = isBestPrice ? colors.success : 'transparent';

                        return (
                          <td
                            key={shop.id}
                            style={{
                              textAlign: 'center',
                              backgroundColor,
                              border: `2px solid ${borderColor}`,
                              fontWeight: isBestPrice ? 700 : 600,
                              color: isBestPrice ? colors.success : colors.text,
                              position: 'relative',
                            }}
                          >
                            {cell.price !== null ? (
                              <>
                                <div>{formatCurrency(cell.price)}</div>
                                {isBestPrice && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: '-8px',
                                      right: '-8px',
                                      backgroundColor: colors.success,
                                      color: colors.white,
                                      borderRadius: '50%',
                                      width: '20px',
                                      height: '20px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    ✓
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="form-helper">Not available</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div
              className="surface-card surface-card--compact"
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: `${colors.success}20`,
                    border: `2px solid ${colors.success}`,
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
                <span className="form-helper">Best price for this product</span>
              </div>
              <div className="form-helper" style={{ fontSize: '0.85rem' }}>
                💡 Tip: Green highlight indicates the best price for each product across all selected shops.
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!comparisonData || comparisonData.products.length === 0 || comparisonData.shops.length === 0) && (
          <section className="surface-card">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>No Comparison Available</h3>
              <p style={{ marginBottom: '1.5rem', color: colors.textSecondary }}>
                {selectedProductIds.size === 0 && selectedShopIds.size === 0
                  ? 'Please select at least one product and one shop to compare prices.'
                  : selectedProductIds.size === 0
                  ? 'Please select at least one product to compare prices.'
                  : 'Please select at least one shop to compare prices.'}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

