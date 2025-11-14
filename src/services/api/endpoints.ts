/**
 * API Endpoints Definition
 * This file defines all API endpoints for easy reference and type safety
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    VERIFY_OTP: '/api/auth/verify-otp',
    SEND_OTP: '/api/auth/send-otp',
    ME: '/api/auth/me',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },

  // Users
  USERS: {
    LIST: '/api/users',
    GET: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },

  // Shops
  SHOPS: {
    LIST: '/api/shops',
    GET: (id: string) => `/api/shops/${id}`,
    CREATE: '/api/shops',
    UPDATE: (id: string) => `/api/shops/${id}`,
    DELETE: (id: string) => `/api/shops/${id}`,
    BY_OWNER: (ownerId: string) => `/api/shops/owner/${ownerId}`,
    PRODUCTS: (shopId: string) => `/api/shops/${shopId}/products`,
    PRICES: (shopId: string) => `/api/shops/${shopId}/prices`,
  },

  // Products
  PRODUCTS: {
    LIST: '/api/products',
    GET: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
    BY_CATEGORY: (category: string) => `/api/products/category/${category}`,
    SEARCH: '/api/products/search',
    GLOBAL_PRICES: '/api/products/global-prices',
    COMPARE: '/api/products/compare',
  },

  // Shop Products
  SHOP_PRODUCTS: {
    LIST: (shopId: string) => `/api/shop-products/shop/${shopId}`,
    GET: (id: string) => `/api/shop-products/${id}`,
    CREATE: '/api/shop-products',
    UPDATE: (id: string) => `/api/shop-products/${id}`,
    DELETE: (id: string) => `/api/shop-products/${id}`,
  },

  // Price Updates
  PRICE_UPDATES: {
    LIST: '/api/price-updates',
    GET: (id: string) => `/api/price-updates/${id}`,
    CREATE: '/api/price-updates',
    BY_SHOP: (shopId: string) => `/api/price-updates/shop/${shopId}`,
    HISTORY: (shopProductId: string) => `/api/price-updates/history/${shopProductId}`,
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    LIST: '/api/subscriptions',
    GET: (id: string) => `/api/subscriptions/${id}`,
    CREATE: '/api/subscriptions',
    UPDATE: (id: string) => `/api/subscriptions/${id}`,
    CANCEL: (id: string) => `/api/subscriptions/${id}/cancel`,
    STATUS: (userId: string) => `/api/subscriptions/user/${userId}`,
    PLANS: '/api/subscriptions/plans',
  },

  // Payments
  PAYMENTS: {
    LIST: '/api/payments',
    GET: (id: string) => `/api/payments/${id}`,
    CREATE: '/api/payments',
    HISTORY: (userId: string) => `/api/payments/user/${userId}`,
    WEBHOOK: '/api/payments/webhook',
  },

  // Favorites
  FAVORITES: {
    LIST: (userId: string) => `/api/favorites/user/${userId}`,
    ADD: '/api/favorites',
    REMOVE: (id: string) => `/api/favorites/${id}`,
    CHECK: (userId: string, type: string, itemId: string) =>
      `/api/favorites/check/${userId}/${type}/${itemId}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: (userId: string) => `/api/notifications/user/${userId}`,
    GET: (id: string) => `/api/notifications/${id}`,
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: (userId: string) => `/api/notifications/user/${userId}/read-all`,
    DELETE: (id: string) => `/api/notifications/${id}`,
    PREFERENCES: (userId: string) => `/api/notifications/preferences/${userId}`,
  },

  // Search
  SEARCH: {
    PRODUCTS: '/api/search/products',
    SHOPS: '/api/search/shops',
    GLOBAL: '/api/search',
  },
} as const;

