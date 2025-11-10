# Frontend Development Tasks - Market Yard

## 📋 Overview

This document tracks all frontend development tasks for the Market Yard Progressive Web App. **All data persistence will use browser `localStorage`** during the initial development phase for testing and UI feedback collection.

**Note**: All API calls and backend integration will be implemented later. For now, we simulate backend behavior using local storage.

---

## 🎯 Development Approach

### Local Storage Strategy
- **AsyncStorage**: Primary storage for all app data
- **Mock Data**: Seed initial data for testing
- **Data Structure**: Match backend schema structure for easy migration
- **Storage Keys**: Organized by feature (e.g., `@users`, `@shops`, `@products`, `@price_updates`)

### Migration Path
- All data structures will mirror backend schema
- Helper functions will abstract storage operations
- Easy to swap AsyncStorage calls with API calls later
- Data can be exported/imported for migration

---

## 📱 Project Setup

### Phase 0: Project Initialization

- [ ] **TASK-001**: Initialize React Native + Expo project
  - [ ] Create new Expo project
  - [ ] Configure TypeScript
  - [ ] Set up project structure (components, screens, services, utils, types)
  - [ ] Install core dependencies (AsyncStorage, navigation, etc.)
  - [ ] Configure ESLint and Prettier
  - [ ] Set up Git ignore and environment files

- [ ] **TASK-002**: Set up navigation structure
  - [ ] Install React Navigation
  - [ ] Create navigation types
  - [ ] Set up stack navigators (Auth, Shop Owner, End User)
  - [ ] Create tab navigators for main app flows
  - [ ] Implement navigation guards

- [ ] **TASK-003**: Set up local storage service
  - [ ] Create AsyncStorage service wrapper
  - [ ] Define storage keys constants
  - [ ] Create data models/types matching backend schema
  - [ ] Implement CRUD operations for each entity
  - [ ] Create seed data function for initial testing
  - [ ] Implement data export/import utilities

- [ ] **TASK-004**: Set up UI foundation
  - [ ] Install UI library (React Native Paper or NativeBase)
  - [ ] Define color scheme and theme
  - [ ] Create typography system
  - [ ] Set up reusable components (Button, Input, Card, etc.)
  - [ ] Create layout components (Container, Header, Footer)
  - [ ] Set up loading and error states

- [ ] **TASK-005**: Create authentication context/state management
  - [ ] Set up React Context for auth state
  - [ ] Implement login/logout functions
  - [ ] Create user session management
  - [ ] Implement "Remember me" functionality
  - [ ] Store auth token in AsyncStorage

---

## 🔐 Authentication Module

### Phase 1: Authentication Screens

- [x] **TASK-101**: Onboarding/Welcome Screen
  - [x] Design welcome screen
  - [x] User type selection (Shop Owner / End User)
  - [x] Navigation to registration/login

- [x] **TASK-102**: Registration Screen
  - [x] Phone number input with validation
  - [x] OTP verification screen (mock OTP: use 123456)
  - [x] User details form (name, email - optional)
  - [x] Password creation with strength indicator
  - [x] Terms & conditions checkbox
  - [x] Save user to storage
  - [x] Error handling and validation messages

- [x] **TASK-103**: Login Screen
  - [x] Phone number + password login
  - [x] OTP login option (mock)
  - [x] "Remember me" checkbox
  - [x] Forgot password link (placeholder)
  - [x] Navigate based on user type
  - [x] Store session in storage

- [x] **TASK-104**: Profile Management Screen
  - [x] View profile information
  - [x] Edit profile form
  - [ ] Profile picture upload (local storage)
  - [x] Change password (update in storage)
  - [x] View subscription status
  - [x] Logout functionality

---

## 🏪 Shop Owner Module

### Phase 2: Shop Owner Setup

- [ ] **TASK-201**: Shop Registration Screen
  - [ ] Multi-step form wizard
  - [ ] Step 1: Shop name and category
  - [ ] Step 2: Address input (with map picker - optional)
  - [ ] Step 3: Contact details
  - [ ] Step 4: Shop description and image upload
  - [ ] Step 5: Review and submit
  - [ ] Save shop data to AsyncStorage
  - [ ] Link shop to logged-in user

- [ ] **TASK-202**: Shop Owner Dashboard
  - [ ] Overview statistics (total products, earnings, etc.)
  - [ ] Quick actions (update prices, add products)
  - [ ] Recent price updates
  - [ ] Earnings summary card
  - [ ] Navigation to key features

- [ ] **TASK-203**: Product Management Screen
  - [ ] List of products in shop catalog
  - [ ] Search products from master list (stored in AsyncStorage)
  - [ ] Add product to shop catalog
  - [ ] Remove product from catalog
  - [ ] Toggle product availability
  - [ ] Product details view

- [ ] **TASK-204**: Product Master List (Local Storage)
  - [ ] Create seed data for common products
  - [ ] Categories: Fruits, Vegetables, Farming Materials, Farming Products
  - [ ] Product details (name, category, unit, image)
  - [ ] Store in AsyncStorage as master list
  - [ ] Search and filter functionality

- [ ] **TASK-205**: Daily Price Update Screen
  - [ ] List all products in shop
  - [ ] Price input for each product
  - [ ] Bulk update option
  - [ ] Quick price entry (numeric keyboard)
  - [ ] Save price updates to AsyncStorage
  - [ ] Record timestamp and update type
  - [ ] Calculate earnings (₹1 per update)
  - [ ] Visual confirmation of updates

- [ ] **TASK-206**: Price History Screen
  - [ ] View price history for each product
  - [ ] Filter by date range
  - [ ] Price trend visualization (simple line chart)
  - [ ] Export price history (optional)

- [ ] **TASK-207**: Earnings Dashboard
  - [ ] Total earnings display
  - [ ] Earnings breakdown (today, this month, all time)
  - [ ] Pending payments list
  - [ ] Completed payments history
  - [ ] Payment status indicators
  - [ ] Export earnings report (optional)

---

## 🛒 End User Module (Free Version)

### Phase 3: Basic End User Features

- [ ] **TASK-301**: Home Screen (Free User)
  - [ ] Welcome message
  - [ ] Quick access to global prices
  - [ ] Search bar
  - [ ] Category cards
  - [ ] "Upgrade to Premium" CTA

- [ ] **TASK-302**: Global Price Page
  - [ ] List all products with price ranges
  - [ ] Display: Product name, min price, max price, best shop
  - [ ] Product images
  - [ ] Category filter
  - [ ] Search functionality
  - [ ] Sort options (price, name)
  - [ ] Pull to refresh

- [ ] **TASK-303**: Product Detail Screen (Free)
  - [ ] Product information
  - [ ] Price range display
  - [ ] Best value shop (name only)
  - [ ] Product image gallery
  - [ ] "View Shop Details - Upgrade to Premium" CTA
  - [ ] Related products

- [ ] **TASK-304**: Product Browse & Search
  - [ ] Browse by category
  - [ ] Search with suggestions
  - [ ] Filter options
  - [ ] Sort options
  - [ ] Product cards with images

- [ ] **TASK-305**: Categories Screen
  - [ ] Category grid/list view
  - [ ] Category icons/images
  - [ ] Product count per category
  - [ ] Navigation to category products

---

## 👑 End User Module (Premium Version)

### Phase 4: Premium Features

- [ ] **TASK-401**: Premium Upgrade Screen
  - [ ] Feature comparison (Free vs Premium)
  - [ ] Pricing information (₹100/month)
  - [ ] Payment integration UI (mock for now)
  - [ ] Terms and conditions
  - [ ] Upgrade button (simulate payment)

- [ ] **TASK-402**: Shop-Specific Price View
  - [ ] List all shops selling a product
  - [ ] Shop details (name, address, phone)
  - [ ] Price comparison table
  - [ ] Distance calculation (if location enabled)
  - [ ] Shop rating display
  - [ ] Contact shop button
  - [ ] Filter by location

- [ ] **TASK-403**: Advanced Price Comparison
  - [ ] Select multiple products
  - [ ] Select multiple shops
  - [ ] Side-by-side comparison table
  - [ ] Visual highlight of best prices
  - [ ] Export comparison (optional)

- [ ] **TASK-404**: Price History & Trends Screen
  - [ ] Price history for selected product
  - [ ] Price history for specific shop
  - [ ] Date range selector
  - [ ] Line chart visualization (use a chart library)
  - [ ] Price statistics (average, min, max)
  - [ ] Shop-specific vs global view

- [ ] **TASK-405**: Advanced Insights Dashboard
  - [ ] Most popular shops
  - [ ] Trending products
  - [ ] Best deals section
  - [ ] User purchasing patterns (mock data)
  - [ ] Charts and graphs
  - [ ] Recommendations

- [ ] **TASK-406**: Subscription Management Screen
  - [ ] View subscription status
  - [ ] Subscription expiry date
  - [ ] Renew subscription button
  - [ ] Cancel subscription option
  - [ ] Payment history
  - [ ] Invoice download (mock)

---

## 🎨 UI/UX Components

### Phase 5: Reusable Components

- [ ] **TASK-501**: Form Components
  - [ ] TextInput with validation
  - [ ] Phone number input with formatting
  - [ ] Password input with show/hide
  - [ ] OTP input (6 digits)
  - [ ] Dropdown/Picker components
  - [ ] Checkbox and Radio buttons
  - [ ] Date picker

- [ ] **TASK-502**: Display Components
  - [ ] Product card
  - [ ] Shop card
  - [ ] Price display component
  - [ ] Rating display (stars)
  - [ ] Badge/Label components
  - [ ] Empty state component
  - [ ] Loading skeleton

- [ ] **TASK-503**: Navigation Components
  - [ ] Header with back button
  - [ ] Tab bar
  - [ ] Bottom navigation
  - [ ] Breadcrumbs (if needed)

- [ ] **TASK-504**: Feedback Components
  - [ ] Toast/SNackbar notifications
  - [ ] Alert dialogs
  - [ ] Loading spinner
  - [ ] Error message display
  - [ ] Success message display

- [ ] **TASK-505**: List Components
  - [ ] FlatList optimizations
  - [ ] Pull to refresh
  - [ ] Infinite scroll
  - [ ] Section list for categories

---

## 📊 Data Management

### Phase 6: Local Storage Implementation

- [x] **TASK-601**: User Data Service
  - [x] Create user in local storage
  - [x] Get user by phone number
  - [x] Update user profile
  - [x] Delete user (for testing)
  - [x] Get all users (for admin)

- [x] **TASK-602**: Shop Data Service
  - [x] Create shop
  - [x] Get shop by owner ID
  - [x] Get all shops
  - [x] Update shop details
  - [x] Delete shop

- [x] **TASK-603**: Product Data Service
  - [x] Seed master product list
  - [x] Get all products
  - [x] Get products by category
  - [x] Search products
  - [x] Get product by ID

- [x] **TASK-604**: Shop Products Service
  - [x] Add product to shop
  - [x] Remove product from shop
  - [x] Get shop products
  - [x] Update product availability

- [ ] **TASK-605**: Price Update Service
  - [ ] Create price update
  - [ ] Get price updates by shop
  - [ ] Get current prices for shop
  - [ ] Get price history
  - [ ] Calculate earnings

- [ ] **TASK-606**: Global Price Service
  - [ ] Calculate global prices (min, max, avg)
  - [ ] Get best shop for each product
  - [ ] Filter and sort prices
  - [ ] Cache global prices

- [ ] **TASK-607**: Subscription Service
  - [ ] Create subscription
  - [ ] Check subscription status
  - [ ] Update subscription
  - [ ] Cancel subscription
  - [ ] Get payment history

---

## 🧪 Testing & Seed Data

### Phase 7: Testing Setup

- [ ] **TASK-701**: Create Seed Data Script
  - [ ] Seed master product list (50+ products)
  - [ ] Seed sample shops (5-10 shops)
  - [ ] Seed sample users (shop owners + end users)
  - [ ] Seed sample price updates
  - [ ] Seed sample subscriptions

- [ ] **TASK-702**: Data Reset Functionality
  - [ ] Clear all data option (for testing)
  - [ ] Reset to seed data
  - [ ] Export data function
  - [ ] Import data function

- [ ] **TASK-703**: Mock Authentication
  - [ ] Mock OTP verification (accept any 6 digits)
  - [ ] Mock login validation
  - [ ] Auto-login for testing

- [ ] **TASK-704**: Mock Payment Flow
  - [ ] Simulate payment success
  - [ ] Simulate payment failure
  - [ ] Update subscription status

---

## 📱 Additional Features

### Phase 8: Enhanced Features

- [ ] **TASK-801**: Favorites/Bookmarks
  - [ ] Add product to favorites
  - [ ] Add shop to favorites
  - [ ] View favorites list
  - [ ] Remove from favorites

- [ ] **TASK-802**: Notifications (Local)
  - [ ] In-app notification center
  - [ ] Notification list
  - [ ] Mark as read/unread
  - [ ] Notification preferences screen

- [ ] **TASK-803**: Settings Screen
  - [ ] App settings
  - [ ] Notification preferences
  - [ ] Language selection (placeholder)
  - [ ] About screen
  - [ ] Help & Support

- [ ] **TASK-804**: Search Improvements
  - [ ] Search history
  - [ ] Popular searches
  - [ ] Search suggestions
  - [ ] Recent searches

- [ ] **TASK-805**: Image Handling
  - [ ] Image picker integration
  - [ ] Image compression
  - [ ] Image caching
  - [ ] Placeholder images

---

## 🔄 Future Integration Points

### Phase 9: Backend Integration Preparation

- [ ] **TASK-901**: API Service Layer Structure
  - [ ] Create API service abstraction
  - [ ] Define API endpoints structure
  - [ ] Create request/response types
  - [ ] Error handling structure

- [ ] **TASK-902**: Data Migration Utilities
  - [ ] Export local storage data
  - [ ] Format for backend migration
  - [ ] Import scripts for backend

- [ ] **TASK-903**: Feature Flags
  - [ ] Set up feature flags
  - [ ] Toggle between local storage and API
  - [ ] Environment-based configuration

---

## 📝 Local Storage Schema

### Storage Keys Structure

```typescript
// Storage Keys
const STORAGE_KEYS = {
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
};
```

### Data Models (Matching Backend Schema)

```typescript
// User Model
interface User {
  id: string;
  phone_number: string;
  email?: string;
  name: string;
  user_type: 'shop_owner' | 'end_user' | 'staff' | 'admin';
  is_premium: boolean;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Shop Model
interface Shop {
  id: string;
  owner_id: string;
  shop_name: string;
  address: string;
  city?: string;
  state?: string;
  category: string;
  phone_number?: string;
  goodwill_score: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

// Product Model
interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  image_url?: string;
  created_at: string;
}

// ShopProduct Model
interface ShopProduct {
  id: string;
  shop_id: string;
  product_id: string;
  is_available: boolean;
  current_price: number;
  last_price_update_at?: string;
}

// PriceUpdate Model
interface PriceUpdate {
  id: string;
  shop_product_id: string;
  price: number;
  updated_by_type: 'shop_owner' | 'staff';
  updated_by_id: string;
  payment_status: 'pending' | 'paid';
  created_at: string;
}

// Subscription Model
interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string;
  amount: number;
}
```

---

## 🎯 Priority Order

### Sprint 1 (Week 1-2)
1. Project Setup (TASK-001 to TASK-005)
2. Authentication Screens (TASK-101 to TASK-104)
3. Basic Data Services (TASK-601, TASK-602)

### Sprint 2 (Week 3-4)
1. Shop Owner Setup (TASK-201 to TASK-204)
2. Price Update Feature (TASK-205)
3. Product & Shop Services (TASK-603, TASK-604, TASK-605)

### Sprint 3 (Week 5-6)
1. End User Free Features (TASK-301 to TASK-305)
2. Global Price Service (TASK-606)
3. UI Components (TASK-501 to TASK-504)

### Sprint 4 (Week 7-8)
1. Premium Features (TASK-401 to TASK-406)
2. Subscription Service (TASK-607)
3. Seed Data (TASK-701 to TASK-704)

### Sprint 5 (Week 9-10)
1. Additional Features (TASK-801 to TASK-805)
2. Polish and Refinement
3. User Testing Preparation

---

## ✅ Progress Tracking

**Total Tasks**: ~60 tasks  
**Completed**: 8  
**In Progress**: 0  
**Pending**: 52

**Current Phase**: Project Setup

---

## 📌 Notes

- All data will be stored in AsyncStorage for initial development
- Data structures match backend schema for easy migration
- Mock authentication (accept any valid format)
- Mock payments (simulate success/failure)
- Focus on UI/UX and user flow first
- Backend integration will be added later as separate tasks

---

**Last Updated**: 2025  
**Status**: Planning Phase

