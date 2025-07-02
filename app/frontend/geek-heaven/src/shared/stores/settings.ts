/**
 * Settings store for application configuration
 * Manages API keys, user preferences, and app settings
 */

import { writable } from 'svelte/store';
import { ProviderType } from '../services/providers';

// Browser detection without SvelteKit dependency
const browser = typeof window !== 'undefined';

/**
 * Configuration for individual Kinopoisk provider
 */
export interface KinopoiskProviderConfig {
  apiKey: string;
  enabled: boolean;
}

/**
 * Settings for all Kinopoisk providers
 */
export interface KinopoiskProviderSettings {
  [ProviderType.KINOPOISK_DEV]: KinopoiskProviderConfig;
  [ProviderType.KINOPOISK_UNOFFICIAL]: KinopoiskProviderConfig;
}

export interface AppSettings {
  // Legacy field for backward compatibility
  kinopoiskApiKey: string;
  openrouterApiKey: string;
  aiModel: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'en';
  autoSave: boolean;
  
  // New provider settings
  selectedKinopoiskProvider: ProviderType;
  kinopoiskProviders: KinopoiskProviderSettings;
  fallbackProviders: ProviderType[];
  providerRetryAttempts: number;
  providerHealthCheckInterval: number;
}

const defaultSettings: AppSettings = {
  kinopoiskApiKey: '',
  openrouterApiKey: '',
  aiModel: 'gpt-4o-mini',
  theme: 'dark',
  language: 'ru',
  autoSave: true,
  
  // New provider settings with defaults
  selectedKinopoiskProvider: ProviderType.KINOPOISK_DEV,
  kinopoiskProviders: {
    [ProviderType.KINOPOISK_DEV]: {
      apiKey: '',
      enabled: true
    },
    [ProviderType.KINOPOISK_UNOFFICIAL]: {
      apiKey: '',
      enabled: true
    }
  },
  fallbackProviders: [ProviderType.KINOPOISK_UNOFFICIAL],
  providerRetryAttempts: 3,
  providerHealthCheckInterval: 300000 // 5 minutes
};

// Load settings from localStorage
function loadSettings(): AppSettings {
  if (!browser) return defaultSettings;
  
  try {
    const stored = localStorage.getItem('geek-heaven-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Migrate legacy settings
      const migrated = migrateSettings(parsed);
      
      return { ...defaultSettings, ...migrated };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  
  return defaultSettings;
}

/**
 * Migrate legacy settings to new provider structure
 */
function migrateSettings(settings: any): Partial<AppSettings> {
  const migrated = { ...settings };
  
  // Migrate legacy kinopoiskApiKey to new provider structure
  if (settings.kinopoiskApiKey && !settings.kinopoiskProviders) {
    migrated.kinopoiskProviders = {
      ...defaultSettings.kinopoiskProviders,
      [ProviderType.KINOPOISK_DEV]: {
        apiKey: settings.kinopoiskApiKey,
        enabled: true
      }
    };
  }
  
  // Ensure all new fields have default values
  if (!migrated.selectedKinopoiskProvider) {
    migrated.selectedKinopoiskProvider = defaultSettings.selectedKinopoiskProvider;
  }
  
  if (!migrated.kinopoiskProviders) {
    migrated.kinopoiskProviders = defaultSettings.kinopoiskProviders;
  }
  
  if (!migrated.fallbackProviders) {
    migrated.fallbackProviders = defaultSettings.fallbackProviders;
  }
  
  if (!migrated.providerRetryAttempts) {
    migrated.providerRetryAttempts = defaultSettings.providerRetryAttempts;
  }
  
  if (!migrated.providerHealthCheckInterval) {
    migrated.providerHealthCheckInterval = defaultSettings.providerHealthCheckInterval;
  }
  
  return migrated;
}

// Save settings to localStorage
function saveSettings(settings: AppSettings): void {
  if (!browser) return;
  
  try {
    localStorage.setItem('geek-heaven-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Create settings store
function createSettingsStore() {
  const { subscribe, set, update } = writable<AppSettings>(loadSettings());

  return {
    subscribe,
    set: (settings: AppSettings) => {
      set(settings);
      saveSettings(settings);
    },
    update: (updater: (settings: AppSettings) => AppSettings) => {
      update((settings) => {
        const newSettings = updater(settings);
        saveSettings(newSettings);
        return newSettings;
      });
    },
    updateApiKey: (apiKey: string) => {
      update((settings) => {
        const newSettings = { ...settings, kinopoiskApiKey: apiKey };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    updateOpenRouterApiKey: (apiKey: string) => {
      update((settings) => {
        const newSettings = { ...settings, openrouterApiKey: apiKey };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    updateTheme: (theme: 'light' | 'dark' | 'auto') => {
      update((settings) => {
        const newSettings = { ...settings, theme };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    updateAiModel: (aiModel: string) => {
      update((settings) => {
        const newSettings = { ...settings, aiModel };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    reset: () => {
      set(defaultSettings);
      saveSettings(defaultSettings);
    }
  };
}

export const settings = createSettingsStore();

// Update specific settings
export function updateKinopoiskApiKey(apiKey: string) {
  settings.update(current => {
    const updated = { 
      ...current, 
      kinopoiskApiKey: apiKey,
      // Also update the selected provider's API key
      kinopoiskProviders: {
        ...current.kinopoiskProviders,
        [current.selectedKinopoiskProvider]: {
          ...current.kinopoiskProviders[current.selectedKinopoiskProvider],
          apiKey: apiKey
        }
      }
    };
    saveSettings(updated);
    return updated;
  });
}

export function updateOpenRouterApiKey(apiKey: string) {
  settings.update(current => {
    const updated = { ...current, openrouterApiKey: apiKey };
    saveSettings(updated);
    return updated;
  });
}

export function updateTheme(theme: 'light' | 'dark' | 'auto') {
  settings.update(current => {
    const updated = { ...current, theme };
    saveSettings(updated);
    return updated;
  });
}

export function updateAiModel(aiModel: string) {
  settings.update(current => {
    const updated = { ...current, aiModel };
    saveSettings(updated);
    return updated;
  });
}

// New provider management functions
export function updateSelectedKinopoiskProvider(providerType: ProviderType) {
  settings.update(current => {
    const updated = { 
      ...current, 
      selectedKinopoiskProvider: providerType,
      // Update legacy field for backward compatibility
      kinopoiskApiKey: current.kinopoiskProviders[providerType]?.apiKey || ''
    };
    saveSettings(updated);
    return updated;
  });
}

export function updateKinopoiskProviderConfig(providerType: ProviderType, config: KinopoiskProviderConfig) {
  settings.update(current => {
    const updated = {
      ...current,
      kinopoiskProviders: {
        ...current.kinopoiskProviders,
        [providerType]: config
      }
    };
    
    // Update legacy field if this is the selected provider
    if (current.selectedKinopoiskProvider === providerType) {
      updated.kinopoiskApiKey = config.apiKey;
    }
    
    saveSettings(updated);
    return updated;
  });
}

export function updateFallbackProviders(fallbackProviders: ProviderType[]) {
  settings.update(current => {
    const updated = { ...current, fallbackProviders };
    saveSettings(updated);
    return updated;
  });
}

export function updateProviderRetryAttempts(retryAttempts: number) {
  settings.update(current => {
    const updated = { ...current, providerRetryAttempts: retryAttempts };
    saveSettings(updated);
    return updated;
  });
}

export function updateProviderHealthCheckInterval(interval: number) {
  settings.update(current => {
    const updated = { ...current, providerHealthCheckInterval: interval };
    saveSettings(updated);
    return updated;
  });
}

// Validate API key format
export function validateApiKey(apiKey: string): boolean {
  // Basic validation - should be a non-empty string with reasonable length
  return apiKey.length >= 10 && apiKey.length <= 100;
}

// Validate OpenRouter API key format
export function validateOpenRouterApiKey(apiKey: string): boolean {
  // OpenRouter API keys typically start with 'sk-or-' and are followed by alphanumeric characters
  const openRouterPattern = /^sk-or-[a-zA-Z0-9]{20,}$/;
  return openRouterPattern.test(apiKey);
}

// Validate Kinopoisk provider API key format
export function validateKinopoiskProviderApiKey(providerType: ProviderType, apiKey: string): boolean {
  if (!apiKey || apiKey.length < 10) {
    return false;
  }
  
  switch (providerType) {
    case ProviderType.KINOPOISK_DEV:
      // Kinopoisk.dev API keys are typically UUIDs or long alphanumeric strings
      const kinopoiskDevPattern = /^[a-zA-Z0-9]{20,}$/;
      return kinopoiskDevPattern.test(apiKey);
    
    case ProviderType.UNOFFICIAL:
      // Unofficial API keys can be UUIDs or alphanumeric strings
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const alphanumericPattern = /^[a-zA-Z0-9]{20,}$/;
      return uuidPattern.test(apiKey) || alphanumericPattern.test(apiKey);
    
    default:
      return validateApiKey(apiKey);
  }
}

// Get enabled Kinopoisk providers
export function getEnabledKinopoiskProviders(currentSettings: AppSettings): ProviderType[] {
  return Object.entries(currentSettings.kinopoiskProviders)
    .filter(([_, config]) => config.enabled && config.apiKey.length > 0)
    .map(([type]) => type as ProviderType);
}

// Check if any Kinopoisk provider is configured
export function hasConfiguredKinopoiskProvider(currentSettings: AppSettings): boolean {
  return getEnabledKinopoiskProviders(currentSettings).length > 0;
}

// Get provider configuration for ProviderManager
export function getProviderManagerConfig(currentSettings: AppSettings): Map<ProviderType, { apiKey: string }> {
  const config = new Map<ProviderType, { apiKey: string }>();
  
  Object.entries(currentSettings.kinopoiskProviders).forEach(([type, providerConfig]) => {
    if (providerConfig.enabled && providerConfig.apiKey) {
      config.set(type as ProviderType, { apiKey: providerConfig.apiKey });
    }
  });
  
  return config;
}

// Check if API key is configured
export function isApiKeyConfigured(apiKey: string): boolean {
  return apiKey.length > 0;
}

// Check if OpenRouter API key is configured
export function isOpenRouterApiKeyConfigured(apiKey: string): boolean {
  return apiKey.length > 0;
}