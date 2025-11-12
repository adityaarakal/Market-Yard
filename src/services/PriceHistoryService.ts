import { Product, Shop } from '../types';
import StorageService from './StorageService';

export interface PriceHistoryEntry {
  date: Date;
  price: number;
  shopId: string;
  shopName: string;
  productId: string;
  productName: string;
  updateId: string;
}

export interface PriceHistoryOptions {
  productId?: string;
  shopId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PriceHistoryStats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

/**
 * Get price history for a product across all shops or specific shop
 */
export function getProductPriceHistory(options: PriceHistoryOptions): PriceHistoryEntry[] {
  const { productId, shopId, startDate, endDate } = options;

  if (!productId) {
    return [];
  }

  // Get all shop products for this product
  const shopProducts = StorageService.getShopProducts();
  const productShopProducts = shopProducts.filter(sp => sp.product_id === productId);

  // Filter by shop if specified
  const filteredShopProducts = shopId
    ? productShopProducts.filter(sp => sp.shop_id === shopId)
    : productShopProducts;

  // Get all price updates for these shop products
  const allUpdates = StorageService.getPriceUpdates();
  const product = StorageService.getProductById(productId);
  const shops = StorageService.getShops();

  const entries: PriceHistoryEntry[] = [];

  filteredShopProducts.forEach(shopProduct => {
    const updates = allUpdates.filter(update => update.shop_product_id === shopProduct.id);
    const shop = shops.find(s => s.id === shopProduct.shop_id);

    updates.forEach(update => {
      const updateDate = new Date(update.created_at);

      // Filter by date range if specified
      if (startDate && updateDate < startDate) {
        return;
      }
      if (endDate && updateDate > endDate) {
        return;
      }

      entries.push({
        date: updateDate,
        price: update.price,
        shopId: shopProduct.shop_id,
        shopName: shop?.shop_name || 'Unknown Shop',
        productId: productId,
        productName: product?.name || 'Unknown Product',
        updateId: update.id,
      });
    });
  });

  // Sort by date (oldest first)
  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get price history for a shop across all products or specific product
 */
export function getShopPriceHistory(options: PriceHistoryOptions): PriceHistoryEntry[] {
  const { productId, shopId, startDate, endDate } = options;

  if (!shopId) {
    return [];
  }

  // Get all shop products for this shop
  const shopProducts = StorageService.getShopProducts();
  const shopShopProducts = shopProducts.filter(sp => sp.shop_id === shopId);

  // Filter by product if specified
  const filteredShopProducts = productId
    ? shopShopProducts.filter(sp => sp.product_id === productId)
    : shopShopProducts;

  // Get all price updates for these shop products
  const allUpdates = StorageService.getPriceUpdates();
  const shop = StorageService.getShopById(shopId);
  const products = StorageService.getProducts();

  const entries: PriceHistoryEntry[] = [];

  filteredShopProducts.forEach(shopProduct => {
    const updates = allUpdates.filter(update => update.shop_product_id === shopProduct.id);
    const product = products.find(p => p.id === shopProduct.product_id);

    updates.forEach(update => {
      const updateDate = new Date(update.created_at);

      // Filter by date range if specified
      if (startDate && updateDate < startDate) {
        return;
      }
      if (endDate && updateDate > endDate) {
        return;
      }

      entries.push({
        date: updateDate,
        price: update.price,
        shopId: shopId,
        shopName: shop?.shop_name || 'Unknown Shop',
        productId: shopProduct.product_id,
        productName: product?.name || 'Unknown Product',
        updateId: update.id,
      });
    });
  });

  // Sort by date (oldest first)
  return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get price history grouped by shop for a product (for global view)
 */
export function getProductPriceHistoryByShop(
  productId: string,
  startDate?: Date,
  endDate?: Date
): Record<string, PriceHistoryEntry[]> {
  const allEntries = getProductPriceHistory({ productId, startDate, endDate });
  const grouped: Record<string, PriceHistoryEntry[]> = {};

  allEntries.forEach(entry => {
    if (!grouped[entry.shopId]) {
      grouped[entry.shopId] = [];
    }
    grouped[entry.shopId].push(entry);
  });

  // Sort each shop's entries by date
  Object.keys(grouped).forEach(shopId => {
    grouped[shopId].sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  return grouped;
}

/**
 * Get price history grouped by product for a shop (for shop view)
 */
export function getShopPriceHistoryByProduct(
  shopId: string,
  startDate?: Date,
  endDate?: Date
): Record<string, PriceHistoryEntry[]> {
  const allEntries = getShopPriceHistory({ shopId, startDate, endDate });
  const grouped: Record<string, PriceHistoryEntry[]> = {};

  allEntries.forEach(entry => {
    if (!grouped[entry.productId]) {
      grouped[entry.productId] = [];
    }
    grouped[entry.productId].push(entry);
  });

  // Sort each product's entries by date
  Object.keys(grouped).forEach(productId => {
    grouped[productId].sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  return grouped;
}

/**
 * Calculate price statistics from history entries
 */
export function calculatePriceStats(entries: PriceHistoryEntry[]): PriceHistoryStats {
  if (entries.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }

  const prices = entries.map(e => e.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const count = entries.length;

  return { min, max, avg, count };
}

/**
 * Get shops that have price history for a product
 */
export function getShopsWithPriceHistory(productId: string): Shop[] {
  const entries = getProductPriceHistory({ productId });
  const shopIds = new Set(entries.map(e => e.shopId));
  const shops = StorageService.getShops();
  return shops.filter(s => s.is_active && shopIds.has(s.id));
}

/**
 * Get products that have price history for a shop
 */
export function getProductsWithPriceHistory(shopId: string): Product[] {
  const entries = getShopPriceHistory({ shopId });
  const productIds = new Set(entries.map(e => e.productId));
  const products = StorageService.getProducts();
  return products.filter(p => p.is_active && productIds.has(p.id));
}

