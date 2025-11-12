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

  const login = async (phone: string, password: string, options?: LoginOptions): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const normalizedPhone = phone.replace(/\D/g, '');
      
      // Ensure seed data exists
      SeedDataService.seedAll(false);
      
      const foundUser = await findUserByPhone(normalizedPhone);

      if (!foundUser) {
        return { success: false, error: 'User not found. Please register first or check your phone number.' };
      }

      // For local storage, simple password check (in production, use bcrypt)
      // Trim both to handle whitespace issues
      const storedPassword = (foundUser.password_hash || '').trim();
      const enteredPassword = (password || '').trim();
      
      if (storedPassword !== enteredPassword) {
        return { success: false, error: 'Invalid password. Please check your password and try again.' };
      }

      if (!foundUser.is_active) {
        return { success: false, error: 'Account is inactive. Please contact support.' };
      }

      // Create session
      const token = `mock_token_${Date.now()}`;
      const newSession: Session = {
        user: foundUser,
        token,
      };

      // Save session first
      StorageService.saveSession(newSession);
      
      // Update state synchronously
      setSession(newSession);
      setUser(foundUser);
      
      // Save remembered login if needed (only for shop_owner and end_user)
      if (options?.rememberMe) {
        if (foundUser.user_type === 'shop_owner' || foundUser.user_type === 'end_user') {
          StorageService.saveRememberedLogin({ 
            phone: normalizedPhone, 
            userType: foundUser.user_type 
          });
        }
      } else {
        StorageService.clearRememberedLogin();
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOtp = async (phone: string, otp: string, options?: LoginOptions): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const normalizedPhone = phone.replace(/\D/g, '');
      
      // Ensure seed data exists
      SeedDataService.seedAll(false);
      
      const foundUser = await findUserByPhone(normalizedPhone);

      if (!foundUser) {
        return { success: false, error: 'User not found. Please register first or check your phone number.' };
      }

      if (!foundUser.is_active) {
        return { success: false, error: 'Account is inactive. Please contact support.' };
      }

      // Trim OTP to handle whitespace
      const enteredOtp = (otp || '').trim();
      if (enteredOtp !== APP_CONFIG.MOCK_OTP) {
        return { success: false, error: `Invalid OTP. Use ${APP_CONFIG.MOCK_OTP} for testing.` };
      }

      const token = `mock_token_${Date.now()}`;
      const newSession: Session = {
        user: foundUser,
        token,
      };

      // Save session first
      StorageService.saveSession(newSession);
      
      // Update state synchronously
      setSession(newSession);
      setUser(foundUser);
      
      // Save remembered login if needed (only for shop_owner and end_user)
      if (options?.rememberMe) {
        if (foundUser.user_type === 'shop_owner' || foundUser.user_type === 'end_user') {
          StorageService.saveRememberedLogin({ 
            phone: normalizedPhone, 
            userType: foundUser.user_type 
          });
        }
      } else {
        StorageService.clearRememberedLogin();
      }

      return { success: true };
    } catch (error) {
      console.error('OTP login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
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

      // Save session first
      StorageService.saveSession(newSession);
      
      // Update state synchronously
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

