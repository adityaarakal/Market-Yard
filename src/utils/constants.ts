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
  REMEMBERED_LOGIN: '@market_yard_remembered_login',
  FAVORITES: '@market_yard_favorites',
  NOTIFICATIONS: '@market_yard_notifications',
  NOTIFICATION_PREFERENCES: '@market_yard_notification_preferences',
} as const;

// App Constants
export const APP_CONFIG = {
  PRICE_UPDATE_INCENTIVE: 1.0, // ₹1 per price update
  PREMIUM_SUBSCRIPTION_PRICE: 100.0, // ₹100 per month
  MOCK_OTP: '123456', // For testing - accepts any 6 digits in development
  MOCK_PAYMENT_SUCCESS_RATE: 0.9, // 90% success rate for testing (0.0 to 1.0)
  MOCK_PAYMENT_DELAY_MS: 1500, // Simulate payment processing delay
  AUTO_LOGIN_ENABLED: process.env.NODE_ENV === 'development', // Auto-login in development mode
  AUTO_LOGIN_PHONE: '9999999999', // Default test phone for auto-login
  AUTO_LOGIN_PASSWORD: 'test123', // Default test password for auto-login
  // Feature Flags (can be overridden by environment variables)
  FEATURE_FLAGS: {
    USE_API_MODE: process.env.REACT_APP_USE_API === 'true',
    ENABLE_IMAGE_CACHE: process.env.REACT_APP_ENABLE_IMAGE_CACHE !== 'false',
    ENABLE_SEARCH_HISTORY: process.env.REACT_APP_ENABLE_SEARCH_HISTORY !== 'false',
    ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
    ENABLE_FAVORITES: process.env.REACT_APP_ENABLE_FAVORITES !== 'false',
    ENABLE_PRICE_COMPARISON: process.env.REACT_APP_ENABLE_PRICE_COMPARISON !== 'false',
    ENABLE_ADVANCED_SEARCH: process.env.REACT_APP_ENABLE_ADVANCED_SEARCH !== 'false',
    ENABLE_IMAGE_COMPRESSION: process.env.REACT_APP_ENABLE_IMAGE_COMPRESSION !== 'false',
    ENABLE_OFFLINE_MODE: process.env.REACT_APP_ENABLE_OFFLINE_MODE !== 'false',
  },
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  PHONE_NUMBER_REGEX: /^[6-9]\d{9}$/, // Indian phone number
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
};

