import React, { forwardRef } from 'react';
import { colors } from '../../theme';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Checkbox component
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, onChange, error, helperText, fullWidth = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    };

    return (
      <div
        style={{
          width: fullWidth ? '100%' : 'auto',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--spacing-sm)',
            cursor: props.disabled ? 'not-allowed' : 'pointer',
            opacity: props.disabled ? 0.6 : 1,
          }}
        >
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            {...props}
            style={{
              width: '20px',
              height: '20px',
              marginTop: '2px',
              cursor: props.disabled ? 'not-allowed' : 'pointer',
              accentColor: colors.primary,
              ...props.style,
            }}
          />
          {label && (
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: error ? colors.error : colors.text,
                  userSelect: 'none',
                }}
              >
                {label}
              </div>
              {helperText && !error && (
                <div
                  style={{
                    marginTop: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    color: colors.textSecondary,
                  }}
                >
                  {helperText}
                </div>
              )}
              {error && (
                <div
                  style={{
                    marginTop: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    color: colors.error,
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          )}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;

