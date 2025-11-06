# Local Storage Implementation Guide - Market Yard

## Overview

This guide provides implementation details for using AsyncStorage (local storage) in the Market Yard mobile app during frontend development phase. All data will be stored locally for testing and UI feedback collection.

---

## AsyncStorage Setup

### Installation

```bash
npm install @react-native-async-storage/async-storage
# or
expo install @react-native-async-storage/async-storage
```

### Basic Usage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store data
await AsyncStorage.setItem('key', JSON.stringify(data));

// Retrieve data
const data = await AsyncStorage.getItem('key');
const parsed = data ? JSON.parse(data) : null;

// Remove data
await AsyncStorage.removeItem('key');

// Clear all
await AsyncStorage.clear();
```

---

## Storage Service Implementation

### Storage Service Structure

```typescript
// services/StorageService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
export const STORAGE_KEYS = {
  USERS: '@market_yard_users',
  SHOPS: '@market_yard_shops',
  PRODUCTS: '@market_yard_products',
  SHOP_PRODUCTS: '@market_yard_shop_products',
  PRICE_UPDATES: '@market_yard_price_updates',
  PRICE_HISTORY: '@market_yard_price_history',
  SUBSCRIPTIONS: '@market_yard_subscriptions',
  PAYMENTS: '@market_yard_payments',
  SESSION: '@market_yard_session',
  SETTINGS: '@market_yard_settings',
} as const;

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

  // User-specific methods
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

  // Shop-specific methods
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

  // Product-specific methods
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

  // Price update methods
  async getPriceUpdates(): Promise<PriceUpdate[]> {
    return (await this.getItem<PriceUpdate[]>(STORAGE_KEYS.PRICE_UPDATES)) || [];
  }

  async savePriceUpdate(update: PriceUpdate): Promise<void> {
    const updates = await this.getPriceUpdates();
    updates.push(update);
    await this.setItem(STORAGE_KEYS.PRICE_UPDATES, updates);
  }

  // Session management
  async saveSession(session: { user: User; token: string }): Promise<void> {
    await this.setItem(STORAGE_KEYS.SESSION, session);
  }

  async getSession(): Promise<{ user: User; token: string } | null> {
    return await this.getItem<{ user: User; token: string }>(STORAGE_KEYS.SESSION);
  }

  async clearSession(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.SESSION);
  }
}

export default new StorageService();
```

---

## Data Models

### Type Definitions

```typescript
// types/index.ts

export interface User {
  id: string;
  phone_number: string;
  email?: string;
  name: string;
  user_type: 'shop_owner' | 'end_user' | 'staff' | 'admin';
  password_hash?: string; // For local storage, store plain (for testing)
  is_premium: boolean;
  subscription_expires_at?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  shop_name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  phone_number?: string;
  category: 'fruits' | 'vegetables' | 'farming_materials' | 'farming_products' | 'mixed';
  description?: string;
  image_url?: string;
  goodwill_score: number;
  total_ratings: number;
  average_rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'fruits' | 'vegetables' | 'farming_materials' | 'farming_products';
  unit: 'kg' | 'piece' | 'pack' | 'dozen' | 'bunch' | 'litre' | 'gram';
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ShopProduct {
  id: string;
  shop_id: string;
  product_id: string;
  is_available: boolean;
  current_price?: number;
  last_price_update_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceUpdate {
  id: string;
  shop_product_id: string;
  price: number;
  updated_by_type: 'shop_owner' | 'staff';
  updated_by_id: string;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed';
  payment_amount: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  amount: number;
  started_at: string;
  expires_at: string;
  cancelled_at?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data Implementation

### Seed Data Service

```typescript
// services/SeedDataService.ts

import StorageService from './StorageService';
import { User, Shop, Product, ShopProduct } from '../types';

class SeedDataService {
  async seedProducts(): Promise<void> {
    const products: Product[] = [
      // Fruits
      { id: '1', name: 'Apple', category: 'fruits', unit: 'kg', is_active: true, created_at: new Date().toISOString() },
      { id: '2', name: 'Banana', category: 'fruits', unit: 'dozen', is_active: true, created_at: new Date().toISOString() },
      { id: '3', name: 'Orange', category: 'fruits', unit: 'kg', is_active: true, created_at: new Date().toISOString() },
      { id: '4', name: 'Mango', category: 'fruits', unit: 'kg', is_active: true, created_at: new Date().toISOString() },
      
      // Vegetables
      { id: '5', name: 'Tomato', category: 'vegetables', unit: 'kg', is_active: true, created_at: new Date().toISOString() },
      { id: '6', name: 'Onion', category: 'vegetables', unit: 'kg', is_active: true, created_at: new Date().toISOString() },
      { id: '7', name: 'Potato', category: 'vegetables', unit: 'kg', is_active: true, created_at: new Date().toISOString() },
      { id: '8', name: 'Carrot', category: 'vegetables', unit: 'kg', is_active: true, created_at: new Date().toISOString() },
      
      // Farming Materials
      { id: '9', name: 'Fertilizer', category: 'farming_materials', unit: 'pack', is_active: true, created_at: new Date().toISOString() },
      { id: '10', name: 'Seeds', category: 'farming_materials', unit: 'pack', is_active: true, created_at: new Date().toISOString() },
      
      // Add more products as needed
    ];

    await StorageService.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  async seedShops(): Promise<void> {
    const shops: Shop[] = [
      {
        id: 'shop1',
        owner_id: 'user1',
        shop_name: 'Fresh Fruits Store',
        address: 'Market Yard, Shop No. 12',
        city: 'Your City',
        category: 'fruits',
        goodwill_score: 95,
        total_ratings: 10,
        average_rating: 4.5,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Add more shops
    ];

    await StorageService.setItem(STORAGE_KEYS.SHOPS, shops);
  }

  async seedAll(): Promise<void> {
    await this.seedProducts();
    await this.seedShops();
    // Add other seed functions
  }
}

export default new SeedDataService();
```

---

## Usage Examples

### Creating a User

```typescript
import StorageService from './services/StorageService';
import { User } from './types';

const createUser = async (phone: string, name: string, userType: 'shop_owner' | 'end_user') => {
  const user: User = {
    id: `user_${Date.now()}`,
    phone_number: phone,
    name,
    user_type: userType,
    is_premium: false,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await StorageService.saveUser(user);
  return user;
};
```

### Updating Price

```typescript
import StorageService from './services/StorageService';
import { PriceUpdate, ShopProduct } from './types';

const updatePrice = async (shopProductId: string, price: number, userId: string) => {
  // Create price update
  const priceUpdate: PriceUpdate = {
    id: `update_${Date.now()}`,
    shop_product_id: shopProductId,
    price,
    updated_by_type: 'shop_owner',
    updated_by_id: userId,
    payment_status: 'pending',
    payment_amount: 1.00,
    created_at: new Date().toISOString(),
  };

  await StorageService.savePriceUpdate(priceUpdate);

  // Update shop product current price
  const shopProducts = await StorageService.getItem<ShopProduct[]>(STORAGE_KEYS.SHOP_PRODUCTS) || [];
  const shopProduct = shopProducts.find(sp => sp.id === shopProductId);
  if (shopProduct) {
    shopProduct.current_price = price;
    shopProduct.last_price_update_at = new Date().toISOString();
    await StorageService.setItem(STORAGE_KEYS.SHOP_PRODUCTS, shopProducts);
  }
};
```

### Calculating Global Prices

```typescript
const getGlobalPrices = async () => {
  const products = await StorageService.getProducts();
  const shopProducts = await StorageService.getItem<ShopProduct[]>(STORAGE_KEYS.SHOP_PRODUCTS) || [];
  const shops = await StorageService.getShops();

  return products.map(product => {
    const productShopProducts = shopProducts.filter(
      sp => sp.product_id === product.id && sp.is_available && sp.current_price
    );

    const prices = productShopProducts.map(sp => sp.current_price!).filter(p => p > 0);

    if (prices.length === 0) {
      return {
        product,
        min_price: null,
        max_price: null,
        avg_price: null,
        best_shop: null,
      };
    }

    const minPrice = Math.min(...prices);
    const minPriceShopProduct = productShopProducts.find(sp => sp.current_price === minPrice);
    const bestShop = minPriceShopProduct 
      ? shops.find(s => s.id === minPriceShopProduct.shop_id)
      : null;

    return {
      product,
      min_price: minPrice,
      max_price: Math.max(...prices),
      avg_price: prices.reduce((a, b) => a + b, 0) / prices.length,
      best_shop: bestShop,
      shop_count: prices.length,
    };
  });
};
```

---

## Migration to Backend

### Future Migration Strategy

When ready to integrate with backend:

1. **Create API Service Layer**
   ```typescript
   // services/ApiService.ts
   class ApiService {
     async getUsers(): Promise<User[]> {
       const response = await fetch(`${API_URL}/users`);
       return response.json();
     }
     // Similar methods for all entities
   }
   ```

2. **Create Adapter Layer**
   ```typescript
   // services/DataService.ts
   class DataService {
     constructor(private storage: 'local' | 'api') {}

     async getUsers(): Promise<User[]> {
       if (this.storage === 'local') {
         return StorageService.getUsers();
       } else {
         return ApiService.getUsers();
       }
     }
   }
   ```

3. **Export Local Data**
   ```typescript
   const exportData = async () => {
     return {
       users: await StorageService.getUsers(),
       shops: await StorageService.getShops(),
       products: await StorageService.getProducts(),
       // ... all data
     };
   };
   ```

---

## Best Practices

1. **Always use JSON.stringify/parse** for complex objects
2. **Handle errors** gracefully with try-catch
3. **Validate data** before saving
4. **Generate unique IDs** using UUID or timestamp-based IDs
5. **Update timestamps** on create/update operations
6. **Cache frequently accessed data** in memory for performance
7. **Clear old data** periodically to prevent storage bloat

---

## Testing Utilities

### Clear All Data
```typescript
const clearAllData = async () => {
  await StorageService.clear();
  console.log('All data cleared');
};
```

### Export Data
```typescript
const exportData = async () => {
  const data = {
    users: await StorageService.getUsers(),
    shops: await StorageService.getShops(),
    products: await StorageService.getProducts(),
    // ... all entities
  };
  
  return JSON.stringify(data, null, 2);
};
```

### Import Data
```typescript
const importData = async (jsonData: string) => {
  const data = JSON.parse(jsonData);
  await StorageService.setItem(STORAGE_KEYS.USERS, data.users);
  await StorageService.setItem(STORAGE_KEYS.SHOPS, data.shops);
  // ... set all entities
};
```

---

**Last Updated**: 2024

