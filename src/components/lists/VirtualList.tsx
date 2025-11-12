import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number | ((index: number) => number);
  overscan?: number;
  containerHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  onScroll?: (scrollTop: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
}

/**
 * VirtualList component for rendering large lists efficiently
 * Only renders visible items and a few extra (overscan) for smooth scrolling
 */
export default function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 50,
  overscan = 5,
  containerHeight,
  className = '',
  style,
  onScroll,
  keyExtractor,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ height: 0, width: 0 });

  // Calculate item height (can be fixed or dynamic)
  const getItemHeight = useCallback(
    (index: number): number => {
      if (typeof itemHeight === 'function') {
        return itemHeight(index);
      }
      return itemHeight;
    },
    [itemHeight]
  );

  // Calculate total height of all items
  const totalHeight = useMemo(() => {
    return items.reduce((sum, _, index) => sum + getItemHeight(index), 0);
  }, [items, getItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const height = containerHeight || containerSize.height;
    if (height === 0) return { start: 0, end: items.length };

    let start = 0;
    let accumulatedHeight = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const itemH = getItemHeight(i);
      if (accumulatedHeight + itemH > scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += itemH;
    }

    // Find end index
    let end = start;
    let visibleHeight = 0;
    for (let i = start; i < items.length; i++) {
      const itemH = getItemHeight(i);
      if (visibleHeight > height + scrollTop - accumulatedHeight) {
        end = Math.min(items.length, i + overscan);
        break;
      }
      visibleHeight += itemH;
      end = i + 1;
    }
    end = Math.min(items.length, end + overscan);

    return { start, end };
  }, [items, scrollTop, containerHeight, containerSize.height, overscan, getItemHeight]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < visibleRange.start; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [visibleRange.start, getItemHeight]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  // Update container size
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({
          height: entry.contentRect.height,
          width: entry.contentRect.width,
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight || '100%',
        overflow: 'auto',
        position: 'relative',
        ...style,
      }}
      onScroll={handleScroll}
    >
      {/* Spacer for items before visible range */}
      <div style={{ height: offsetY }} />

      {/* Visible items */}
      {visibleItems.map(({ item, index }) => (
        <div
          key={keyExtractor ? keyExtractor(item, index) : index}
          style={{
            height: getItemHeight(index),
            minHeight: getItemHeight(index),
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}

      {/* Spacer for items after visible range */}
      <div
        style={{
          height: totalHeight - offsetY - visibleItems.reduce((sum, { index }) => sum + getItemHeight(index), 0),
        }}
      />
    </div>
  );
}

