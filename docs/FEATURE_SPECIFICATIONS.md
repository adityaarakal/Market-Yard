# Feature Specifications - Market Yard

## Phase 1: Core Features

---

## 1. Authentication & User Management

### 1.1 User Registration
**Priority**: High  
**User Type**: All Users

**Requirements**:
- Phone number-based registration (primary identifier)
- OTP verification via SMS
- Optional email registration
- User type selection: Shop Owner or End User
- Password creation (min 8 characters)
- Terms & conditions acceptance

**Validation**:
- Phone number must be valid Indian number
- OTP must be verified before account creation
- Phone number must be unique

**UI/UX**:
- Clean registration form
- Step-by-step wizard (Phone → OTP → Details → Password)
- Error handling and clear messages

---

### 1.2 User Login
**Priority**: High  
**User Type**: All Users

**Requirements**:
- Phone number + password login
- OTP-based login option
- "Remember me" functionality
- Biometric authentication (fingerprint/face ID) - optional
- Auto-logout after token expiration

**Security**:
- Rate limiting (max 5 attempts per 15 minutes)
- Account lockout after multiple failed attempts
- Secure token storage

---

### 1.3 Profile Management
**Priority**: Medium  
**User Type**: All Users

**Requirements**:
- View and edit profile
- Update name, email, profile picture
- Change password
- View subscription status
- Logout functionality

---

## 2. Shop Owner Features

### 2.1 Shop Registration & Setup
**Priority**: High  
**User Type**: Shop Owner

**Requirements**:
- Shop name
- Shop address (with map integration)
- Shop phone number
- Shop category (fruits, vegetables, farming materials, farming products)
- Shop description
- Upload shop image/logo
- Business hours (optional)

**Validation**:
- Shop name required
- Address required
- Phone number must be different from user phone (or same is allowed)

**UI/UX**:
- Multi-step form
- Address autocomplete/Google Maps integration
- Image upload with preview

---

### 2.2 Product Management
**Priority**: High  
**User Type**: Shop Owner

**Requirements**:
- Add products to shop catalog
- Search and select from existing product database
- If product doesn't exist, request addition (or create if allowed)
- Mark products as available/unavailable
- View all products in shop
- Remove products from shop

**Product Information**:
- Product name
- Category
- Unit (kg, piece, pack, etc.)
- Product image (optional)

**UI/UX**:
- Searchable product list
- Quick add/remove toggle
- Bulk operations

---

### 2.3 Daily Price Updates
**Priority**: High  
**User Type**: Shop Owner

**Requirements**:
- Update price for each product daily
- Quick price update interface (list view)
- Bulk price update option
- View price history for each product
- See last updated date/time
- Payment tracking for updates (₹1 per product)

**Price Update Flow**:
1. Shop owner opens app
2. Sees list of their products
3. Enters/updates price for each product
4. Submits (can update multiple at once)
5. System records update and queues payment
6. Confirmation message with earnings

**Incentive System**:
- ₹1 INR credited per product price update
- Payment processed daily or weekly
- Earnings dashboard showing total pending/completed payments

**Validation**:
- Price must be positive number
- Price must be within reasonable range (configurable)
- Can update multiple times per day (latest price is current)

**UI/UX**:
- Simple numeric input
- Quick entry (keyboard optimized)
- Save draft functionality
- Visual confirmation of updates

---

### 2.4 Earnings Dashboard
**Priority**: Medium  
**User Type**: Shop Owner

**Requirements**:
- View total earnings from price updates
- View pending payments
- View completed payments history
- Payment status (pending/processing/paid)
- Export earnings report (optional)

**Display**:
- Total earnings (all time)
- Earnings this month
- Earnings today
- Pending amount
- Payment history table

---

## 3. End User Features (Free Version)

### 3.1 Global Price Page
**Priority**: High  
**User Type**: End User (Free)

**Requirements**:
- View all products with price ranges
- See minimum and maximum prices for each product
- See which shop offers best value (lowest price)
- Search products
- Filter by category
- Sort by price (low to high, high to low)
- View product details
- Basic product information

**Display Format**:
- Product name
- Category
- Price range (₹X - ₹Y)
- Best shop (shop name offering lowest price)
- Number of shops selling this product
- Product image

**Limitations (Free Version)**:
- Cannot see individual shop prices
- Cannot see shop-specific information
- Cannot see price history
- Limited search/filter options

---

### 3.2 Product Browse & Search
**Priority**: High  
**User Type**: End User (Free)

**Requirements**:
- Browse products by category
- Search by product name
- Filter by category
- Sort options (price, name, popularity)
- Product detail view
- View product images

**Search Features**:
- Real-time search
- Search history
- Popular searches
- Search suggestions

---

### 3.3 Product Details (Free)
**Priority**: Medium  
**User Type**: End User (Free)

**Requirements**:
- Product name and image
- Category
- Price range
- Best value shop (name only, no details)
- "Upgrade to Premium" CTA

---

## 4. End User Features (Premium Version)

### 4.1 Shop-Specific Price View
**Priority**: High  
**User Type**: End User (Premium)

**Requirements**:
- View prices for each product from all shops
- See shop details (name, address, phone)
- Compare prices across shops
- Filter shops by location
- View shop ratings (Phase 2)

**Display**:
- Product name
- List of shops with:
  - Shop name
  - Price
  - Shop address
  - Distance (if location enabled)
  - Shop rating
  - Contact information

---

### 4.2 Advanced Price Comparison
**Priority**: High  
**User Type**: End User (Premium)

**Requirements**:
- Compare multiple products across multiple shops
- Side-by-side comparison
- Price history graphs
- Price trends (daily/weekly/monthly)
- Best deals highlighting
- Price alerts (future feature)

**Comparison Features**:
- Select multiple products
- Select multiple shops
- Compare prices in table format
- Visual charts for price trends
- Export comparison (optional)

---

### 4.3 Advanced Insights
**Priority**: Medium  
**User Type**: End User (Premium)

**Requirements**:
- Most popular shops (where users buy most from)
- Trending products
- Price drop alerts
- Shopping recommendations
- User purchasing patterns (aggregated, anonymous)

**Insights Dashboard**:
- Charts and graphs
- Trend analysis
- Popular products
- Best value recommendations

---

### 4.4 Price History
**Priority**: Medium  
**User Type**: End User (Premium)

**Requirements**:
- View price history for any product
- View price history for specific shop
- Price trends over time
- Historical price data visualization

**Display**:
- Line graph showing price over time
- Date range selector
- Shop-specific or global view
- Price statistics (average, min, max)

---

## 5. Subscription Management

### 5.1 Subscription Plans
**Priority**: High  
**User Type**: End User

**Requirements**:
- Display subscription plan details
- Monthly subscription: ₹100 INR
- Feature comparison (Free vs Premium)
- Clear pricing information
- Terms and conditions

**UI/UX**:
- Attractive pricing page
- Clear feature list
- "Upgrade to Premium" buttons throughout app
- Free trial option (optional, Phase 2)

---

### 5.2 Payment Integration
**Priority**: High  
**User Type**: End User

**Requirements**:
- Razorpay integration
- Multiple payment methods:
  - UPI
  - Credit/Debit cards
  - Net banking
  - Wallets
- Secure payment flow
- Payment confirmation
- Receipt generation

**Payment Flow**:
1. User selects subscription plan
2. Redirected to Razorpay payment page
3. Completes payment
4. Webhook received from Razorpay
5. Subscription activated
6. User receives confirmation

**Security**:
- Webhook signature verification
- Idempotency checks
- Payment status tracking

---

### 5.3 Subscription Management
**Priority**: Medium  
**User Type**: End User (Premium)

**Requirements**:
- View subscription status
- View subscription expiry date
- Renew subscription
- Cancel subscription
- Payment history
- Invoice download

**Renewal**:
- Auto-renewal option
- Manual renewal
- Renewal reminders (7 days, 3 days, 1 day before expiry)

---

## 6. Staff Features (Admin)

### 6.1 Price Collection
**Priority**: High  
**User Type**: Staff/Admin

**Requirements**:
- View all shops
- View products for each shop
- Update prices on behalf of shop owners
- Call or visit shops to collect prices
- Bulk price updates
- Mark price source (call/visit)

**Workflow**:
1. Staff selects shop
2. Views products
3. Calls shop or visits
4. Enters prices
5. Submits updates
6. Prices updated in system

---

### 6.2 Shop Management
**Priority**: Medium  
**User Type**: Staff/Admin

**Requirements**:
- View all shops
- Add/edit shop information
- Verify shop details
- Mark shops as active/inactive
- View shop statistics

---

## Phase 2: Advanced Features

---

## 7. Reviews & Ratings System

### 7.1 Shop Reviews
**Priority**: Medium (Phase 2)  
**User Type**: End User (Premium)

**Requirements**:
- Rate shop (1-5 stars)
- Write review about shop
- Review shop owner behavior
- View all reviews for a shop
- Like/helpful votes on reviews
- Report inappropriate reviews

**Review Information**:
- Rating (1-5)
- Comment
- Date of visit (optional)
- Verified purchase badge (if verified)

---

### 7.2 Price Verification Feedback
**Priority**: Medium (Phase 2)  
**User Type**: End User (Premium)

**Requirements**:
- Submit feedback after purchase
- Report if actual price matches listed price
- Report if price was higher/lower
- Report if discount was given
- Optional feedback comment

**Feedback Form**:
- Shop name
- Product name
- Listed price (pre-filled)
- Actual price paid
- Discount given (yes/no, amount)
- Additional comments

**Purpose**:
- Build goodwill indicator for shops
- Improve price accuracy
- Build trust in platform

---

### 7.3 Goodwill Indicator
**Priority**: Medium (Phase 2)  
**User Type**: All Users

**Requirements**:
- Calculate goodwill score for each shop
- Display goodwill indicator
- Update based on:
  - Price accuracy reports
  - User reviews
  - Price verification feedback
  - User behavior patterns

**Calculation**:
- Base score: 100
- Price accuracy: +10 for accurate, -5 for inaccurate
- Reviews: Average rating (1-5) converted to score
- Verification: Positive feedback increases, negative decreases

**Display**:
- Visual indicator (badge, color, percentage)
- Score out of 100
- Trust level (Excellent/Good/Fair/Poor)

---

## 8. Notifications

### 8.1 Push Notifications
**Priority**: Medium  
**User Type**: All Users

**Requirements**:
- Price update notifications (optional)
- Subscription reminders
- New features announcements
- Important updates

**Notification Types**:
- Price drops (for favorite products)
- Subscription expiry
- Payment confirmations
- New shop additions
- System updates

---

### 8.2 In-App Notifications
**Priority**: Low  
**User Type**: All Users

**Requirements**:
- Notification center
- Mark as read/unread
- Notification history
- Settings for notification preferences

---

## UI/UX Requirements

### Design Principles
- Clean and simple interface
- Easy navigation
- Fast loading times
- Mobile-first design
- Intuitive user experience
- Accessible design (WCAG compliance)

### Color Scheme
- Professional and trustworthy
- Market/fresh produce theme (greens, oranges)
- High contrast for readability

### Typography
- Clear, readable fonts
- Appropriate sizing for mobile
- Multilingual support (future)

### Performance
- App load time < 3 seconds
- Smooth scrolling
- Fast search results
- Optimized images

---

## Non-Functional Requirements

### Performance
- API response time < 500ms (95th percentile)
- App should work smoothly on mid-range devices
- Support for 1000+ concurrent users

### Security
- Data encryption at rest and in transit
- Secure payment processing
- Regular security audits

### Reliability
- 99.9% uptime
- Error handling and graceful degradation
- Data backup and recovery

### Scalability
- Support for 100+ shops
- Support for 10,000+ products
- Support for 50,000+ users

### Compatibility
- iOS 12+ support
- Android 8.0+ support
- Various screen sizes

---

## Future Enhancements (Phase 3+)

1. Order placement and delivery tracking
2. Inventory management for shop owners
3. Multi-language support
4. WhatsApp integration
5. SMS price alerts
6. AI-powered price predictions
7. Demand forecasting
8. Marketing and promotional features
9. Analytics dashboard for shop owners
10. Loyalty programs

