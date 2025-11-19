import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/feedback/LoadingSpinner';
import './App.css';

// Lazy load pages for code splitting
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ShopOwnerDashboard = lazy(() => import('./pages/ShopOwnerDashboard'));
const EndUserHome = lazy(() => import('./pages/EndUserHome'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ShopRegistrationPage = lazy(() => import('./pages/ShopRegistrationPage'));
const ShopProductManagementPage = lazy(() => import('./pages/ShopProductManagementPage'));
const ProductMasterListPage = lazy(() => import('./pages/ProductMasterListPage'));
const DailyPriceUpdatePage = lazy(() => import('./pages/DailyPriceUpdatePage'));
const PriceHistoryPage = lazy(() => import('./pages/PriceHistoryPage'));
const EarningsDashboardPage = lazy(() => import('./pages/EarningsDashboardPage'));
const GlobalPricePage = lazy(() => import('./pages/GlobalPricePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const PremiumUpgradePage = lazy(() => import('./pages/PremiumUpgradePage'));
const ShopSpecificPriceViewPage = lazy(() => import('./pages/ShopSpecificPriceViewPage'));
const AdvancedPriceComparisonPage = lazy(() => import('./pages/AdvancedPriceComparisonPage'));
const PriceHistoryTrendsPage = lazy(() => import('./pages/PriceHistoryTrendsPage'));
const AdvancedInsightsDashboardPage = lazy(() => import('./pages/AdvancedInsightsDashboardPage'));
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const NotificationCenterPage = lazy(() => import('./pages/NotificationCenterPage'));
const NotificationPreferencesPage = lazy(() => import('./pages/NotificationPreferencesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HelpSupportPage = lazy(() => import('./pages/HelpSupportPage'));
const FeatureFlagsPage = lazy(() => import('./pages/FeatureFlagsPage'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <LoadingSpinner size="large" />
  </div>
);

// Helper function to check if user can access a route
function canAccessRoute(userType: string | undefined, requiredUserType?: 'shop_owner' | 'end_user'): boolean {
  if (!requiredUserType) return true; // No restriction
  if (!userType) return false;
  
  // Admin can access everything
  if (userType === 'admin' || userType === 'staff') {
    return true;
  }
  
  // Regular users can only access their own routes
  return userType === requiredUserType;
}

// Protected Route Component
function ProtectedRoute({ children, requiredUserType }: { children: React.ReactElement; requiredUserType?: 'shop_owner' | 'end_user' }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (requiredUserType && !canAccessRoute(user?.user_type, requiredUserType)) {
    // Redirect to appropriate dashboard based on user type
    if (user?.user_type === 'shop_owner' || user?.user_type === 'admin' || user?.user_type === 'staff') {
      return <Navigate to="/shop-owner/dashboard" replace />;
    }
    return <Navigate to="/end-user/home" replace />;
  }

  return children;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    // Admin and staff default to shop owner dashboard, but can access both
    if (user?.user_type === 'shop_owner' || user?.user_type === 'admin' || user?.user_type === 'staff') {
      return <Navigate to="/shop-owner/dashboard" replace />;
    }
    return <Navigate to="/end-user/home" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      <Route
        path="/welcome"
        element={
          <PublicRoute>
            <WelcomePage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/shop-owner/dashboard"
        element={
          <ProtectedRoute requiredUserType="shop_owner">
            <ShopOwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/register"
        element={
          <ProtectedRoute requiredUserType="shop_owner">
            <ShopRegistrationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/products"
        element={
          <ProtectedRoute requiredUserType="shop_owner">
            <ShopProductManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/price-update"
        element={
          <ProtectedRoute requiredUserType="shop_owner">
            <DailyPriceUpdatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/price-history"
        element={
          <ProtectedRoute requiredUserType="shop_owner">
            <PriceHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop-owner/earnings"
        element={
          <ProtectedRoute requiredUserType="shop_owner">
            <EarningsDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/home"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <EndUserHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/global-prices"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <GlobalPricePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/product/:productId"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/categories"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/premium/upgrade"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <PremiumUpgradePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/product/:productId/shops"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <ShopSpecificPriceViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/price-comparison"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <AdvancedPriceComparisonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/price-history"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <PriceHistoryTrendsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/insights"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <AdvancedInsightsDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription/manage"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <SubscriptionManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/end-user/favorites"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <FavoritesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationCenterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications/preferences"
        element={
          <ProtectedRoute>
            <NotificationPreferencesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/about"
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/help"
        element={
          <ProtectedRoute>
            <HelpSupportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/feature-flags"
        element={
          <ProtectedRoute>
            <FeatureFlagsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductMasterListPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
