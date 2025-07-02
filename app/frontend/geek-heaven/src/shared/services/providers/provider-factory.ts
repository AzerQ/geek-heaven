/**
 * Provider Factory
 * Creates and manages Kinopoisk provider instances
 */

import type {
  IKinopoiskProvider,
  IProviderFactory,
  ProviderType,
  ProviderConfig,
  ValidationResult
} from './types';
import { KinopoiskDevProvider } from './kinopoisk-dev-provider';
import { KinopoiskUnofficialProvider } from './kinopoisk-unofficial-provider';
import { ProviderError, ProviderErrorType } from './types';

/**
 * Factory for creating Kinopoisk providers
 */
export class ProviderFactory implements IProviderFactory {
  private static instance: ProviderFactory;
  private providerCache = new Map<string, IKinopoiskProvider>();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }

  /**
   * Create provider instance
   */
  createProvider(type: ProviderType, config?: ProviderConfig): IKinopoiskProvider {
    // Create cache key
    const cacheKey = `${type}_${config?.apiKey || 'no-key'}`;
    
    // Return cached instance if exists
    if (this.providerCache.has(cacheKey)) {
      const cachedProvider = this.providerCache.get(cacheKey)!;
      // Update config if provided
      if (config) {
        cachedProvider.setApiKey(config.apiKey);
      }
      return cachedProvider;
    }

    // Create new provider instance
    let provider: IKinopoiskProvider;
    
    switch (type) {
      case ProviderType.KINOPOISK_DEV:
        provider = new KinopoiskDevProvider(config);
        break;
      
      case ProviderType.UNOFFICIAL:
        provider = new KinopoiskUnofficialProvider(config);
        break;
      
      default:
        throw new ProviderError(
          ProviderErrorType.CONFIGURATION_ERROR,
          `Unsupported provider type: ${type}`
        );
    }

    // Cache the provider
    this.providerCache.set(cacheKey, provider);
    
    return provider;
  }

  /**
   * Get available provider types
   */
  getAvailableProviders(): ProviderType[] {
    return Object.values(ProviderType);
  }

  /**
   * Validate provider configuration
   */
  async validateProviderConfig(type: ProviderType, config: ProviderConfig): Promise<ValidationResult> {
    try {
      const provider = this.createProvider(type, config);
      return await provider.validateApiKey(config.apiKey);
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }

  /**
   * Clear provider cache
   */
  clearCache(): void {
    this.providerCache.clear();
  }

  /**
   * Remove specific provider from cache
   */
  removeFromCache(type: ProviderType, apiKey?: string): void {
    const cacheKey = `${type}_${apiKey || 'no-key'}`;
    this.providerCache.delete(cacheKey);
  }

  /**
   * Get cached provider if exists
   */
  getCachedProvider(type: ProviderType, apiKey?: string): IKinopoiskProvider | undefined {
    const cacheKey = `${type}_${apiKey || 'no-key'}`;
    return this.providerCache.get(cacheKey);
  }

  /**
   * Check if provider type is supported
   */
  isProviderSupported(type: ProviderType): boolean {
    return Object.values(ProviderType).includes(type);
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(type: ProviderType): string {
    const displayNames: Record<ProviderType, string> = {
      [ProviderType.KINOPOISK_DEV]: 'Kinopoisk.dev API',
      [ProviderType.UNOFFICIAL]: 'Kinopoisk Unofficial API'
    };
    
    return displayNames[type] || type;
  }

  /**
   * Get provider description
   */
  getProviderDescription(type: ProviderType): string {
    const descriptions: Record<ProviderType, string> = {
      [ProviderType.KINOPOISK_DEV]: 'Официальный API Кинопоиска для разработчиков',
      [ProviderType.UNOFFICIAL]: 'Неофициальный API с расширенными возможностями'
    };
    
    return descriptions[type] || 'Описание недоступно';
  }

  /**
   * Get provider documentation URL
   */
  getProviderDocumentationUrl(type: ProviderType): string {
    const urls: Record<ProviderType, string> = {
      [ProviderType.KINOPOISK_DEV]: 'https://api.kinopoisk.dev/documentation',
      [ProviderType.UNOFFICIAL]: 'https://kinopoiskapiunofficial.tech/documentation/api/'
    };
    
    return urls[type] || '';
  }

  /**
   * Get provider API key registration URL
   */
  getProviderRegistrationUrl(type: ProviderType): string {
    const urls: Record<ProviderType, string> = {
      [ProviderType.KINOPOISK_DEV]: 'https://api.kinopoisk.dev/',
      [ProviderType.UNOFFICIAL]: 'https://kinopoiskapiunofficial.tech/'
    };
    
    return urls[type] || '';
  }
}