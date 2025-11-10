import { ShopProduct } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';

export interface AddShopProductInput {
  shopId: string;
  productId: string;
  isAvailable?: boolean;
  currentPrice?: number;
}

export interface UpdateShopProductInput {
  isAvailable?: boolean;
  currentPrice?: number;
}

export function addProductToShop(input: AddShopProductInput): ShopProduct {
  const existing = StorageService.getShopProduct(input.shopId, input.productId);
  const now = new Date().toISOString();

  const shopProduct: ShopProduct = existing
    ? {
        ...existing,
        is_available: input.isAvailable ?? existing.is_available,
        current_price: input.currentPrice ?? existing.current_price,
        last_price_update_at: input.currentPrice != null ? now : existing.last_price_update_at,
        updated_at: now,
      }
    : {
        id: generateId('shop_product'),
        shop_id: input.shopId,
        product_id: input.productId,
        is_available: input.isAvailable ?? true,
        current_price: input.currentPrice,
        created_at: now,
        updated_at: now,
        last_price_update_at: input.currentPrice != null ? now : undefined,
      };

  StorageService.saveShopProduct(shopProduct);
  return shopProduct;
}

export function removeProductFromShop(shopProductId: string): void {
  StorageService.removeShopProduct(shopProductId);
}

export function getShopProducts(shopId: string): ShopProduct[] {
  return StorageService.getShopProductsByShopId(shopId);
}

export function updateShopProduct(shopProductId: string, updates: UpdateShopProductInput): ShopProduct {
  const shopProducts = StorageService.getShopProducts();
  const existing = shopProducts.find(sp => sp.id === shopProductId);
  if (!existing) {
    throw new Error('Shop product not found');
  }

  const now = new Date().toISOString();
  const updated: ShopProduct = {
    ...existing,
    is_available: updates.isAvailable ?? existing.is_available,
    current_price: updates.currentPrice ?? existing.current_price,
    last_price_update_at: updates.currentPrice != null ? now : existing.last_price_update_at,
    updated_at: now,
  };

  StorageService.saveShopProduct(updated);
  return updated;
}


