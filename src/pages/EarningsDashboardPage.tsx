import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { getPriceUpdatesByShop, PriceUpdate } from '../services/PriceUpdateService';
import { formatCurrency } from '../utils/format';
import { colors } from '../theme/index';

interface EarningsBreakdown {
  allTime: number;
  thisMonth: number;
  today: number;
  pending: number;
  paid: number;
  processing: number;
  failed: number;
}

interface PaymentListItem extends PriceUpdate {
  productName: string;
  productUnit: string;
}

export default function EarningsDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [priceUpdates, setPriceUpdates] = useState<PriceUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'processing' | 'failed'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'thisMonth' | 'thisYear'>('all');

  const shop = useMemo(() => (user ? StorageService.getShopByOwnerId(user.id) : null), [user]);

  useEffect(() => {
    if (user && shop) {
      loadPriceUpdates();
    }
  }, [user, shop?.id]);

  const loadPriceUpdates = () => {
    if (!shop) return;
    setLoading(true);
    try {
      const updates = getPriceUpdatesByShop(shop.id);
      setPriceUpdates(updates);
    } catch (error) {
      console.error('Error loading price updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnings: EarningsBreakdown = useMemo(() => {
    if (!priceUpdates.length) {
      return { allTime: 0, thisMonth: 0, today: 0, pending: 0, paid: 0, processing: 0, failed: 0 };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const breakdown: EarningsBreakdown = {
      allTime: 0,
      thisMonth: 0,
      today: 0,
      pending: 0,
      paid: 0,
      processing: 0,
      failed: 0,
    };

    priceUpdates.forEach(update => {
      const updateDate = new Date(update.created_at);
      const amount = update.payment_amount || 0;

      // Calculate by time period
      breakdown.allTime += amount;

      if (updateDate >= monthStart) {
        breakdown.thisMonth += amount;
      }

      if (updateDate >= todayStart) {
        breakdown.today += amount;
      }

      // Calculate by status
      switch (update.payment_status) {
        case 'pending':
          breakdown.pending += amount;
          break;
        case 'paid':
          breakdown.paid += amount;
          break;
        case 'processing':
          breakdown.processing += amount;
          break;
        case 'failed':
          breakdown.failed += amount;
          break;
      }
    });

    return breakdown;
  }, [priceUpdates]);

  const paymentList: PaymentListItem[] = useMemo(() => {
    if (!shop) return [];

    // Get all shop products for this shop
    const shopProducts = StorageService.getShopProductsByShopId(shop.id);
    const allProducts = StorageService.getProducts();

    let filtered = priceUpdates.map(update => {
      // Find the shop product by its ID
      const shopProduct = shopProducts.find(sp => sp.id === update.shop_product_id);
      // Find the product by product_id
      const product = shopProduct ? allProducts.find(p => p.id === shopProduct.product_id) : null;

      return {
        ...update,
        productName: product?.name || 'Unknown Product',
        productUnit: product?.unit || '',
      };
    });

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.payment_status === filterStatus);
    }

    // Filter by period
    if (filterPeriod !== 'all') {
      const now = new Date();
      let periodStart: Date;

      switch (filterPeriod) {
        case 'today':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'thisMonth':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'thisYear':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(0);
      }

      filtered = filtered.filter(item => new Date(item.created_at) >= periodStart);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [priceUpdates, filterStatus, filterPeriod, shop?.id]);

  const getStatusColor = (status: PriceUpdate['payment_status']): string => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.info;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: PriceUpdate['payment_status']): string => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const handleExport = () => {
    if (paymentList.length === 0) {
      alert('No data to export');
      return;
    }

    const csvHeaders = ['Date', 'Product', 'Unit', 'Price', 'Payment Amount', 'Payment Status', 'Update ID'];
    const csvRows = paymentList.map(item => [
      new Date(item.created_at).toLocaleString(),
      item.productName,
      item.productUnit,
      item.price.toString(),
      (item.payment_amount || 0).toString(),
      item.payment_status,
      item.id,
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!shop) {
    return (
      <div className="page-shell">
        <div className="page-shell__content">
          <div className="surface-card">
            <div className="form-error">No shop found for this account.</div>
            <button
              type="button"
              className="button button--primary"
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/shop-owner/register')}
            >
              Register your shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title" style={{ fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.3rem)', textAlign: 'left' }}>
                Earnings Dashboard
              </h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Track your earnings from price updates and payment status.
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate('/shop-owner/dashboard')}
              >
                Back to Dashboard
              </button>
              {paymentList.length > 0 && (
                <button
                  type="button"
                  className="button button--primary"
                  style={{ width: 'auto' }}
                  onClick={handleExport}
                >
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Earnings Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: '0.95rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Total Earnings</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatCurrency(earnings.allTime)}</div>
              <div className="form-helper" style={{ marginTop: '0.35rem' }}>All time</div>
            </div>
            <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: '0.95rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>This Month</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatCurrency(earnings.thisMonth)}</div>
              <div className="form-helper" style={{ marginTop: '0.35rem' }}>
                {earnings.allTime > 0 && earnings.thisMonth > 0
                  ? `${Math.round((earnings.thisMonth / earnings.allTime) * 100)}% of total`
                  : 'No updates'}
              </div>
            </div>
            <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: '0.95rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Today</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatCurrency(earnings.today)}</div>
              <div className="form-helper" style={{ marginTop: '0.35rem' }}>
                {earnings.allTime > 0 && earnings.today > 0
                  ? `${Math.round((earnings.today / earnings.allTime) * 100)}% of total`
                  : 'No updates'}
              </div>
            </div>
            <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: '0.95rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Paid</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: colors.success }}>{formatCurrency(earnings.paid)}</div>
              <div className="form-helper" style={{ marginTop: '0.35rem' }}>
                {earnings.allTime > 0 && earnings.paid > 0
                  ? `${Math.round((earnings.paid / earnings.allTime) * 100)}% of total`
                  : 'No payments'}
              </div>
            </div>
            <div className="surface-card surface-card--compact" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: '0.95rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Pending</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: colors.warning }}>{formatCurrency(earnings.pending)}</div>
              <div className="form-helper" style={{ marginTop: '0.35rem' }}>
                {earnings.allTime > 0 && earnings.pending > 0
                  ? `${Math.round((earnings.pending / earnings.allTime) * 100)}% of total`
                  : 'No pending'}
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card">
          <div className="action-row" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>Payment History</h2>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
              <select
                className="form-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                style={{ width: 'auto', minWidth: '120px' }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
              <select
                className="form-select"
                value={filterPeriod}
                onChange={e => setFilterPeriod(e.target.value as typeof filterPeriod)}
                style={{ width: 'auto', minWidth: '120px' }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading payment history...</div>
          ) : paymentList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No payments found matching your filters.</p>
              <button
                type="button"
                className="button button--ghost"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setFilterStatus('all');
                  setFilterPeriod('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Payment Amount</th>
                    <th>Status</th>
                    <th>Update ID</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentList.map(item => (
                    <tr key={item.id}>
                      <td>{new Date(item.created_at).toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.productName}</div>
                        <div className="form-helper" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          {item.productUnit}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(item.payment_amount || 0)}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: getStatusColor(item.payment_status),
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {getStatusLabel(item.payment_status)}
                        </span>
                      </td>
                      <td>
                        <div className="form-helper" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          {item.id.substring(0, 8)}...
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {paymentList.length > 0 && (
          <section className="surface-card surface-card--compact">
            <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Summary</div>
                <div className="form-helper">
                  Showing {paymentList.length} {paymentList.length === 1 ? 'payment' : 'payments'}
                  {filterStatus !== 'all' && ` with status "${getStatusLabel(filterStatus as PriceUpdate['payment_status'])}"`}
                  {filterPeriod !== 'all' && ` from ${filterPeriod.replace('this', 'this ')}`}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ fontWeight: 600, textAlign: 'right' }}>
                  Total: {formatCurrency(paymentList.reduce((sum, item) => sum + (item.payment_amount || 0), 0))}
                </div>
                <div className="form-helper" style={{ textAlign: 'right' }}>
                  Filtered amount
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

