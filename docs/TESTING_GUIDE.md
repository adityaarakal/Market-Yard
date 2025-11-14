# Testing Guide

## Overview

The Market Yard app uses Jest and React Testing Library for testing. This guide explains how to write and run tests.

## Test Setup

### Configuration

- **Jest**: Configured via `react-scripts` (Create React App)
- **React Testing Library**: For component testing
- **Setup File**: `src/setupTests.ts` - Automatically loaded before tests
- **Test Utilities**: `src/utils/testUtils.tsx` - Helper functions for testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test -- --watch

# Run tests once
npm test -- --watchAll=false

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- TextInput.test.tsx
```

## Test Structure

### Component Tests

Component tests should be placed in `__tests__` directories next to the components:

```
src/
  components/
    forms/
      TextInput.tsx
      __tests__/
        TextInput.test.tsx
```

### Service Tests

Service tests should be placed in `__tests__` directories next to the services:

```
src/
  services/
    StorageService.ts
    __tests__/
      StorageService.test.ts
```

## Writing Tests

### Component Testing Example

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Service Testing Example

```typescript
import StorageService from '../StorageService';

describe('StorageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saves and retrieves data', () => {
    const data = { key: 'value' };
    StorageService.setItem('test', data);
    const retrieved = StorageService.getItem('test');
    
    expect(retrieved).toEqual(data);
  });
});
```

### Testing with Providers

Use `renderWithProviders` from `testUtils` when testing components that need context:

```typescript
import { renderWithProviders } from '../../utils/testUtils';
import { createMockUser } from '../../utils/testUtils';

it('renders with user context', () => {
  const user = createMockUser({ name: 'Test User' });
  renderWithProviders(<MyComponent />, { user });
  
  expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

## Test Utilities

### Available Helpers

- `renderWithProviders()` - Render component with Router and Auth providers
- `createMockUser()` - Create mock user object
- `createMockShop()` - Create mock shop object
- `createMockProduct()` - Create mock product object
- `waitForAsync()` - Wait for async operations
- `mockLocalStorage()` - Mock localStorage for tests

### Example Usage

```typescript
import {
  renderWithProviders,
  createMockUser,
  waitForAsync,
} from '../../utils/testUtils';

it('tests with providers', () => {
  const user = createMockUser();
  renderWithProviders(<MyComponent />, { user });
  // ... test code
});
```

## Best Practices

### 1. Test User Behavior, Not Implementation

✅ Good:
```typescript
it('allows user to submit form', async () => {
  render(<Form />);
  await userEvent.type(screen.getByLabelText('Name'), 'John');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

❌ Bad:
```typescript
it('calls onSubmit handler', () => {
  const onSubmit = jest.fn();
  render(<Form onSubmit={onSubmit} />);
  // Testing implementation details
});
```

### 2. Use Accessible Queries

Prefer queries that reflect how users interact:

1. `getByRole` - Most preferred
2. `getByLabelText` - For form inputs
3. `getByText` - For visible text
4. `getByTestId` - Last resort

### 3. Clean Up After Tests

```typescript
beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});
```

### 4. Test Edge Cases

- Empty states
- Error states
- Loading states
- Invalid inputs
- Boundary conditions

### 5. Keep Tests Focused

Each test should verify one specific behavior:

```typescript
// ✅ Good - focused test
it('displays error when email is invalid', () => {
  // ...
});

// ❌ Bad - testing multiple things
it('validates form and shows errors', () => {
  // Tests multiple validation rules
});
```

## Mocking

### Mocking localStorage

localStorage is automatically mocked in `setupTests.ts`. For custom mocks:

```typescript
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
```

### Mocking API Calls

```typescript
jest.mock('../services/api/ApiClient', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));
```

### Mocking React Router

Use `renderWithProviders` which includes Router, or mock manually:

```typescript
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
```

## Coverage

### Running Coverage

```bash
npm test -- --coverage
```

### Coverage Thresholds

Current thresholds (in `jest.config.js`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

### Viewing Coverage

Coverage reports are generated in `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser.

## Common Issues

### Issue: "Cannot find module"

**Solution**: Check import paths and ensure modules are properly exported.

### Issue: "localStorage is not defined"

**Solution**: localStorage is mocked in `setupTests.ts`. If issues persist, ensure the mock is properly set up.

### Issue: "Testing Library element not found"

**Solution**: 
- Use `screen.debug()` to see rendered output
- Check if element is actually rendered
- Verify query method matches element type

### Issue: "Act warning"

**Solution**: Wrap async operations in `act()` or use `waitFor()`:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Continuous Integration

Tests should run automatically in CI/CD pipelines. Example GitHub Actions:

```yaml
- name: Run tests
  run: npm test -- --watchAll=false --coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

