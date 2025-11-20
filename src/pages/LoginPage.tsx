import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { VALIDATION } from '../utils/constants';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = StorageService.getRememberedLogin();
    if (remembered?.phone) {
      setPhone(remembered.phone);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedPhone = phone.replace(/\D/g, '');
    if (!VALIDATION.PHONE_NUMBER_REGEX.test(normalizedPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!password) {
      setError('Enter your password to continue.');
      return;
    }

    setLoading(true);
    const result = await login(normalizedPhone, password, { rememberMe });
    setLoading(false);

    if (result.success) {
      // Navigate immediately - session is already saved in AuthContext
      const session = StorageService.getSession();
      const currentUser = session?.user;
      if (currentUser?.user_type === 'shop_owner' || currentUser?.user_type === 'admin' || currentUser?.user_type === 'staff') {
        navigate('/shop-owner/dashboard', { replace: true });
      } else {
        navigate('/end-user/home', { replace: true });
      }
    } else {
      setError(result.error || 'Login failed. Please check your phone number and password.');
    }
  };

  return (
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__heading">
          <span className="auth-card__title">Login</span>
          <p className="auth-card__subtitle">Enter your phone number and password to continue.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

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

        <label className="checkbox-row">
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
          Remember me on this device
        </label>

        <button type="submit" className="button button--primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/register" className="link">
            Don't have an account? Create one
          </Link>
        </div>
      </form>
    </div>
  );
}

