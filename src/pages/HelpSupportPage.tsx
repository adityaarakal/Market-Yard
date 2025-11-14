import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How do I find the best prices?',
    answer:
      'Use the Global Prices page to see all products with their price ranges. Premium users can view detailed shop-specific prices and compare across multiple shops.',
  },
  {
    question: 'How do I upgrade to Premium?',
    answer:
      'Go to Settings → Subscription or visit the Premium Upgrade page. Premium costs ₹100/month and gives you access to shop details, price history, and advanced comparison features.',
  },
  {
    question: 'How do I add products to my shop?',
    answer:
      'Shop owners can add products from the Shop Owner Dashboard → Products section. You can search and add products from the master product list.',
  },
  {
    question: 'How do I update prices?',
    answer:
      'Shop owners can update prices daily from the Daily Price Update page. You earn ₹1 for each price update you submit.',
  },
  {
    question: 'How do I view my earnings?',
    answer:
      'Shop owners can view their earnings from the Earnings Dashboard. It shows total earnings, pending payments, and payment history.',
  },
  {
    question: 'How do I save favorites?',
    answer:
      'Click the favorite button (❤️) on any product or shop to save it. View all your favorites from Settings → Favorites.',
  },
  {
    question: 'How do I manage notifications?',
    answer:
      'Go to Settings → Notification Preferences to customize which notifications you want to receive. You can enable or disable different types of notifications.',
  },
  {
    question: 'What if I forget my password?',
    answer:
      'Password recovery is coming soon. For now, please contact support if you need to reset your password.',
  },
];

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const handleFaqToggle = (index: number) => {
    const faqId = `faq-${index}`;
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a backend
    alert('Thank you for contacting us! We will get back to you soon.');
    setContactForm({ subject: '', message: '' });
  };

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        {/* Header */}
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title">Help & Support</h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Get help and find answers to common questions
              </p>
            </div>
            <div className="action-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button--outline"
                style={{ width: 'auto' }}
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </div>
        </header>

        {/* Quick Links */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Quick Links</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              type="button"
              className="button button--outline"
              onClick={() => navigate('/premium/upgrade')}
              style={{ padding: '1rem', textAlign: 'left' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💎</div>
              <div style={{ fontWeight: 600 }}>Upgrade to Premium</div>
            </button>
            <button
              type="button"
              className="button button--outline"
              onClick={() => navigate('/notifications/preferences')}
              style={{ padding: '1rem', textAlign: 'left' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔔</div>
              <div style={{ fontWeight: 600 }}>Notification Settings</div>
            </button>
            <button
              type="button"
              className="button button--outline"
              onClick={() => navigate('/profile')}
              style={{ padding: '1rem', textAlign: 'left' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤</div>
              <div style={{ fontWeight: 600 }}>My Profile</div>
            </button>
            <button
              type="button"
              className="button button--outline"
              onClick={() => navigate('/settings/about')}
              style={{ padding: '1rem', textAlign: 'left' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>ℹ️</div>
              <div style={{ fontWeight: 600 }}>About App</div>
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqItems.map((faq, index) => {
              const faqId = `faq-${index}`;
              const isExpanded = expandedFaq === faqId;
              return (
                <div
                  key={index}
                  className="surface-card surface-card--compact"
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleFaqToggle(index)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, fontWeight: 600, color: colors.text }}>{faq.question}</div>
                    <div style={{ fontSize: '1.25rem', color: colors.textSecondary, flexShrink: 0 }}>
                      {isExpanded ? '−' : '+'}
                    </div>
                  </button>
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 1rem 1rem 1rem',
                        color: colors.textSecondary,
                        lineHeight: 1.6,
                        borderTop: `1px solid ${colors.border}`,
                        marginTop: '0.5rem',
                        paddingTop: '1rem',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Support */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Contact Support</h2>
          <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Subject
              </label>
              <input
                id="subject"
                type="text"
                className="form-input"
                value={contactForm.subject}
                onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="What can we help you with?"
                required
              />
            </div>
            <div>
              <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Message
              </label>
              <textarea
                id="message"
                className="form-input"
                value={contactForm.message}
                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Describe your issue or question..."
                rows={5}
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="button button--primary">
              Send Message
            </button>
          </form>
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: colors.surface, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📧 Email Support</div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              support@marketyard.com
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

