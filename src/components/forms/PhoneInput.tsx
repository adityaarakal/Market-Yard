import React, { forwardRef, useState, useEffect } from 'react';
import { colors } from '../../theme';
import { VALIDATION } from '../../utils/constants';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const formatPhoneNumber = (input: string): string => {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  // Limit to 10 digits (Indian mobile numbers)
  const limited = digits.slice(0, 10);

  // Format with space after first 5 digits
  if (limited.length <= 5) {
    return limited;
  }
  return `${limited.slice(0, 5)} ${limited.slice(5)}`;
};

/**
 * PhoneInput component with Indian phone number formatting and validation
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, countryCode = '+91', error, helperText, label, required, fullWidth = true, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => formatPhoneNumber(value || ''));

    useEffect(() => {
      const digits = value.replace(/\D/g, '');
      const formatted = formatPhoneNumber(digits);
      setDisplayValue(formatted);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatPhoneNumber(input);
      setDisplayValue(formatted);

      // Extract digits only for the actual value
      const digits = formatted.replace(/\D/g, '');
      onChange(digits);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Validate on blur
      const digits = displayValue.replace(/\D/g, '');
      if (digits.length > 0 && !VALIDATION.PHONE_NUMBER_REGEX.test(digits)) {
        // Error will be shown by parent component
      }
      
      // Update border styling
      const target = e.target as HTMLInputElement;
      const normalizedValue = displayValue.replace(/\D/g, '');
      const isValid = normalizedValue.length === 0 || VALIDATION.PHONE_NUMBER_REGEX.test(normalizedValue);
      const displayError = error || (!isValid && normalizedValue.length > 0 ? 'Enter a valid 10-digit Indian mobile number' : undefined);
      target.style.borderColor = displayError ? colors.error : colors.border;
      target.style.boxShadow = 'none';
      
      props.onBlur?.(e);
    };

    const normalizedValue = displayValue.replace(/\D/g, '');
    const isValid = normalizedValue.length === 0 || VALIDATION.PHONE_NUMBER_REGEX.test(normalizedValue);
    const displayError = error || (!isValid && normalizedValue.length > 0 ? 'Enter a valid 10-digit Indian mobile number' : undefined);

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
              color: displayError ? colors.error : colors.text,
            }}
            htmlFor={props.id}
          >
            {label}
            {required && (
              <span style={{ color: colors.error, marginLeft: '4px' }}>*</span>
            )}
          </label>
        )}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          <div
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: '1rem',
              lineHeight: '1.5',
              color: colors.text,
              backgroundColor: colors.surface,
              border: `1px solid ${displayError ? colors.error : colors.border}`,
              borderRight: 'none',
              borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {countryCode}
          </div>
          <input
            ref={ref}
            type="tel"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={props.placeholder}
            disabled={props.disabled}
            required={required}
            inputMode="numeric"
            maxLength={12} // 10 digits + 1 space
            id={props.id}
            name={props.name}
            autoComplete={props.autoComplete}
            style={{
              flex: 1,
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: '1rem',
              lineHeight: '1.5',
              color: colors.text,
              backgroundColor: colors.white,
              border: `1px solid ${displayError ? colors.error : colors.border}`,
              borderLeft: 'none',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              outline: 'none',
              ...props.style,
            }}
            onFocus={e => {
              const target = e.target as HTMLInputElement;
              if (!displayError) {
                target.style.borderColor = colors.primary;
                target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
              }
              props.onFocus?.(e);
            }}
          />
        </div>
        {displayError && (
          <div
            style={{
              marginTop: 'var(--spacing-xs)',
              fontSize: '0.875rem',
              color: colors.error,
            }}
          >
            {displayError}
          </div>
        )}
        {helperText && !displayError && (
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

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
