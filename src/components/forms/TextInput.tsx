import React, { forwardRef } from 'react';
import { colors } from '../../theme';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, required, fullWidth = true, className, ...props }, ref) => {
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
          type="text"
          {...props}
          className={`form-input ${error ? 'form-input--error' : ''} ${className || ''}`}
          aria-label={label || props['aria-label']}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
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

TextInput.displayName = 'TextInput';

export default TextInput;

