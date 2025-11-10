import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { getShopProductsForOwner } from '../services/PriceService';
import { addProductToShop, removeProductFromShop, updateShopProduct } from '../services/ShopProductService';
import { createPriceUpdate, getPriceHistory } from '../services/PriceUpdateService';
import { Product, ShopProduct } from '../types';
import { formatCurrency } from '../utils/format';
import { colors } from '../theme';

interface ShopProductWithDetails extends ShopProduct {
  productName: string;
  unit: string;
  description?: string;
}

export default function ShopProductManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<ShopProductWithDetails[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchCatalog, setSearchCatalog] = useState('');
  const [searchMaster, setSearchMaster] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<ReturnType<typeof getPriceHistory>>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const shop = useMemo(() => (user ? StorageService.getShopByOwnerId(user.id) : null), [user]);

  const loadCatalog = () => {
    if (!user) return;
    const items = getShopProductsForOwner(user.id).map(item => {
      const master = StorageService.getProductById(item.product_id) as Product | null;
      return {
        ...item,
        description: master?.description,
      };
    });
    setCatalog(items);
    if (!selectedProductId && items.length) {
      setSelectedProductId(items[0].id);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [user]);

  useEffect(() => {
    setProducts(StorageService.getProducts());
  }, []);

  useEffect(() => {
    if (!selectedProductId) {
      setPriceHistory([]);
      return;
    }
    setPriceHistory(getPriceHistory(selectedProductId).slice(0, 10));
  }, [selectedProductId]);

  const catalogFiltered = useMemo(() => {
    const query = searchCatalog.toLowerCase();
    if (!query) return catalog;
    return catalog.filter(item =>
      [item.productName, item.unit]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [catalog, searchCatalog]);

  const masterFiltered = useMemo(() => {
    const query = searchMaster.toLowerCase();
    const catalogIds = new Set(catalog.map(item => item.product_id));
    return products
      .filter(product => !catalogIds.has(product.id))
      .filter(product =>
        [product.name, product.category, product.unit]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, catalog, searchMaster]);

  const handleAddProduct = (productId: string) => {
    if (!shop) {
      setMessage('Register your shop before managing products.');
      return;
    }
    addProductToShop({ shopId: shop.id, productId });
    setMessage('Product added to catalog.');
    loadCatalog();
  };

  const handleRemoveProduct = (shopProductId: string) => {
    removeProductFromShop(shopProductId);
    setMessage('Product removed from catalog.');
    if (selectedProductId === shopProductId) {
      setSelectedProductId(null);
    }
    loadCatalog();
  };

  const handleToggleAvailability = (shopProductId: string, current: boolean) => {
    updateShopProduct(shopProductId, { isAvailable: !current });
    setMessage(`Product ${current ? 'disabled' : 'enabled'} successfully.`);
    loadCatalog();
  };

  const handleUpdatePrice = (shopProductId: string, value: string) => {
    if (!shop || !user) {
      setMessage('Shop not found.');
      return;
    }
    const num = parseFloat(value);
    if (Number.isNaN(num) || num <= 0) {
      setMessage('Enter a valid price.');
      return;
    }
    updateShopProduct(shopProductId, { currentPrice: num });
    createPriceUpdate({
      shopProductId,
      price: num,
      updatedById: user.id,
      updatedByType: 'shop_owner',
      paymentStatus: 'pending',
      paymentAmount: 1,
    });
    setMessage('Price updated successfully.');
    loadCatalog();
  };

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return catalog.find(item => item.id === selectedProductId) || null;
  }, [catalog, selectedProductId]);

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Product Management
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Add, remove, or update the products in your catalog.
              </p>
            </div>
            <button type="button" className="button button--outline" style={{ width: 'auto' }} onClick={() => navigate('/shop-owner/dashboard')}>
              Back to dashboard
            </button>
          </div>
          {message && <div className="form-info">{message}</div>}
        </header>

        <section className="surface-card" style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="action-row" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-field" style={{ flex: 1 }}>
              <label htmlFor="catalog-search">Search your catalog</label>
              <input
                id="catalog-search"
                className="form-input"
                type="text"
                placeholder="Search by name or unit"
                value={searchCatalog}
                onChange={event => setSearchCatalog(event.target.value)}
              />
            </div>
          </div>

          <div className="action-row" style={{ alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '280px' }}>
              <h2 style={{ marginBottom: '0.75rem' }}>Catalog</h2>
              {catalogFiltered.length === 0 ? (
                <p>No products in catalog. Add items from the master list.</p>
              ) : (
                <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                  <div className="table-container">
                    <table className="data-table" style={{ minWidth: '600px' }}>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalogFiltered.map(item => (
                          <tr key={item.id} onClick={() => setSelectedProductId(item.id)} style={{ cursor: 'pointer' }}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{item.productName}</div>
                              <div className="form-helper">{item.unit}</div>
                            </td>
                            <td>{item.current_price ? formatCurrency(item.current_price) : 'Not set'}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: 'var(--radius-pill)',
                                  backgroundColor: item.is_available ? colors.success : colors.error,
                                  color: '#fff',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {item.is_available ? 'Available' : 'Hidden'}
                              </span>
                            </td>
                            <td>
                              <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="button button--outline"
                                  style={{ width: 'auto', padding: '0.4rem 0.9rem' }}
                                  onClick={event => {
                                    event.stopPropagation();
                                    handleToggleAvailability(item.id, item.is_available);
                                  }}
                                >
                                  {item.is_available ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  type="button"
                                  className="button button--outline"
                                  style={{ width: 'auto', padding: '0.4rem 0.9rem', borderColor: colors.error, color: colors.error }}
                                  onClick={event => {
                                    event.stopPropagation();
                                    handleRemoveProduct(item.id);
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '260px' }}>
              <h2 style={{ marginBottom: '0.75rem' }}>Product details</h2>
              {selectedProduct ? (
                <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>{selectedProduct.productName}</div>
                  <div className="form-helper" style={{ marginBottom: '0.75rem' }}>
                    {selectedProduct.unit} • {selectedProduct.description || 'No description provided'}
                  </div>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <div>
                      <div className="form-helper">Current price</div>
                      <div style={{ fontWeight: 600 }}>{selectedProduct.current_price ? formatCurrency(selectedProduct.current_price) : 'Not set'}</div>
                    </div>
                    <div>
                      <label htmlFor="detail-price" className="form-helper" style={{ marginBottom: '0.25rem', display: 'block' }}>
                        Update price
                      </label>
                      <input
                        id="detail-price"
                        className="form-input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter new price"
                        onBlur={event => handleUpdatePrice(selectedProduct.id, event.target.value)}
                      />
                    </div>
                    <div>
                      <div className="form-helper">Price history</div>
                      {priceHistory.length === 0 ? (
                        <div className="form-helper">No updates yet.</div>
                      ) : (
                        <ul className="feature-list" style={{ gap: '0.25rem' }}>
                          {priceHistory.map(update => (
                            <li key={update.id}>
                              {formatCurrency(update.price)} · {new Date(update.created_at).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-helper">Select a product from your catalog to view details.</div>
              )}
            </div>
          </div>
        </section>

        <section className="surface-card">
          <div className="action-row" style={{ marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h2>Master Product List</h2>
            <div className="form-field" style={{ flex: 1, minWidth: '220px' }}>
              <label htmlFor="master-search">Search master list</label>
              <input
                id="master-search"
                className="form-input"
                type="text"
                placeholder="Search products"
                value={searchMaster}
                onChange={event => setSearchMaster(event.target.value)}
              />
            </div>
          </div>
          {masterFiltered.length === 0 ? (
            <p>No more products available to add.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {masterFiltered.map(product => (
                <div key={product.id} className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{product.name}</div>
                  <div className="form-helper" style={{ marginBottom: '0.75rem' }}>
                    {product.category.replace('_', ' ')} • {product.unit}
                  </div>
                  <button type="button" className="button button--primary" style={{ width: '120px' }} onClick={() => handleAddProduct(product.id)}>
                    Add to Catalog
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
