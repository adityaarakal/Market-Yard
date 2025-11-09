import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, theme } from '../theme';
import StorageService from '../services/StorageService';

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

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: theme.spacing.md,
  backgroundColor: colors.primary,
  color: colors.white,
  border: 'none',
  borderRadius: theme.borderRadius.md,
  fontSize: theme.typography.body.fontSize,
  fontWeight: '600',
  cursor: 'pointer',
  marginBottom: theme.spacing.md,
};

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(phone, password);
    setLoading(false);

    if (result.success) {
      // Wait a moment for auth context to update, then navigate
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
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div style={styles}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: theme.spacing.lg, color: colors.text }}>Login</h2>
        {error && <div style={{ color: colors.error, marginBottom: theme.spacing.md }}>{error}</div>}
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ color: colors.primary, textDecoration: 'none' }}>
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </div>
  );
}

