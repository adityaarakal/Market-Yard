import React, { useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { colors } from '../theme';

type RegistrationStep = 'phone' | 'otp' | 'details';

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
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__heading" style={{ alignItems: 'center', gap: '0.35rem' }}>
          <span className="auth-card__title">Create your Market Yard account</span>
          <p className="auth-card__subtitle">
            Step {step === 'phone' ? '1' : step === 'otp' ? '2' : '3'} of 3 ·{' '}
            {step === 'phone' ? 'Verify your phone' : step === 'otp' ? 'Enter OTP' : 'Complete profile'}
          </p>
        </div>

        {error && <div className="form-error">{error}</div>}
        {info && <div className="form-info">{info}</div>}

        {step === 'phone' && (
          <>
            <div className="segmented-control" style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className={`segmented-control__button${formData.userType === 'shop_owner' ? ' segmented-control__button--active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'shop_owner' }))}
              >
                Shop Owner
              </button>
              <button
                type="button"
                className={`segmented-control__button${formData.userType === 'end_user' ? ' segmented-control__button--active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'end_user' }))}
              >
                End User
              </button>
            </div>
            <div className="form-field">
              <label htmlFor="register-phone">Phone number</label>
              <input
                id="register-phone"
                className="form-input"
                type="tel"
                placeholder="Enter 10-digit phone"
                value={formData.phone}
                onChange={event => setFormData(prev => ({ ...prev, phone: event.target.value }))}
                required
              />
            </div>
            <button type="submit" className="button button--primary">
              Send OTP
            </button>
            <p className="form-helper" style={{ textAlign: 'center' }}>
              We will send a 6-digit verification code to confirm your phone number.
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="form-field">
              <label htmlFor="register-otp">Enter the 6-digit OTP</label>
              <input
                id="register-otp"
                className="form-input"
                type="tel"
                placeholder="123456"
                value={otpValue}
                onChange={event => setOtpValue(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                style={{ letterSpacing: '6px', textAlign: 'center', fontWeight: 600 }}
              />
            </div>
            <div className="action-row">
              <button type="button" className="button button--outline" onClick={handleBack}>
                Back
              </button>
              <button type="button" className="button button--ghost" onClick={handleResendOtp}>
                Resend OTP
              </button>
            </div>
            <button type="submit" className="button button--primary">
              Verify OTP
            </button>
          </>
        )}

        {step === 'details' && (
          <>
            <div className="form-field">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                className="form-input"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={event => setFormData(prev => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="register-email">Email (optional)</label>
              <input
                id="register-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={event => setFormData(prev => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="form-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                className="form-input"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={event => setFormData(prev => ({ ...prev, password: event.target.value }))}
              />
              {passwordStrength.label && (
                <span className="form-helper" style={{ color: passwordStrength.color }}>
                  Password strength: {passwordStrength.label}
                </span>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="register-confirm-password">Confirm password</label>
              <input
                id="register-confirm-password"
                className="form-input"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={event => setFormData(prev => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={event => setFormData(prev => ({ ...prev, termsAccepted: event.target.checked }))}
              />
              I agree to the Market Yard terms & conditions and understand that OTP verification is simulated during
              prototype testing.
            </label>
            <div className="action-row">
              <button type="button" className="button button--outline" onClick={handleBack}>
                Back
              </button>
              <button type="submit" className="button button--primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <Link to="/login" className="link">
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}

