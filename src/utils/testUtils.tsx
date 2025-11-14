/**
 * Test Utilities
 * Helper functions and components for testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { User } from '../types';

/**
 * Custom render function that includes providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null;
  initialRoute?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    user = null,
    initialRoute = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set initial route if provided
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
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
    ...overrides,
  };
}

/**
 * Create a mock shop for testing
 */
export function createMockShop(overrides?: any) {
  return {
    id: 'shop_1',
    owner_id: 'user_1',
    name: 'Test Shop',
    category: 'fruits' as const,
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    phone_number: '8888888888',
    email: 'shop@example.com',
    description: 'Test shop description',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock product for testing
 */
export function createMockProduct(overrides?: any) {
  return {
    id: 'prod_1',
    name: 'Test Product',
    category: 'fruits' as const,
    unit: 'kg',
    description: 'Test product description',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock localStorage helper
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
}

/**
 * Re-export everything from testing-library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

