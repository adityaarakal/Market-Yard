import { STORAGE_KEYS } from '../utils/constants';
import {
  User,
  Shop,
  Product,
  ShopProduct,
  PriceUpdate,
  Subscription,
  Payment,
  Session,
  Favorite,
} from '../types';

class StorageService {
  // Generic methods
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // User methods
  getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS) || [];
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    this.setItem(STORAGE_KEYS.USERS, users);
  }

  deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  getUserByPhone(phone: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.phone_number === phone) || null;
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  // Shop methods
  getShops(): Shop[] {
    return this.getItem<Shop[]>(STORAGE_KEYS.SHOPS) || [];
  }

  saveShop(shop: Shop): void {
    const shops = this.getShops();
    const existingIndex = shops.findIndex(s => s.id === shop.id);

    if (existingIndex >= 0) {
      shops[existingIndex] = shop;
    } else {
      shops.push(shop);
    }

    this.setItem(STORAGE_KEYS.SHOPS, shops);
  }

  deleteShop(shopId: string): void {
    const shops = this.getShops().filter(s => s.id !== shopId);
    this.setItem(STORAGE_KEYS.SHOPS, shops);
  }

  getShopByOwnerId(ownerId: string): Shop | null {
    const shops = this.getShops();
    return shops.find(s => s.owner_id === ownerId) || null;
  }

  getShopById(id: string): Shop | null {
    const shops = this.getShops();
    return shops.find(s => s.id === id) || null;
  }

  // Product methods
  getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }

    this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  getProductById(id: string): Product | null {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  // ShopProduct methods
  getShopProducts(): ShopProduct[] {
    return this.getItem<ShopProduct[]>(STORAGE_KEYS.SHOP_PRODUCTS) || [];
  }

  saveShopProduct(shopProduct: ShopProduct): void {
    const shopProducts = this.getShopProducts();
    const existingIndex = shopProducts.findIndex(
      sp => sp.id === shopProduct.id || (sp.shop_id === shopProduct.shop_id && sp.product_id === shopProduct.product_id)
    );

    if (existingIndex >= 0) {
      shopProducts[existingIndex] = shopProduct;
    } else {
      shopProducts.push(shopProduct);
    }

    this.setItem(STORAGE_KEYS.SHOP_PRODUCTS, shopProducts);
  }

  removeShopProduct(shopProductId: string): void {
    const shopProducts = this.getShopProducts().filter(sp => sp.id !== shopProductId);
    this.setItem(STORAGE_KEYS.SHOP_PRODUCTS, shopProducts);
  }

  setShopProductAvailability(shopProductId: string, isAvailable: boolean): void {
    const shopProducts = this.getShopProducts();
    const target = shopProducts.find(sp => sp.id === shopProductId);
    if (target) {
      target.is_available = isAvailable;
      target.updated_at = new Date().toISOString();
      this.setItem(STORAGE_KEYS.SHOP_PRODUCTS, shopProducts);
    }
  }

  getShopProductsByShopId(shopId: string): ShopProduct[] {
    const shopProducts = this.getShopProducts();
    return shopProducts.filter(sp => sp.shop_id === shopId);
  }

  getShopProduct(shopId: string, productId: string): ShopProduct | null {
    const shopProducts = this.getShopProducts();
    return shopProducts.find(sp => sp.shop_id === shopId && sp.product_id === productId) || null;
  }

  // Price Update methods
  getPriceUpdates(): PriceUpdate[] {
    return this.getItem<PriceUpdate[]>(STORAGE_KEYS.PRICE_UPDATES) || [];
  }

  savePriceUpdate(update: PriceUpdate): void {
    const updates = this.getPriceUpdates();
    updates.push(update);
    this.setItem(STORAGE_KEYS.PRICE_UPDATES, updates);
  }

  deletePriceUpdatesByShopProduct(shopProductId: string): void {
    const updates = this.getPriceUpdates().filter(update => update.shop_product_id !== shopProductId);
    this.setItem(STORAGE_KEYS.PRICE_UPDATES, updates);
  }

  getPriceUpdatesByShopId(shopId: string): PriceUpdate[] {
    const updates = this.getPriceUpdates();
    const shopProducts = this.getShopProductsByShopId(shopId);
    const shopProductIds = shopProducts.map(sp => sp.id);
    return updates.filter(update => shopProductIds.includes(update.shop_product_id));
  }

  // Subscription methods
  getSubscriptions(): Subscription[] {
    return this.getItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS) || [];
  }

  saveSubscription(subscription: Subscription): void {
    const subscriptions = this.getSubscriptions();
    const existingIndex = subscriptions.findIndex(s => s.id === subscription.id);

    if (existingIndex >= 0) {
      subscriptions[existingIndex] = subscription;
    } else {
      subscriptions.push(subscription);
    }

    this.setItem(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
  }

  getSubscriptionByUserId(userId: string): Subscription | null {
    const subscriptions = this.getSubscriptions();
    return subscriptions.find(s => s.user_id === userId && s.status === 'active') || null;
  }

  getSubscriptionHistoryByUser(userId: string): Subscription[] {
    return this.getSubscriptions().filter(s => s.user_id === userId);
  }

  deleteSubscription(subscriptionId: string): void {
    const subscriptions = this.getSubscriptions().filter(s => s.id !== subscriptionId);
    this.setItem(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
  }

  // Payment methods
  getPayments(): Payment[] {
    return this.getItem<Payment[]>(STORAGE_KEYS.PAYMENTS) || [];
  }

  savePayment(payment: Payment): void {
    const payments = this.getPayments();
    const existingIndex = payments.findIndex(p => p.id === payment.id);

    if (existingIndex >= 0) {
      payments[existingIndex] = payment;
    } else {
      payments.push(payment);
    }

    this.setItem(STORAGE_KEYS.PAYMENTS, payments);
  }

  getPaymentsByUserId(userId: string): Payment[] {
    return this.getPayments().filter(p => p.user_id === userId);
  }

  getPaymentsByType(userId: string, type: Payment['type']): Payment[] {
    return this.getPaymentsByUserId(userId).filter(p => p.type === type);
  }

  // Session methods
  saveSession(session: Session): void {
    this.setItem(STORAGE_KEYS.SESSION, session);
  }

  getSession(): Session | null {
    return this.getItem<Session>(STORAGE_KEYS.SESSION);
  }

  clearSession(): void {
    this.removeItem(STORAGE_KEYS.SESSION);
  }

  // Remembered login helpers
  saveRememberedLogin(data: { phone: string; userType?: 'shop_owner' | 'end_user' }): void {
    this.setItem(STORAGE_KEYS.REMEMBERED_LOGIN, data);
  }

  getRememberedLogin():
    | {
        phone: string;
        userType?: 'shop_owner' | 'end_user';
      }
    | null {
    return this.getItem(STORAGE_KEYS.REMEMBERED_LOGIN);
  }

  clearRememberedLogin(): void {
    this.removeItem(STORAGE_KEYS.REMEMBERED_LOGIN);
  }

  // Favorite methods
  getFavorites(): Favorite[] {
    return this.getItem<Favorite[]>(STORAGE_KEYS.FAVORITES) || [];
  }

  saveFavorite(favorite: Favorite): void {
    const favorites = this.getFavorites();
    const existingIndex = favorites.findIndex(
      f => f.user_id === favorite.user_id && f.type === favorite.type && f.item_id === favorite.item_id
    );

    if (existingIndex >= 0) {
      favorites[existingIndex] = favorite;
    } else {
      favorites.push(favorite);
    }

    this.setItem(STORAGE_KEYS.FAVORITES, favorites);
  }

  deleteFavorite(favoriteId: string): void {
    const favorites = this.getFavorites().filter(f => f.id !== favoriteId);
    this.setItem(STORAGE_KEYS.FAVORITES, favorites);
  }

  getFavoritesByUserId(userId: string): Favorite[] {
    return this.getFavorites().filter(f => f.user_id === userId);
  }

  getFavoritesByType(userId: string, type: 'product' | 'shop'): Favorite[] {
    return this.getFavoritesByUserId(userId).filter(f => f.type === type);
  }

  isFavorite(userId: string, type: 'product' | 'shop', itemId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(f => f.user_id === userId && f.type === type && f.item_id === itemId);
  }

  removeFavorite(userId: string, type: 'product' | 'shop', itemId: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(f => !(f.user_id === userId && f.type === type && f.item_id === itemId));
    this.setItem(STORAGE_KEYS.FAVORITES, filtered);
  }
}

const storageService = new StorageService();
export default storageService;

