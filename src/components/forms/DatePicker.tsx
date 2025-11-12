import React, { forwardRef } from 'react';
import { colors } from '../../theme';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  value: string; // ISO date string (YYYY-MM-DD) or datetime string
  onChange: (value: string) => void;
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
  format?: 'date' | 'datetime-local';
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

/**
 * DatePicker component
 */
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, minDate, maxDate, format = 'date', error, helperText, label, required, fullWidth = true, ...props }, ref) => {
    // Convert ISO date to local date string for input[type="date"]
    const getDisplayValue = () => {
      if (!value) return '';
      if (format === 'date') {
        // Input type="date" expects YYYY-MM-DD format
        return value.split('T')[0];
      }
      // For datetime-local, convert ISO to local datetime string
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const displayValue = getDisplayValue();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
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
        <input
          ref={ref}
          type={format}
          value={displayValue}
          onChange={handleChange}
          min={minDate ? (format === 'date' ? minDate.split('T')[0] : minDate) : undefined}
          max={maxDate ? (format === 'date' ? maxDate.split('T')[0] : maxDate) : undefined}
          placeholder={props.placeholder}
          disabled={props.disabled}
          required={required}
          id={props.id}
          name={props.name}
          autoComplete={props.autoComplete}
          style={{
            width: '100%',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: '1rem',
            lineHeight: '1.5',
            color: colors.text,
            backgroundColor: colors.white,
            border: `1px solid ${error ? colors.error : colors.border}`,
            borderRadius: 'var(--radius-md)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none',
            ...props.style,
          }}
          onFocus={e => {
            const target = e.target as HTMLInputElement;
            if (!error) {
              target.style.borderColor = colors.primary;
              target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
            }
            props.onFocus?.(e);
          }}
          onBlur={e => {
            const target = e.target as HTMLInputElement;
            target.style.borderColor = error ? colors.error : colors.border;
            target.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
        />
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
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
