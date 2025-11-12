import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { colors } from '../../theme';
import LoadingSpinner from '../feedback/LoadingSpinner';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  threshold?: number;
  pullDownContent?: ReactNode;
  releaseContent?: ReactNode;
  refreshContent?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PullToRefresh component for mobile-like pull-to-refresh functionality
 */
export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  pullDownContent,
  releaseContent,
  refreshContent,
  disabled = false,
  className = '',
  style,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing || !containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
    
    // Only allow pull-to-refresh when at the top of the page
    if (scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setCurrentY(e.touches[0].clientY);
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current || disabled || isRefreshing) return;

    const newY = e.touches[0].clientY;
    const deltaY = newY - startY;

    if (deltaY > 0) {
      e.preventDefault();
      setCurrentY(newY);
      const distance = Math.min(deltaY, threshold * 2);
      setPullDistance(distance);
      setIsPulling(distance >= threshold);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current || disabled || isRefreshing) return;

    isDraggingRef.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setIsPulling(false);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setStartY(0);
        setCurrentY(0);
      }
    } else {
      // Spring back
      setPullDistance(0);
      setIsPulling(false);
      setStartY(0);
      setCurrentY(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, isRefreshing, disabled, threshold]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showRefreshIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'auto',
        ...style,
      }}
    >
      {/* Refresh Indicator */}
      {showRefreshIndicator && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${Math.max(pullDistance, threshold)}px`,
            transform: `translateY(${pullDistance - Math.max(pullDistance, threshold)}px)`,
            transition: isRefreshing ? 'transform 0.2s' : 'none',
            backgroundColor: colors.surface,
            zIndex: 1000,
          }}
        >
          {isRefreshing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              {refreshContent || (
                <>
                  <LoadingSpinner size="small" />
                  <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Refreshing...</span>
                </>
              )}
            </div>
          ) : isPulling ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              {releaseContent || (
                <>
                  <span style={{ fontSize: '1.5rem' }}>↓</span>
                  <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Release to refresh</span>
                </>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: pullProgress,
              }}
            >
              {pullDownContent || (
                <>
                  <span style={{ fontSize: '1.5rem', transform: `rotate(${pullProgress * 180}deg)` }}>↓</span>
                  <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Pull to refresh</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: showRefreshIndicator ? `translateY(${Math.max(pullDistance, threshold)}px)` : 'translateY(0)',
          transition: isRefreshing ? 'transform 0.2s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

