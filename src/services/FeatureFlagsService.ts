/**
 * Feature Flags Service
 * Manages feature flags and toggles between local storage and API modes
 */

import StorageService from './StorageService';
import { STORAGE_KEYS } from '../utils/constants';
import ApiClient from './api/ApiClient';

export interface FeatureFlags {
  useApiMode: boolean;
  enableImageCache: boolean;
  enableSearchHistory: boolean;
  enableNotifications: boolean;
  enableFavorites: boolean;
  enablePriceComparison: boolean;
  enableAdvancedSearch: boolean;
  enableImageCompression: boolean;
  enableOfflineMode: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  useApiMode: false, // Default to localStorage mode
  enableImageCache: true,
  enableSearchHistory: true,
  enableNotifications: true,
  enableFavorites: true,
  enablePriceComparison: true,
  enableAdvancedSearch: true,
  enableImageCompression: true,
  enableOfflineMode: true,
};

class FeatureFlagsService {
  private flags: FeatureFlags;
  private listeners: Set<(flags: FeatureFlags) => void> = new Set();

  constructor() {
    this.flags = this.loadFlags();
    this.applyFlags();
  }

  /**
   * Load flags from storage or environment
   */
  private loadFlags(): FeatureFlags {
    // Check environment variables first
    const envFlags: Partial<FeatureFlags> = {
      useApiMode: process.env.REACT_APP_USE_API === 'true',
      enableImageCache: process.env.REACT_APP_ENABLE_IMAGE_CACHE !== 'false',
      enableSearchHistory: process.env.REACT_APP_ENABLE_SEARCH_HISTORY !== 'false',
      enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
      enableFavorites: process.env.REACT_APP_ENABLE_FAVORITES !== 'false',
      enablePriceComparison: process.env.REACT_APP_ENABLE_PRICE_COMPARISON !== 'false',
      enableAdvancedSearch: process.env.REACT_APP_ENABLE_ADVANCED_SEARCH !== 'false',
      enableImageCompression: process.env.REACT_APP_ENABLE_IMAGE_COMPRESSION !== 'false',
      enableOfflineMode: process.env.REACT_APP_ENABLE_OFFLINE_MODE !== 'false',
    };

    // Load from localStorage
    const storedFlags = StorageService.getItem<Partial<FeatureFlags>>(
      `${STORAGE_KEYS.SETTINGS}_feature_flags`
    );

    // Merge: env > stored > default
    return {
      ...DEFAULT_FLAGS,
      ...storedFlags,
      ...Object.fromEntries(
        Object.entries(envFlags).filter(([_, value]) => value !== undefined)
      ),
    } as FeatureFlags;
  }

  /**
   * Save flags to storage
   */
  private saveFlags(): void {
    StorageService.setItem(`${STORAGE_KEYS.SETTINGS}_feature_flags`, this.flags);
  }

  /**
   * Apply flags (e.g., configure API client)
   */
  private applyFlags(): void {
    // Configure API client based on useApiMode flag
    ApiClient.setLocalStorageMode(!this.flags.useApiMode);
  }

  /**
   * Get all flags
   */
  getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Get a specific flag
   */
  getFlag<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
    return this.flags[key];
  }

  /**
   * Set a flag
   */
  setFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]): void {
    this.flags[key] = value;
    this.saveFlags();
    this.applyFlags();
    this.notifyListeners();
  }

  /**
   * Set multiple flags at once
   */
  setFlags(updates: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...updates };
    this.saveFlags();
    this.applyFlags();
    this.notifyListeners();
  }

  /**
   * Reset flags to defaults
   */
  resetFlags(): void {
    this.flags = { ...DEFAULT_FLAGS };
    this.saveFlags();
    this.applyFlags();
    this.notifyListeners();
  }

  /**
   * Toggle API mode
   */
  toggleApiMode(): void {
    this.setFlag('useApiMode', !this.flags.useApiMode);
  }

  /**
   * Enable API mode
   */
  enableApiMode(): void {
    this.setFlag('useApiMode', true);
  }

  /**
   * Disable API mode (use localStorage)
   */
  disableApiMode(): void {
    this.setFlag('useApiMode', false);
  }

  /**
   * Check if API mode is enabled
   */
  isApiModeEnabled(): boolean {
    return this.flags.useApiMode;
  }

  /**
   * Check if localStorage mode is enabled
   */
  isLocalStorageModeEnabled(): boolean {
    return !this.flags.useApiMode;
  }

  /**
   * Subscribe to flag changes
   */
  subscribe(listener: (flags: FeatureFlags) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of flag changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getFlags()));
  }

  /**
   * Get flags for display (exclude sensitive flags)
   */
  getPublicFlags(): Omit<FeatureFlags, 'useApiMode'> {
    const { useApiMode, ...publicFlags } = this.flags;
    return publicFlags;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof Omit<FeatureFlags, 'useApiMode'>): boolean {
    return this.flags[feature] === true;
  }
}

const featureFlagsService = new FeatureFlagsService();
export default featureFlagsService;

