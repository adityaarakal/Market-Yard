import { Favorite, Product, Shop } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';

/**
 * Add a product to favorites
 */
export function addProductToFavorites(userId: string, productId: string): Favorite {
  // Check if already favorited
  if (StorageService.isFavorite(userId, 'product', productId)) {
    const favorites = StorageService.getFavoritesByUserId(userId);
    const existing = favorites.find(f => f.user_id === userId && f.type === 'product' && f.item_id === productId);
    if (existing) {
      return existing;
    }
  }

  const favorite: Favorite = {
    id: generateId('favorite'),
    user_id: userId,
    type: 'product',
    item_id: productId,
    created_at: new Date().toISOString(),
  };

  StorageService.saveFavorite(favorite);
  return favorite;
}

/**
 * Add a shop to favorites
 */
export function addShopToFavorites(userId: string, shopId: string): Favorite {
  // Check if already favorited
  if (StorageService.isFavorite(userId, 'shop', shopId)) {
    const favorites = StorageService.getFavoritesByUserId(userId);
    const existing = favorites.find(f => f.user_id === userId && f.type === 'shop' && f.item_id === shopId);
    if (existing) {
      return existing;
    }
  }

  const favorite: Favorite = {
    id: generateId('favorite'),
    user_id: userId,
    type: 'shop',
    item_id: shopId,
    created_at: new Date().toISOString(),
  };

  StorageService.saveFavorite(favorite);
  return favorite;
}

/**
 * Remove a product from favorites
 */
export function removeProductFromFavorites(userId: string, productId: string): void {
  StorageService.removeFavorite(userId, 'product', productId);
}

/**
 * Remove a shop from favorites
 */
export function removeShopFromFavorites(userId: string, shopId: string): void {
  StorageService.removeFavorite(userId, 'shop', shopId);
}

/**
 * Check if a product is favorited by user
 */
export function isProductFavorite(userId: string, productId: string): boolean {
  return StorageService.isFavorite(userId, 'product', productId);
}

/**
 * Check if a shop is favorited by user
 */
export function isShopFavorite(userId: string, shopId: string): boolean {
  return StorageService.isFavorite(userId, 'shop', shopId);
}

/**
 * Get all favorites for a user
 */
export function getUserFavorites(userId: string): Favorite[] {
  return StorageService.getFavoritesByUserId(userId);
}

/**
 * Get all favorite products for a user
 */
export function getUserFavoriteProducts(userId: string): Favorite[] {
  return StorageService.getFavoritesByType(userId, 'product');
}

/**
 * Get all favorite shops for a user
 */
export function getUserFavoriteShops(userId: string): Favorite[] {
  return StorageService.getFavoritesByType(userId, 'shop');
}

/**
 * Get favorite products with product details
 */
export function getFavoriteProductsWithDetails(userId: string): (Product & { favorited_at: string })[] {
  const favoriteProducts = getUserFavoriteProducts(userId);
  const products = StorageService.getProducts();

  return favoriteProducts
    .map(fav => {
      const product = products.find(p => p.id === fav.item_id);
      if (!product) return null;
      return {
        ...product,
        favorited_at: fav.created_at,
      };
    })
    .filter((p): p is Product & { favorited_at: string } => p !== null)
    .sort((a, b) => new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime());
}

/**
 * Get favorite shops with shop details
 */
export function getFavoriteShopsWithDetails(userId: string): (Shop & { favorited_at: string })[] {
  const favoriteShops = getUserFavoriteShops(userId);
  const shops = StorageService.getShops();

  return favoriteShops
    .map(fav => {
      const shop = shops.find(s => s.id === fav.item_id);
      if (!shop) return null;
      return {
        ...shop,
        favorited_at: fav.created_at,
      };
    })
    .filter((s): s is Shop & { favorited_at: string } => s !== null)
    .sort((a, b) => new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime());
}

/**
 * Toggle product favorite status
 */
export function toggleProductFavorite(userId: string, productId: string): boolean {
  const isFav = isProductFavorite(userId, productId);
  if (isFav) {
    removeProductFromFavorites(userId, productId);
    return false;
  } else {
    addProductToFavorites(userId, productId);
    return true;
  }
}

/**
 * Toggle shop favorite status
 */
export function toggleShopFavorite(userId: string, shopId: string): boolean {
  const isFav = isShopFavorite(userId, shopId);
  if (isFav) {
    removeShopFromFavorites(userId, shopId);
    return false;
  } else {
    addShopToFavorites(userId, shopId);
    return true;
  }
}

