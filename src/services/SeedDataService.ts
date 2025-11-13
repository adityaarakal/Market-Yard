import StorageService from './StorageService';
import { STORAGE_KEYS } from '../utils/constants';
import { User, Shop, Product, ShopProduct, PriceUpdate, Subscription, Payment } from '../types';
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
      // Additional Fruits (prod_36 to prod_50)
      {
        id: 'prod_36',
        name: 'Strawberry',
        category: 'fruits',
        unit: 'kg',
        description: 'Fresh red strawberries, sweet and juicy',
        image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_37',
        name: 'Cherry',
        category: 'fruits',
        unit: 'kg',
        description: 'Fresh red cherries, sweet and tart',
        image_url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_38',
        name: 'Kiwi',
        category: 'fruits',
        unit: 'piece',
        description: 'Fresh kiwi fruit, rich in Vitamin C',
        image_url: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_39',
        name: 'Dragon Fruit',
        category: 'fruits',
        unit: 'piece',
        description: 'Exotic dragon fruit, refreshing and nutritious',
        image_url: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_40',
        name: 'Lychee',
        category: 'fruits',
        unit: 'kg',
        description: 'Fresh lychee, sweet and aromatic',
        image_url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_41',
        name: 'Custard Apple',
        category: 'fruits',
        unit: 'kg',
        description: 'Sweet custard apple (sitaphal), creamy texture',
        image_url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_42',
        name: 'Sapota',
        category: 'fruits',
        unit: 'kg',
        description: 'Sweet sapota (chikoo), rich and flavorful',
        image_url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400',
        is_active: true,
        created_at: now,
      },
      // Additional Vegetables (prod_43 to prod_50)
      {
        id: 'prod_43',
        name: 'Green Beans',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh green beans, crisp and nutritious',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_44',
        name: 'Peas',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh green peas, sweet and tender',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_45',
        name: 'Bottle Gourd',
        category: 'vegetables',
        unit: 'piece',
        description: 'Fresh bottle gourd (lauki), light and healthy',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_46',
        name: 'Ridge Gourd',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh ridge gourd (turai), nutritious vegetable',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_47',
        name: 'Bitter Gourd',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh bitter gourd (karela), known for health benefits',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_48',
        name: 'Drumstick',
        category: 'vegetables',
        unit: 'bunch',
        description: 'Fresh drumstick (moringa), rich in nutrients',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_49',
        name: 'Broccoli',
        category: 'vegetables',
        unit: 'piece',
        description: 'Fresh broccoli, rich in vitamins and fiber',
        image_url: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_50',
        name: 'Zucchini',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh zucchini, versatile and healthy',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_51',
        name: 'Sweet Potato',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh sweet potato, nutritious and flavorful',
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
        is_active: true,
        created_at: now,
      },
      {
        id: 'prod_52',
        name: 'Yam',
        category: 'vegetables',
        unit: 'kg',
        description: 'Fresh yam, starchy and nutritious',
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
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
        id: 'user_4',
        phone_number: '9876543213',
        name: 'Shop Owner 2',
        user_type: 'shop_owner',
        password_hash: 'password123',
        is_premium: false,
        is_active: true,
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user_5',
        phone_number: '9876543214',
        name: 'Shop Owner 3',
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
        id: 'user_6',
        phone_number: '9876543215',
        name: 'End User 2',
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
      {
        id: 'shop_3',
        owner_id: 'user_4',
        shop_name: 'Green Groceries',
        address: 'Market Yard, Shop No. 8',
        city: 'Your City',
        category: 'mixed',
        goodwill_score: 92,
        total_ratings: 15,
        average_rating: 4.6,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'shop_4',
        owner_id: 'user_4',
        shop_name: 'Farming Supplies Center',
        address: 'Market Yard, Shop No. 30',
        city: 'Your City',
        category: 'farming_materials',
        goodwill_score: 85,
        total_ratings: 12,
        average_rating: 4.3,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'shop_5',
        owner_id: 'user_5',
        shop_name: 'Grain Market',
        address: 'Market Yard, Shop No. 18',
        city: 'Your City',
        category: 'farming_products',
        goodwill_score: 90,
        total_ratings: 20,
        average_rating: 4.7,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'shop_6',
        owner_id: 'user_5',
        shop_name: 'Tropical Fruits',
        address: 'Market Yard, Shop No. 5',
        city: 'Your City',
        category: 'fruits',
        goodwill_score: 87,
        total_ratings: 9,
        average_rating: 4.4,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'shop_7',
        owner_id: 'user_1',
        shop_name: 'Organic Vegetables',
        address: 'Market Yard, Shop No. 15',
        city: 'Your City',
        category: 'vegetables',
        goodwill_score: 93,
        total_ratings: 18,
        average_rating: 4.8,
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
        product_id: 'prod_3',
        is_available: true,
        current_price: 90,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_4',
        shop_id: 'shop_1',
        product_id: 'prod_4',
        is_available: true,
        current_price: 80,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_5',
        shop_id: 'shop_1',
        product_id: 'prod_5',
        is_available: true,
        current_price: 60,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      // Shop 2 - Vegetable Paradise
      {
        id: 'shop_prod_6',
        shop_id: 'shop_2',
        product_id: 'prod_6',
        is_available: true,
        current_price: 30,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_7',
        shop_id: 'shop_2',
        product_id: 'prod_7',
        is_available: true,
        current_price: 28,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_8',
        shop_id: 'shop_2',
        product_id: 'prod_8',
        is_available: true,
        current_price: 22,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_9',
        shop_id: 'shop_2',
        product_id: 'prod_9',
        is_available: true,
        current_price: 35,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_10',
        shop_id: 'shop_2',
        product_id: 'prod_10',
        is_available: true,
        current_price: 25,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      // Shop 3 - Green Groceries (Mixed)
      {
        id: 'shop_prod_11',
        shop_id: 'shop_3',
        product_id: 'prod_1',
        is_available: true,
        current_price: 115,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_12',
        shop_id: 'shop_3',
        product_id: 'prod_6',
        is_available: true,
        current_price: 32,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_13',
        shop_id: 'shop_3',
        product_id: 'prod_7',
        is_available: true,
        current_price: 30,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_14',
        shop_id: 'shop_3',
        product_id: 'prod_14',
        is_available: true,
        current_price: 45,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      // Shop 4 - Farming Supplies Center
      {
        id: 'shop_prod_15',
        shop_id: 'shop_4',
        product_id: 'prod_11',
        is_available: true,
        current_price: 250,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_16',
        shop_id: 'shop_4',
        product_id: 'prod_12',
        is_available: true,
        current_price: 150,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_17',
        shop_id: 'shop_4',
        product_id: 'prod_13',
        is_available: true,
        current_price: 180,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      // Shop 5 - Grain Market
      {
        id: 'shop_prod_18',
        shop_id: 'shop_5',
        product_id: 'prod_14',
        is_available: true,
        current_price: 42,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_19',
        shop_id: 'shop_5',
        product_id: 'prod_15',
        is_available: true,
        current_price: 50,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_20',
        shop_id: 'shop_5',
        product_id: 'prod_32',
        is_available: true,
        current_price: 38,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_21',
        shop_id: 'shop_5',
        product_id: 'prod_35',
        is_available: true,
        current_price: 120,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      // Shop 6 - Tropical Fruits
      {
        id: 'shop_prod_22',
        shop_id: 'shop_6',
        product_id: 'prod_4',
        is_available: true,
        current_price: 85,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_23',
        shop_id: 'shop_6',
        product_id: 'prod_17',
        is_available: true,
        current_price: 35,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_24',
        shop_id: 'shop_6',
        product_id: 'prod_18',
        is_available: true,
        current_price: 55,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      // Shop 7 - Organic Vegetables
      {
        id: 'shop_prod_25',
        shop_id: 'shop_7',
        product_id: 'prod_9',
        is_available: true,
        current_price: 38,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_26',
        shop_id: 'shop_7',
        product_id: 'prod_25',
        is_available: true,
        current_price: 20,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
      {
        id: 'shop_prod_27',
        shop_id: 'shop_7',
        product_id: 'prod_49',
        is_available: true,
        current_price: 60,
        last_price_update_at: isoNow,
        created_at: isoNow,
        updated_at: isoNow,
      },
    ];

    const priceUpdates: PriceUpdate[] = shopProducts.map(sp => {
      // Determine owner based on shop_id
      let ownerId = 'user_1';
      if (sp.shop_id === 'shop_3' || sp.shop_id === 'shop_4') {
        ownerId = 'user_4';
      } else if (sp.shop_id === 'shop_5' || sp.shop_id === 'shop_6') {
        ownerId = 'user_5';
      }
      
      return {
        id: generateId('price_update'),
        shop_product_id: sp.id,
        price: sp.current_price || 0,
        updated_by_type: 'shop_owner',
        updated_by_id: ownerId,
        payment_status: 'paid',
        payment_amount: 1,
        created_at: sp.last_price_update_at || isoNow,
      };
    });

    StorageService.setItem(STORAGE_KEYS.SHOP_PRODUCTS, shopProducts);
    StorageService.setItem(STORAGE_KEYS.PRICE_UPDATES, priceUpdates);
  }

  seedSubscriptions(): void {
    const now = new Date();
    const isoNow = now.toISOString();
    const existingSubscriptions = StorageService.getSubscriptions();
    
    const subscriptions: Subscription[] = [
      {
        id: generateId('subscription'),
        user_id: 'user_3',
        status: 'active',
        amount: 100,
        started_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: true,
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: isoNow,
      },
      {
        id: generateId('subscription'),
        user_id: 'user_admin',
        status: 'active',
        amount: 100,
        started_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: true,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: isoNow,
      },
    ];

    // Merge with existing subscriptions (only add if user doesn't have an active subscription)
    subscriptions.forEach(subscription => {
      const existingActive = existingSubscriptions.find(
        s => s.user_id === subscription.user_id && s.status === 'active'
      );
      if (!existingActive) {
        StorageService.saveSubscription(subscription);
      }
    });
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
    this.seedSubscriptions();
    console.log('Seed data created successfully!');
    console.log(`- ${StorageService.getProducts().length} products`);
    console.log(`- ${StorageService.getUsers().length} users`);
    console.log(`- ${StorageService.getShops().length} shops`);
    console.log(`- ${StorageService.getShopProducts().length} shop products`);
    console.log(`- ${StorageService.getPriceUpdates().length} price updates`);
    console.log(`- ${StorageService.getSubscriptions().length} subscriptions`);
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

  resetToSeedData(): void {
    this.clearAll();
    this.seedAll(true);
    console.log('Data reset to seed data!');
  }

  exportData(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      users: StorageService.getUsers(),
      shops: StorageService.getShops(),
      products: StorageService.getProducts(),
      shopProducts: StorageService.getShopProducts(),
      priceUpdates: StorageService.getPriceUpdates(),
      subscriptions: StorageService.getSubscriptions(),
      payments: StorageService.getPayments(),
    };

    return JSON.stringify(data, null, 2);
  }

  exportDataAsFile(filename?: string): void {
    const data = this.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `market-yard-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Data exported successfully!');
  }

  importData(jsonData: string, options?: { merge?: boolean; clearBeforeImport?: boolean }): {
    success: boolean;
    message: string;
    counts: {
      users: number;
      shops: number;
      products: number;
      shopProducts: number;
      priceUpdates: number;
      subscriptions: number;
      payments: number;
    };
  } {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      const merge = options?.merge ?? false;
      const clearBeforeImport = options?.clearBeforeImport ?? false;

      if (clearBeforeImport) {
        StorageService.clear();
      }

      const counts = {
        users: 0,
        shops: 0,
        products: 0,
        shopProducts: 0,
        priceUpdates: 0,
        subscriptions: 0,
        payments: 0,
      };

      // Import users
      if (Array.isArray(data.users)) {
        if (merge) {
          const existingUsers = StorageService.getUsers();
          data.users.forEach((user: User) => {
            const existingIndex = existingUsers.findIndex(u => u.id === user.id || u.phone_number === user.phone_number);
            if (existingIndex >= 0) {
              existingUsers[existingIndex] = user;
            } else {
              existingUsers.push(user);
            }
          });
          StorageService.setItem(STORAGE_KEYS.USERS, existingUsers);
          counts.users = existingUsers.length;
        } else {
          StorageService.setItem(STORAGE_KEYS.USERS, data.users);
          counts.users = data.users.length;
        }
      }

      // Import shops
      if (Array.isArray(data.shops)) {
        if (merge) {
          const existingShops = StorageService.getShops();
          data.shops.forEach((shop: Shop) => {
            const existingIndex = existingShops.findIndex(s => s.id === shop.id);
            if (existingIndex >= 0) {
              existingShops[existingIndex] = shop;
            } else {
              existingShops.push(shop);
            }
          });
          StorageService.setItem(STORAGE_KEYS.SHOPS, existingShops);
          counts.shops = existingShops.length;
        } else {
          StorageService.setItem(STORAGE_KEYS.SHOPS, data.shops);
          counts.shops = data.shops.length;
        }
      }

      // Import products
      if (Array.isArray(data.products)) {
        if (merge) {
          const existingProducts = StorageService.getProducts();
          data.products.forEach((product: Product) => {
            const existingIndex = existingProducts.findIndex(
              p => p.id === product.id || p.name.toLowerCase() === product.name.toLowerCase()
            );
            if (existingIndex >= 0) {
              existingProducts[existingIndex] = product;
            } else {
              existingProducts.push(product);
            }
          });
          StorageService.setItem(STORAGE_KEYS.PRODUCTS, existingProducts);
          counts.products = existingProducts.length;
        } else {
          StorageService.setItem(STORAGE_KEYS.PRODUCTS, data.products);
          counts.products = data.products.length;
        }
      }

      // Import shop products
      if (Array.isArray(data.shopProducts)) {
        if (merge) {
          const existingShopProducts = StorageService.getShopProducts();
          data.shopProducts.forEach((shopProduct: ShopProduct) => {
            const existingIndex = existingShopProducts.findIndex(
              sp => sp.id === shopProduct.id || (sp.shop_id === shopProduct.shop_id && sp.product_id === shopProduct.product_id)
            );
            if (existingIndex >= 0) {
              existingShopProducts[existingIndex] = shopProduct;
            } else {
              existingShopProducts.push(shopProduct);
            }
          });
          StorageService.setItem(STORAGE_KEYS.SHOP_PRODUCTS, existingShopProducts);
          counts.shopProducts = existingShopProducts.length;
        } else {
          StorageService.setItem(STORAGE_KEYS.SHOP_PRODUCTS, data.shopProducts);
          counts.shopProducts = data.shopProducts.length;
        }
      }

      // Import price updates
      if (Array.isArray(data.priceUpdates)) {
        if (merge) {
          const existingPriceUpdates = StorageService.getPriceUpdates();
          data.priceUpdates.forEach((priceUpdate: PriceUpdate) => {
            const existingIndex = existingPriceUpdates.findIndex(pu => pu.id === priceUpdate.id);
            if (existingIndex >= 0) {
              existingPriceUpdates[existingIndex] = priceUpdate;
            } else {
              existingPriceUpdates.push(priceUpdate);
            }
          });
          StorageService.setItem(STORAGE_KEYS.PRICE_UPDATES, existingPriceUpdates);
          counts.priceUpdates = existingPriceUpdates.length;
        } else {
          StorageService.setItem(STORAGE_KEYS.PRICE_UPDATES, data.priceUpdates);
          counts.priceUpdates = data.priceUpdates.length;
        }
      }

      // Import subscriptions
      if (Array.isArray(data.subscriptions)) {
        if (merge) {
          const existingSubscriptions = StorageService.getSubscriptions();
          data.subscriptions.forEach((subscription: Subscription) => {
            const existingIndex = existingSubscriptions.findIndex(s => s.id === subscription.id);
            if (existingIndex >= 0) {
              existingSubscriptions[existingIndex] = subscription;
            } else {
              existingSubscriptions.push(subscription);
            }
          });
          StorageService.setItem(STORAGE_KEYS.SUBSCRIPTIONS, existingSubscriptions);
          counts.subscriptions = existingSubscriptions.length;
        } else {
          StorageService.setItem(STORAGE_KEYS.SUBSCRIPTIONS, data.subscriptions);
          counts.subscriptions = data.subscriptions.length;
        }
      }

      // Import payments
      if (Array.isArray(data.payments)) {
        if (merge) {
          const existingPayments = StorageService.getPayments();
          data.payments.forEach((payment: Payment) => {
            const existingIndex = existingPayments.findIndex(p => p.id === payment.id);
            if (existingIndex >= 0) {
              existingPayments[existingIndex] = payment;
            } else {
              existingPayments.push(payment);
            }
          });
          StorageService.setItem(STORAGE_KEYS.PAYMENTS, existingPayments);
          counts.payments = existingPayments.length;
        } else {
          StorageService.setItem(STORAGE_KEYS.PAYMENTS, data.payments);
          counts.payments = data.payments.length;
        }
      }

      console.log('Data imported successfully!', counts);
      return {
        success: true,
        message: 'Data imported successfully',
        counts,
      };
    } catch (error) {
      console.error('Error importing data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        counts: {
          users: 0,
          shops: 0,
          products: 0,
          shopProducts: 0,
          priceUpdates: 0,
          subscriptions: 0,
          payments: 0,
        },
      };
    }
  }

  importDataFromFile(file: File, options?: { merge?: boolean; clearBeforeImport?: boolean }): Promise<{
    success: boolean;
    message: string;
    counts: {
      users: number;
      shops: number;
      products: number;
      shopProducts: number;
      priceUpdates: number;
      subscriptions: number;
      payments: number;
    };
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          const result = this.importData(jsonData, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }
}

const seedDataService = new SeedDataService();
export default seedDataService;

