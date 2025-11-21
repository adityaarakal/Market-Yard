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
    const initializeApp = async () => {
      try {
        // Always ensure admin user exists FIRST (before any other operations)
        SeedDataService.ensureAdminUser();
        
        // Seed other data
        SeedDataService.seedAll();
        
        // Load existing session
        loadSession();
        
        // Auto-login for testing in development mode
        if (APP_CONFIG.AUTO_LOGIN_ENABLED && !StorageService.getSession()) {
          autoLoginForTesting();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Ensure loading state is set to false even if there's an error
        setIsLoading(false);
      }
    };
    
    initializeApp();
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
      
      // Always ensure admin user exists FIRST
      SeedDataService.ensureAdminUser();
      
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
      
      // Always ensure admin user exists FIRST
      SeedDataService.ensureAdminUser();
      
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
      // In development, accept any 6-digit OTP for testing
      const isValidOtp = process.env.NODE_ENV === 'development' 
        ? /^\d{6}$/.test(enteredOtp)
        : enteredOtp === APP_CONFIG.MOCK_OTP;
      
      if (!isValidOtp) {
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

      // Normalize phone number
      const normalizedPhone = userData.phone.replace(/\D/g, '');

      // Check if user already exists
      const existingUser = await findUserByPhone(normalizedPhone);
      if (existingUser) {
        return { success: false, error: 'Phone number already registered. Please log in instead.' };
      }

      // Create new user
      const newUser = await createUserRecord({
        phone: normalizedPhone,
        name: userData.name,
        userType: userData.userType,
        password: userData.password,
        email: userData.email,
        isVerified: true,
        isActive: true,
        isPremium: false,
      });

      // Verify user was saved
      const savedUser = await findUserByPhone(normalizedPhone);
      if (!savedUser) {
        console.error('User was not saved properly after registration');
        return { success: false, error: 'Failed to save user. Please try again.' };
      }

      // Auto-login after registration
      const token = `mock_token_${Date.now()}`;
      const newSession: Session = {
        user: savedUser,
        token,
      };

      // Save session first
      StorageService.saveSession(newSession);
      
      // Update state synchronously
      setSession(newSession);
      setUser(savedUser);

      console.log('User registered and logged in:', savedUser.phone_number);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: errorMessage };
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

  /**
   * Auto-login for testing in development mode
   */
  const autoLoginForTesting = async () => {
    if (process.env.NODE_ENV !== 'development') return;

    try {
      // Check URL parameters for auto-login credentials
      const urlParams = new URLSearchParams(window.location.search);
      const autoLoginPhone = urlParams.get('autoLoginPhone') || APP_CONFIG.AUTO_LOGIN_PHONE;
      const autoLoginPassword = urlParams.get('autoLoginPassword') || APP_CONFIG.AUTO_LOGIN_PASSWORD;

      // Try to find or create test user
      let testUser = await findUserByPhone(autoLoginPhone);
      
      if (!testUser) {
        // Create test user if doesn't exist
        testUser = await createUserRecord({
          phone: autoLoginPhone,
          name: 'Test User',
          userType: 'end_user',
          password: autoLoginPassword,
          isVerified: true,
          isActive: true,
          isPremium: false,
        });
      }

      // Auto-login
      const result = await login(autoLoginPhone, autoLoginPassword);
      if (result.success) {
        console.log('✅ Auto-logged in for testing:', testUser.phone_number);
      }
    } catch (error) {
      console.warn('Auto-login failed (this is OK if no test user exists):', error);
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

