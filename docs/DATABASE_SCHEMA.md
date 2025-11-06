# Database Schema - Market Yard

## Overview

This document provides the complete database schema design for the Market Yard application using PostgreSQL.

---

## Entity Relationship Diagram

```
Users ──┬── Shops (Shop Owners)
        │
        ├── Subscriptions (End Users)
        │
        ├── Payments (All Users)
        │
        └── Reviews (End Users)

Shops ──┬── ShopProducts
        │
        └── Reviews

Products ── ShopProducts ── PriceUpdates ── PriceHistory

ShopProducts ── PriceVerifications (Phase 2)
```

---

## Tables

### 1. users
Stores all user accounts (shop owners and end users).

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('shop_owner', 'end_user', 'staff', 'admin')),
    password_hash VARCHAR(255) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_otp VARCHAR(6),
    otp_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_premium ON users(is_premium);
```

**Fields**:
- `id`: Unique identifier
- `phone_number`: Primary identifier (Indian format)
- `email`: Optional email
- `name`: User's full name
- `user_type`: Role (shop_owner, end_user, staff, admin)
- `password_hash`: Bcrypt hashed password
- `is_premium`: Premium subscription status
- `subscription_expires_at`: When premium expires
- `is_active`: Account status
- `is_verified`: Phone verification status
- `verification_otp`: OTP for verification
- `otp_expires_at`: OTP expiration time

---

### 2. shops
Stores shop information for shop owners.

```sql
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone_number VARCHAR(15),
    category VARCHAR(50) CHECK (category IN ('fruits', 'vegetables', 'farming_materials', 'farming_products', 'mixed')),
    description TEXT,
    image_url VARCHAR(500),
    goodwill_score INTEGER DEFAULT 100 CHECK (goodwill_score >= 0 AND goodwill_score <= 100),
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shops_owner ON shops(owner_id);
CREATE INDEX idx_shops_category ON shops(category);
CREATE INDEX idx_shops_location ON shops(latitude, longitude);
CREATE INDEX idx_shops_goodwill ON shops(goodwill_score);
```

**Fields**:
- `id`: Unique identifier
- `owner_id`: Foreign key to users table
- `shop_name`: Name of the shop
- `address`: Full address
- `city`, `state`, `pincode`: Location details
- `latitude`, `longitude`: GPS coordinates
- `phone_number`: Shop contact number
- `category`: Shop category
- `description`: Shop description
- `image_url`: Shop logo/image URL
- `goodwill_score`: Calculated goodwill score (0-100)
- `total_ratings`: Number of ratings received
- `average_rating`: Average rating (0-5)

---

### 3. products
Master list of all products available in the market.

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('fruits', 'vegetables', 'farming_materials', 'farming_products')),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'piece', 'pack', 'dozen', 'bunch', 'litre', 'gram')),
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE FULLTEXT INDEX idx_products_search ON products(name, description);
```

**Fields**:
- `id`: Unique identifier
- `name`: Product name
- `category`: Product category
- `unit`: Unit of measurement
- `description`: Product description
- `image_url`: Product image URL
- `is_active`: Whether product is active in system

---

### 4. shop_products
Junction table linking shops to products (many-to-many relationship).

```sql
CREATE TABLE shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    current_price DECIMAL(10, 2),
    last_price_update_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_id, product_id)
);

CREATE INDEX idx_shop_products_shop ON shop_products(shop_id);
CREATE INDEX idx_shop_products_product ON shop_products(product_id);
CREATE INDEX idx_shop_products_price ON shop_products(current_price);
CREATE INDEX idx_shop_products_available ON shop_products(is_available);
```

**Fields**:
- `id`: Unique identifier
- `shop_id`: Foreign key to shops
- `product_id`: Foreign key to products
- `is_available`: Whether product is currently available
- `current_price`: Latest price for this product at this shop
- `last_price_update_at`: When price was last updated

---

### 5. price_updates
Records all price updates made by shop owners or staff.

```sql
CREATE TABLE price_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    updated_by_type VARCHAR(20) NOT NULL CHECK (updated_by_type IN ('shop_owner', 'staff')),
    updated_by_id UUID NOT NULL REFERENCES users(id),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
    payment_amount DECIMAL(10, 2) DEFAULT 1.00,
    payment_id UUID REFERENCES payments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_updates_shop_product ON price_updates(shop_product_id);
CREATE INDEX idx_price_updates_updated_by ON price_updates(updated_by_id);
CREATE INDEX idx_price_updates_date ON price_updates(created_at);
CREATE INDEX idx_price_updates_payment ON price_updates(payment_status);
```

**Fields**:
- `id`: Unique identifier
- `shop_product_id`: Foreign key to shop_products
- `price`: Updated price
- `updated_by_type`: Who updated (shop_owner or staff)
- `updated_by_id`: User who made the update
- `payment_status`: Payment status for ₹1 incentive
- `payment_amount`: Amount to be paid (default ₹1)
- `payment_id`: Link to payment record

---

### 6. price_history
Historical price data for analytics and trends.

```sql
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_product_id, date)
);

CREATE INDEX idx_price_history_shop_product ON price_history(shop_product_id);
CREATE INDEX idx_price_history_date ON price_history(date);
CREATE INDEX idx_price_history_composite ON price_history(shop_product_id, date);
```

**Fields**:
- `id`: Unique identifier
- `shop_product_id`: Foreign key to shop_products
- `price`: Price on this date
- `date`: Date of price record
- `created_at`: Record creation timestamp

**Note**: This table can be partitioned by date for better performance with large datasets.

---

### 7. subscriptions
Stores subscription information for premium users.

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_subscription_id VARCHAR(255) UNIQUE,
    razorpay_plan_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    amount DECIMAL(10, 2) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);
CREATE INDEX idx_subscriptions_razorpay ON subscriptions(razorpay_subscription_id);
```

**Fields**:
- `id`: Unique identifier
- `user_id`: Foreign key to users
- `razorpay_subscription_id`: Razorpay subscription ID
- `razorpay_plan_id`: Razorpay plan ID
- `status`: Subscription status
- `amount`: Monthly subscription amount
- `started_at`: When subscription started
- `expires_at`: When subscription expires
- `cancelled_at`: Cancellation timestamp
- `auto_renew`: Whether to auto-renew

---

### 8. payments
Records all payment transactions (subscriptions and price update incentives).

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    shop_owner_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('subscription', 'price_update_incentive', 'refund')),
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_order_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded')),
    method VARCHAR(50),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_shop_owner ON payments(shop_owner_id);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_date ON payments(created_at);
```

**Fields**:
- `id`: Unique identifier
- `user_id`: User making/receiving payment
- `shop_owner_id`: Shop owner receiving incentive payment
- `type`: Payment type
- `razorpay_payment_id`: Razorpay payment ID
- `razorpay_order_id`: Razorpay order ID
- `amount`: Payment amount
- `currency`: Currency (INR)
- `status`: Payment status
- `method`: Payment method (UPI, card, etc.)
- `description`: Payment description
- `metadata`: Additional payment data (JSON)

---

### 9. reviews (Phase 2)
User reviews for shops.

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_id, user_id)
);

CREATE INDEX idx_reviews_shop ON reviews(shop_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_date ON reviews(created_at);
```

**Fields**:
- `id`: Unique identifier
- `shop_id`: Shop being reviewed
- `user_id`: User writing review
- `rating`: Rating (1-5 stars)
- `comment`: Review text
- `is_verified_purchase`: Whether user actually purchased
- `helpful_count`: Number of helpful votes
- `is_visible`: Whether review is visible

---

### 10. price_verifications (Phase 2)
User feedback on price accuracy after purchase.

```sql
CREATE TABLE price_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listed_price DECIMAL(10, 2) NOT NULL,
    actual_price_paid DECIMAL(10, 2) NOT NULL,
    was_discounted BOOLEAN DEFAULT FALSE,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    price_accuracy VARCHAR(20) CHECK (price_accuracy IN ('accurate', 'higher', 'lower', 'discounted')),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_verifications_shop_product ON price_verifications(shop_product_id);
CREATE INDEX idx_price_verifications_user ON price_verifications(user_id);
CREATE INDEX idx_price_verifications_accuracy ON price_verifications(price_accuracy);
CREATE INDEX idx_price_verifications_date ON price_verifications(created_at);
```

**Fields**:
- `id`: Unique identifier
- `shop_product_id`: Product and shop combination
- `user_id`: User providing feedback
- `listed_price`: Price shown in app
- `actual_price_paid`: Price actually paid
- `was_discounted`: Whether discount was given
- `discount_amount`: Discount amount if any
- `price_accuracy`: Accuracy status
- `feedback`: Additional comments

---

### 11. notifications
In-app notifications for users.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at);
```

**Fields**:
- `id`: Unique identifier
- `user_id`: User receiving notification
- `type`: Notification type
- `title`: Notification title
- `message`: Notification message
- `data`: Additional data (JSON)
- `is_read`: Read status
- `read_at`: When notification was read

---

## Database Functions & Triggers

### 1. Update Shop Rating Trigger
Automatically updates shop's average rating when a review is added/updated.

```sql
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shops
    SET 
        total_ratings = (SELECT COUNT(*) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE)
    WHERE id = NEW.shop_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shop_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_shop_rating();
```

### 2. Update Current Price Trigger
Updates `shop_products.current_price` when a new price update is made.

```sql
CREATE OR REPLACE FUNCTION update_current_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shop_products
    SET 
        current_price = NEW.price,
        last_price_update_at = NEW.created_at
    WHERE id = NEW.shop_product_id;
    
    -- Insert into price_history
    INSERT INTO price_history (shop_product_id, price, date)
    VALUES (NEW.shop_product_id, NEW.price, CURRENT_DATE)
    ON CONFLICT (shop_product_id, date) DO UPDATE
    SET price = NEW.price;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_current_price
AFTER INSERT ON price_updates
FOR EACH ROW
EXECUTE FUNCTION update_current_price();
```

### 3. Update Timestamp Trigger
Automatically updates `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Repeat for other tables that need updated_at
```

---

## Views

### 1. Global Prices View
Aggregated view for global price page.

```sql
CREATE VIEW global_prices AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.category,
    p.unit,
    p.image_url,
    COUNT(DISTINCT sp.shop_id) AS shop_count,
    MIN(sp.current_price) AS min_price,
    MAX(sp.current_price) AS max_price,
    AVG(sp.current_price) AS avg_price,
    (SELECT s.shop_name 
     FROM shops s 
     JOIN shop_products sp2 ON s.id = sp2.shop_id 
     WHERE sp2.product_id = p.id 
     ORDER BY sp2.current_price ASC 
     LIMIT 1) AS best_shop_name,
    (SELECT s.id 
     FROM shops s 
     JOIN shop_products sp2 ON s.id = sp2.shop_id 
     WHERE sp2.product_id = p.id 
     ORDER BY sp2.current_price ASC 
     LIMIT 1) AS best_shop_id
FROM products p
LEFT JOIN shop_products sp ON p.id = sp.product_id
WHERE p.is_active = TRUE AND sp.is_available = TRUE
GROUP BY p.id, p.name, p.category, p.unit, p.image_url;
```

---

## Indexes Summary

All indexes are included in the table definitions above. Key indexes:
- Foreign key indexes for join performance
- Search indexes (name, category, phone_number)
- Date indexes for time-based queries
- Composite indexes for common query patterns

---

## Data Migration & Seeding

### Initial Data
- Default products list (fruits, vegetables, farming materials)
- Admin user account
- Sample categories

### Data Maintenance
- Archive old price_history records (older than 1 year)
- Clean up expired OTPs
- Update goodwill scores daily (cron job)

---

## Backup & Recovery

- Daily automated backups
- Point-in-time recovery capability
- Transaction log backups every 15 minutes
- Backup retention: 30 days

---

## Performance Considerations

1. **Partitioning**: Consider partitioning `price_history` by date/month
2. **Materialized Views**: For complex aggregations (global prices)
3. **Connection Pooling**: Use PgBouncer or similar
4. **Read Replicas**: For read-heavy operations
5. **Caching**: Cache frequently accessed data (shops, products, global prices)

