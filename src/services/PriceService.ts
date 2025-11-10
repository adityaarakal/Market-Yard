import StorageService from './StorageService';
import { Product, Shop, ShopProduct } from '../types';

export interface GlobalPriceEntry {
  product: Product;
  shopCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
  bestShop: Shop | null;
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
  };
}

export function getGlobalPriceSummary(): GlobalPriceEntry[] {
  const products = StorageService.getProducts();
  const shopProducts = StorageService.getShopProducts();

  return products
    .map(product => {
      const productShopProducts = shopProducts.filter(sp => sp.product_id === product.id);
      return calculateGlobalPriceEntry(product, productShopProducts);
    })
    .sort((a, b) => a.product.name.localeCompare(b.product.name));
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
