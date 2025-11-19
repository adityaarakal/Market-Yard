/**
 * Badge Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild;
    expect(badge).toBeInTheDocument();
  });

  it('applies primary variant', () => {
    render(<Badge variant="primary">Primary</Badge>);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('applies success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('applies error variant', () => {
    render(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('applies warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('applies small size', () => {
    render(<Badge size="small">Small</Badge>);
    expect(screen.getByText('Small')).toBeInTheDocument();
  });

  it('applies medium size', () => {
    render(<Badge size="medium">Medium</Badge>);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('applies large size', () => {
    render(<Badge size="large">Large</Badge>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });
});

