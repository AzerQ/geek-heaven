/**
 * Settings store for application configuration
 * Manages API keys, user preferences, and app settings
 */

import { writable } from 'svelte/store';

// Browser detection without SvelteKit dependency
const browser = typeof window !== 'undefined';

export interface AppSettings {
  kinopoiskApiKey: string;
  openrouterApiKey: string;
  aiModel: string;
  theme: 'light' | 'dark';
  language: 'ru' | 'en';
  autoSave: boolean;
}

const defaultSettings: AppSettings = {
  kinopoiskApiKey: '',
  openrouterApiKey: '',
  aiModel: 'anthropic/claude-3.5-sonnet',
  theme: 'dark',
  language: 'ru',
  autoSave: true
};

// Load settings from localStorage
function loadSettings(): AppSettings {
  if (!browser) return defaultSettings;
  
  try {
    const stored = localStorage.getItem('geek-heaven-settings');
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  
  return defaultSettings;
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
    updateTheme: (theme: 'light' | 'dark') => {
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

// Validate API key format
export function validateApiKey(apiKey: string): boolean {
  // Basic validation for Kinopoisk API key format
  return apiKey.length > 0 && /^[a-zA-Z0-9-_]+$/.test(apiKey);
}

// Validate OpenRouter API key format
export function validateOpenRouterApiKey(apiKey: string): boolean {
  // OpenRouter API keys typically start with 'sk-or-'
  return apiKey.length > 0 && /^sk-or-[a-zA-Z0-9-_]+$/.test(apiKey);
}

// Check if API key is configured
export function isApiKeyConfigured(apiKey: string): boolean {
  return apiKey.length > 0;
}

// Check if OpenRouter API key is configured
export function isOpenRouterApiKeyConfigured(apiKey: string): boolean {
  return apiKey.length > 0;
}