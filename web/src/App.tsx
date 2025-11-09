import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import EndUserHome from './pages/EndUserHome';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, requiredUserType }: { children: React.ReactElement; requiredUserType?: 'shop_owner' | 'end_user' }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (requiredUserType && user?.user_type !== requiredUserType) {
    // Redirect to appropriate dashboard based on user type
    if (user?.user_type === 'shop_owner') {
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
    if (user?.user_type === 'shop_owner') {
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
        path="/end-user/home"
        element={
          <ProtectedRoute requiredUserType="end_user">
            <EndUserHome />
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
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
