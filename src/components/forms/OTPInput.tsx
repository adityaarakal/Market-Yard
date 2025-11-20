import React, { useRef, useState, useEffect, KeyboardEvent } from 'react';
import { colors } from '../../theme';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * OTPInput component for 6-digit OTP entry
 */
export default function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled = false,
  autoFocus = true,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Sync value prop with internal state
    if (value) {
      const digits = value.slice(0, length).split('');
      const newOtp = new Array(length).fill('');
      digits.forEach((digit, index) => {
        if (index < length) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
    } else {
      setOtp(new Array(length).fill(''));
    }
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow digits
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1); // Take only the last character
    setOtp(newOtp);

    // Update parent value
    const otpValue = newOtp.join('');
    onChange(otpValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all digits are filled
    if (otpValue.length === length && otpValue.split('').every(d => d !== '')) {
      onComplete?.(otpValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, length).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (index + i < length) {
            newOtp[index + i] = digit;
          }
        });
        setOtp(newOtp);
        const otpValue = newOtp.join('');
        onChange(otpValue);
        if (otpValue.length === length) {
          onComplete?.(otpValue);
          inputRefs.current[length - 1]?.focus();
        } else {
          const nextIndex = Math.min(index + digits.length, length - 1);
          inputRefs.current[nextIndex]?.focus();
        }
      });
    }
  };

  const handleFocus = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    inputRefs.current[index]?.select();
    const target = e.target as HTMLInputElement;
    if (!error) {
      target.style.borderColor = colors.primary;
      target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
    }
  };

  const handleBlur = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const digit = otp[index];
    target.style.borderColor = error ? colors.error : digit ? colors.primary : colors.border;
    target.style.boxShadow = 'none';
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          justifyContent: 'center',
          marginBottom: error ? 'var(--spacing-xs)' : 0,
        }}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            disabled={disabled}
            style={{
              width: '48px',
              height: '48px',
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: colors.text,
              backgroundColor: colors.white,
              border: `2px solid ${error ? colors.error : digit ? colors.primary : colors.border}`,
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              transition: 'all 0.2s',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.6 : 1,
            }}
            onFocus={e => handleFocus(index, e)}
            onBlur={e => handleBlur(index, e)}
          />
        ))}
      </div>
      {error && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: colors.error,
            marginTop: 'var(--spacing-xs)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
