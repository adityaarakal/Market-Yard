import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/StorageService';
import { generateId } from '../utils/id';
import { Shop } from '../types';
import { colors } from '../theme';

const categories: Shop['category'][] = ['fruits', 'vegetables', 'farming_materials', 'farming_products', 'mixed'];

type Step = 'details' | 'address' | 'contact' | 'description' | 'review';

interface FormState {
  shopName: string;
  category: Shop['category'];
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  email: string;
  description: string;
  imageUrl: string;
}

const initialForm: FormState = {
  shopName: '',
  category: 'fruits',
  address: '',
  city: '',
  state: '',
  phoneNumber: '',
  email: '',
  description: '',
  imageUrl: '',
};

export default function ShopRegistrationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [saving, setSaving] = useState(false);

  const stepOrder: Step[] = ['details', 'address', 'contact', 'description', 'review'];
  const currentIndex = stepOrder.indexOf(step);

  const canGoBack = currentIndex > 0;
  const canGoNext = useMemo(() => {
    switch (step) {
      case 'details':
        return form.shopName.trim().length >= 3 && !!form.category;
      case 'address':
        return form.address.trim().length >= 5 && form.city.trim().length >= 2 && form.state.trim().length >= 2;
      case 'contact':
        return true;
      case 'description':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [form, step]);

  const handleInputChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!canGoNext) {
      setError('Please complete the required fields before continuing.');
      return;
    }
    setError('');
    setInfo('');
    const nextStep = stepOrder[currentIndex + 1];
    if (nextStep) {
      setStep(nextStep);
    }
  };

  const handleBack = () => {
    setError('');
    setInfo('');
    if (!canGoBack) return;
    const previous = stepOrder[currentIndex - 1];
    if (previous) {
      setStep(previous);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      setError('You must be logged in to register a shop.');
      return;
    }

    setSaving(true);
    setError('');
    setInfo('');

    const now = new Date().toISOString();
    const shop: Shop = {
      id: generateId('shop'),
      owner_id: user.id,
      shop_name: form.shopName.trim(),
      address: form.address.trim(),
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      phone_number: form.phoneNumber.trim() || undefined,
      category: form.category,
      description: form.description.trim() || undefined,
      image_url: form.imageUrl.trim() || undefined,
      goodwill_score: 0,
      average_rating: 0,
      total_ratings: 0,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    try {
      StorageService.saveShop(shop);
      setInfo('Shop registered successfully. Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/shop-owner/dashboard', { replace: true });
      }, 800);
    } catch (e) {
      console.error(e);
      setError('Something went wrong while saving your shop. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <>
            <div className="form-field">
              <label htmlFor="shop-name">Shop name *</label>
              <input
                id="shop-name"
                className="form-input"
                type="text"
                placeholder="Fresh Fruits Paradise"
                value={form.shopName}
                onChange={event => handleInputChange('shopName', event.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="shop-category">Category *</label>
              <select
                id="shop-category"
                className="form-select"
                value={form.category}
                onChange={event => handleInputChange('category', event.target.value as Shop['category'])}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      case 'address':
        return (
          <>
            <div className="form-field">
              <label htmlFor="shop-address">Address *</label>
              <textarea
                id="shop-address"
                className="form-textarea"
                placeholder="Shop No. 20, Market Yard Road"
                value={form.address}
                onChange={event => handleInputChange('address', event.target.value)}
                required
              />
            </div>
            <div className="action-row" style={{ gap: '1rem' }}>
              <div className="form-field" style={{ flex: 1 }}>
                <label htmlFor="shop-city">City *</label>
                <input
                  id="shop-city"
                  className="form-input"
                  type="text"
                  placeholder="Pune"
                  value={form.city}
                  onChange={event => handleInputChange('city', event.target.value)}
                />
              </div>
              <div className="form-field" style={{ flex: 1 }}>
                <label htmlFor="shop-state">State *</label>
                <input
                  id="shop-state"
                  className="form-input"
                  type="text"
                  placeholder="Maharashtra"
                  value={form.state}
                  onChange={event => handleInputChange('state', event.target.value)}
                />
              </div>
            </div>
            <div className="form-helper">
              Map picker integration will be added later. For now, enter the address manually.
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            <div className="form-field">
              <label htmlFor="shop-phone">Contact phone</label>
              <input
                id="shop-phone"
                className="form-input"
                type="tel"
                placeholder="9876543210"
                value={form.phoneNumber}
                onChange={event => handleInputChange('phoneNumber', event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="shop-email">Email</label>
              <input
                id="shop-email"
                className="form-input"
                type="email"
                placeholder="hello@yourshop.com"
                value={form.email}
                onChange={event => handleInputChange('email', event.target.value)}
              />
            </div>
          </>
        );
      case 'description':
        return (
          <>
            <div className="form-field">
              <label htmlFor="shop-description">Description</label>
              <textarea
                id="shop-description"
                className="form-textarea"
                placeholder="Tell customers what makes your shop special."
                value={form.description}
                onChange={event => handleInputChange('description', event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="shop-image">Image URL</label>
              <input
                id="shop-image"
                className="form-input"
                type="url"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={event => handleInputChange('imageUrl', event.target.value)}
              />
              <span className="form-helper">Upload support will be added later. Use a direct image URL for now.</span>
            </div>
          </>
        );
      case 'review':
        return (
          <div className="surface-card surface-card--compact" style={{ background: '#f9fbff' }}>
            <h3 style={{ marginBottom: '1rem' }}>Review your details</h3>
            <dl style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <dt style={{ fontWeight: 600 }}>Shop name</dt>
                <dd>{form.shopName}</dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600 }}>Category</dt>
                <dd>{form.category.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600 }}>Address</dt>
                <dd>
                  {form.address}
                  <br />
                  {form.city}, {form.state}
                </dd>
              </div>
              {(form.phoneNumber || form.email) && (
                <div>
                  <dt style={{ fontWeight: 600 }}>Contact</dt>
                  <dd>
                    {form.phoneNumber && <div>Phone: {form.phoneNumber}</div>}
                    {form.email && <div>Email: {form.email}</div>}
                  </dd>
                </div>
              )}
              {(form.description || form.imageUrl) && (
                <div>
                  <dt style={{ fontWeight: 600 }}>About</dt>
                  <dd>
                    {form.description || 'N/A'}
                    {form.imageUrl && (
                      <div className="form-helper" style={{ marginTop: '0.5rem' }}>
                        Image: {form.imageUrl}
                      </div>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-shell page-shell--center">
      <div className="page-shell__content" style={{ gap: '1.5rem', maxWidth: '640px' }}>
        <header className="auth-card__heading" style={{ textAlign: 'center' }}>
          <span className="auth-card__title">Register your shop</span>
          <p className="auth-card__subtitle">Provide a few details so customers can find your market stall.</p>
        </header>

        <div className="surface-card">
          <div className="form-helper" style={{ marginBottom: '1rem' }}>
            Step {currentIndex + 1} of {stepOrder.length}
          </div>
          {error && <div className="form-error">{error}</div>}
          {info && <div className="form-info">{info}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>{renderStep()}</div>

          <div className="action-row" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="button button--outline"
              style={{ width: 'auto' }}
              onClick={handleBack}
              disabled={!canGoBack || saving}
            >
              Back
            </button>
            {step === 'review' ? (
              <button
                type="button"
                className="button button--primary"
                style={{ width: 'auto' }}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Submit'}
              </button>
            ) : (
              <button
                type="button"
                className="button button--primary"
                style={{ width: 'auto' }}
                onClick={handleNext}
                disabled={!canGoNext || saving}
              >
                Next
              </button>
            )}
          </div>
        </div>

        <div className="form-helper" style={{ textAlign: 'center' }}>
          Need to come back later? Your progress will remain until you refresh or clear data.
        </div>
      </div>
    </div>
  );
}
