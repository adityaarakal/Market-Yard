// User Types
export interface User {
  id: string;
  phone_number: string;
  email?: string;
  name: string;
  user_type: 'shop_owner' | 'end_user' | 'staff' | 'admin';
  password_hash?: string;
  is_premium: boolean;
  subscription_expires_at?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Shop Types
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

// Product Types
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

// Shop Product Types
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

// Price Update Types
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

// Subscription Types
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

// Payment Types
export interface Payment {
  id: string;
  user_id: string;
  shop_owner_id?: string;
  type: 'subscription' | 'price_update_incentive' | 'refund';
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  method?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Session Types
export interface Session {
  user: User;
  token: string;
}
