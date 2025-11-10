import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, theme } from '../theme';

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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    password: '',
    userType: 'end_user' as 'shop_owner' | 'end_user',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
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

  return (
    <div style={styles}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: theme.spacing.lg, color: colors.text }}>Register</h2>
        {error && <div style={{ color: colors.error, marginBottom: theme.spacing.md }}>{error}</div>}
        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          style={inputStyle}
          required
        />
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle}
          required
        />
        <input
          type="email"
          placeholder="Email (Optional)"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          style={inputStyle}
          required
        />
        <select
          value={formData.userType}
          onChange={e => setFormData({ ...formData, userType: e.target.value as 'shop_owner' | 'end_user' })}
          style={inputStyle}
        >
          <option value="end_user">End User</option>
          <option value="shop_owner">Shop Owner</option>
        </select>
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: colors.primary, textDecoration: 'none' }}>
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}

