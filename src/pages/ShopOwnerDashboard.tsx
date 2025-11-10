import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import StorageService from '../services/StorageService';
import { getShopProductsForOwner } from '../services/PriceService';
import { Product, ShopProduct } from '../types';
import { generateId } from '../utils/id';
import { formatCurrency } from '../utils/format';
import { calculateEarnings, getPriceHistory, getPriceUpdatesByShop } from '../services/PriceUpdateService';

interface ShopProductWithDetails extends ShopProduct {
  productName: string;
  unit: string;
}

interface EarningsSummary {
  total: number;
  paid: number;
  pending: number;
}

export default function ShopOwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [shopProducts, setShopProducts] = useState<ShopProductWithDetails[]>([]);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [newPrices, setNewPrices] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [earnings, setEarnings] = useState<EarningsSummary>({ total: 0, paid: 0, pending: 0 });
  const [recentUpdates, setRecentUpdates] = useState<ReturnType<typeof getPriceHistory>>([]);

  const shop = useMemo(() => (user ? StorageService.getShopByOwnerId(user.id) : null), [user]);

  useEffect(() => {
    if (user) {
      const products = getShopProductsForOwner(user.id);
      setShopProducts(products);
      if (shop) {
        setEarnings(calculateEarnings(shop.id));
        setRecentUpdates(getPriceUpdatesByShop(shop.id).slice(0, 5));
      }
    }
  }, [user, shop?.id]);

  useEffect(() => {
    setAllProducts(StorageService.getProducts());
  }, []);

  const catalogProductIds = useMemo(() => new Set(shopProducts.map(sp => sp.product_id)), [shopProducts]);

  const availableProducts = useMemo(() => {
    return allProducts
      .filter(product => !catalogProductIds.has(product.id))
      .filter(product =>
        [product.name, product.category, product.unit]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts, catalogProductIds, searchTerm]);

  const handlePriceChange = (productId: string, value: string) => {
    setNewPrices(prev => ({ ...prev, [productId]: value }));
  };

  const refreshCatalog = () => {
    if (user) {
      const products = getShopProductsForOwner(user.id);
      setShopProducts(products);
      if (shop) {
        setEarnings(calculateEarnings(shop.id));
        setRecentUpdates(getPriceUpdatesByShop(shop.id).slice(0, 5));
      }
    }
  };

  const handlePriceUpdate = (productId: string) => {
    if (!shop) {
      setMessage('Shop not found.');
      return;
    }

    const priceValue = parseFloat(newPrices[productId]);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setMessage('Enter a valid price.');
      return;
    }

    setUpdatingProductId(productId);

    const existingShopProduct = StorageService
      .getShopProductsByShopId(shop.id)
      .find(sp => sp.product_id === productId);

    const now = new Date().toISOString();
    const shopProduct: ShopProduct = existingShopProduct || {
      id: generateId('shop_product', productId),
      shop_id: shop.id,
      product_id: productId,
      is_available: true,
      created_at: now,
      updated_at: now,
    };

    shopProduct.current_price = priceValue;
    shopProduct.last_price_update_at = now;
    shopProduct.updated_at = now;

    StorageService.saveShopProduct(shopProduct);

    StorageService.savePriceUpdate({
      id: generateId('price_update', shopProduct.id),
      shop_product_id: shopProduct.id,
      price: priceValue,
      updated_by_type: 'shop_owner',
      updated_by_id: user?.id || 'unknown',
      payment_status: 'pending',
      payment_amount: 1,
      created_at: now,
    });

    refreshCatalog();
    setUpdatingProductId(null);
    setMessage('Price updated successfully.');
  };

  const handleAddProduct = (productId: string) => {
    if (!shop) {
      setMessage('Shop not found.');
      return;
    }

    const now = new Date().toISOString();
    const shopProduct: ShopProduct = {
      id: generateId('shop_product', productId),
      shop_id: shop.id,
      product_id: productId,
      is_available: true,
      created_at: now,
      updated_at: now,
    };

    StorageService.saveShopProduct(shopProduct);
    refreshCatalog();
    setMessage('Product added to your catalog. Set a price to make it live.');
  };

  const handleRemoveProduct = (shopProductId: string) => {
    StorageService.removeShopProduct(shopProductId);
    refreshCatalog();
    setMessage('Product removed from your catalog.');
  };

  const handleToggleAvailability = (shopProductId: string, current: boolean) => {
    StorageService.setShopProductAvailability(shopProductId, !current);
    refreshCatalog();
    setMessage(`Product ${current ? 'disabled' : 'enabled'} successfully.`);
  };

  const summaryCards = [
    {
      title: 'Total Products',
      value: shopProducts.length,
      helper: 'In your catalog',
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(earnings.total || 0),
      helper: `${formatCurrency(earnings.pending || 0)} pending` ,
    },
    {
      title: 'Paid Earnings',
      value: formatCurrency(earnings.paid || 0),
      helper: 'Paid to date',
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.75rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.5rem)', textAlign: 'left' }}>
                Shop Owner Dashboard
              </h1>
              {shop ? (
                <div className="form-helper" style={{ textAlign: 'left' }}>
                  Managing: {shop.shop_name} ({shop.category})
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-error" style={{ margin: 0 }}>No shop found for this account.</div>
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ width: 'auto' }}
                    onClick={() => navigate('/shop-owner/register')}
                  >
                    Register your shop
                  </button>
                </div>
              )}
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="button button--outline" style={{ width: 'auto' }} onClick={() => navigate('/profile')}>
                Profile
              </button>
              <button type="button" className="button button--primary" style={{ width: 'auto' }} onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          {message && <div className="form-info">{message}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {summaryCards.map(card => (
              <div key={card.title} className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ fontSize: '0.95rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>{card.title}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{card.value}</div>
                <div className="form-helper" style={{ marginTop: '0.35rem' }}>{card.helper}</div>
              </div>
            ))}
          </div>

          <div className="action-row" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="button button--primary" style={{ width: 'auto' }} onClick={() => navigate('/shop-owner/register')}>
              Edit shop details
            </button>
            <button type="button" className="button button--outline" style={{ width: 'auto' }} onClick={() => navigate('/shop-owner/dashboard')}>
              Update prices
            </button>
            <button type="button" className="button button--ghost" style={{ width: 'auto' }} onClick={() => navigate('/end-user/home')}>
              View as customer
            </button>
          </div>
        </header>

        {recentUpdates.length > 0 && (
          <section className="surface-card surface-card--compact">
            <div className="action-row" style={{ marginBottom: '1rem' }}>
              <h2>Recent Price Updates</h2>
              <span className="form-helper">Last {recentUpdates.length} updates</span>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {recentUpdates.map(update => {
                const relatedProduct = shopProducts.find(sp => sp.id === update.shop_product_id);
                return (
                  <div key={update.id} className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{relatedProduct?.productName || 'Product removed'}</div>
                        <div className="form-helper">
                          Updated at {new Date(update.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: colors.primary }}>{formatCurrency(update.price)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Your Catalog</h2>
          {shopProducts.length === 0 ? (
            <p>No products found. Add products from the list below.</p>
          ) : (
            <div className="table-container">
              <table className="data-table" style={{ minWidth: '720px' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shopProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{product.productName}</div>
                        <div className="form-helper" style={{ marginTop: '0.25rem' }}>{product.unit}</div>
                      </td>
                      <td>
                        <div style={{ marginBottom: '0.5rem' }}>
                          {product.current_price ? formatCurrency(product.current_price) : 'Not set'}
                        </div>
                        <div className="action-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                          <input
                            className="form-input"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter price"
                            value={newPrices[product.product_id] || ''}
                            onChange={e => handlePriceChange(product.product_id, e.target.value)}
                            style={{ width: '140px', marginBottom: 0 }}
                          />
                          <button
                            type="button"
                            className="button button--primary"
                            style={{ width: 'auto' }}
                            disabled={updatingProductId === product.product_id}
                            onClick={() => handlePriceUpdate(product.product_id)}
                          >
                            {updatingProductId === product.product_id ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: product.is_available ? colors.success : colors.error,
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {product.is_available ? 'Available' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <div className="action-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="button button--outline"
                            style={{ width: 'auto', padding: '0.5rem 1rem' }}
                            onClick={() => handleToggleAvailability(product.id, product.is_available)}
                          >
                            {product.is_available ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            className="button button--outline"
                            style={{
                              width: 'auto',
                              padding: '0.5rem 1rem',
                              borderColor: colors.error,
                              color: colors.error,
                            }}
                            onClick={() => handleRemoveProduct(product.id)}
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
          )}
        </section>

        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Add More Products</h2>
          <input
            className="form-input"
            type="text"
            placeholder="Search products by name, category, unit"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          {availableProducts.length === 0 ? (
            <p>No more products available to add.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {availableProducts.map(product => (
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

