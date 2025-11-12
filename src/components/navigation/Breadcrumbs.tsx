import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: string | React.ReactNode;
  className?: string;
  maxItems?: number;
}

/**
 * Breadcrumbs component for showing navigation path
 */
export default function Breadcrumbs({
  items,
  separator = '›',
  className = '',
  maxItems,
}: BreadcrumbsProps) {
  const navigate = useNavigate();

  const handleClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const displayItems = maxItems && items.length > maxItems
    ? [
        items[0], // First item
        { label: '...', path: undefined, onClick: undefined }, // Ellipsis
        ...items.slice(-(maxItems - 1)), // Last items
      ]
    : items;

  return (
    <nav
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        flexWrap: 'wrap',
        fontSize: '0.875rem',
        color: colors.textSecondary,
      }}
      aria-label="Breadcrumb"
    >
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const isClickable = (item.path || item.onClick) && !isLast;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span
                style={{
                  color: colors.divider,
                  margin: '0 var(--spacing-xs)',
                }}
              >
                {typeof separator === 'string' ? <span>{separator}</span> : separator}
              </span>
            )}
            <span
              onClick={() => isClickable && handleClick(item)}
              style={{
                color: isLast ? colors.text : isClickable ? colors.primary : colors.textSecondary,
                fontWeight: isLast ? 600 : 400,
                cursor: isClickable ? 'pointer' : 'default',
                textDecoration: isClickable ? 'none' : 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => {
                if (isClickable) {
                  e.currentTarget.style.textDecoration = 'underline';
                }
              }}
              onMouseLeave={e => {
                if (isClickable) {
                  e.currentTarget.style.textDecoration = 'none';
                }
              }}
            >
              {item.label}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

