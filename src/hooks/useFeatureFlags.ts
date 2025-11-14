/**
 * React hook for feature flags
 */

import { useState, useEffect } from 'react';
import featureFlagsService, { FeatureFlags } from '../services/FeatureFlagsService';

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(featureFlagsService.getFlags());

  useEffect(() => {
    const unsubscribe = featureFlagsService.subscribe(newFlags => {
      setFlags(newFlags);
    });

    return unsubscribe;
  }, []);

  return {
    flags,
    setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => {
      featureFlagsService.setFlag(key, value);
    },
    setFlags: (updates: Partial<FeatureFlags>) => {
      featureFlagsService.setFlags(updates);
    },
    resetFlags: () => {
      featureFlagsService.resetFlags();
    },
    toggleApiMode: () => {
      featureFlagsService.toggleApiMode();
    },
    enableApiMode: () => {
      featureFlagsService.enableApiMode();
    },
    disableApiMode: () => {
      featureFlagsService.disableApiMode();
    },
    isApiModeEnabled: () => featureFlagsService.isApiModeEnabled(),
    isLocalStorageModeEnabled: () => featureFlagsService.isLocalStorageModeEnabled(),
    isFeatureEnabled: (feature: keyof Omit<FeatureFlags, 'useApiMode'>) =>
      featureFlagsService.isFeatureEnabled(feature),
  };
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
  const { flags } = useFeatureFlags();
  return flags[key];
}

/**
 * Hook to check if API mode is enabled
 */
export function useApiMode(): boolean {
  return useFeatureFlag('useApiMode');
}

