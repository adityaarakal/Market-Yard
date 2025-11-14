/**
 * StorageService Tests
 */

import StorageService from '../StorageService';
import { STORAGE_KEYS } from '../../utils/constants';
import { User } from '../../types';

// Mock localStorage with proper implementation
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Replace window.localStorage before tests
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

describe('StorageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  describe('User operations', () => {
    const mockUser: User = {
      id: 'user_1',
      phone_number: '9999999999',
      name: 'Test User',
      email: 'test@example.com',
      user_type: 'end_user',
      is_verified: true,
      is_active: true,
      is_premium: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('should save and retrieve a user', () => {
      StorageService.saveUser(mockUser);
      const users = StorageService.getUsers();
      
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(mockUser);
    });

    it('should get user by phone number', () => {
      StorageService.saveUser(mockUser);
      const foundUser = StorageService.getUserByPhone('9999999999');
      
      expect(foundUser).toEqual(mockUser);
    });

    it('should return null if user not found by phone', () => {
      const foundUser = StorageService.getUserByPhone('0000000000');
      expect(foundUser).toBeNull();
    });

    it('should update existing user', () => {
      StorageService.saveUser(mockUser);
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      StorageService.saveUser(updatedUser);
      
      const users = StorageService.getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Updated Name');
    });

    it('should delete a user', () => {
      StorageService.saveUser(mockUser);
      StorageService.deleteUser(mockUser.id);
      
      const users = StorageService.getUsers();
      expect(users).toHaveLength(0);
    });
  });

  describe('Session operations', () => {
    it('should save and retrieve session', () => {
      const mockSession = {
        user: {
          id: 'user_1',
          phone_number: '9999999999',
          name: 'Test User',
          email: 'test@example.com',
          user_type: 'end_user' as const,
          is_verified: true,
          is_active: true,
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token: 'mock_token_123',
      };

      StorageService.saveSession(mockSession);
      const retrievedSession = StorageService.getSession();
      
      expect(retrievedSession).toEqual(mockSession);
    });

    it('should clear session', () => {
      const mockSession = {
        user: {
          id: 'user_1',
          phone_number: '9999999999',
          name: 'Test User',
          email: 'test@example.com',
          user_type: 'end_user' as const,
          is_verified: true,
          is_active: true,
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token: 'mock_token_123',
      };

      StorageService.saveSession(mockSession);
      StorageService.clearSession();
      
      const session = StorageService.getSession();
      expect(session).toBeNull();
    });
  });

  describe('Generic operations', () => {
    it('should set and get item', () => {
      const testData = { key: 'value' };
      StorageService.setItem('test_key', testData);
      const retrieved = StorageService.getItem('test_key');
      
      expect(retrieved).toEqual(testData);
    });

    it('should remove item', () => {
      StorageService.setItem('test_key', { data: 'test' });
      StorageService.removeItem('test_key');
      
      const retrieved = StorageService.getItem('test_key');
      expect(retrieved).toBeNull();
    });
  });
});

