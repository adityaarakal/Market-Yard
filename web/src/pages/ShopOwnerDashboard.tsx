import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, theme } from '../theme';
import StorageService from '../services/StorageService';
import { getShopProductsForOwner } from '../services/PriceService';
import { ShopProduct } from '../types';
import { generateId } from '../utils/id';
import { formatCurrency } from '../utils/format';

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: theme.spacing.lg,
  backgroundColor: colors.background,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  padding: theme.spacing.lg,
  borderRadius: theme.borderRadius.md,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: theme.spacing.sm,
  borderRadius: theme.borderRadius.sm,
  border: `1px solid ${colors.border}`,
};

const buttonStyle: React.CSSProperties = {
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  backgroundColor: colors.primary,
  color: colors.white,
  border: 'none',
  borderRadius: theme.borderRadius.sm,
  cursor: 'pointer',
};

interface ShopProductWithDetails extends ShopProduct {
  productName: string;
  unit: string;
}

export default function ShopOwnerDashboard() {
  const { user, logout } = useAuth();
  const [shopProducts, setShopProducts] = useState<ShopProductWithDetails[]>([]);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [newPrices, setNewPrices] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const shop = useMemo(() => (user ? StorageService.getShopByOwnerId(user.id) : null), [user]);

  useEffect(() => {
    if (user) {
      const products = getShopProductsForOwner(user.id);
      setShopProducts(products);
    }
  }, [user]);

  const handlePriceChange = (productId: string, value: string) => {
    setNewPrices(prev => ({ ...prev, [productId]: value }));
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
      id: generateId('shop_product'),
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
      id: generateId('price_update'),
      shop_product_id: shopProduct.id,
      price: priceValue,
      updated_by_type: 'shop_owner',
      updated_by_id: user?.id || 'unknown',
      payment_status: 'pending',
      payment_amount: 1,
      created_at: now,
    });

    const updatedProducts = getShopProductsForOwner(user?.id || '');
    setShopProducts(updatedProducts);
    setUpdatingProductId(null);
    setMessage('Price updated successfully.');
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
        <div>
          <h1 style={{ color: colors.text, marginBottom: theme.spacing.sm }}>Shop Owner Dashboard</h1>
          {shop ? (
            <div style={{ color: colors.textSecondary }}>
              Managing: {shop.shop_name} ({shop.category})
            </div>
          ) : (
            <div style={{ color: colors.error }}>No shop found for this account.</div>
          )}
        </div>
        <button type="button" style={buttonStyle} onClick={logout}>
          Logout
        </button>
      </div>
      {message && (
        <div style={{ marginBottom: theme.spacing.lg, color: colors.primary }}>{message}</div>
      )}
      <div style={cardStyle}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Products</h2>
        {shopProducts.length === 0 ? (
          <p>No products found. Seed sample data to get started.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: theme.spacing.sm }}>Product</th>
                <th style={{ textAlign: 'left', padding: theme.spacing.sm }}>Current Price</th>
                <th style={{ textAlign: 'left', padding: theme.spacing.sm }}>Update Price</th>
              </tr>
            </thead>
            <tbody>
              {shopProducts.map(product => (
                <tr key={product.product_id}>
                  <td style={{ padding: theme.spacing.sm }}>
                    <div style={{ fontWeight: 600 }}>{product.productName}</div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>{product.unit}</div>
                  </td>
                  <td style={{ padding: theme.spacing.sm }}>
                    {product.current_price ? formatCurrency(product.current_price) : 'Not set'}
                  </td>
                  <td style={{ padding: theme.spacing.sm }}>
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter price"
                        value={newPrices[product.product_id] || ''}
                        onChange={e => handlePriceChange(product.product_id, e.target.value)}
                        style={{ ...inputStyle, width: '140px' }}
                      />
                      <button
                        type="button"
                        style={buttonStyle}
                        disabled={updatingProductId === product.product_id}
                        onClick={() => handlePriceUpdate(product.product_id)}
                      >
                        {updatingProductId === product.product_id ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

