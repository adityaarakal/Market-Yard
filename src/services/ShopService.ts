import { Shop } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';

export interface CreateShopInput {
  ownerId: string;
  shopName: string;
  address: string;
  category: Shop['category'];
  city?: string;
  state?: string;
  phoneNumber?: string;
  description?: string;
  goodwillScore?: number;
  averageRating?: number;
  totalRatings?: number;
  isActive?: boolean;
}

export interface UpdateShopInput {
  shopName?: string;
  address?: string;
  category?: Shop['category'];
  city?: string;
  state?: string;
  phoneNumber?: string;
  description?: string;
  goodwillScore?: number;
  averageRating?: number;
  totalRatings?: number;
  isActive?: boolean;
}

export function createShop(input: CreateShopInput): Shop {
  const now = new Date().toISOString();
  const shop: Shop = {
    id: generateId('shop'),
    owner_id: input.ownerId,
    shop_name: input.shopName.trim(),
    address: input.address.trim(),
    city: input.city?.trim(),
    state: input.state?.trim(),
    phone_number: input.phoneNumber?.trim(),
    category: input.category,
    description: input.description?.trim(),
    goodwill_score: input.goodwillScore ?? 0,
    average_rating: input.averageRating ?? 0,
    total_ratings: input.totalRatings ?? 0,
    is_active: input.isActive ?? true,
    created_at: now,
    updated_at: now,
  };

  StorageService.saveShop(shop);
  return shop;
}

export function getAllShops(): Shop[] {
  return StorageService.getShops();
}

export function getShopById(id: string): Shop | null {
  return StorageService.getShopById(id);
}

export function getShopByOwnerId(ownerId: string): Shop | null {
  return StorageService.getShopByOwnerId(ownerId);
}

export function updateShop(shopId: string, updates: UpdateShopInput): Shop {
  const existing = StorageService.getShopById(shopId);
  if (!existing) {
    throw new Error('Shop not found');
  }

  const updated: Shop = {
    ...existing,
    shop_name: updates.shopName?.trim() || existing.shop_name,
    address: updates.address?.trim() || existing.address,
    city: updates.city?.trim() || existing.city,
    state: updates.state?.trim() || existing.state,
    phone_number: typeof updates.phoneNumber === 'string' ? updates.phoneNumber.trim() || undefined : existing.phone_number,
    description: typeof updates.description === 'string' ? updates.description.trim() || undefined : existing.description,
    category: updates.category ?? existing.category,
    goodwill_score: updates.goodwillScore ?? existing.goodwill_score,
    average_rating: updates.averageRating ?? existing.average_rating,
    total_ratings: updates.totalRatings ?? existing.total_ratings,
    is_active: updates.isActive ?? existing.is_active,
    updated_at: new Date().toISOString(),
  };

  StorageService.saveShop(updated);
  return updated;
}

export function deleteShop(shopId: string): void {
  StorageService.deleteShop(shopId);
}


