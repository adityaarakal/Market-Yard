import { STORAGE_KEYS } from '../utils/constants';
import {
  User,
  Shop,
  Product,
  ShopProduct,
  PriceUpdate,
  Subscription,
  Session,
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
      sp => sp.shop_id === shopProduct.shop_id && sp.product_id === shopProduct.product_id
    );

    if (existingIndex >= 0) {
      shopProducts[existingIndex] = shopProduct;
    } else {
      shopProducts.push(shopProduct);
    }

    this.setItem(STORAGE_KEYS.SHOP_PRODUCTS, shopProducts);
  }

  getShopProductsByShopId(shopId: string): ShopProduct[] {
    const shopProducts = this.getShopProducts();
    return shopProducts.filter(sp => sp.shop_id === shopId);
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
}

const storageService = new StorageService();
export default storageService;

