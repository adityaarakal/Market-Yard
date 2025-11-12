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
    const existingProducts = StorageService.getProducts();
    
    const seedProducts: Product[] = [
      // Fruits
      {
        id: 'prod_1',
        name: 'Apple',
        category: 'fruits',
        unit: 'kg',
        description: 'Fresh red apples, rich in vitamins and fiber',
        image_url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_2',
        name: 'Banana',
        category: 'fruits',
        unit: 'dozen',
        description: 'Ripe yellow bananas, high in potassium',
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_3',
        name: 'Orange',
        category: 'fruits',
        unit: 'kg',
        description: 'Sweet and juicy oranges, excellent source of Vitamin C',
        image_url: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_4',
        name: 'Mango',
        category: 'fruits',
        unit: 'kg',
        description: 'Sweet and aromatic mangoes, the king of fruits',
        image_url: 'https://images.unsplash.com/photo-1605027990121-c2fd0ee0ef86?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_5',
        name: 'Grapes',
        category: 'fruits',
        unit: 'kg',
        description: 'Fresh green and red grapes, perfect for snacking',
        image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_16',
        name: 'Papaya',
        category: 'fruits',
        unit: 'kg',
        description: 'Ripe papaya, rich in antioxidants and enzymes',
        image_url: 'https://images.unsplash.com/photo-1615485925511-87058e5945aa?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_17',
        name: 'Watermelon',
        category: 'fruits',
        unit: 'piece',
        description: 'Sweet and refreshing watermelon, perfect for summer',
        image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_18',
        name: 'Pineapple',
        category: 'fruits',
        unit: 'piece',
        description: 'Tropical pineapple, sweet and tangy',
        image_url: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_19',
        name: 'Guava',
        category: 'fruits',
        unit: 'kg',
        description: 'Fresh guava, high in Vitamin C and fiber',
        image_url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4e3?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_20',
        name: 'Pomegranate',
        category: 'fruits',
        unit: 'kg',
        description: 'Fresh pomegranate, antioxidant-rich superfruit',
        image_url: 'https://images.unsplash.com/photo-1601645129556-3c74b294ba40?w=400',
        is_active: true,
        created_at: now,
      },
      // Vegetables
      {
        id: 'prod_6',
        name: 'Tomato',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh red tomatoes, essential for cooking',
        image_url: 'https://images.unsplash.com/photo-1546470427-e26264be0f42?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_7',
        name: 'Onion',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh onions, a kitchen staple',
        image_url: 'https://images.unsplash.com/photo-1618512496249-c5f68e4fd6e9?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_8',
        name: 'Potato',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh potatoes, versatile and nutritious',
        image_url: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_9',
        name: 'Carrot',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh carrots, rich in beta-carotene',
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_10',
        name: 'Cabbage',
        category: 'vegetables',
        unit: 'piece',
        description: 'Fresh green cabbage, perfect for salads and cooking',
        image_url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_21',
        name: 'Cauliflower',
        category: 'vegetables',
        unit: 'piece',
        description: 'Fresh white cauliflower, versatile vegetable',
        image_url: 'https://images.unsplash.com/photo-1592841200221-09021825c5e6?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_22',
        name: 'Brinjal',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh purple brinjal (eggplant), popular in Indian cuisine',
        image_url: 'https://images.unsplash.com/photo-1594282418426-62d3c1374fdc?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_23',
        name: 'Capsicum',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh bell peppers, available in green, red, and yellow',
        image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_24',
        name: 'Ladies Finger',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh okra (ladies finger), rich in fiber',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_25',
        name: 'Spinach',
        category: 'vegetables',
        unit: 'bunch',
        description: 'Fresh green spinach, packed with iron and vitamins',
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_26',
        name: 'Cucumber',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh cucumber, hydrating and refreshing',
        image_url: 'https://images.unsplash.com/photo-1604977043462-5b83b3c09fe7?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_27',
        name: 'Beetroot',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh beetroot, vibrant and nutritious',
        image_url: 'https://images.unsplash.com/photo-1604977043462-5b83b3c09fe7?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_28',
        name: 'Radish',
        category: 'vegetables',
        unit: 'bunch',
        description: 'Fresh white radish, crisp and peppery',
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
        is_active: true,
        created_at: now,
      },
      // Farming Materials
      {
        id: 'prod_11',
        name: 'Fertilizer',
        category: 'farming_materials',
        unit: 'pack',
        description: 'Organic and chemical fertilizers for crop nutrition',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_12',
        name: 'Seeds',
        category: 'farming_materials',
        unit: 'pack',
        description: 'Quality seeds for various crops and vegetables',
        image_url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_13',
        name: 'Pesticide',
        category: 'farming_materials',
        unit: 'litre',
        description: 'Effective pesticides for crop protection',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_29',
        name: 'Herbicide',
        category: 'farming_materials',
        unit: 'litre',
        description: 'Weed control herbicides for farms',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_30',
        name: 'Manure',
        category: 'farming_materials',
        unit: 'kg',
        description: 'Organic manure for soil enrichment',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_31',
        name: 'Garden Tools',
        category: 'farming_materials',
        unit: 'pack',
        description: 'Essential gardening and farming tools',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        is_active: true,
        created_at: now,
      },
      // Farming Products
      {
        id: 'prod_14',
        name: 'Wheat',
        category: 'farming_products',
        unit: 'kg',
        description: 'Premium quality wheat grains',
        image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_15',
        name: 'Rice',
        category: 'farming_products',
        unit: 'kg',
        description: 'Fine quality rice grains',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_32',
        name: 'Jowar',
        category: 'farming_products',
        unit: 'kg',
        description: 'Sorghum (jowar) grains, nutritious millet',
        image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_33',
        name: 'Bajra',
        category: 'farming_products',
        unit: 'kg',
        description: 'Pearl millet (bajra) grains',
        image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_34',
        name: 'Corn',
        category: 'farming_products',
        unit: 'kg',
        description: 'Fresh corn kernels',
        image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_35',
        name: 'Lentils',
        category: 'farming_products',
        unit: 'kg',
        description: 'Various types of lentils (dal)',
        image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
        is_active: true,
        created_at: now,
      },
    ];

    // Merge seed products with existing products (update if exists, add if new)
    const mergedProducts = [...existingProducts];
    
    seedProducts.forEach(seedProduct => {
      const existingIndex = mergedProducts.findIndex(
        p => p.id === seedProduct.id || p.name.toLowerCase() === seedProduct.name.toLowerCase()
      );
      if (existingIndex >= 0) {
        // Update existing product with new data (preserve ID)
        mergedProducts[existingIndex] = {
          ...mergedProducts[existingIndex],
          ...seedProduct,
          id: mergedProducts[existingIndex].id, // Preserve existing ID
        };
      } else {
        // Add new product
        mergedProducts.push(seedProduct);
      }
    });

    StorageService.setItem(STORAGE_KEYS.PRODUCTS, mergedProducts);
  }

  seedUsers(): void {
    const now = new Date().toISOString();
    const existingUsers = StorageService.getUsers();
    
    const seedUsers: User[] = [
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

    // Merge seed users with existing users (update if exists, add if new)
    const mergedUsers = [...existingUsers];
    
    seedUsers.forEach(seedUser => {
      const existingIndex = mergedUsers.findIndex(u => u.id === seedUser.id || u.phone_number === seedUser.phone_number);
      if (existingIndex >= 0) {
        // Update existing user
        mergedUsers[existingIndex] = seedUser;
      } else {
        // Add new user
        mergedUsers.push(seedUser);
      }
    });

    StorageService.setItem(STORAGE_KEYS.USERS, mergedUsers);
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
      // Even if data exists, ensure admin user is always present
      this.ensureAdminUser();
      return;
    }

    this.seedProducts();
    this.seedUsers();
    this.seedShops();
    this.seedShopInventory();
    console.log('Seed data created successfully!');
  }

  ensureAdminUser(): void {
    const existingUsers = StorageService.getUsers();
    const adminUser = existingUsers.find(u => u.phone_number === '9999999999' || u.id === 'user_admin');
    
    if (!adminUser) {
      // Admin user doesn't exist, add it
      const now = new Date().toISOString();
      const newAdminUser: User = {
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
      };
      StorageService.saveUser(newAdminUser);
      console.log('Admin user added to existing data');
    }
  }

  clearAll(): void {
    StorageService.clear();
    console.log('All data cleared!');
  }
}

const seedDataService = new SeedDataService();
export default seedDataService;

