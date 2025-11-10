import React, { useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { colors, theme } from '../theme';

type RegistrationStep = 'phone' | 'otp' | 'details';

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.lg,
  backgroundColor: colors.background,
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '440px',
  backgroundColor: colors.white,
  padding: theme.spacing.xl,
  borderRadius: theme.borderRadius.lg,
  boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: theme.spacing.md,
  marginBottom: theme.spacing.md,
  border: `1px solid ${colors.border}`,
  borderRadius: theme.borderRadius.md,
  fontSize: theme.typography.body.fontSize,
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.md,
  border: 'none',
  fontSize: theme.typography.body.fontSize,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: 'transparent',
  border: `1px solid ${colors.border}`,
  color: colors.textSecondary,
};

interface PasswordStrength {
  label: 'Weak' | 'Medium' | 'Strong' | '';
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { label: '', color: colors.textSecondary };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 3) {
    return { label: 'Strong', color: colors.success };
  }
  if (score === 2) {
    return { label: 'Medium', color: colors.warning };
  }
  return { label: 'Weak', color: colors.error };
}

export default function RegisterPage() {
  const location = useLocation();
  const initialUserType = useMemo(() => {
    const state = location.state as { userType?: 'shop_owner' | 'end_user' } | null;
    return state?.userType || 'end_user';
  }, [location.state]);

  const [step, setStep] = useState<RegistrationStep>('phone');
  const [otpValue, setOtpValue] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: initialUserType as 'shop_owner' | 'end_user',
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const normalizedPhone = useMemo(() => formData.phone.replace(/\D/g, ''), [formData.phone]);

  const handleBack = () => {
    setError('');
    setInfo('');
    if (step === 'details') {
      setStep('otp');
    } else if (step === 'otp') {
      setStep('phone');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (step === 'phone') {
      if (normalizedPhone.length !== 10 || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
        setError('Enter a valid 10-digit Indian mobile number (6-9 starts).');
        return;
      }

      const existingUser = StorageService.getUserByPhone(normalizedPhone);
      if (existingUser) {
        setError('This phone number is already registered. Try logging in instead.');
        return;
      }

      setStep('otp');
      setOtpValue('');
      setInfo('Mock OTP 123456 sent. Enter it below to continue.');
      return;
    }

    if (step === 'otp') {
      if (!otpValue) {
        setError('Enter the 6-digit OTP sent to your phone.');
        return;
      }

      if (otpValue !== '123456') {
        setError('Incorrect OTP. Use 123456 as the mock verification code.');
        return;
      }

      setStep('details');
      setInfo('Phone number verified. Complete your profile to finish registration.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!formData.password) {
      setError('Create a password to continue.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the terms & conditions to create an account.');
      return;
    }

    setLoading(true);

    const result = await register({
      phone: normalizedPhone,
      name: formData.name.trim(),
      password: formData.password,
      userType: formData.userType,
      email: formData.email.trim() || undefined,
    });

    setLoading(false);

    if (result.success) {
      if (formData.userType === 'shop_owner') {
        navigate('/shop-owner/dashboard');
      } else {
        navigate('/end-user/home');
      }
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleResendOtp = () => {
    setInfo('Mock OTP re-sent. Use 123456 to verify.');
    setError('');
    setOtpValue('');
  };

  return (
    <div style={containerStyle}>
      <form style={cardStyle} onSubmit={handleSubmit}>
        <div style={{ marginBottom: theme.spacing.md, color: colors.textSecondary, fontSize: '14px' }}>
          Step {step === 'phone' ? '1' : step === 'otp' ? '2' : '3'} of 3 ·{' '}
          {step === 'phone' ? 'Verify your phone' : step === 'otp' ? 'Enter OTP' : 'Complete profile'}
        </div>
        <h2 style={{ marginBottom: theme.spacing.md, color: colors.text }}>Create your Market Yard account</h2>
        <div
          style={{
            marginBottom: theme.spacing.lg,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
            fontSize: '14px',
          }}
        >
          Signing up as{' '}
          <span style={{ fontWeight: 600, color: colors.text }}>
            {formData.userType === 'shop_owner' ? 'Shop Owner' : 'End User'}
          </span>
        </div>

        {error && (
          <div style={{ color: colors.error, marginBottom: theme.spacing.md, fontSize: '14px' }}>
            {error}
          </div>
        )}
        {info && (
          <div style={{ color: colors.primary, marginBottom: theme.spacing.md, fontSize: '14px' }}>
            {info}
          </div>
        )}

        {step === 'phone' && (
          <>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: colors.textSecondary }}>
              User Type
            </label>
            <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
              {(['shop_owner', 'end_user'] as Array<'shop_owner' | 'end_user'>).map(type => {
                const isSelected = formData.userType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
                    style={{
                      flex: 1,
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                      backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                      color: isSelected ? colors.primary : colors.textSecondary,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {type === 'shop_owner' ? 'Shop Owner' : 'End User'}
                  </button>
                );
              })}
            </div>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: colors.textSecondary }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              onChange={event => setFormData({ ...formData, phone: event.target.value })}
              style={inputStyle}
              inputMode="numeric"
              maxLength={14}
            />
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: colors.primary, color: colors.white, marginTop: theme.spacing.sm }}
            >
              Send OTP
            </button>
            <div style={{ marginTop: theme.spacing.md, fontSize: '14px', color: colors.textSecondary }}>
              We will send a 6-digit verification code to confirm your phone number.
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <label style={{ display: 'block', marginBottom: theme.spacing.sm, color: colors.text }}>
              Enter the 6-digit OTP
            </label>
            <input
              type="tel"
              placeholder="123456"
              value={otpValue}
              onChange={event => setOtpValue(event.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ ...inputStyle, letterSpacing: '6px', textAlign: 'center', fontWeight: 600 }}
              inputMode="numeric"
              maxLength={6}
            />
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: colors.primary, color: colors.white }}
            >
              Verify OTP
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing.sm }}>
              <button type="button" style={secondaryButtonStyle} onClick={handleBack}>
                Back
              </button>
              <button
                type="button"
                style={{ ...secondaryButtonStyle, color: colors.primary, borderColor: colors.primary }}
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: colors.textSecondary }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={event => setFormData({ ...formData, name: event.target.value })}
              style={inputStyle}
              required
            />
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: colors.textSecondary }}>
              Email (Optional)
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={event => setFormData({ ...formData, email: event.target.value })}
              style={inputStyle}
            />
            <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: colors.textSecondary }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={event => setFormData({ ...formData, password: event.target.value })}
              style={inputStyle}
            />
            <div style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md, fontSize: '13px', color: passwordStrength.color }}>
              {passwordStrength.label && `Password strength: ${passwordStrength.label}`}
            </div>
            <input
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={event => setFormData({ ...formData, confirmPassword: event.target.value })}
              style={inputStyle}
            />
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: theme.spacing.sm,
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: theme.spacing.lg,
              }}
            >
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={event => setFormData({ ...formData, termsAccepted: event.target.checked })}
                style={{ marginTop: 4 }}
              />
              I agree to the Market Yard terms & conditions and understand that OTP verification is simulated during prototype
              testing.
            </label>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: colors.primary, color: colors.white }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <button type="button" style={{ ...secondaryButtonStyle, marginTop: theme.spacing.sm }} onClick={handleBack}>
              Back
            </button>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: theme.spacing.lg }}>
          <Link to="/login" style={{ color: colors.primary, textDecoration: 'none' }}>
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}

