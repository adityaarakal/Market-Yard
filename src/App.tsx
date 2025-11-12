import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import EndUserHome from './pages/EndUserHome';
import ProfilePage from './pages/ProfilePage';
import ShopRegistrationPage from './pages/ShopRegistrationPage';
import ShopProductManagementPage from './pages/ShopProductManagementPage';
import ProductMasterListPage from './pages/ProductMasterListPage';
import DailyPriceUpdatePage from './pages/DailyPriceUpdatePage';
import PriceHistoryPage from './pages/PriceHistoryPage';
import EarningsDashboardPage from './pages/EarningsDashboardPage';
import GlobalPricePage from './pages/GlobalPricePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import PremiumUpgradePage from './pages/PremiumUpgradePage';
import ShopSpecificPriceViewPage from './pages/ShopSpecificPriceViewPage';
import './App.css';

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
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
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
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
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
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
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
