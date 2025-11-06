# Architecture & Design Document - Market Yard

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │  Shop Owner App  │          │   End User App   │         │
│  │  - Price Updates │          │  - Price Browse  │         │
│  │  - Product Mgmt  │          │  - Comparison    │         │
│  │  - Earnings      │          │  - Subscription  │         │
│  └──────────────────┘          └──────────────────┘         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS / WebSocket
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    API Gateway Layer                         │
│  - Request Routing                                            │
│  - Rate Limiting                                              │
│  - Authentication Middleware                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  Backend Services (Node.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Product    │  │  Payment     │      │
│  │   Service    │  │   Service    │  │  Service     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Price      │  │ Subscription │  │ Notification │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼────┐  ┌──────▼──────┐  ┌─────▼──────┐
│ PostgreSQL │  │    Redis    │  │  Razorpay  │
│  Database  │  │   (Cache)   │  │   (API)    │
└────────────┘  └─────────────┘  └────────────┘
```

---

## Application Structure

### Mobile App Modules

#### 1. Authentication Module
- User registration/login
- Shop owner registration
- JWT token management
- Role-based access control (Shop Owner vs End User)

#### 2. Shop Owner Module
- Dashboard
- Product management (add/edit products)
- Daily price updates
- Earnings tracking (₹1 per update)
- Price history view

#### 3. End User Module
- Product browsing
- Global price page (free)
- Shop-specific prices (premium)
- Price comparison
- Favorites/bookmarks
- Search and filters

#### 4. Subscription Module
- Subscription plans display
- Payment integration (Razorpay)
- Subscription status
- Payment history

#### 5. Reviews & Ratings Module (Phase 2)
- Shop reviews
- Price verification feedback
- Goodwill indicator display

---

## Database Schema Design

### Core Tables

#### Users Table
```sql
users
├── id (PK)
├── phone_number (unique)
├── email
├── name
├── user_type (shop_owner | end_user)
├── password_hash
├── is_premium (boolean)
├── subscription_expires_at
├── created_at
└── updated_at
```

#### Shops Table
```sql
shops
├── id (PK)
├── owner_id (FK -> users.id)
├── shop_name
├── address
├── phone_number
├── category (fruits | vegetables | farming_materials | farming_products)
├── goodwill_score (default: 100)
├── total_ratings
├── average_rating
├── created_at
└── updated_at
```

#### Products Table
```sql
products
├── id (PK)
├── name
├── category
├── unit (kg | piece | pack | etc.)
├── description
├── image_url
└── created_at
```

#### Shop Products Table (Many-to-Many)
```sql
shop_products
├── id (PK)
├── shop_id (FK -> shops.id)
├── product_id (FK -> products.id)
├── is_available (boolean)
├── created_at
└── updated_at
```

#### Price Updates Table
```sql
price_updates
├── id (PK)
├── shop_product_id (FK -> shop_products.id)
├── price (decimal)
├── updated_by_type (shop_owner | staff)
├── updated_by_id (FK -> users.id)
├── payment_status (pending | paid)
├── payment_amount (default: 1 INR)
├── created_at
└── updated_at
```

#### Price History Table
```sql
price_history
├── id (PK)
├── shop_product_id (FK -> shop_products.id)
├── price (decimal)
├── date
├── created_at
└── INDEX on (shop_product_id, date)
```

#### Subscriptions Table
```sql
subscriptions
├── id (PK)
├── user_id (FK -> users.id)
├── razorpay_subscription_id
├── razorpay_plan_id
├── status (active | cancelled | expired)
├── started_at
├── expires_at
├── amount_paid
└── created_at
```

#### Payments Table
```sql
payments
├── id (PK)
├── user_id (FK -> users.id)
├── shop_owner_id (FK -> users.id) [for price update payments]
├── type (subscription | price_update_incentive)
├── razorpay_payment_id
├── amount
├── status (pending | success | failed)
├── created_at
└── updated_at
```

#### Reviews Table (Phase 2)
```sql
reviews
├── id (PK)
├── shop_id (FK -> shops.id)
├── user_id (FK -> users.id)
├── rating (1-5)
├── comment
├── price_accuracy (accurate | higher | lower | discounted)
├── created_at
└── updated_at
```

#### Price Verification Feedback (Phase 2)
```sql
price_verifications
├── id (PK)
├── shop_product_id (FK -> shop_products.id)
├── user_id (FK -> users.id)
├── listed_price
├── actual_price_paid
├── was_discounted (boolean)
├── discount_amount
├── feedback
├── created_at
└── updated_at
```

---

## API Endpoints Design

### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
GET    /api/auth/me
```

### Shop Owner Endpoints
```
GET    /api/shop-owner/shop
POST   /api/shop-owner/shop
PUT    /api/shop-owner/shop
GET    /api/shop-owner/products
POST   /api/shop-owner/products
PUT    /api/shop-owner/products/:id
POST   /api/shop-owner/prices/update
GET    /api/shop-owner/earnings
GET    /api/shop-owner/payment-history
```

### End User Endpoints
```
GET    /api/products
GET    /api/products/:id
GET    /api/products/global-prices
GET    /api/products/compare
GET    /api/shops
GET    /api/shops/:id
GET    /api/shops/:id/products
GET    /api/shops/:id/prices (premium only)
GET    /api/search
```

### Subscription Endpoints
```
GET    /api/subscriptions/plans
POST   /api/subscriptions/create
POST   /api/subscriptions/payment-webhook (Razorpay)
GET    /api/subscriptions/status
POST   /api/subscriptions/cancel
```

### Reviews & Ratings Endpoints (Phase 2)
```
GET    /api/shops/:id/reviews
POST   /api/shops/:id/reviews
POST   /api/prices/verify
GET    /api/shops/:id/goodwill
```

---

## Data Flow Diagrams

### Price Update Flow

```
Shop Owner → Opens App → Selects Product → Enters Price → Submit
                                                         ↓
                    Backend receives → Validates → Saves to DB
                                                         ↓
                    Updates Price Updates Table → Updates Price History
                                                         ↓
                    Queue Payment (₹1) → Redis Cache Update
                                                         ↓
                    Broadcast to All Users (WebSocket) → App Updates
```

### Price Discovery Flow (End User)

```
End User → Opens App → Browse Global Prices (Free)
                      ↓
         Premium User? → Yes → View Shop-Specific Prices
                      ↓
         No → Show Limited View
                      ↓
         User Clicks Product → Show Best Price Shops
                      ↓
         User Can Filter/Sort → Apply Filters
                      ↓
         Display Results → User Makes Decision
```

### Subscription Flow

```
End User → View Premium Features → Click Subscribe
                                           ↓
         Backend creates Razorpay subscription
                                           ↓
         User redirected to Razorpay Payment
                                           ↓
         Payment Success → Webhook received
                                           ↓
         Update user subscription status → Grant Premium Access
```

---

## Security Considerations

1. **Authentication**
   - JWT tokens with refresh tokens
   - Secure token storage on mobile (Keychain/Keystore)
   - Token expiration and rotation

2. **Authorization**
   - Role-based access control (RBAC)
   - Endpoint-level permission checks
   - Shop owner can only update their own shop data

3. **Data Validation**
   - Input validation on all endpoints
   - SQL injection prevention (parameterized queries)
   - XSS prevention

4. **Payment Security**
   - Razorpay handles PCI compliance
   - Webhook signature verification
   - Idempotency keys for payment operations

5. **Rate Limiting**
   - Prevent abuse of price update endpoints
   - Limit API calls per user
   - Prevent spam updates

---

## Performance Optimizations

1. **Caching Strategy**
   - Redis cache for global price page
   - Cache TTL: 5-15 minutes
   - Cache invalidation on price updates

2. **Database Optimization**
   - Indexes on frequently queried columns
   - Price history partitioning by date
   - Connection pooling

3. **Mobile App**
   - Image optimization and lazy loading
   - Pagination for product lists
   - Offline capability for cached data

4. **API Optimization**
   - Response compression
   - Pagination for large datasets
   - Selective field loading

---

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless API design
   - Load balancer for multiple backend instances
   - Database read replicas

2. **Microservices (Future)**
   - Split into services (Auth, Products, Payments, etc.)
   - Message queue for async operations
   - Service mesh for inter-service communication

3. **Caching Layers**
   - CDN for static assets
   - Redis for hot data
   - Database query caching

---

## Monitoring & Analytics

1. **Application Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - API response times

2. **Business Metrics**
   - Daily active users (DAU)
   - Price update frequency
   - Premium conversion rate
   - Revenue tracking

3. **User Analytics**
   - Feature usage tracking
   - User journey analysis
   - Conversion funnel

---

## Future Enhancements (Phase 2+)

1. **AI/ML Features**
   - Price prediction based on history
   - Demand forecasting
   - Recommendation engine

2. **Advanced Features**
   - Order placement (if shop owners want)
   - Delivery tracking
   - Inventory management
   - Multi-language support

3. **Integration**
   - WhatsApp notifications
   - SMS alerts for price drops
   - Email digests

