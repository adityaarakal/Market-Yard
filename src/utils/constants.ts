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
} as const;

// App Constants
export const APP_CONFIG = {
  PRICE_UPDATE_INCENTIVE: 1.0, // ₹1 per price update
  PREMIUM_SUBSCRIPTION_PRICE: 100.0, // ₹100 per month
  MOCK_OTP: '123456', // For testing
  MOCK_PAYMENT_SUCCESS_RATE: 0.9, // 90% success rate for testing (0.0 to 1.0)
  MOCK_PAYMENT_DELAY_MS: 1500, // Simulate payment processing delay
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  PHONE_NUMBER_REGEX: /^[6-9]\d{9}$/, // Indian phone number
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
};

