import { Shop, ShopProduct, Product } from '../types';
import StorageService from './StorageService';
import { calculateDistance } from '../utils/distance';

export interface ShopPriceEntry {
  shop: Shop;
  shopProduct: ShopProduct;
  product: Product;
  price: number;
  distance?: number; // Distance in kilometers (if user location is available)
}

export interface GetShopPricesOptions {
  productId: string;
  userLatitude?: number;
  userLongitude?: number;
  filterByLocation?: {
    latitude: number;
    longitude: number;
    radiusKm: number; // Radius in kilometers
  };
  sortBy?: 'price' | 'distance' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all shops selling a specific product with their prices
 */
export function getShopPricesForProduct(options: GetShopPricesOptions): ShopPriceEntry[] {
  const { productId, userLatitude, userLongitude, filterByLocation, sortBy = 'price', sortOrder = 'asc' } = options;

  // Get all shop products for this product
  const shopProducts = StorageService.getShopProducts();
  const productShopProducts = shopProducts.filter(
    sp => sp.product_id === productId && sp.is_available && sp.current_price != null
  );

  // Get product details
  const product = StorageService.getProductById(productId);
  if (!product) {
    return [];
  }

  // Get all shops
  const shops = StorageService.getShops();
  const activeShops = shops.filter(s => s.is_active);

  // Build shop price entries
  let entries: ShopPriceEntry[] = productShopProducts
    .map(shopProduct => {
      const shop = activeShops.find(s => s.id === shopProduct.shop_id);
      if (!shop) {
        return null;
      }

      const entry: ShopPriceEntry = {
        shop,
        shopProduct,
        product,
        price: shopProduct.current_price!,
      };

      // Calculate distance if user location is available
      if (userLatitude != null && userLongitude != null && shop.latitude != null && shop.longitude != null) {
        entry.distance = calculateDistance(userLatitude, userLongitude, shop.latitude, shop.longitude);
      }

      return entry;
    })
    .filter((entry): entry is ShopPriceEntry => entry !== null);

  // Filter by location if specified
  if (filterByLocation) {
    entries = entries.filter(entry => {
      if (!entry.shop.latitude || !entry.shop.longitude || !entry.distance) {
        return false;
      }
      return entry.distance <= filterByLocation.radiusKm;
    });
  }

  // Sort entries
  entries.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'distance':
        if (a.distance != null && b.distance != null) {
          comparison = a.distance - b.distance;
        } else if (a.distance != null) {
          comparison = -1;
        } else if (b.distance != null) {
          comparison = 1;
        } else {
          comparison = 0;
        }
        break;
      case 'rating':
        comparison = (b.shop.average_rating || 0) - (a.shop.average_rating || 0);
        break;
      case 'name':
        comparison = a.shop.shop_name.localeCompare(b.shop.shop_name);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return entries;
}

/**
 * Get the best price shop for a product
 */
export function getBestPriceShop(productId: string): ShopPriceEntry | null {
  const entries = getShopPricesForProduct({ productId, sortBy: 'price', sortOrder: 'asc' });
  return entries.length > 0 ? entries[0] : null;
}

