import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, theme } from '../theme';
import StorageService from '../services/StorageService';
import { APP_CONFIG, VALIDATION } from '../utils/constants';

const styles: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.lg,
  backgroundColor: colors.background,
};

const formStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: colors.white,
  padding: theme.spacing.xl,
  borderRadius: theme.borderRadius.lg,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: theme.spacing.md,
  marginBottom: theme.spacing.md,
  border: `1px solid ${colors.border}`,
  borderRadius: theme.borderRadius.md,
  fontSize: theme.typography.body.fontSize,
};

export default function LoginPage() {
  const location = useLocation();
  const preferredUserType = useMemo(() => {
    const state = location.state as { userType?: 'shop_owner' | 'end_user' } | null;
    return state?.userType;
  }, [location.state]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = StorageService.getRememberedLogin();
    if (remembered?.phone) {
      setPhone(remembered.phone);
      setRememberMe(true);
    }
  }, []);

  const handleModeChange = (mode: 'password' | 'otp') => {
    setLoginMode(mode);
    setError('');
    setInfo('');
    setOtp('');
    setOtpSent(false);
    if (mode === 'password') {
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const normalizedPhone = phone.replace(/\D/g, '');
    if (!VALIDATION.PHONE_NUMBER_REGEX.test(normalizedPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (loginMode === 'password') {
      if (!password) {
        setError('Enter your password to continue.');
        return;
      }

      setLoading(true);
      const result = await login(normalizedPhone, password, { rememberMe });
      setLoading(false);

      if (result.success) {
        if (rememberMe) {
          StorageService.saveRememberedLogin({ phone: normalizedPhone, userType: preferredUserType });
        } else {
          StorageService.clearRememberedLogin();
        }

        setTimeout(() => {
          const session = StorageService.getSession();
          const currentUser = session?.user;
          if (currentUser?.user_type === 'shop_owner') {
            navigate('/shop-owner/dashboard', { replace: true });
          } else {
            navigate('/end-user/home', { replace: true });
          }
        }, 50);
      } else {
        setError(result.error || 'Login failed. Double-check your phone and password.');
      }
      return;
    }

    if (!otpSent) {
      setOtpSent(true);
      setInfo(`Mock OTP ${APP_CONFIG.MOCK_OTP} sent to your phone. Enter it below to log in.`);
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your phone.');
      return;
    }

    setLoading(true);
    const result = await loginWithOtp(normalizedPhone, otp, { rememberMe });
    setLoading(false);

    if (result.success) {
      if (rememberMe) {
        StorageService.saveRememberedLogin({ phone: normalizedPhone, userType: preferredUserType });
      } else {
        StorageService.clearRememberedLogin();
      }

      setTimeout(() => {
        const session = StorageService.getSession();
        const currentUser = session?.user;
        if (currentUser?.user_type === 'shop_owner') {
          navigate('/shop-owner/dashboard', { replace: true });
        } else {
          navigate('/end-user/home', { replace: true });
        }
      }, 50);
    } else {
      setError(result.error || 'Invalid OTP. Use 123456 while testing.');
    }
  };

  return (
    <div style={styles}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: theme.spacing.md, color: colors.text }}>Login</h2>
        {preferredUserType && (
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
            Returning as{' '}
            <span style={{ fontWeight: 600, color: colors.text }}>
              {preferredUserType === 'shop_owner' ? 'Shop Owner' : 'End User'}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
          <button
            type="button"
            onClick={() => handleModeChange('password')}
            style={{
              flex: 1,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${loginMode === 'password' ? colors.primary : colors.border}`,
              backgroundColor: loginMode === 'password' ? colors.primaryLight : 'transparent',
              color: loginMode === 'password' ? colors.primary : colors.textSecondary,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('otp')}
            style={{
              flex: 1,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${loginMode === 'otp' ? colors.primary : colors.border}`,
              backgroundColor: loginMode === 'otp' ? colors.primaryLight : 'transparent',
              color: loginMode === 'otp' ? colors.primary : colors.textSecondary,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            OTP
          </button>
        </div>
        {error && <div style={{ color: colors.error, marginBottom: theme.spacing.md }}>{error}</div>}
        {info && <div style={{ color: colors.primary, marginBottom: theme.spacing.md }}>{info}</div>}
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={inputStyle}
          required
        />
        {loginMode === 'password' ? (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
        ) : (
          otpSent && (
            <input
              type="tel"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ ...inputStyle, letterSpacing: '6px', textAlign: 'center', fontWeight: 600 }}
              inputMode="numeric"
              maxLength={6}
            />
          )
        )}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            color: colors.textSecondary,
            fontSize: '14px',
            marginBottom: theme.spacing.md,
          }}
        >
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
          Remember me on this device
        </label>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: theme.spacing.md,
            backgroundColor: colors.primary,
            color: colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.body.fontSize,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: theme.spacing.md,
          }}
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : loginMode === 'password'
            ? 'Login'
            : otpSent
            ? 'Verify & Login'
            : 'Send OTP'}
        </button>
        {loginMode === 'password' && (
          <div style={{ textAlign: 'right', marginBottom: theme.spacing.md }}>
            <span style={{ fontSize: '14px', color: colors.textSecondary }}>Forgot password? (Coming soon)</span>
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ color: colors.primary, textDecoration: 'none' }}>
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </div>
  );
}

