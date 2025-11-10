import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import StorageService from '../services/StorageService';
import { APP_CONFIG, VALIDATION } from '../utils/constants';

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
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__heading">
          <span className="auth-card__title">Welcome back</span>
          <p className="auth-card__subtitle">Choose your login method and continue to Market Yard.</p>
        </div>

        {preferredUserType && (
          <div className="form-info" style={{ color: colors.text }}>
            Returning as{' '}
            <span style={{ fontWeight: 600 }}>
              {preferredUserType === 'shop_owner' ? 'Shop Owner' : 'End User'}
            </span>
          </div>
        )}

        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-control__button${loginMode === 'password' ? ' segmented-control__button--active' : ''}`}
            onClick={() => handleModeChange('password')}
          >
            Password
          </button>
          <button
            type="button"
            className={`segmented-control__button${loginMode === 'otp' ? ' segmented-control__button--active' : ''}`}
            onClick={() => handleModeChange('otp')}
          >
            OTP
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {info && <div className="form-info">{info}</div>}

        <div className="form-field">
          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            className="form-input"
            type="tel"
            placeholder="Enter 10-digit phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
        </div>

        {loginMode === 'password' ? (
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
        ) : (
          otpSent && (
            <div className="form-field">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                className="form-input"
                type="tel"
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                style={{ letterSpacing: '6px', textAlign: 'center', fontWeight: 600 }}
              />
            </div>
          )
        )}

        <label className="checkbox-row">
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
          Remember me on this device
        </label>

        <button type="submit" className="button button--primary" disabled={loading}>
          {loading
            ? 'Please wait...'
            : loginMode === 'password'
            ? 'Login'
            : otpSent
            ? 'Verify & Login'
            : 'Send OTP'}
        </button>

        {loginMode === 'password' && (
          <div className="action-row" style={{ justifyContent: 'flex-end' }}>
            <span className="form-helper">Forgot password? (Coming soon)</span>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link to="/register" className="link">
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </div>
  );
}

