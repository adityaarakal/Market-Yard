import { Product, Shop } from '../types';
import StorageService from './StorageService';

export interface ComparisonCell {
  productId: string;
  shopId: string;
  price: number | null;
  isAvailable: boolean;
  isBestPrice: boolean; // Best price for this product across selected shops
}

export interface PriceComparisonData {
  products: Product[];
  shops: Shop[];
  cells: ComparisonCell[];
}

/**
 * Get price comparison data for multiple products and shops
 */
export function getPriceComparison(
  productIds: string[],
  shopIds: string[]
): PriceComparisonData {
  // Get products
  const products = productIds
    .map(id => StorageService.getProductById(id))
    .filter((p): p is Product => p !== null);

  // Get shops
  const shops = shopIds
    .map(id => StorageService.getShopById(id))
    .filter((s): s is Shop => s !== null && s.is_active);

  // Get all shop products
  const shopProducts = StorageService.getShopProducts();

  // Build comparison cells
  const cells: ComparisonCell[] = [];

  // For each product, find best price across selected shops
  const bestPrices: Record<string, number> = {};
  products.forEach(product => {
    const productShopProducts = shopProducts.filter(
      sp => sp.product_id === product.id && shopIds.includes(sp.shop_id)
    );
    const availablePrices = productShopProducts
      .filter(sp => sp.is_available && sp.current_price != null)
      .map(sp => sp.current_price!);
    
    if (availablePrices.length > 0) {
      bestPrices[product.id] = Math.min(...availablePrices);
    }
  });

  // If no products or shops selected, return empty data
  if (products.length === 0 || shops.length === 0) {
    return {
      products: [],
      shops: [],
      cells: [],
    };
  }

  // Create cells for each product-shop combination
  products.forEach(product => {
    shops.forEach(shop => {
      const shopProduct = shopProducts.find(
        sp => sp.shop_id === shop.id && sp.product_id === product.id
      );

      const price = shopProduct?.current_price ?? null;
      const isAvailable = shopProduct?.is_available ?? false;
      const isBestPrice =
        price !== null &&
        bestPrices[product.id] !== undefined &&
        price === bestPrices[product.id] &&
        isAvailable;

      cells.push({
        productId: product.id,
        shopId: shop.id,
        price,
        isAvailable,
        isBestPrice,
      });
    });
  });

  return {
    products,
    shops,
    cells,
  };
}

/**
 * Get shops that sell at least one of the selected products
 */
export function getShopsSellingProducts(productIds: string[]): Shop[] {
  if (productIds.length === 0) {
    return StorageService.getShops().filter(s => s.is_active);
  }

  const shopProducts = StorageService.getShopProducts();
  const relevantShopProducts = shopProducts.filter(
    sp => productIds.includes(sp.product_id) && sp.is_available && sp.current_price != null
  );
  const shopIds = new Set(relevantShopProducts.map(sp => sp.shop_id));

  return StorageService.getShops()
    .filter(s => s.is_active && shopIds.has(s.id))
    .sort((a, b) => a.shop_name.localeCompare(b.shop_name));
}

/**
 * Get products available at at least one of the selected shops
 */
export function getProductsAvailableAtShops(shopIds: string[]): Product[] {
  if (shopIds.length === 0) {
    return StorageService.getProducts().filter(p => p.is_active);
  }

  const shopProducts = StorageService.getShopProducts();
  const relevantShopProducts = shopProducts.filter(
    sp => shopIds.includes(sp.shop_id) && sp.is_available && sp.current_price != null
  );
  const productIds = new Set(relevantShopProducts.map(sp => sp.product_id));

  return StorageService.getProducts()
    .filter(p => p.is_active && productIds.has(p.id))
    .sort((a, b) => a.name.localeCompare(b.name));
}

