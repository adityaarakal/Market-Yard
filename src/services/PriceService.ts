import StorageService from './StorageService';
import { Product, Shop, ShopProduct } from '../types';

const GLOBAL_PRICE_CACHE_KEY = 'global_price_cache_v1';
const GLOBAL_PRICE_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export interface GlobalPriceEntry {
  product: Product;
  shopCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
  bestShop: Shop | null;
  bestShopProductId?: string;
}

interface GlobalPriceCache {
  data: GlobalPriceEntry[];
  generatedAt: string;
  filters?: {
    category?: string;
    search?: string;
  };
}

function calculateGlobalPriceEntry(product: Product, shopProducts: ShopProduct[]): GlobalPriceEntry {
  const availableProducts = shopProducts.filter(sp => sp.is_available && sp.current_price != null);

  if (availableProducts.length === 0) {
    return {
      product,
      shopCount: 0,
      minPrice: null,
      maxPrice: null,
      avgPrice: null,
      bestShop: null,
    };
  }

  const prices = availableProducts
    .map(sp => sp.current_price as number)
    .sort((a, b) => a - b);

  const minPrice = prices[0];
  const maxPrice = prices[prices.length - 1];
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  const bestShopProduct = availableProducts.find(sp => sp.current_price === minPrice) || null;
  const bestShop = bestShopProduct ? StorageService.getShopById(bestShopProduct.shop_id) : null;

  return {
    product,
    shopCount: availableProducts.length,
    minPrice,
    maxPrice,
    avgPrice,
    bestShop,
    bestShopProductId: bestShopProduct?.id,
  };
}

function storeCache(cache: GlobalPriceCache) {
  try {
    localStorage.setItem(GLOBAL_PRICE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Unable to persist global price cache', error);
  }
}

function getCache(filters?: GlobalPriceCache['filters']): GlobalPriceCache | null {
  try {
    const raw = localStorage.getItem(GLOBAL_PRICE_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const cache: GlobalPriceCache = JSON.parse(raw);
    const age = Date.now() - new Date(cache.generatedAt).getTime();
    if (age > GLOBAL_PRICE_CACHE_TTL_MS) {
      return null;
    }
    if (
      filters?.category !== cache.filters?.category ||
      (filters?.search || '').toLowerCase() !== (cache.filters?.search || '').toLowerCase()
    ) {
      return null;
    }
    return cache;
  } catch (error) {
    console.warn('Unable to read global price cache', error);
    return null;
  }
}

export function getGlobalPriceSummary(filters?: { category?: string; search?: string }): GlobalPriceEntry[] {
  const cache = getCache(filters);
  if (cache) {
    return cache.data;
  }

  const products = StorageService.getProducts();
  const shopProducts = StorageService.getShopProducts();

  let entries = products.map(product => {
      const productShopProducts = shopProducts.filter(sp => sp.product_id === product.id);
      return calculateGlobalPriceEntry(product, productShopProducts);
  });

  if (filters?.category) {
    entries = entries.filter(entry => entry.product.category === filters.category);
  }

  if (filters?.search) {
    const query = filters.search.toLowerCase();
    entries = entries.filter(entry =>
      [entry.product.name, entry.product.category, entry.product.unit]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  entries.sort((a, b) => {
    const aPrice = a.minPrice ?? Number.POSITIVE_INFINITY;
    const bPrice = b.minPrice ?? Number.POSITIVE_INFINITY;
    if (aPrice === bPrice) {
      return a.product.name.localeCompare(b.product.name);
    }
    return aPrice - bPrice;
  });

  storeCache({
    data: entries,
    generatedAt: new Date().toISOString(),
    filters,
  });

  return entries;
}

export function getShopProductsForOwner(ownerId: string): Array<ShopProduct & { productName: string; unit: string }> {
  const shop = StorageService.getShopByOwnerId(ownerId);
  if (!shop) {
    return [];
  }

  const shopProducts = StorageService.getShopProductsByShopId(shop.id);
  const products = StorageService.getProducts();

  return shopProducts.map(shopProduct => {
    const product = products.find(p => p.id === shopProduct.product_id);
    return {
      ...shopProduct,
      productName: product?.name || 'Unknown Product',
      unit: product?.unit || '',
    };
  });
}
