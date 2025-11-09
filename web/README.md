# Market Yard - Progressive Web App

React.js TypeScript Progressive Web App (PWA) for Market Yard price comparison platform.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the App

```bash
# Start development server
npm start

# Build for production
npm run build

# Serve production build
npm install -g serve
serve -s build
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
web/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # Business logic & storage services
│   ├── contexts/       # React contexts
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── theme/          # Theme configuration
├── public/             # Static files and PWA manifest
└── package.json
```

## 📝 Local Storage

All data is stored in browser's `localStorage` for development and testing. The app will be migrated to use a backend API later.

### Seed Data

To seed initial data for testing, open browser console and run:

```typescript
import SeedDataService from './src/services/SeedDataService';

// Seed all data
SeedDataService.seedAll();

// Clear all data
SeedDataService.clearAll();
```

Or add a button in the UI to trigger seeding.

## 🎨 Theme

The app uses a custom theme defined in `src/theme/`. Colors are market/fresh produce themed (greens and oranges).

## 📱 PWA Features

- ✅ Progressive Web App configuration
- ✅ Service Worker for offline support
- ✅ Installable on mobile devices
- ✅ Responsive design
- ✅ Local storage for data persistence

## 🔄 Migration to Backend

When ready to integrate with backend:
1. All data structures match backend schema
2. Storage service can be easily swapped with API calls
3. Data export/import utilities available

## 📄 License

See parent directory README for license information.
