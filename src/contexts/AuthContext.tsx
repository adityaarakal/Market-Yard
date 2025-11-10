import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '../types';
import StorageService from '../services/StorageService';
import SeedDataService from '../services/SeedDataService';
import { APP_CONFIG } from '../utils/constants';
import { createUser as createUserRecord, getUserByPhone as findUserByPhone } from '../services/UserService';

type AuthResponse = { success: boolean; error?: string };
type LoginOptions = { rememberMe?: boolean };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string, options?: LoginOptions) => Promise<AuthResponse>;
  loginWithOtp: (phone: string, otp: string, options?: LoginOptions) => Promise<AuthResponse>;
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

  const persistSession = (newSession: Session, _rememberMe?: boolean) => {
    StorageService.saveSession(newSession);
    setSession(newSession);
    setUser(newSession.user);
  };

  const login = async (phone: string, password: string, options?: LoginOptions): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const normalizedPhone = phone.replace(/\D/g, '');
      const foundUser = await findUserByPhone(normalizedPhone);

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

      persistSession(newSession, options?.rememberMe);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOtp = async (phone: string, otp: string, options?: LoginOptions): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const normalizedPhone = phone.replace(/\D/g, '');
      const foundUser = await findUserByPhone(normalizedPhone);

      if (!foundUser) {
        return { success: false, error: 'User not found' };
      }

      if (!foundUser.is_active) {
        return { success: false, error: 'Account is inactive' };
      }

      if (otp !== APP_CONFIG.MOCK_OTP) {
        return { success: false, error: 'Invalid OTP' };
      }

      const token = `mock_token_${Date.now()}`;
      const newSession: Session = {
        user: foundUser,
        token,
      };

      persistSession(newSession, options?.rememberMe);

      return { success: true };
    } catch (error) {
      console.error('OTP login error:', error);
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
      const existingUser = await findUserByPhone(userData.phone);
      if (existingUser) {
        return { success: false, error: 'Phone number already registered' };
      }

      // Create new user
      const newUser = await createUserRecord({
        phone: userData.phone,
        name: userData.name,
        userType: userData.userType,
        password: userData.password,
        email: userData.email,
        isVerified: true,
        isActive: true,
        isPremium: false,
      });

      // Auto-login after registration
      const token = `mock_token_${Date.now()}`;
      const newSession: Session = {
        user: newUser,
        token,
      };

      persistSession(newSession);

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
    loginWithOtp,
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

