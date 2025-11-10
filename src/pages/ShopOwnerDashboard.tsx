import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, theme } from '../theme';
import StorageService from '../services/StorageService';
import { getShopProductsForOwner } from '../services/PriceService';
import { Product, ShopProduct } from '../types';
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
  marginBottom: theme.spacing.lg,
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

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: colors.white,
  color: colors.primary,
  border: `1px solid ${colors.primary}`,
};

interface ShopProductWithDetails extends ShopProduct {
  productName: string;
  unit: string;
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

  const shop = useMemo(() => (user ? StorageService.getShopByOwnerId(user.id) : null), [user]);

  useEffect(() => {
    if (user) {
      const products = getShopProductsForOwner(user.id);
      setShopProducts(products);
    }
  }, [user]);

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
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <button
            type="button"
            style={{ ...secondaryButtonStyle, padding: `${theme.spacing.sm} ${theme.spacing.md}` }}
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
          <button type="button" style={buttonStyle} onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      {message && (
        <div style={{ marginBottom: theme.spacing.lg, color: colors.primary }}>{message}</div>
      )}

      <div style={cardStyle}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Your Catalog</h2>
        {shopProducts.length === 0 ? (
          <p>No products found. Add products from the list below.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: theme.spacing.sm }}>Product</th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.sm }}>Current Price</th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.sm }}>Status</th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.sm }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shopProducts.map(product => (
                  <tr key={product.id}>
                    <td style={{ padding: theme.spacing.sm }}>
                      <div style={{ fontWeight: 600 }}>{product.productName}</div>
                      <div style={{ color: colors.textSecondary, fontSize: '12px' }}>{product.unit}</div>
                    </td>
                    <td style={{ padding: theme.spacing.sm }}>
                      <div style={{ marginBottom: theme.spacing.sm }}>
                        {product.current_price ? formatCurrency(product.current_price) : 'Not set'}
                      </div>
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
                    <td style={{ padding: theme.spacing.sm }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borderRadius.sm,
                          backgroundColor: product.is_available ? colors.success : colors.error,
                          color: colors.white,
                          fontSize: '12px',
                        }}
                      >
                        {product.is_available ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: theme.spacing.sm }}>
                      <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          style={{ ...secondaryButtonStyle, padding: `${theme.spacing.xs} ${theme.spacing.md}` }}
                          onClick={() => handleToggleAvailability(product.id, product.is_available)}
                        >
                          {product.is_available ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          style={{
                            ...secondaryButtonStyle,
                            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
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
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Add More Products</h2>
        <div style={{ marginBottom: theme.spacing.md }}>
          <input
            type="text"
            placeholder="Search products by name, category, unit"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
        </div>
        {availableProducts.length === 0 ? (
          <p>No more products available to add.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: theme.spacing.md,
            }}
          >
            {availableProducts.map(product => (
              <div
                key={product.id}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  backgroundColor: colors.surface,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: theme.spacing.xs }}>{product.name}</div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: theme.spacing.sm }}>
                  {product.category.replace('_', ' ')} • {product.unit}
                </div>
                <button type="button" style={buttonStyle} onClick={() => handleAddProduct(product.id)}>
                  Add to Catalog
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

