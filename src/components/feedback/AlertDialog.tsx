import React from 'react';
import { colors } from '../../theme';

export interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'error' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  showCancel?: boolean;
  confirmVariant?: 'primary' | 'danger';
  icon?: string | React.ReactNode;
  children?: React.ReactNode;
}

/**
 * AlertDialog component for displaying modal dialogs
 */
export default function AlertDialog({
  open,
  title,
  message,
  variant = 'info',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  showCancel = true,
  confirmVariant = 'primary',
  icon,
  children,
}: AlertDialogProps) {
  if (!open) return null;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  const variantStyles = {
    info: {
      iconColor: colors.info,
      icon: icon || 'ℹ',
    },
    warning: {
      iconColor: colors.warning,
      icon: icon || '⚠',
    },
    error: {
      iconColor: colors.error,
      icon: icon || '✕',
    },
    success: {
      iconColor: colors.success,
      icon: icon || '✓',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 'var(--spacing-md)',
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-message"
    >
      <div
        className="surface-card"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-card)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
            {icon !== null && (
              <div
                style={{
                  fontSize: '2rem',
                  color: style.iconColor,
                  flexShrink: 0,
                }}
              >
                {typeof style.icon === 'string' ? <span>{style.icon}</span> : icon || style.icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                id="alert-dialog-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: colors.text,
                  margin: 0,
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                {title}
              </h2>
              <p
                id="alert-dialog-message"
                style={{
                  fontSize: '0.875rem',
                  color: colors.textSecondary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {message}
              </p>
            </div>
          </div>

          {/* Children */}
          {children && <div>{children}</div>}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--spacing-sm)',
              marginTop: 'var(--spacing-sm)',
            }}
          >
            {showCancel && (
              <button
                type="button"
                className="button button--ghost"
                onClick={handleCancel}
                style={{ width: 'auto', minWidth: '100px' }}
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="button"
              className={`button button--${confirmVariant === 'danger' ? 'primary' : 'primary'}`}
              onClick={handleConfirm}
              style={{
                width: 'auto',
                minWidth: '100px',
                backgroundColor: confirmVariant === 'danger' ? colors.error : undefined,
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ConfirmDialog component for confirmation dialogs
 */
export interface ConfirmDialogProps extends Omit<AlertDialogProps, 'variant' | 'confirmLabel' | 'cancelLabel'> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  confirmVariant = 'primary',
  icon,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      title={title}
      message={message}
      variant="warning"
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onClose={onClose}
      showCancel={true}
      confirmVariant={confirmVariant}
      icon={icon}
    >
      {children}
    </AlertDialog>
  );
}
