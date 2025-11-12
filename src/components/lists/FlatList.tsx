import React, { ReactNode } from 'react';
import VirtualList from './VirtualList';
import PullToRefresh from './PullToRefresh';
import InfiniteScroll from './InfiniteScroll';

export interface FlatListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  horizontal?: boolean;
  numColumns?: number;
  // Virtualization
  virtualized?: boolean;
  itemHeight?: number | ((index: number) => number);
  containerHeight?: number;
  overscan?: number;
  // Pull to refresh
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  // Infinite scroll
  onEndReached?: () => Promise<void> | void;
  onEndReachedThreshold?: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  // Styling
  className?: string;
  style?: React.CSSProperties;
  contentContainerStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  // Empty state
  ListEmptyComponent?: ReactNode;
  // Footer
  ListFooterComponent?: ReactNode;
  // Header
  ListHeaderComponent?: ReactNode;
}

/**
 * FlatList component - optimized list component with virtualization, pull-to-refresh, and infinite scroll
 */
export default function FlatList<T>({
  data,
  renderItem,
  keyExtractor,
  horizontal = false,
  numColumns = 1,
  virtualized = false,
  itemHeight = 50,
  containerHeight,
  overscan = 5,
  onRefresh,
  refreshing = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
  hasMore = false,
  isLoadingMore = false,
  className = '',
  style,
  contentContainerStyle,
  itemStyle,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
}: FlatListProps<T>) {
  // Render grid item
  const renderGridItem = (item: T, index: number) => {
    if (numColumns === 1) {
      return (
        <div key={keyExtractor ? keyExtractor(item, index) : index} style={itemStyle}>
          {renderItem(item, index)}
        </div>
      );
    }

    // For multiple columns, group items into rows
    const rowIndex = Math.floor(index / numColumns);
    const colIndex = index % numColumns;

    if (colIndex === 0) {
      // Start of a new row
      const rowItems = data.slice(index, index + numColumns);
      return (
        <div
          key={`row-${rowIndex}`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
            gap: '1rem',
            ...itemStyle,
          }}
        >
          {rowItems.map((rowItem, i) => (
            <div key={keyExtractor ? keyExtractor(rowItem, index + i) : index + i}>
              {renderItem(rowItem, index + i)}
            </div>
          ))}
        </div>
      );
    }

    return null; // Items are rendered as part of the row
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Handle end reached
  const handleEndReached = async () => {
    if (onEndReached && hasMore && !isLoadingMore) {
      await onEndReached();
    }
  };

  // Empty state
  if (data.length === 0 && ListEmptyComponent) {
    return (
      <div className={className} style={style}>
        {ListHeaderComponent}
        {ListEmptyComponent}
        {ListFooterComponent}
      </div>
    );
  }

  // Content
  const content = virtualized ? (
    <VirtualList
      items={data}
      renderItem={numColumns === 1 ? renderItem : renderGridItem}
      itemHeight={itemHeight}
      overscan={overscan}
      containerHeight={containerHeight}
      keyExtractor={keyExtractor}
    />
  ) : (
    <div
      style={{
        display: horizontal ? 'flex' : numColumns > 1 ? 'grid' : 'block',
        flexDirection: horizontal ? 'row' : undefined,
        gridTemplateColumns: numColumns > 1 && !horizontal ? `repeat(${numColumns}, 1fr)` : undefined,
        gap: '1rem',
        ...contentContainerStyle,
      }}
    >
      {numColumns === 1
        ? data.map((item, index) => (
            <div key={keyExtractor ? keyExtractor(item, index) : index} style={itemStyle}>
              {renderItem(item, index)}
            </div>
          ))
        : Array.from({ length: Math.ceil(data.length / numColumns) }).map((_, rowIndex) => {
            const startIndex = rowIndex * numColumns;
            const rowItems = data.slice(startIndex, startIndex + numColumns);
            return (
              <div
                key={`row-${rowIndex}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
                  gap: '1rem',
                }}
              >
                {rowItems.map((item, colIndex) => {
                  const index = startIndex + colIndex;
                  return (
                    <div key={keyExtractor ? keyExtractor(item, index) : index} style={itemStyle}>
                      {renderItem(item, index)}
                    </div>
                  );
                })}
              </div>
            );
          })}
    </div>
  );

  // Wrap with pull-to-refresh if needed
  const wrappedContent = onRefresh ? (
    <PullToRefresh onRefresh={handleRefresh} disabled={refreshing}>
      {ListHeaderComponent}
      {content}
      {onEndReached && (
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={handleEndReached}
          threshold={onEndReachedThreshold * 100}
        />
      )}
      {ListFooterComponent}
    </PullToRefresh>
  ) : (
    <>
      {ListHeaderComponent}
      {content}
      {onEndReached && (
        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={handleEndReached}
          threshold={onEndReachedThreshold * 100}
        />
      )}
      {ListFooterComponent}
    </>
  );

  return (
    <div className={className} style={style}>
      {wrappedContent}
    </div>
  );
}

