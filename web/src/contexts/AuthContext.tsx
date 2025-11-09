import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '../types';
import StorageService from '../services/StorageService';
import SeedDataService from '../services/SeedDataService';

type AuthResponse = { success: boolean; error?: string };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (userData: {
    phone: string;
    name: string;
    password: string;
    userType: 'shop_owner' | 'end_user';
    email?: string;
  }) => Promise<AuthResponse>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on app start
  useEffect(() => {
    SeedDataService.seedAll();
    loadSession();
  }, []);

  const loadSession = () => {
    try {
      const savedSession = StorageService.getSession();
      if (savedSession && savedSession.user) {
        setSession(savedSession);
        setUser(savedSession.user);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const foundUser = StorageService.getUserByPhone(phone);

      if (!foundUser) {
        return { success: false, error: 'User not found' };
      }

      // For local storage, simple password check (in production, use bcrypt)
      if (foundUser.password_hash !== password) {
        return { success: false, error: 'Invalid password' };
      }

      if (!foundUser.is_active) {
        return { success: false, error: 'Account is inactive' };
      }

      // Create session
      const token = `mock_token_${Date.now()}`;
      const newSession: Session = {
        user: foundUser,
        token,
      };

      StorageService.saveSession(newSession);
      setSession(newSession);
      setUser(foundUser);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    phone: string;
    name: string;
    password: string;
    userType: 'shop_owner' | 'end_user';
    email?: string;
  }): Promise<AuthResponse> => {
    try {
      setIsLoading(true);

      // Check if user already exists
      const existingUser = StorageService.getUserByPhone(userData.phone);
      if (existingUser) {
        return { success: false, error: 'Phone number already registered' };
      }

      // Create new user
      const now = new Date().toISOString();
      const newUser: User = {
        id: `user_${Date.now()}`,
        phone_number: userData.phone,
        name: userData.name,
        email: userData.email,
        user_type: userData.userType,
        password_hash: userData.password, // In production, hash this
        is_premium: false,
        is_active: true,
        is_verified: true, // For testing, auto-verify
        created_at: now,
        updated_at: now,
      };

      StorageService.saveUser(newUser);

      // Auto-login after registration
      const token = `mock_token_${Date.now()}`;
      const newSession: Session = {
        user: newUser,
        token,
      };

      StorageService.saveSession(newSession);
      setSession(newSession);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      StorageService.clearSession();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser: User) => {
    try {
      StorageService.saveUser(updatedUser);
      setUser(updatedUser);
      if (session) {
        const updatedSession: Session = {
          ...session,
          user: updatedUser,
        };
        StorageService.saveSession(updatedSession);
        setSession(updatedSession);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

