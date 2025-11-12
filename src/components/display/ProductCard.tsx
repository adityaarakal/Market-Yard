import React from 'react';
import { Product } from '../../types';
import { colors } from '../../theme';
import PriceDisplay, { PriceRangeDisplay } from './PriceDisplay';
import Badge from './Badge';

export interface ProductCardProps {
  product: Product;
  minPrice?: number | null;
  maxPrice?: number | null;
  bestShop?: string;
  shopCount?: number;
  onClick?: () => void;
  className?: string;
  showCategory?: boolean;
  showImage?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * ProductCard component for displaying product information
 */
export default function ProductCard({
  product,
  minPrice,
  maxPrice,
  bestShop,
  shopCount,
  onClick,
  className = '',
  showCategory = true,
  showImage = true,
  variant = 'default',
}: ProductCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const cardStyles: Record<string, React.CSSProperties> = {
    default: {
      padding: 'var(--spacing-md)',
      minHeight: '200px',
    },
    compact: {
      padding: 'var(--spacing-sm)',
      minHeight: '150px',
    },
    detailed: {
      padding: 'var(--spacing-lg)',
      minHeight: '250px',
    },
  };

  return (
    <div
      className={`surface-card ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        ...cardStyles[variant],
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', height: '100%' }}>
        {/* Product Image */}
        {showImage && (
          <div
            style={{
              width: '100%',
              height: variant === 'compact' ? '120px' : variant === 'detailed' ? '180px' : '150px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: colors.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<span style="font-size: 3rem;">🛒</span>`;
                  }
                }}
              />
            ) : (
              <span style={{ fontSize: '3rem' }}>🛒</span>
            )}
          </div>
        )}

        {/* Product Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-xs)' }}>
            <h3
              style={{
                fontSize: variant === 'compact' ? '0.875rem' : variant === 'detailed' ? '1.25rem' : '1rem',
                fontWeight: 600,
                color: colors.text,
                margin: 0,
                flex: 1,
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </h3>
          </div>

          {/* Category Badge */}
          {showCategory && (
            <Badge variant="default" size="small">
              {product.category.replace('_', ' ')}
            </Badge>
          )}

          {/* Additional Info - Detailed Variant */}
          {variant === 'detailed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {bestShop && (
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  Best: <span style={{ fontWeight: 500, color: colors.text }}>{bestShop}</span>
                </div>
              )}
              {shopCount != null && shopCount > 0 && (
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  {shopCount} {shopCount === 1 ? 'shop' : 'shops'}
                </div>
              )}
              {product.description && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: colors.textSecondary,
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {product.description}
                </p>
              )}
            </div>
          )}

          {/* Compact Info */}
          {variant === 'compact' && bestShop && (
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
              Best: {bestShop}
            </div>
          )}

          {/* Price Display */}
          <div style={{ marginTop: 'auto' }}>
            {minPrice != null || maxPrice != null ? (
              <PriceRangeDisplay
                minPrice={minPrice}
                maxPrice={maxPrice}
                unit={product.unit}
                size={variant === 'compact' ? 'small' : variant === 'detailed' ? 'large' : 'medium'}
                variant="primary"
              />
            ) : (
              <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Price not available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

