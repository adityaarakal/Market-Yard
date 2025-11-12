import React, { forwardRef } from 'react';
import { colors } from '../../theme';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  helperText?: string;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  direction?: 'horizontal' | 'vertical';
}

/**
 * Radio button group component
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ name, options, value, onChange, error, helperText, required, fullWidth = true, direction = 'vertical', ...props }, ref) => {
    const handleChange = (optionValue: string) => {
      onChange(optionValue);
    };

    return (
      <div
        style={{
          width: fullWidth ? '100%' : 'auto',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: direction === 'horizontal' ? 'row' : 'column',
            gap: direction === 'horizontal' ? 'var(--spacing-lg)' : 'var(--spacing-sm)',
            flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
          }}
        >
          {options.map(option => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-sm)',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                opacity: option.disabled ? 0.6 : 1,
              }}
            >
              <input
                ref={option.value === value ? ref : undefined}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => handleChange(option.value)}
                disabled={option.disabled || props.disabled}
                required={required}
                {...props}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  accentColor: colors.primary,
                  ...props.style,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: error ? colors.error : colors.text,
                    userSelect: 'none',
                  }}
                >
                  {option.label}
                </div>
                {option.helperText && (
                  <div
                    style={{
                      marginTop: 'var(--spacing-xs)',
                      fontSize: '0.875rem',
                      color: colors.textSecondary,
                    }}
                  >
                    {option.helperText}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
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

Radio.displayName = 'Radio';

export default Radio;

