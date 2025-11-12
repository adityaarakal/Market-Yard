import React from 'react';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../theme';

export interface PriceDisplayProps {
  price: number | null | undefined;
  unit?: string;
  currency?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'success' | 'error';
  showUnit?: boolean;
  className?: string;
}

/**
 * PriceDisplay component for displaying formatted prices
 */
export default function PriceDisplay({
  price,
  unit,
  currency = 'INR',
  size = 'medium',
  variant = 'default',
  showUnit = true,
  className = '',
}: PriceDisplayProps) {
  const formattedPrice = formatCurrency(price ?? null, currency);

  const sizeStyles = {
    small: { fontSize: '0.875rem', fontWeight: 500 },
    medium: { fontSize: '1rem', fontWeight: 600 },
    large: { fontSize: '1.5rem', fontWeight: 700 },
  };

  const variantColors = {
    default: colors.text,
    primary: colors.primary,
    success: colors.success,
    error: colors.error,
  };

  return (
    <span
      className={className}
      style={{
        ...sizeStyles[size],
        color: variantColors[variant],
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      {formattedPrice}
      {showUnit && unit && (
        <span
          style={{
            fontSize: size === 'large' ? '0.875rem' : size === 'medium' ? '0.75rem' : '0.625rem',
            color: colors.textSecondary,
            fontWeight: 400,
          }}
        >
          / {unit}
        </span>
      )}
    </span>
  );
}

/**
 * PriceRangeDisplay component for displaying price ranges
 */
export interface PriceRangeDisplayProps {
  minPrice: number | null | undefined;
  maxPrice: number | null | undefined;
  unit?: string;
  currency?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'success' | 'error';
  showUnit?: boolean;
  className?: string;
}

export function PriceRangeDisplay({
  minPrice,
  maxPrice,
  unit,
  currency = 'INR',
  size = 'medium',
  variant = 'default',
  showUnit = true,
  className = '',
}: PriceRangeDisplayProps) {
  if (minPrice == null && maxPrice == null) {
    return <span className={className}>Price not available</span>;
  }

  if (minPrice != null && maxPrice != null && minPrice === maxPrice) {
    return (
      <PriceDisplay
        price={minPrice}
        unit={unit}
        currency={currency}
        size={size}
        variant={variant}
        showUnit={showUnit}
        className={className}
      />
    );
  }

  const formattedMin = formatCurrency(minPrice ?? null, currency);
  const formattedMax = formatCurrency(maxPrice ?? null, currency);

  const sizeStyles = {
    small: { fontSize: '0.875rem', fontWeight: 500 },
    medium: { fontSize: '1rem', fontWeight: 600 },
    large: { fontSize: '1.5rem', fontWeight: 700 },
  };

  const variantColors = {
    default: colors.text,
    primary: colors.primary,
    success: colors.success,
    error: colors.error,
  };

  return (
    <span
      className={className}
      style={{
        ...sizeStyles[size],
        color: variantColors[variant],
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      {minPrice != null ? formattedMin : 'N/A'} - {maxPrice != null ? formattedMax : 'N/A'}
      {showUnit && unit && (
        <span
          style={{
            fontSize: size === 'large' ? '0.875rem' : size === 'medium' ? '0.75rem' : '0.625rem',
            color: colors.textSecondary,
            fontWeight: 400,
          }}
        >
          / {unit}
        </span>
      )}
    </span>
  );
}

