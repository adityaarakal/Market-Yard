import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createSubscription } from '../services/SubscriptionService';
import { createPayment } from '../services/PaymentService';
import { updateUser as updateUserRecord } from '../services/UserService';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';

const PREMIUM_PRICE = 100; // ₹100/month
const SUBSCRIPTION_DURATION_DAYS = 30; // 30 days

interface Feature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
}

const features: Feature[] = [
  {
    name: 'View Global Prices',
    free: true,
    premium: true,
  },
  {
    name: 'View Price Ranges',
    free: true,
    premium: true,
  },
  {
    name: 'View Best Value Shop (Name Only)',
    free: true,
    premium: true,
  },
  {
    name: 'View Shop Details',
    free: false,
    premium: true,
  },
  {
    name: 'View Shop Contact Information',
    free: false,
    premium: true,
  },
  {
    name: 'View Shop Address',
    free: false,
    premium: true,
  },
  {
    name: 'View Price History',
    free: false,
    premium: true,
  },
  {
    name: 'Compare Prices Across Shops',
    free: false,
    premium: true,
  },
  {
    name: 'Shop-specific Product Details',
    free: false,
    premium: true,
  },
  {
    name: 'Advanced Search & Filters',
    free: true,
    premium: true,
  },
];

export default function PremiumUpgradePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!user) {
    return null;
  }

  // Redirect if already premium
  if (user.is_premium) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-info">
              <h2>You're already a Premium user!</h2>
              <p>Thank you for being a Premium subscriber.</p>
              <button
                type="button"
                className="button button--primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate(user.user_type === 'shop_owner' ? '/shop-owner/dashboard' : '/end-user/home')}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only end users can upgrade to premium
  if (user.user_type !== 'end_user' && user.user_type !== 'admin' && user.user_type !== 'staff') {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">
              <h2>Premium upgrade is only available for end users.</h2>
              <p>Shop owners have access to all features by default.</p>
              <button
                type="button"
                className="button button--primary"
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/shop-owner/dashboard')}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpgrade = async () => {
    if (!acceptTerms) {
      setMessage({ type: 'error', text: 'Please accept the terms and conditions to continue.' });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate expiration date (30 days from now)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000);

      // Create payment record
      const payment = createPayment({
        userId: user.id,
        type: 'subscription',
        amount: PREMIUM_PRICE,
        status: 'success',
        method: 'Mock Payment',
        description: `Premium subscription for ${SUBSCRIPTION_DURATION_DAYS} days`,
        currency: 'INR',
      });

      // Create subscription
      const subscription = createSubscription({
        userId: user.id,
        amount: PREMIUM_PRICE,
        durationInDays: SUBSCRIPTION_DURATION_DAYS,
        autoRenew: false, // Default to false, can be changed later
      });

      // Update user's premium status
      const updatedUser = await updateUserRecord(user.id, {
        isPremium: true,
        subscriptionExpiresAt: expiresAt.toISOString(),
      });

      // Update AuthContext
      updateUser(updatedUser);

      setMessage({
        type: 'success',
        text: `🎉 Success! You're now a Premium user. Your subscription expires on ${expiresAt.toLocaleDateString()}.`,
      });

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/end-user/home');
      }, 2000);
    } catch (error) {
      console.error('Upgrade error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upgrade to Premium. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Upgrade to Premium
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Unlock advanced features and get the most out of Market Yard.
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/end-user/home')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </header>

        {/* Pricing Information */}
        <section className="surface-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                fontSize: '3rem',
                fontWeight: 700,
                color: colors.primary,
                marginBottom: '0.5rem',
              }}
            >
              {formatCurrency(PREMIUM_PRICE)}
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: colors.textSecondary,
                  marginLeft: '0.5rem',
                }}
              >
                /month
              </span>
            </div>
            <p style={{ color: colors.textSecondary, fontSize: '1rem' }}>Cancel anytime. No hidden fees.</p>
          </div>

          {/* Feature Comparison */}
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Feature Comparison</h2>
          <div className="table-container" style={{ marginBottom: '2rem' }}>
            <table className="data-table" style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Feature</th>
                  <th style={{ textAlign: 'center' }}>Free</th>
                  <th style={{ textAlign: 'center' }}>Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 500 }}>{feature.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <span style={{ color: colors.success, fontSize: '1.2rem' }}>✓</span>
                        ) : (
                          <span style={{ color: colors.textSecondary, fontSize: '1.2rem' }}>✗</span>
                        )
                      ) : (
                        <span style={{ color: colors.textSecondary }}>{feature.free}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {typeof feature.premium === 'boolean' ? (
                        feature.premium ? (
                          <span style={{ color: colors.success, fontSize: '1.2rem', fontWeight: 700 }}>✓</span>
                        ) : (
                          <span style={{ color: colors.textSecondary, fontSize: '1.2rem' }}>✗</span>
                        )
                      ) : (
                        <span style={{ color: colors.primary, fontWeight: 600 }}>{feature.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Payment Section */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Payment Information</h2>
          <div
            className="surface-card surface-card--compact"
            style={{
              padding: '1.5rem',
              backgroundColor: colors.surface,
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Plan</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Premium Monthly Plan</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Amount</div>
              <div style={{ fontWeight: 700, fontSize: '1.5rem', color: colors.primary }}>
                {formatCurrency(PREMIUM_PRICE)} /month
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Duration</div>
              <div style={{ fontWeight: 600 }}>30 days</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Payment Method</div>
              <div style={{ fontWeight: 600, color: colors.warning }}>Mock Payment (Testing Mode)</div>
              <div className="form-helper" style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                In production, this will integrate with Razorpay payment gateway.
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${acceptTerms ? colors.primary : colors.border}`,
                backgroundColor: acceptTerms ? `${colors.primary}10` : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                style={{
                  marginTop: '0.25rem',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Terms and Conditions</div>
                <div className="form-helper" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                  By upgrading to Premium, you agree to:
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                    <li>Pay {formatCurrency(PREMIUM_PRICE)} per month for Premium subscription</li>
                    <li>Subscription will auto-renew unless cancelled</li>
                    <li>You can cancel your subscription at any time</li>
                    <li>Refunds are available within 7 days of purchase</li>
                    <li>Premium features are subject to availability</li>
                    <li>Market Yard reserves the right to modify pricing and features</li>
                  </ul>
                </div>
              </div>
            </label>
          </div>

          {/* Message */}
          {message && (
            <div
              className={message.type === 'success' ? 'form-info' : message.type === 'error' ? 'form-error' : 'form-info'}
              style={{ marginBottom: '1rem' }}
            >
              {message.text}
            </div>
          )}

          {/* Upgrade Button */}
          <button
            type="button"
            className="button button--primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 600 }}
            onClick={handleUpgrade}
            disabled={processing || !acceptTerms}
          >
            {processing ? 'Processing Payment...' : `Upgrade to Premium - ${formatCurrency(PREMIUM_PRICE)}/month`}
          </button>

          <div className="form-helper" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
            🔒 Secure payment processing. Your payment information is safe and encrypted.
          </div>
        </section>

        {/* Benefits Section */}
        <section className="surface-card surface-card--compact">
          <h3 style={{ marginBottom: '1rem' }}>Why Upgrade to Premium?</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              className="surface-card surface-card--compact"
              style={{
                padding: '1.25rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Shop Details</div>
              <div className="form-helper" style={{ fontSize: '0.9rem' }}>
                View complete shop information including address, contact details, and location.
              </div>
            </div>
            <div
              className="surface-card surface-card--compact"
              style={{
                padding: '1.25rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Price History</div>
              <div className="form-helper" style={{ fontSize: '0.9rem' }}>
                Track price trends over time and make informed purchasing decisions.
              </div>
            </div>
            <div
              className="surface-card surface-card--compact"
              style={{
                padding: '1.25rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Compare Prices</div>
              <div className="form-helper" style={{ fontSize: '0.9rem' }}>
                Compare prices across multiple shops and find the best deals.
              </div>
            </div>
            <div
              className="surface-card surface-card--compact"
              style={{
                padding: '1.25rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💎</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Exclusive Features</div>
              <div className="form-helper" style={{ fontSize: '0.9rem' }}>
                Get access to premium-only features and early access to new updates.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

