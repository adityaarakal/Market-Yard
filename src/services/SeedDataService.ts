import StorageService from './StorageService';
import { STORAGE_KEYS } from '../utils/constants';
import { User, Shop, Product, ShopProduct, PriceUpdate } from '../types';
import { generateId } from '../utils/id';

class SeedDataService {
  private hasSeedData(): boolean {
    const products = StorageService.getProducts();
    const users = StorageService.getUsers();
    const shops = StorageService.getShops();
    return products.length > 0 && users.length > 0 && shops.length > 0;
  }

  seedProducts(): void {
    const now = new Date().toISOString();
    const products: Product[] = [
      // Fruits
      {
        id: 'prod_1',
        name: 'Apple',
        category: 'fruits',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_2',
        name: 'Banana',
        category: 'fruits',
        unit: 'dozen',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_3',
        name: 'Orange',
        category: 'fruits',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_4',
        name: 'Mango',
        category: 'fruits',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_5',
        name: 'Grapes',
        category: 'fruits',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      // Vegetables
      {
        id: 'prod_6',
        name: 'Tomato',
        category: 'vegetables',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_7',
        name: 'Onion',
        category: 'vegetables',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_8',
        name: 'Potato',
        category: 'vegetables',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_9',
        name: 'Carrot',
        category: 'vegetables',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_10',
        name: 'Cabbage',
        category: 'vegetables',
        unit: 'piece',
        is_active: true,
        created_at: now,
      },
      // Farming Materials
      {
        id: 'prod_11',
        name: 'Fertilizer',
        category: 'farming_materials',
        unit: 'pack',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_12',
        name: 'Seeds',
        category: 'farming_materials',
        unit: 'pack',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_13',
        name: 'Pesticide',
        category: 'farming_materials',
        unit: 'litre',
        is_active: true,
        created_at: now,
      },
      // Farming Products
      {
        id: 'prod_14',
        name: 'Wheat',
        category: 'farming_products',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_15',
        name: 'Rice',
        category: 'farming_products',
        unit: 'kg',
        is_active: true,
        created_at: now,
      },
    ];

    StorageService.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  seedUsers(): void {
    const now = new Date().toISOString();
    const users: User[] = [
      {
        id: 'user_1',
        phone_number: '9876543210',
        name: 'Shop Owner 1',
        user_type: 'shop_owner',
        password_hash: 'password123',
        is_premium: false,
        is_active: true,
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user_2',
        phone_number: '9876543211',
        name: 'End User 1',
        user_type: 'end_user',
        password_hash: 'password123',
        is_premium: false,
        is_active: true,
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user_3',
        phone_number: '9876543212',
        name: 'Premium User',
        user_type: 'end_user',
        password_hash: 'password123',
        is_premium: true,
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user_admin',
        phone_number: '9999999999',
        name: 'Admin User',
        user_type: 'admin',
        password_hash: 'admin123',
        is_premium: true,
        is_active: true,
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
    ];

    StorageService.setItem(STORAGE_KEYS.USERS, users);
  }

  seedShops(): void {
    const now = new Date().toISOString();
    const shops: Shop[] = [
      {
        id: 'shop_1',
        owner_id: 'user_1',
        shop_name: 'Fresh Fruits Store',
        address: 'Market Yard, Shop No. 12',
        city: 'Your City',
        category: 'fruits',
        goodwill_score: 95,
        total_ratings: 10,
        average_rating: 4.5,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'shop_2',
        owner_id: 'user_1',
        shop_name: 'Vegetable Paradise',
        address: 'Market Yard, Shop No. 25',
        city: 'Your City',
        category: 'vegetables',
        goodwill_score: 88,
        total_ratings: 8,
        average_rating: 4.2,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ];

    StorageService.setItem(STORAGE_KEYS.SHOPS, shops);
  }

  seedShopInventory(): void {
    const now = new Date();
    const isoNow = now.toISOString();

    const shopProducts: ShopProduct[] = [
      {
        id: 'shop_prod_1',
        shop_id: 'shop_1',
        product_id: 'prod_1',
        is_available: true,
        current_price: 120,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_2',
        shop_id: 'shop_1',
        product_id: 'prod_2',
        is_available: true,
        current_price: 40,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_3',
        shop_id: 'shop_1',
        product_id: 'prod_6',
        is_available: true,
        current_price: 30,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_4',
        shop_id: 'shop_2',
        product_id: 'prod_7',
        is_available: true,
        current_price: 28,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_5',
        shop_id: 'shop_2',
        product_id: 'prod_8',
        is_available: true,
        current_price: 22,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_6',
        shop_id: 'shop_2',
        product_id: 'prod_3',
        is_available: true,
        current_price: 90,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
    ];

    const priceUpdates: PriceUpdate[] = shopProducts.map(sp => ({
      id: generateId('price_update'),
      shop_product_id: sp.id,
      price: sp.current_price || 0,
      updated_by_type: 'shop_owner',
      updated_by_id: 'user_1',
      payment_status: 'paid',
      payment_amount: 1,
      created_at: sp.last_price_update_at || isoNow,
    }));

    StorageService.setItem(STORAGE_KEYS.SHOP_PRODUCTS, shopProducts);
    StorageService.setItem(STORAGE_KEYS.PRICE_UPDATES, priceUpdates);
  }

  seedAll(force = false): void {
    if (!force && this.hasSeedData()) {
      return;
    }

    this.seedProducts();
    this.seedUsers();
    this.seedShops();
    this.seedShopInventory();
    console.log('Seed data created successfully!');
  }

  clearAll(): void {
    StorageService.clear();
    console.log('All data cleared!');
  }
}

const seedDataService = new SeedDataService();
export default seedDataService;

