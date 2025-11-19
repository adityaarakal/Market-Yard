/**
 * ProductCard Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../ProductCard';
import { Product } from '../../../types';

function createMockProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'prod_1',
    name: 'Test Product',
    category: 'fruits',
    unit: 'kg',
    description: 'Test description',
    is_active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('ProductCard', () => {
  const mockProduct = createMockProduct({
    id: 'prod_1',
    name: 'Test Product',
    category: 'fruits',
    unit: 'kg',
    description: 'Test description',
  });

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('displays category badge when showCategory is true', () => {
    render(<ProductCard product={mockProduct} showCategory={true} />);
    expect(screen.getByText('fruits')).toBeInTheDocument();
  });

  it('hides category badge when showCategory is false', () => {
    render(<ProductCard product={mockProduct} showCategory={false} />);
    expect(screen.queryByText('fruits')).not.toBeInTheDocument();
  });

  it('displays price range when provided', () => {
    render(<ProductCard product={mockProduct} minPrice={10} maxPrice={20} />);
    expect(screen.getByText(/10.*20/i)).toBeInTheDocument();
  });

  it('displays "Price not available" when no price provided', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Price not available')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', async () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    await userEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', async () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    card.focus();
    await userEvent.keyboard('{Enter}');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', async () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    card.focus();
    await userEvent.keyboard(' ');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not have button role when onClick is not provided', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays best shop in detailed variant', () => {
    render(
      <ProductCard
        product={mockProduct}
        variant="detailed"
        bestShop="Best Shop Name"
      />
    );
    expect(screen.getByText(/Best Shop Name/i)).toBeInTheDocument();
  });

  it('displays shop count in detailed variant', () => {
    render(
      <ProductCard
        product={mockProduct}
        variant="detailed"
        shopCount={5}
      />
    );
    expect(screen.getByText(/5 shops/i)).toBeInTheDocument();
  });

  it('displays product description in detailed variant', () => {
    render(
      <ProductCard
        product={mockProduct}
        variant="detailed"
      />
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('hides image when showImage is false', () => {
    const { container } = render(
      <ProductCard product={mockProduct} showImage={false} />
    );
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(0);
  });
});

