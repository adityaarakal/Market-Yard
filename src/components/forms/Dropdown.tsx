import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { colors } from '../../theme';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
}

/**
 * Dropdown/Picker component
 */
const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, value, onChange, error, helperText, required, fullWidth = true, placeholder, ...props }, ref) => {
    const selectRef = useRef<HTMLSelectElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    };

    return (
      <div
        style={{
          width: fullWidth ? '100%' : 'auto',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        {label && (
          <label
            style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: error ? colors.error : colors.text,
            }}
            htmlFor={props.id}
          >
            {label}
            {required && (
              <span style={{ color: colors.error, marginLeft: '4px' }}>*</span>
            )}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          <select
            ref={ref || selectRef}
            value={value}
            onChange={handleChange}
            {...props}
            aria-label={label || props['aria-label']}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            aria-required={required}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              paddingRight: 'calc(var(--spacing-md) + 20px)',
              fontSize: '1rem',
              lineHeight: '1.5',
              color: value ? colors.text : colors.textSecondary,
              backgroundColor: colors.white,
              border: `1px solid ${error ? colors.error : colors.border}`,
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              appearance: 'none',
              cursor: props.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: props.disabled ? 0.6 : 1,
              ...props.style,
            }}
            onFocus={e => {
              const target = e.target as HTMLSelectElement;
              target.style.borderColor = error ? colors.error : colors.primary;
              props.onFocus?.(e);
            }}
            onBlur={e => {
              const target = e.target as HTMLSelectElement;
              target.style.borderColor = error ? colors.error : colors.border;
              props.onBlur?.(e);
            }}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div
            style={{
              position: 'absolute',
              right: 'var(--spacing-md)',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: colors.textSecondary,
              fontSize: '1.25rem',
            }}
          >
            ▼
          </div>
        </div>
        {error && (
          <div
            id={props.id ? `${props.id}-error` : undefined}
            role="alert"
            aria-live="polite"
            style={{
              marginTop: 'var(--spacing-xs)',
              fontSize: '0.875rem',
              color: colors.error,
            }}
          >
            {error}
          </div>
        )}
        {helperText && !error && (
          <div
            id={props.id ? `${props.id}-helper` : undefined}
            style={{
              marginTop: 'var(--spacing-xs)',
              fontSize: '0.875rem',
              color: colors.textSecondary,
            }}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;

