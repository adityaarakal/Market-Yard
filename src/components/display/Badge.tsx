import React from 'react';
import { colors } from '../../theme';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  outlined?: boolean;
  rounded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Badge component for displaying labels, tags, and status indicators
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  outlined = false,
  rounded = true,
  className = '',
  style = {},
}: BadgeProps) {
  const variantStyles = {
    default: {
      backgroundColor: colors.grey[200],
      color: colors.grey[900],
      borderColor: colors.grey[300],
    },
    primary: {
      backgroundColor: colors.primaryLight,
      color: colors.primaryDark,
      borderColor: colors.primary,
    },
    success: {
      backgroundColor: `${colors.success}20`,
      color: colors.success,
      borderColor: colors.success,
    },
    warning: {
      backgroundColor: `${colors.warning}20`,
      color: colors.secondaryDark,
      borderColor: colors.warning,
    },
    error: {
      backgroundColor: `${colors.error}20`,
      color: colors.error,
      borderColor: colors.error,
    },
    info: {
      backgroundColor: `${colors.info}20`,
      color: colors.info,
      borderColor: colors.info,
    },
  };

  const sizeStyles = {
    small: {
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      lineHeight: '1.2',
    },
    medium: {
      fontSize: '0.875rem',
      padding: '0.375rem 0.75rem',
      lineHeight: '1.4',
    },
    large: {
      fontSize: '1rem',
      padding: '0.5rem 1rem',
      lineHeight: '1.5',
    },
  };

  const styleConfig = variantStyles[variant];
  const sizeConfig = sizeStyles[size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        borderRadius: rounded ? 'var(--radius-pill)' : 'var(--radius-sm)',
        border: `1px solid ${outlined ? styleConfig.borderColor : 'transparent'}`,
        backgroundColor: outlined ? 'transparent' : styleConfig.backgroundColor,
        color: styleConfig.color,
        ...sizeConfig,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * StatusBadge component for displaying status indicators
 */
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'info' | 'cancelled' | 'expired' | 'processing' | 'paid' | 'failed' | 'refunded';
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge({ status, size = 'medium', className = '' }: StatusBadgeProps) {
  const statusConfig: Record<StatusBadgeProps['status'], { variant: BadgeVariant; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    success: { variant: 'success', label: 'Success' },
    error: { variant: 'error', label: 'Error' },
    warning: { variant: 'warning', label: 'Warning' },
    info: { variant: 'info', label: 'Info' },
    cancelled: { variant: 'default', label: 'Cancelled' },
    expired: { variant: 'error', label: 'Expired' },
    processing: { variant: 'warning', label: 'Processing' },
    paid: { variant: 'success', label: 'Paid' },
    failed: { variant: 'error', label: 'Failed' },
    refunded: { variant: 'info', label: 'Refunded' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}

