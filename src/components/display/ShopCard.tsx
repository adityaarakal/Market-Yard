import React from 'react';
import { Shop } from '../../types';
import { colors } from '../../theme';
import RatingDisplay from './RatingDisplay';
import Badge from './Badge';
import { formatDistance } from '../../utils/distance';

export interface ShopCardProps {
  shop: Shop;
  distance?: number; // in kilometers
  onClick?: () => void;
  className?: string;
  showImage?: boolean;
  showRating?: boolean;
  showDistance?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  price?: number;
  priceLabel?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (shopId: string) => void;
  showFavoriteButton?: boolean;
}

/**
 * ShopCard component for displaying shop information
 */
export default function ShopCard({
  shop,
  distance,
  onClick,
  className = '',
  showImage = true,
  showRating = true,
  showDistance = true,
  variant = 'default',
  price,
  priceLabel,
  isFavorite = false,
  onFavoriteToggle,
  showFavoriteButton = false,
}: ShopCardProps) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', height: '100%', position: 'relative' }}>
        {/* Favorite Button */}
        {showFavoriteButton && onFavoriteToggle && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onFavoriteToggle(shop.id);
            }}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: isFavorite ? colors.primary : 'rgba(255, 255, 255, 0.9)',
              color: isFavorite ? 'white' : colors.text,
              border: `2px solid ${isFavorite ? colors.primary : colors.border}`,
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem',
              boxShadow: 'var(--shadow-soft)',
              zIndex: 10,
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}

        {/* Shop Image */}
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
            {shop.image_url ? (
              <img
                src={shop.image_url}
                alt={shop.shop_name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<span style="font-size: 3rem;">🏪</span>`;
                  }
                }}
              />
            ) : (
              <span style={{ fontSize: '3rem' }}>🏪</span>
            )}
          </div>
        )}

        {/* Shop Info */}
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
              {shop.shop_name}
            </h3>
            {!shop.is_active && (
              <Badge variant="error" size="small">
                Inactive
              </Badge>
            )}
          </div>

          {/* Category Badge */}
          <Badge variant="default" size="small">
            {shop.category.replace('_', ' ')}
          </Badge>

          {/* Rating Display */}
          {showRating && shop.average_rating > 0 && (
            <div>
              <RatingDisplay
                rating={shop.average_rating}
                totalRatings={shop.total_ratings}
                size={variant === 'compact' ? 'small' : 'medium'}
              />
              {shop.goodwill_score > 0 && (
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.25rem' }}>
                  Goodwill: {shop.goodwill_score}
                </div>
              )}
            </div>
          )}

          {/* Detailed Info */}
          {variant === 'detailed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {shop.address && (
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  📍 {shop.address}
                  {shop.city && `, ${shop.city}`}
                  {shop.state && `, ${shop.state}`}
                </div>
              )}
              {showDistance && distance != null && (
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  📏 {formatDistance(distance)}
                </div>
              )}
              {shop.phone_number && (
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  📞 {shop.phone_number}
                </div>
              )}
              {shop.description && (
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
                  {shop.description}
                </p>
              )}
            </div>
          )}

          {/* Compact Info */}
          {variant === 'compact' && (
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
              {shop.address && (
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shop.address}
                </div>
              )}
              {showDistance && distance != null && (
                <div>{formatDistance(distance)}</div>
              )}
            </div>
          )}

          {/* Price Display */}
          {price != null && (
            <div style={{ marginTop: 'auto' }}>
              {priceLabel && (
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>
                  {priceLabel}
                </div>
              )}
              <span
                style={{
                  fontSize: variant === 'compact' ? '0.875rem' : '1rem',
                  fontWeight: 600,
                  color: colors.primary,
                }}
              >
                ₹{price.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

