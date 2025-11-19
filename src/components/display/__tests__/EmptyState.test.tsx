/**
 * EmptyState Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders with title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <EmptyState
        title="No items"
        description="Start adding items to see them here"
      />
    );
    expect(screen.getByText('Start adding items to see them here')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<EmptyState title="Empty" icon="📦" />);
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('applies small size', () => {
    render(<EmptyState title="Empty" size="small" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('applies medium size', () => {
    render(<EmptyState title="Empty" size="medium" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('applies large size', () => {
    render(<EmptyState title="Empty" size="large" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});

