import React, { useEffect, useRef, useState, ReactNode } from 'react';
import LoadingSpinner from '../feedback/LoadingSpinner';
import { colors } from '../../theme';

export interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => Promise<void> | void;
  children?: ReactNode;
  threshold?: number;
  loader?: ReactNode;
  endMessage?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  scrollableTarget?: string;
}

/**
 * InfiniteScroll component for loading more data as user scrolls
 */
export default function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  children,
  threshold = 200,
  loader,
  endMessage,
  className = '',
  style,
  scrollableTarget,
}: InfiniteScrollProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading) {
      if (observerRef.current && sentinelRef.current) {
        observerRef.current.unobserve(sentinelRef.current);
      }
      return;
    }

    const target = scrollableTarget
      ? document.getElementById(scrollableTarget)
      : null;

    const options: IntersectionObserverInit = {
      root: target,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      options
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current && sentinelRef.current) {
        observerRef.current.unobserve(sentinelRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoading, threshold, scrollableTarget]);

  return (
    <>
      {children}
      {hasMore && (
        <div
          ref={sentinelRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)',
            minHeight: '60px',
          }}
        >
          {isLoading &&
            (loader || (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <LoadingSpinner size="small" />
                <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Loading more...</span>
              </div>
            ))}
        </div>
      )}
      {!hasMore && endMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)',
            color: colors.textSecondary,
            fontSize: '0.875rem',
          }}
        >
          {endMessage}
        </div>
      )}
    </>
  );
}

