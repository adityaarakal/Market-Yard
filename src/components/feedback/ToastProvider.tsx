import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastPosition } from './Toast';

export interface ToastOptions {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string | React.ReactNode;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  showSuccess: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void;
  showError: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void;
  showWarning: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void;
  showInfo: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
}

/**
 * ToastProvider component for managing toasts globally
 */
export function ToastProvider({
  children,
  defaultPosition = 'top-right',
  defaultDuration = 3000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: ToastItem = {
        ...options,
        id,
        position: options.position || defaultPosition,
        duration: options.duration !== undefined ? options.duration : defaultDuration,
      };
      setToasts(prev => [...prev, toast]);
    },
    [defaultPosition, defaultDuration]
  );

  const showSuccess = useCallback(
    (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => {
      showToast({ ...options, message, variant: 'success' });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => {
      showToast({ ...options, message, variant: 'error' });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => {
      showToast({ ...options, message, variant: 'warning' });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => {
      showToast({ ...options, message, variant: 'info' });
    },
    [showToast]
  );

  // Group toasts by position
  const toastsByPosition = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || defaultPosition;
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, ToastItem[]>
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <ToastContainer
          key={position}
          toasts={positionToasts}
          onRemove={removeToast}
          position={position as ToastPosition}
        />
      ))}
    </ToastContext.Provider>
  );
}
