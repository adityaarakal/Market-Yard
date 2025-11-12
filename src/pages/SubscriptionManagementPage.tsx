import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getSubscriptionStatus,
  getSubscriptionHistory,
  cancelSubscription,
  renewSubscription,
} from '../services/SubscriptionService';
import { getPaymentHistoryByType, downloadInvoice, createPayment } from '../services/PaymentService';
import { updateUser as updateUserRecord } from '../services/UserService';
import { Subscription, Payment } from '../types';
import { colors } from '../theme';
import { formatCurrency } from '../utils/format';
import { APP_CONFIG } from '../utils/constants';

const PREMIUM_PRICE = APP_CONFIG.PREMIUM_SUBSCRIPTION_PRICE;
const SUBSCRIPTION_DURATION_DAYS = 30;

export default function SubscriptionManagementPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRenewConfirm, setShowRenewConfirm] = useState(false);

  // Load subscription and payment data
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    try {
      const currentSubscription = getSubscriptionStatus(user.id);
      setSubscription(currentSubscription);

      const history = getSubscriptionHistory(user.id);
      setSubscriptionHistory(history);

      const payments = getPaymentHistoryByType(user.id, 'subscription');
      setPaymentHistory(payments);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setMessage({ type: 'error', text: 'Failed to load subscription data. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if subscription is expired
  const isExpired = subscription
    ? new Date(subscription.expires_at) < new Date()
    : user?.subscription_expires_at
    ? new Date(user.subscription_expires_at) < new Date()
    : false;

  // Check if subscription is active
  const isActive = subscription?.status === 'active' && !isExpired;

  // Get days until expiry
  const getDaysUntilExpiry = (): number | null => {
    if (!subscription && !user?.subscription_expires_at) return null;
    const expiryDate = subscription ? new Date(subscription.expires_at) : new Date(user!.subscription_expires_at!);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Handle subscription renewal
  const handleRenew = async () => {
    if (!user || !subscription) return;

    setProcessing(true);
    setMessage(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create payment record
      const payment = createPayment({
        userId: user.id,
        type: 'subscription',
        amount: PREMIUM_PRICE,
        status: 'success',
        method: 'Mock Payment',
        description: `Premium subscription renewal for ${SUBSCRIPTION_DURATION_DAYS} days`,
        currency: 'INR',
      });

      // Renew subscription
      const renewedSubscription = renewSubscription(subscription.id, SUBSCRIPTION_DURATION_DAYS);

      // Update user's premium status
      const expiresAt = new Date(renewedSubscription.expires_at);
      const updatedUser = await updateUserRecord(user.id, {
        isPremium: true,
        subscriptionExpiresAt: expiresAt.toISOString(),
      });

      // Update AuthContext
      updateUser(updatedUser);

      // Update local state
      setSubscription(renewedSubscription);
      setPaymentHistory([payment, ...paymentHistory]);
      setSubscriptionHistory([renewedSubscription, ...subscriptionHistory]);

      setMessage({
        type: 'success',
        text: `🎉 Subscription renewed successfully! Your subscription expires on ${expiresAt.toLocaleDateString()}.`,
      });

      setShowRenewConfirm(false);
    } catch (error) {
      console.error('Renewal error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to renew subscription. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle subscription cancellation
  const handleCancel = async () => {
    if (!user || !subscription) return;

    setProcessing(true);
    setMessage(null);

    try {
      // Cancel subscription
      const cancelledSubscription = cancelSubscription(subscription.id);

      // Update local state
      setSubscription(cancelledSubscription);
      setSubscriptionHistory(
        subscriptionHistory.map(s => (s.id === subscription.id ? cancelledSubscription : s))
      );

      setMessage({
        type: 'info',
        text: `Subscription cancelled. You will continue to have access until ${new Date(cancelledSubscription.expires_at).toLocaleDateString()}.`,
      });

      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Cancellation error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to cancel subscription. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = (payment: Payment) => {
    try {
      downloadInvoice(payment);
      setMessage({
        type: 'success',
        text: 'Invoice downloaded successfully!',
      });
    } catch (error) {
      console.error('Invoice download error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to download invoice. Please try again.',
      });
    }
  };

  if (!user) {
    return null;
  }

  // Only end users can manage subscriptions
  if (user.user_type !== 'end_user' && user.user_type !== 'admin' && user.user_type !== 'staff') {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">
              <h2>Subscription management is only available for end users.</h2>
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading subscription data...</div>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Subscription Management
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Manage your premium subscription, view payment history, and download invoices.
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/profile')}
              >
                Back to Profile
              </button>
            </div>
          </div>
        </header>

        {/* Message */}
        {message && (
          <div
            className={message.type === 'success' ? 'form-info' : message.type === 'error' ? 'form-error' : 'form-info'}
            style={{ marginBottom: '1rem' }}
          >
            {message.text}
          </div>
        )}

        {/* Subscription Status */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Subscription Status</h2>
          {subscription || user.is_premium ? (
            <div
              className="surface-card surface-card--compact"
              style={{
                padding: '1.5rem',
                backgroundColor: colors.surface,
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${isActive ? colors.success : isExpired ? colors.error : colors.warning}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {isActive ? 'Active Premium Subscription' : isExpired ? 'Expired Subscription' : 'Cancelled Subscription'}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: isActive ? `${colors.success}20` : isExpired ? `${colors.error}20` : `${colors.warning}20`,
                      color: isActive ? colors.success : isExpired ? colors.error : colors.warning,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {subscription?.status.toUpperCase() || (isExpired ? 'EXPIRED' : 'ACTIVE')}
                  </div>
                </div>
                {subscription && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Monthly Plan</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary }}>
                      {formatCurrency(subscription.amount)}
                      <span style={{ fontSize: '1rem', fontWeight: 400, color: colors.textSecondary }}>/month</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Started On</div>
                  <div style={{ fontWeight: 600 }}>
                    {subscription
                      ? new Date(subscription.started_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Expires On</div>
                  <div style={{ fontWeight: 600 }}>
                    {subscription
                      ? new Date(subscription.expires_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : user.subscription_expires_at
                      ? new Date(user.subscription_expires_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </div>
                </div>
                {daysUntilExpiry !== null && (
                  <div>
                    <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Days Remaining</div>
                    <div style={{ fontWeight: 600, color: daysUntilExpiry > 7 ? colors.success : colors.warning }}>
                      {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.9rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Auto Renew</div>
                  <div style={{ fontWeight: 600 }}>{subscription?.auto_renew ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {isActive && (
                  <>
                    <button
                      type="button"
                      className="button button--primary"
                      style={{ width: 'auto' }}
                      onClick={() => setShowRenewConfirm(true)}
                      disabled={processing}
                    >
                      Renew Subscription
                    </button>
                    <button
                      type="button"
                      className="button button--outline"
                      style={{ width: 'auto', borderColor: colors.error, color: colors.error }}
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={processing}
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}
                {isExpired && (
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ width: 'auto' }}
                    onClick={() => navigate('/premium/upgrade')}
                  >
                    Renew Subscription
                  </button>
                )}
                {!subscription && !user.is_premium && (
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ width: 'auto' }}
                    onClick={() => navigate('/premium/upgrade')}
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="surface-card surface-card--compact" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No Active Subscription</h3>
              <p style={{ color: colors.textSecondary, marginBottom: '1.5rem' }}>
                You don't have an active premium subscription. Upgrade to unlock all premium features.
              </p>
              <button
                type="button"
                className="button button--primary"
                onClick={() => navigate('/premium/upgrade')}
              >
                Upgrade to Premium
              </button>
            </div>
          )}
        </section>

        {/* Payment History */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Payment History</h2>
          {paymentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>No payment history found.</div>
          ) : (
            <div className="table-container">
              <table className="data-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Description</th>
                    <th style={{ textAlign: 'center' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Method</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map(payment => (
                    <tr key={payment.id}>
                      <td>
                        {new Date(payment.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{payment.description || 'Premium Subscription'}</div>
                        <div className="form-helper" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {payment.type.replace('_', ' ')}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{formatCurrency(payment.amount)}</div>
                        <div className="form-helper" style={{ fontSize: '0.85rem' }}>{payment.currency}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor:
                              payment.status === 'success'
                                ? `${colors.success}20`
                                : payment.status === 'failed'
                                ? `${colors.error}20`
                                : payment.status === 'pending'
                                ? `${colors.warning}20`
                                : `${colors.textSecondary}20`,
                            color:
                              payment.status === 'success'
                                ? colors.success
                                : payment.status === 'failed'
                                ? colors.error
                                : payment.status === 'pending'
                                ? colors.warning
                                : colors.textSecondary,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          {payment.status.toUpperCase()}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{payment.method || 'N/A'}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {payment.status === 'success' && (
                          <button
                            type="button"
                            className="button button--outline"
                            style={{ width: 'auto', padding: '0.5rem 1rem' }}
                            onClick={() => handleDownloadInvoice(payment)}
                          >
                            Download Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Subscription History */}
        {subscriptionHistory.length > 0 && (
          <section className="surface-card">
            <h2 style={{ marginBottom: '1rem' }}>Subscription History</h2>
            <div className="table-container">
              <table className="data-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Status</th>
                    <th style={{ textAlign: 'left' }}>Started</th>
                    <th style={{ textAlign: 'left' }}>Expires</th>
                    <th style={{ textAlign: 'center' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Auto Renew</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionHistory.map(sub => (
                    <tr key={sub.id}>
                      <td>
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor:
                              sub.status === 'active'
                                ? `${colors.success}20`
                                : sub.status === 'expired'
                                ? `${colors.error}20`
                                : sub.status === 'cancelled'
                                ? `${colors.warning}20`
                                : `${colors.textSecondary}20`,
                            color:
                              sub.status === 'active'
                                ? colors.success
                                : sub.status === 'expired'
                                ? colors.error
                                : sub.status === 'cancelled'
                                ? colors.warning
                                : colors.textSecondary,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          {sub.status.toUpperCase()}
                        </div>
                      </td>
                      <td>
                        {new Date(sub.started_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        {new Date(sub.expires_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{formatCurrency(sub.amount)}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{sub.auto_renew ? 'Yes' : 'No'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <div
              className="surface-card"
              style={{ maxWidth: '500px', width: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '1rem' }}>Cancel Subscription</h2>
              <p style={{ marginBottom: '1.5rem', color: colors.textSecondary }}>
                Are you sure you want to cancel your subscription? You will continue to have access until{' '}
                {subscription ? new Date(subscription.expires_at).toLocaleDateString('en-IN') : 'the expiry date'}. After that,
                you will lose access to premium features.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="button button--outline"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={processing}
                >
                  Keep Subscription
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ backgroundColor: colors.error, borderColor: colors.error }}
                  onClick={handleCancel}
                  disabled={processing}
                >
                  {processing ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Renew Confirmation Modal */}
        {showRenewConfirm && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
            onClick={() => setShowRenewConfirm(false)}
          >
            <div
              className="surface-card"
              style={{ maxWidth: '500px', width: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '1rem' }}>Renew Subscription</h2>
              <p style={{ marginBottom: '1rem', color: colors.textSecondary }}>
                Renew your premium subscription for {SUBSCRIPTION_DURATION_DAYS} days.
              </p>
              <div
                className="surface-card surface-card--compact"
                style={{
                  padding: '1rem',
                  backgroundColor: colors.surface,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ color: colors.textSecondary }}>Amount</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: colors.primary }}>
                    {formatCurrency(PREMIUM_PRICE)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ color: colors.textSecondary }}>Duration</div>
                  <div style={{ fontWeight: 600 }}>{SUBSCRIPTION_DURATION_DAYS} days</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="button button--outline"
                  onClick={() => setShowRenewConfirm(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleRenew}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Confirm Renewal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

