import React from 'react';
import { colors } from '../../theme';

export interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  totalRatings?: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  showTotal?: boolean;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

/**
 * RatingDisplay component for displaying star ratings
 */
export default function RatingDisplay({
  rating,
  maxRating = 5,
  totalRatings,
  size = 'medium',
  showNumber = true,
  showTotal = true,
  readonly = true,
  onRatingChange,
  className = '',
}: RatingDisplayProps) {
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const sizeStyles = {
    small: { fontSize: '0.875rem', gap: '0.125rem' },
    medium: { fontSize: '1rem', gap: '0.25rem' },
    large: { fontSize: '1.5rem', gap: '0.375rem' },
  };

  const handleStarClick = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: sizeStyles[size].gap,
        }}
      >
        {Array.from({ length: fullStars }).map((_, index) => (
          <span
            key={`full-${index}`}
            onClick={() => handleStarClick(index)}
            style={{
              fontSize: sizeStyles[size].fontSize,
              color: colors.warning,
              cursor: readonly ? 'default' : 'pointer',
              userSelect: 'none',
            }}
          >
            ★
          </span>
        ))}
        {hasHalfStar && (
          <span
            key="half"
            onClick={() => handleStarClick(fullStars)}
            style={{
              fontSize: sizeStyles[size].fontSize,
              cursor: readonly ? 'default' : 'pointer',
              userSelect: 'none',
              position: 'relative',
              display: 'inline-block',
              width: sizeStyles[size].fontSize,
              height: sizeStyles[size].fontSize,
              lineHeight: 1,
            }}
          >
            <span style={{ color: colors.border, position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>★</span>
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                overflow: 'hidden',
                color: colors.warning,
              }}
            >
              <span style={{ position: 'absolute', left: 0, top: 0 }}>★</span>
            </span>
          </span>
        )}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <span
            key={`empty-${index}`}
            onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + index)}
            style={{
              fontSize: sizeStyles[size].fontSize,
              color: colors.border,
              cursor: readonly ? 'default' : 'pointer',
              userSelect: 'none',
            }}
          >
            ★
          </span>
        ))}
      </div>
      {showNumber && (
        <span
          style={{
            fontSize: sizeStyles[size].fontSize === '1.5rem' ? '1rem' : sizeStyles[size].fontSize === '1rem' ? '0.875rem' : '0.75rem',
            fontWeight: 600,
            color: colors.text,
          }}
        >
          {clampedRating.toFixed(1)}
        </span>
      )}
      {showTotal && totalRatings != null && totalRatings > 0 && (
        <span
          style={{
            fontSize: sizeStyles[size].fontSize === '1.5rem' ? '0.875rem' : sizeStyles[size].fontSize === '1rem' ? '0.75rem' : '0.625rem',
            color: colors.textSecondary,
          }}
        >
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}
