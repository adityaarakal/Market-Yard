import React, { forwardRef, useState } from 'react';
import { colors } from '../../theme';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  showStrengthIndicator?: boolean;
}

interface PasswordStrength {
  label: 'Weak' | 'Medium' | 'Strong' | '';
  color: string;
  score: number; // 0-4
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { label: '', color: colors.textSecondary, score: 0 };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 3) {
    return { label: 'Strong', color: colors.success, score };
  }
  if (score === 2) {
    return { label: 'Medium', color: colors.warning, score };
  }
  return { label: 'Weak', color: colors.error, score };
}

/**
 * PasswordInput component with show/hide toggle and optional strength indicator
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value, onChange, showStrengthIndicator = false, error, helperText, label, required, fullWidth = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const strength = showStrengthIndicator ? getPasswordStrength(value) : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={handleChange}
            placeholder={props.placeholder}
            disabled={props.disabled}
            required={required}
            id={props.id}
            name={props.name}
            autoComplete={props.autoComplete}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              paddingRight: 'calc(var(--spacing-md) + 24px + var(--spacing-sm))',
              fontSize: '1rem',
              lineHeight: '1.5',
              color: colors.text,
              backgroundColor: colors.white,
              border: `1px solid ${error ? colors.error : colors.border}`,
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s',
              outline: 'none',
              ...props.style,
            }}
            onFocus={e => {
              const target = e.target as HTMLInputElement;
              target.style.borderColor = error ? colors.error : colors.primary;
              props.onFocus?.(e);
            }}
            onBlur={e => {
              const target = e.target as HTMLInputElement;
              target.style.borderColor = error ? colors.error : colors.border;
              props.onBlur?.(e);
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 'var(--spacing-sm)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--spacing-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
              fontSize: '1.25rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = colors.textSecondary;
            }}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {showStrengthIndicator && value && strength && (
          <div style={{ marginTop: 'var(--spacing-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xs)' }}>
              <div
                style={{
                  flex: 1,
                  height: '4px',
                  backgroundColor: colors.surface,
                  borderRadius: 'var(--radius-pill)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(strength.score / 4) * 100}%`,
                    height: '100%',
                    backgroundColor: strength.color,
                    borderRadius: 'var(--radius-pill)',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: strength.color,
                }}
              >
                {strength.label}
              </span>
            </div>
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

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
