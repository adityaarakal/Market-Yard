import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

export default function AboutPage() {
  const navigate = useNavigate();

  const appVersion = '1.0.0';
  const buildDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page-shell">
      <div className="page-shell__content" style={{ gap: '1.5rem' }}>
        {/* Header */}
        <header className="surface-card surface-card--compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="action-row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="page-heading__title">About Market Yard</h1>
              <p className="form-helper" style={{ textAlign: 'left' }}>
                Your trusted marketplace for agricultural products
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

        {/* App Info */}
        <section className="surface-card">
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: colors.text }}>
              Market Yard
            </h2>
            <p style={{ marginBottom: '2rem', color: colors.textSecondary }}>
              Connecting farmers, shop owners, and consumers for better pricing transparency
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxWidth: '500px',
                margin: '0 auto',
                textAlign: 'left',
              }}
            >
              <div className="surface-card surface-card--compact" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Version</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{appVersion}</div>
              </div>

              <div className="surface-card surface-card--compact" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary, marginBottom: '0.25rem' }}>Build Date</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{buildDate}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Features</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>💰</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Price Transparency</div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  Compare prices across multiple shops and find the best deals
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>📊</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Price History</div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  Track price trends over time to make informed decisions
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>🏪</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Shop Directory</div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  Discover local shops and their product offerings
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>⭐</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Favorites</div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  Save your favorite products and shops for quick access
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credits */}
        <section className="surface-card">
          <h2 style={{ marginBottom: '1rem' }}>Credits</h2>
          <div style={{ fontSize: '0.875rem', color: colors.textSecondary, lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              Market Yard is built with modern web technologies to provide a seamless experience for all users.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              © {new Date().getFullYear()} Market Yard. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

