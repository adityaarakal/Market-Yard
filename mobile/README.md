# Market Yard Mobile App

React Native mobile application built with Expo and TypeScript.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, `npx expo` works too)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── services/       # Business logic & API services
│   ├── navigation/     # Navigation configuration
│   ├── contexts/       # React contexts
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── theme/          # Theme configuration
├── assets/             # Images, fonts, etc.
├── App.tsx            # Root component
└── package.json
```

## 🛠️ Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📝 Local Storage

All data is currently stored in AsyncStorage for development and testing. The app will be migrated to use a backend API later.

### Seed Data

To seed initial data for testing:

```typescript
import SeedDataService from './src/services/SeedDataService';

// Seed all data
await SeedDataService.seedAll();

// Clear all data
await SeedDataService.clearAll();
```

## 🎨 Theme

The app uses a custom theme defined in `src/theme/`. Colors are market/fresh produce themed (greens and oranges).

## 📱 Features

- ✅ Project setup with TypeScript
- ✅ Local storage service
- ✅ Seed data for testing
- ⏳ Navigation structure (in progress)
- ⏳ UI components (in progress)
- ⏳ Authentication (pending)
- ⏳ Shop owner features (pending)
- ⏳ End user features (pending)

## 🔄 Migration to Backend

When ready to integrate with backend:
1. All data structures match backend schema
2. Storage service can be easily swapped with API calls
3. Data export/import utilities available

## 📄 License

See parent directory README for license information.

