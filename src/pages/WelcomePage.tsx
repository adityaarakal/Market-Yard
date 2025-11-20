import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';
import SeedDataService from '../services/SeedDataService';
import StorageService from '../services/StorageService';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [hasData, setHasData] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'shop_owner' | 'end_user'>('shop_owner');

  useEffect(() => {
    const products = StorageService.getProducts();
    setHasData(products.length > 0);
    
    // If already logged in, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      if (user.user_type === 'shop_owner' || user.user_type === 'admin' || user.user_type === 'staff') {
        navigate('/shop-owner/dashboard', { replace: true });
      } else {
        navigate('/end-user/home', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const userTypeDescriptions = useMemo(
    () => ({
      shop_owner: {
        title: 'Shop Owner',
        description: 'Manage your catalog, update daily prices, and track earnings from the market yard.',
        bullets: ['₹1 incentive per price update', 'Manage catalog and availability', 'Track earnings and payouts'],
      },
      end_user: {
        title: 'End User',
        description: 'Compare prices across shops, discover top deals, and plan your market purchases smartly.',
        bullets: ['See best prices across shops', 'Discover top deals instantly', 'Upgrade for shop-level insights'],
      },
    }),
    []
  );

  const handleRegister = () => {
    navigate('/register', {
      state: { userType: selectedUserType },
    });
  };

  const handleLogin = () => {
    navigate('/login', {
      state: { userType: selectedUserType },
    });
  };

  const handleSeed = () => {
    SeedDataService.seedAll(true);
    setHasData(true);
    setMessage('Sample data seeded. You can log in with phone 9876543210 and password password123.');
  };

  const handleReset = () => {
    SeedDataService.clearAll();
    setHasData(false);
    setMessage('All data cleared. Seed sample data to get started.');
  };

  const handleResetToSeed = () => {
    SeedDataService.resetToSeedData();
    setHasData(true);
    setMessage('Data reset to seed data. You can log in with phone 9876543210 and password password123.');
  };

  const handleExport = () => {
    try {
      SeedDataService.exportDataAsFile();
      setMessage('Data exported successfully!');
    } catch (error) {
      setMessage('Error exporting data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await SeedDataService.importDataFromFile(file, { clearBeforeImport: false, merge: true });
      if (result.success) {
        setHasData(true);
        setMessage(
          `Data imported successfully! Imported: ${result.counts.users} users, ${result.counts.shops} shops, ${result.counts.products} products, ${result.counts.shopProducts} shop products, ${result.counts.priceUpdates} price updates, ${result.counts.subscriptions} subscriptions, ${result.counts.payments} payments.`
        );
      } else {
        setMessage('Error importing data: ' + result.message);
      }
    } catch (error) {
      setMessage('Error importing data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="page-shell page-shell--center">
      <div className="page-shell__content">
        <header className="page-heading">
          <span className="page-heading__title">Market Yard</span>
          <p className="page-heading__subtitle">
            Transparent pricing for every market yard visit. Choose how you use Market Yard and get started in minutes.
          </p>
        </header>

        <section className="welcome-options">
          {(['shop_owner', 'end_user'] as Array<'shop_owner' | 'end_user'>).map(type => {
            const isSelected = selectedUserType === type;
            const content = userTypeDescriptions[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedUserType(type)}
                className={`welcome-option${isSelected ? ' welcome-option--selected' : ''}`}
              >
                <span className="welcome-option__tag">{isSelected ? 'Selected' : 'Tap to select'}</span>
                <h3 className="welcome-option__title">{content.title}</h3>
                <p className="welcome-option__description">{content.description}</p>
                <ul className="feature-list">
                  {content.bullets.map(bullet => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </section>

        <div className="cta-buttons">
          <button type="button" className="button button--primary" onClick={handleLogin}>
            Login
          </button>
          <button type="button" className="button button--outline" onClick={handleRegister}>
            Create New Account
          </button>
        </div>

        <section className="surface-card surface-card--compact dev-tools">
          <div className="dev-tools__title">Quick Access</div>
          <div className="form-info" style={{ marginBottom: '0.75rem' }}>
            <strong>Admin Login:</strong> Phone: <code>9999999999</code> | Password: <code>admin123</code>
          </div>
          <div className="dev-tools__title" style={{ marginTop: '1rem' }}>Need demo data?</div>
          {!hasData && (
            <div style={{ color: colors.warning }}>
              No data found. Use the button below to load sample shops, products, and price updates.
            </div>
          )}
          {message && <div className="form-info">{message}</div>}
          <div className="dev-tools__actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button type="button" className="button button--primary" onClick={handleSeed} style={{ width: 'auto' }}>
              Seed Sample Data
            </button>
            <button
              type="button"
              className="button button--outline"
              onClick={handleResetToSeed}
              style={{ width: 'auto' }}
            >
              Reset to Seed Data
            </button>
            <button
              type="button"
              className="button button--outline"
              onClick={handleReset}
              style={{ width: 'auto', borderColor: colors.error, color: colors.error }}
            >
              Clear All Data
            </button>
            <button type="button" className="button button--outline" onClick={handleExport} style={{ width: 'auto' }}>
              Export Data
            </button>
            <label
              htmlFor="import-file"
              className="button button--outline"
              style={{ width: 'auto', cursor: 'pointer', display: 'inline-block' }}
            >
              Import Data
              <input
                id="import-file"
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImport}
              />
            </label>
            <Link className="button button--ghost" to="/login" style={{ width: 'auto' }}>
              Quick Login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}


