import { PriceUpdate, ShopProduct } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';

// Re-export PriceUpdate type for convenience
export type { PriceUpdate } from '../types';

export interface CreatePriceUpdateInput {
  shopProductId: string;
  price: number;
  updatedByType: PriceUpdate['updated_by_type'];
  updatedById: string;
  paymentStatus?: PriceUpdate['payment_status'];
  paymentAmount?: number;
}

export function createPriceUpdate(input: CreatePriceUpdateInput): PriceUpdate {
  const shopProducts = StorageService.getShopProducts();
  const target = shopProducts.find(sp => sp.id === input.shopProductId);
  if (!target) {
    throw new Error('Shop product not found');
  }

  const now = new Date().toISOString();
  const priceUpdate: PriceUpdate = {
    id: generateId('price_update'),
    shop_product_id: input.shopProductId,
    price: input.price,
    updated_by_type: input.updatedByType,
    updated_by_id: input.updatedById,
    payment_status: input.paymentStatus ?? 'pending',
    payment_amount: input.paymentAmount ?? 1,
    created_at: now,
  };

  StorageService.savePriceUpdate(priceUpdate);

  const updatedShopProduct: ShopProduct = {
    ...target,
    current_price: input.price,
    last_price_update_at: now,
    updated_at: now,
  };
  StorageService.saveShopProduct(updatedShopProduct);

  return priceUpdate;
}

export function getPriceUpdatesByShop(shopId: string): PriceUpdate[] {
  return StorageService.getPriceUpdatesByShopId(shopId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getCurrentPricesForShop(shopId: string) {
  return StorageService.getShopProductsByShopId(shopId).map(sp => ({
    shopProductId: sp.id,
    productId: sp.product_id,
    currentPrice: sp.current_price,
    lastUpdatedAt: sp.last_price_update_at,
    isAvailable: sp.is_available,
  }));
}

export function getPriceHistory(shopProductId: string): PriceUpdate[] {
  return StorageService.getPriceUpdates()
    .filter(update => update.shop_product_id === shopProductId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function calculateEarnings(shopId: string) {
  const updates = StorageService.getPriceUpdatesByShopId(shopId);
  const totals = updates.reduce(
    (acc, update) => {
      acc.total += update.payment_amount ?? 0;
      if (update.payment_status === 'pending') {
        acc.pending += update.payment_amount ?? 0;
      } else if (update.payment_status === 'paid') {
        acc.paid += update.payment_amount ?? 0;
      }
      return acc;
    },
    { total: 0, pending: 0, paid: 0 }
  );
  return totals;
}


