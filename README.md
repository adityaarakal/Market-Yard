# Market Yard - Progressive Web Application

## 📱 Project Overview

Market Yard is a Progressive Web App (PWA) built with React.js and TypeScript, designed to solve price discovery and comparison challenges in local market yards. The app connects shop owners, retailers, and individual buyers in a centralized platform for transparent pricing and efficient purchasing decisions.

## 🎯 Problem Statement

Market yards in cities have numerous shops selling fruits, vegetables, farming materials, and products. Prices change daily and vary across shops, making it difficult for buyers to:
- Compare prices across multiple shops
- Make informed purchasing decisions
- Avoid time-consuming phone calls or visits to multiple shops

Shop owners also face challenges:
- Answering repeated price inquiries from multiple customers
- Managing daily price updates manually
- Losing potential customers due to lack of visibility

## 💡 Solution

Market Yard automates the entire price discovery process through a progressive web application where:
- **Shop owners** can update daily prices and earn incentives (₹1 per update)
- **End users** can browse and compare prices across all shops
- **Free users** get basic price ranges and best value information
- **Premium users** get detailed shop-specific prices, insights, and advanced features

## 📚 Documentation

This project includes comprehensive documentation:

1. **[PROJECT_DESCRIPTION.md](./docs/PROJECT_DESCRIPTION.md)**
   - Detailed problem statement
   - Solution overview
   - Core features and business model
   - Target users and success metrics

2. **[TECH_STACK_RECOMMENDATION.md](./docs/TECH_STACK_RECOMMENDATION.md)**
   - Recommended technology stack
   - Rationale for each technology choice
   - Architecture overview
   - Alternative options considered

3. **[ARCHITECTURE_DESIGN.md](./docs/ARCHITECTURE_DESIGN.md)**
   - System architecture
   - Application structure
   - API endpoint design
   - Data flow diagrams
   - Security and scalability considerations

4. **[FEATURE_SPECIFICATIONS.md](./docs/FEATURE_SPECIFICATIONS.md)**
   - Detailed feature specifications
   - User stories and requirements
   - UI/UX requirements
   - Phase 1 and Phase 2 features

5. **[DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)**
   - Complete database schema
   - Table definitions with relationships
   - Indexes and constraints
   - Database functions and triggers
   - Views and performance considerations

6. **[FRONTEND_TASKS.md](./docs/FRONTEND_TASKS.md)**
   - Complete frontend development task breakdown
   - Organized by phases and priorities
   - Local storage implementation strategy
   - Progress tracking checklist

7. **[LOCAL_STORAGE_GUIDE.md](./docs/LOCAL_STORAGE_GUIDE.md)**
   - AsyncStorage implementation guide
   - Code examples and patterns
   - Data models and services
   - Migration strategy to backend

## 🚀 Tech Stack

### Frontend (Current - PWA)
- **React.js + TypeScript** (Progressive Web App)
- **React Router** (Client-side routing)
- **LocalStorage** (Data persistence - for testing)
- **PWA** (Service Worker, Manifest)

### Backend (Future)
- **Node.js + Express.js (TypeScript)** (REST API)
- **PostgreSQL** (Primary database)
- **Redis** (Caching & sessions)

### Payment & Services (Future)
- **Razorpay** (Payment gateway for subscriptions)
- **Socket.io** (Real-time price updates)
- **AWS S3/Cloudinary** (File storage)

### Hosting
- **Vercel/Netlify** (Frontend hosting)
- **Railway/AWS** (Backend hosting)
- **Supabase/AWS RDS** (Database hosting)

## 🏗️ Architecture

```
Web App (React.js PWA)
    ↓
LocalStorage (Current - for testing)
    ↓
[Future: Backend API]
    ↓
PostgreSQL + Redis + Razorpay
```

## 📋 Core Features

### Phase 1 (MVP)

#### Shop Owner Features
- ✅ Shop registration and profile management
- ✅ Product catalog management
- ✅ Daily price updates with ₹1 incentive per update
- ✅ Earnings dashboard and payment tracking

#### End User Features (Free)
- ✅ Global price page with price ranges
- ✅ Best value shop identification
- ✅ Product browsing and search
- ✅ Category filtering

#### End User Features (Premium - ₹100/month)
- ✅ Shop-specific price listings
- ✅ Advanced price comparison
- ✅ Price history and trends
- ✅ User insights and analytics

#### Admin/Staff Features
- ✅ Manual price collection from shops
- ✅ Shop management
- ✅ System administration

### Phase 2 (Future Enhancements)

- 🔄 Price verification feedback system
- 🔄 Goodwill indicator for shops
- 🔄 Reviews and ratings system
- 🔄 Push notifications
- 🔄 Advanced analytics

## 💰 Business Model

- **Revenue**: Premium subscriptions (₹100 INR/month per user)
- **Costs**: 
  - ₹1 INR per product price update (paid to shop owners)
  - Staff costs for manual price collection
  - Platform maintenance and hosting

## 🎯 Target Users

1. **Shop Owners**: Market yard vendors selling produce and farming products
2. **Retailers**: Business owners buying in bulk from market yard
3. **Individuals**: End consumers purchasing products from market yard

## 📊 Key Metrics

- Number of active shop owners
- Number of registered users (free and premium)
- Premium subscription conversion rate
- Price update frequency
- User engagement and retention
- Goodwill scores (Phase 2)

## 💻 Platform Compatibility

This project works seamlessly on **both macOS and Windows**!

- 🍎 **macOS/Linux**: Works out of the box - no special setup needed
- 🪟 **Windows**: Requires Git Bash (automatically detected)
- ✅ **Automatic OS Detection**: All scripts adapt to your platform automatically
- ✅ **Same Codebase**: Works on both platforms from the same repository
- ✅ **Windows Code Only on Windows**: Windows-specific features only run on Windows
- ✅ **Mac Code Only on Mac**: Mac-specific code only runs on Mac

**📖 For details, see:**
- [Quick Start Guide](./docs/QUICK_START.md) - Get started quickly
- [Platform Compatibility](./docs/PLATFORM_COMPATIBILITY.md) - Detailed platform info with clear Mac vs Windows disclaimers

> **Note for AI Agents**: All scripts automatically detect OS. Windows-specific code only runs on Windows, Mac code only runs on Mac. No manual configuration needed!

## 🛠️ Development Setup

### Web App (PWA)

```bash
npm install
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🔧 Git Hooks & Workflows

This project uses **Husky** for git hooks and **GitHub Actions** for CI/CD.

### Pre-Commit Hook
- Automatically runs linting and formatting on staged files
- Performs TypeScript type checking
- Ensures code quality before commits

### Pre-Push Hook
- Runs full test suite
- Verifies project builds successfully
- Prevents pushing broken code

### GitHub Actions
- Automated checks on pull requests
- Runs linting, type checking, tests, and build verification

**📖 For detailed information, see [GIT_HOOKS_WORKFLOW.md](./docs/GIT_HOOKS_WORKFLOW.md)**

## 📱 Mobile App

The former React Native mobile app has been removed from this repository. The Progressive Web App now serves as the single codebase and works across desktop and mobile browsers.

## 📝 Project Status

**Current Status**: ✅ Feature Complete - Ready for Backend Integration

- ✅ Project description and requirements documented
- ✅ Tech stack selected and documented
- ✅ Architecture designed
- ✅ Feature specifications completed
- ✅ Database schema designed
- ✅ Development setup complete
- ✅ Frontend implementation complete (all 44 applicable tasks)
- ✅ Component library complete (50+ components)
- ✅ All pages and features implemented
- ✅ Local storage services implemented
- ✅ Seed data and testing utilities ready

## 🔄 Next Steps

1. Set up project structure
2. Initialize backend API (Node.js + Express)
3. Set up database (PostgreSQL)
4. Implement authentication system
5. Build shop owner features
6. Build end user features
7. Integrate payment gateway (Razorpay)
8. Testing and deployment

## 📄 License

*To be determined*

## 👥 Team

*Project team information*

## 📞 Contact

*Contact information*

---

🌐 **Deployments**  
- GitHub Pages (main branch): https://adityaarakal.github.io/Market-Yard

---

**Last Updated**: 2024

