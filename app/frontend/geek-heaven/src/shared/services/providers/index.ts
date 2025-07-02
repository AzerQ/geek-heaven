/**
 * Providers module exports
 * Central export point for all provider-related functionality
 */

// Export types and interfaces
export * from './types';
export * from './types-unofficial';

// Export base provider
export { BaseKinopoiskProvider } from './base-provider';

// Export concrete providers
export { KinopoiskDevProvider } from './kinopoisk-dev-provider';
export { KinopoiskUnofficialProvider } from './kinopoisk-unofficial-provider';

// Export factory and manager
export { ProviderFactory } from './provider-factory';
export { ProviderManager } from './provider-manager';
export type { ProviderManagerConfig, ProviderHealth } from './provider-manager';