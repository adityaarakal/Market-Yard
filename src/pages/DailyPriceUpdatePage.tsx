import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { getShopProductsForOwner } from '../services/PriceService';
import { createPriceUpdate, calculateEarnings } from '../services/PriceUpdateService';
import { updateShopProduct } from '../services/ShopProductService';
import { formatCurrency } from '../utils/format';
import { colors } from '../theme';

interface ShopProductWithDetails {
  id: string;
  product_id: string;
  productName: string;
  unit: string;
  current_price?: number;
  is_available: boolean;
}

export default function DailyPriceUpdatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shopProducts, setShopProducts] = useState<ShopProductWithDetails[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, paid: 0 });

  const shop = useMemo(() => (user ? StorageService.getShopByOwnerId(user.id) : null), [user]);

  useEffect(() => {
    if (user && shop) {
      loadProducts();
      loadEarnings();
    }
  }, [user, shop?.id]);

  const loadProducts = () => {
    if (!user) return;
    const products = getShopProductsForOwner(user.id);
    setShopProducts(products);
    // Initialize prices with current prices
    const initialPrices: Record<string, string> = {};
    products.forEach(product => {
      if (product.current_price) {
        initialPrices[product.id] = product.current_price.toString();
      }
    });
    setPrices(initialPrices);
  };

  const loadEarnings = () => {
    if (!shop) return;
    setEarnings(calculateEarnings(shop.id));
  };

  const handlePriceChange = (shopProductId: string, value: string) => {
    setPrices(prev => ({ ...prev, [shopProductId]: value }));
    setMessage('');
  };

  const validatePrices = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const priceEntries = Object.entries(prices);

    if (priceEntries.length === 0) {
      errors.push('Enter at least one price to update.');
      return { valid: false, errors };
    }

    priceEntries.forEach(([shopProductId, priceValue]) => {
      if (!priceValue.trim()) return; // Skip empty values
      const num = parseFloat(priceValue);
      if (Number.isNaN(num) || num < 0) {
        const product = shopProducts.find(p => p.id === shopProductId);
        errors.push(`Invalid price for ${product?.productName || 'product'}`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleBulkUpdate = async () => {
    if (!shop || !user) {
      setMessage('Shop not found.');
      setMessageType('error');
      return;
    }

    const validation = validatePrices();
    if (!validation.valid) {
      setMessage(validation.errors.join(', '));
      setMessageType('error');
      return;
    }

    setUpdating(true);
    setMessage('');
    setUpdatedCount(0);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (const [shopProductId, priceValue] of Object.entries(prices)) {
        if (!priceValue.trim()) continue; // Skip empty values

        const num = parseFloat(priceValue);
        if (Number.isNaN(num) || num <= 0) continue;

        const product = shopProducts.find(p => p.id === shopProductId);
        if (!product) continue;

        try {
          // Update shop product price
          updateShopProduct(shopProductId, { currentPrice: num });

          // Create price update record
          createPriceUpdate({
            shopProductId,
            price: num,
            updatedByType: 'shop_owner',
            updatedById: user.id,
            paymentStatus: 'pending',
            paymentAmount: 1,
          });

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Failed to update ${product.productName}`);
          console.error(`Error updating ${product.productName}:`, error);
        }
      }

      if (successCount > 0) {
        setMessage(
          `✅ Successfully updated ${successCount} ${successCount === 1 ? 'price' : 'prices'}. Earnings: ₹${successCount} (₹1 per update). Total earnings: ₹${earnings.total + successCount}.`
        );
        setMessageType('success');
        loadProducts();
        loadEarnings();
        
        // Clear updated prices after successful update
        setTimeout(() => {
          setPrices({});
          setMessage('');
        }, 3000);
      } else {
        setMessage('No prices were updated. Please check your inputs.');
        setMessageType('error');
      }

      if (errorCount > 0) {
        setMessage(
          prev => prev + (prev ? ' ' : '') + `Failed to update ${errorCount} ${errorCount === 1 ? 'product' : 'products'}.`
        );
        setMessageType('error');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      setMessage('An error occurred while updating prices. Please try again.');
      setMessageType('error');
    } finally {
      setUpdating(false);
    }
  };

  const handleSingleUpdate = async (shopProductId: string) => {
    if (!shop || !user) {
      setMessage('Shop not found.');
      setMessageType('error');
      return;
    }

    const priceValue = prices[shopProductId];
    if (!priceValue || !priceValue.trim()) {
      setMessage('Enter a price to update.');
      setMessageType('error');
      return;
    }

    const num = parseFloat(priceValue);
    if (Number.isNaN(num) || num <= 0) {
      setMessage('Enter a valid price.');
      setMessageType('error');
      return;
    }

    setUpdating(true);
    setMessage('');

    try {
      const product = shopProducts.find(p => p.id === shopProductId);
      if (!product) {
        setMessage('Product not found.');
        setMessageType('error');
        return;
      }

      // Update shop product price
      updateShopProduct(shopProductId, { currentPrice: num });

      // Create price update record
      createPriceUpdate({
        shopProductId,
        price: num,
        updatedByType: 'shop_owner',
        updatedById: user.id,
        paymentStatus: 'pending',
        paymentAmount: 1,
      });

      setMessage(`✅ Price updated for ${product.productName}. Earnings: ₹1. Total earnings: ₹${earnings.total + 1}.`);
      setMessageType('success');
      loadProducts();
      loadEarnings();
      
      // Clear this product's price input after successful update
      setTimeout(() => {
        setPrices(prev => {
          const updated = { ...prev };
          delete updated[shopProductId];
          return updated;
        });
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Update error:', error);
      setMessage('Failed to update price. Please try again.');
      setMessageType('error');
    } finally {
      setUpdating(false);
    }
  };

  const availableProducts = shopProducts.filter(p => p.is_available);

  if (!shop) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">No shop found for this account.</div>
            <button
              type="button"
              className="button button--primary"
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/shop-owner/register')}
            >
              Register your shop
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
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Daily Price Update
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Update prices for all your products. Earn ₹1 for each price update.
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/shop-owner/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {message && (
            <div className={messageType === 'success' ? 'form-info' : messageType === 'error' ? 'form-error' : 'form-info'}>
              {message}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: '0.95rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Total Earnings</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatCurrency(earnings.total || 0)}</div>
              <div className="form-helper" style={{ marginTop: '0.35rem' }}>
                {formatCurrency(earnings.pending || 0)} pending
              </div>
            </div>
            <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: '0.95rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Products in Catalog</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{availableProducts.length}</div>
              <div className="form-helper" style={{ marginTop: '0.35rem' }}>
                {shopProducts.length - availableProducts.length} hidden
              </div>
            </div>
          </div>
        </header>

        <section className="surface-card">
          <div className="action-row" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2>Update Prices</h2>
            {availableProducts.length > 0 && (
              <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="form-helper" style={{ margin: 0 }}>
                  {Object.keys(prices).filter(k => prices[k] && prices[k].trim()).length} {Object.keys(prices).filter(k => prices[k] && prices[k].trim()).length === 1 ? 'price' : 'prices'} entered
                </span>
                <button
                  type="button"
                  className="button button--primary"
                  style={{ width: 'auto' }}
                  onClick={handleBulkUpdate}
                  disabled={updating || Object.keys(prices).filter(k => prices[k] && prices[k].trim()).length === 0}
                >
                  {updating ? 'Updating...' : `Update All (${Object.keys(prices).filter(k => prices[k] && prices[k].trim()).length})`}
                </button>
              </div>
            )}
          </div>

          {availableProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No products in your catalog. Add products from the product management page.</p>
              <button
                type="button"
                className="button button--primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/shop-owner/products')}
              >
                Manage Products
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Price</th>
                    <th>New Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{product.productName}</div>
                        <div className="form-helper" style={{ marginTop: '0.25rem' }}>{product.unit}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {product.current_price ? formatCurrency(product.current_price) : 'Not set'}
                        </div>
                        {product.current_price && (
                          <div className="form-helper" style={{ fontSize: '0.8rem' }}>
                            Current price
                          </div>
                        )}
                      </td>
                      <td>
                        <input
                          className="form-input"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          placeholder="Enter new price"
                          value={prices[product.id] || ''}
                          onChange={e => handlePriceChange(product.id, e.target.value)}
                          style={{ width: '140px', marginBottom: 0 }}
                          disabled={updating}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="button button--primary"
                          style={{ width: 'auto', padding: '0.5rem 1rem' }}
                          onClick={() => handleSingleUpdate(product.id)}
                          disabled={updating || !prices[product.id] || !prices[product.id].trim()}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {availableProducts.length > 0 && (
          <section className="surface-card surface-card--compact">
            <h3 style={{ marginBottom: '0.75rem' }}>Quick Tips</h3>
            <ul className="feature-list" style={{ gap: '0.5rem' }}>
              <li>Enter prices for multiple products and click "Update All" to update them at once.</li>
              <li>Each price update earns you ₹1, which will be added to your pending earnings.</li>
              <li>Use the numeric keyboard on mobile for faster price entry.</li>
              <li>Only available products are shown. Hidden products won't appear in this list.</li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

