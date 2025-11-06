import AsyncStorage from '@react-native-async-storage/async-storage';
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
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return (await this.getItem<User[]>(STORAGE_KEYS.USERS)) || [];
  }

  async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    await this.setItem(STORAGE_KEYS.USERS, users);
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.phone_number === phone) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  // Shop methods
  async getShops(): Promise<Shop[]> {
    return (await this.getItem<Shop[]>(STORAGE_KEYS.SHOPS)) || [];
  }

  async saveShop(shop: Shop): Promise<void> {
    const shops = await this.getShops();
    const existingIndex = shops.findIndex(s => s.id === shop.id);

    if (existingIndex >= 0) {
      shops[existingIndex] = shop;
    } else {
      shops.push(shop);
    }

    await this.setItem(STORAGE_KEYS.SHOPS, shops);
  }

  async getShopByOwnerId(ownerId: string): Promise<Shop | null> {
    const shops = await this.getShops();
    return shops.find(s => s.owner_id === ownerId) || null;
  }

  async getShopById(id: string): Promise<Shop | null> {
    const shops = await this.getShops();
    return shops.find(s => s.id === id) || null;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return (await this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS)) || [];
  }

  async saveProduct(product: Product): Promise<void> {
    const products = await this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }

    await this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  // ShopProduct methods
  async getShopProducts(): Promise<ShopProduct[]> {
    return (await this.getItem<ShopProduct[]>(STORAGE_KEYS.SHOP_PRODUCTS)) || [];
  }

  async saveShopProduct(shopProduct: ShopProduct): Promise<void> {
    const shopProducts = await this.getShopProducts();
    const existingIndex = shopProducts.findIndex(
      sp => sp.shop_id === shopProduct.shop_id && sp.product_id === shopProduct.product_id
    );

    if (existingIndex >= 0) {
      shopProducts[existingIndex] = shopProduct;
    } else {
      shopProducts.push(shopProduct);
    }

    await this.setItem(STORAGE_KEYS.SHOP_PRODUCTS, shopProducts);
  }

  async getShopProductsByShopId(shopId: string): Promise<ShopProduct[]> {
    const shopProducts = await this.getShopProducts();
    return shopProducts.filter(sp => sp.shop_id === shopId);
  }

  // Price Update methods
  async getPriceUpdates(): Promise<PriceUpdate[]> {
    return (await this.getItem<PriceUpdate[]>(STORAGE_KEYS.PRICE_UPDATES)) || [];
  }

  async savePriceUpdate(update: PriceUpdate): Promise<void> {
    const updates = await this.getPriceUpdates();
    updates.push(update);
    await this.setItem(STORAGE_KEYS.PRICE_UPDATES, updates);
  }

  async getPriceUpdatesByShopId(shopId: string): Promise<PriceUpdate[]> {
    const updates = await this.getPriceUpdates();
    const shopProducts = await this.getShopProductsByShopId(shopId);
    const shopProductIds = shopProducts.map(sp => sp.id);
    return updates.filter(update => shopProductIds.includes(update.shop_product_id));
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return (await this.getItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS)) || [];
  }

  async saveSubscription(subscription: Subscription): Promise<void> {
    const subscriptions = await this.getSubscriptions();
    const existingIndex = subscriptions.findIndex(s => s.id === subscription.id);

    if (existingIndex >= 0) {
      subscriptions[existingIndex] = subscription;
    } else {
      subscriptions.push(subscription);
    }

    await this.setItem(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const subscriptions = await this.getSubscriptions();
    return subscriptions.find(s => s.user_id === userId && s.status === 'active') || null;
  }

  // Session methods
  async saveSession(session: Session): Promise<void> {
    await this.setItem(STORAGE_KEYS.SESSION, session);
  }

  async getSession(): Promise<Session | null> {
    return await this.getItem<Session>(STORAGE_KEYS.SESSION);
  }

  async clearSession(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.SESSION);
  }
}

export default new StorageService();

