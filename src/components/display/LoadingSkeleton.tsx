import React from 'react';
import { colors } from '../../theme';

export interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * LoadingSkeleton component for displaying loading states
 */
export default function LoadingSkeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  variant = 'rectangular',
  animation = 'pulse',
  className = '',
  style = {},
}: LoadingSkeletonProps) {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: '50%',
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        };
      case 'text':
        return {
          borderRadius: borderRadius,
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        };
      case 'rectangular':
      default:
        return {
          borderRadius: borderRadius,
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        };
    }
  };

  const getAnimationStyles = (): React.CSSProperties => {
    switch (animation) {
      case 'pulse':
        return {
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        };
      case 'wave':
        return {
          animation: 'skeleton-wave 1.6s linear infinite',
          background: `linear-gradient(90deg, ${colors.grey[200]} 25%, ${colors.grey[100]} 50%, ${colors.grey[200]} 75%)`,
          backgroundSize: '200% 100%',
        };
      case 'none':
      default:
        return {};
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes skeleton-pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          @keyframes skeleton-wave {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
      <div
        className={className}
        style={{
          backgroundColor: animation === 'wave' ? 'transparent' : colors.grey[200],
          ...getVariantStyles(),
          ...getAnimationStyles(),
          ...style,
        }}
      />
    </>
  );
}

/**
 * SkeletonText component for displaying text skeletons
 */
export interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  lineHeight?: string | number;
  spacing?: string | number;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  width = '100%',
  lineHeight = '1rem',
  spacing = '0.5rem',
  className = '',
}: SkeletonTextProps) {
  const lineWidths = ['100%', '90%', '95%', '85%', '100%'];

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          width={index === lines - 1 ? lineWidths[index % lineWidths.length] : width}
          height={lineHeight}
          variant="text"
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard component for displaying card skeletons
 */
export interface SkeletonCardProps {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  className?: string;
}

export function SkeletonCard({
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = false,
  className = '',
}: SkeletonCardProps) {
  return (
    <div
      className={`surface-card ${className}`}
      style={{
        padding: 'var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
      }}
    >
      {showImage && <LoadingSkeleton width="100%" height="200px" variant="rectangular" />}
      {showTitle && <LoadingSkeleton width="60%" height="1.5rem" variant="text" />}
      {showDescription && <SkeletonText lines={2} width="100%" />}
      {showActions && (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <LoadingSkeleton width="100px" height="2.5rem" variant="rectangular" />
          <LoadingSkeleton width="100px" height="2.5rem" variant="rectangular" />
        </div>
      )}
    </div>
  );
}

