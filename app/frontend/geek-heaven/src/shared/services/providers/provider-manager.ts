/**
 * Provider Manager
 * Manages active provider, fallback logic, and provider switching
 */

import type {
  IKinopoiskProvider,
  ProviderType,
  ProviderConfig,
  ProviderStatus,
  SearchParams,
  Movie,
  SearchResponse,
  ReviewsResponse,
  ImagesResponse
} from './types';
import { ProviderFactory } from './provider-factory';
import { ProviderError, ProviderErrorType } from './types';

/**
 * Configuration for provider manager
 */
export interface ProviderManagerConfig {
  primaryProvider: ProviderType;
  fallbackProviders: ProviderType[];
  retryAttempts: number;
  retryDelay: number;
  healthCheckInterval: number;
}

/**
 * Provider health status
 */
export interface ProviderHealth {
  type: ProviderType;
  isHealthy: boolean;
  lastCheck: Date;
  errorCount: number;
  lastError?: string;
}

/**
 * Manages Kinopoisk providers with fallback support
 */
export class ProviderManager {
  private static instance: ProviderManager;
  private factory: ProviderFactory;
  private activeProvider: IKinopoiskProvider | null = null;
  private providerConfigs = new Map<ProviderType, ProviderConfig>();
  private providerHealth = new Map<ProviderType, ProviderHealth>();
  private config: ProviderManagerConfig;
  private healthCheckTimer?: NodeJS.Timeout;

  private constructor(config?: Partial<ProviderManagerConfig>) {
    this.factory = ProviderFactory.getInstance();
    this.config = {
      primaryProvider: ProviderType.KINOPOISK_DEV,
      fallbackProviders: [ProviderType.UNOFFICIAL],
      retryAttempts: 3,
      retryDelay: 1000,
      healthCheckInterval: 300000, // 5 minutes
      ...config
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<ProviderManagerConfig>): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager(config);
    }
    return ProviderManager.instance;
  }

  /**
   * Initialize provider manager
   */
  async initialize(providerConfigs: Map<ProviderType, ProviderConfig>): Promise<void> {
    this.providerConfigs = new Map(providerConfigs);
    
    // Initialize health status for all configured providers
    for (const [type] of providerConfigs) {
      this.providerHealth.set(type, {
        type,
        isHealthy: false,
        lastCheck: new Date(),
        errorCount: 0
      });
    }

    // Set active provider
    await this.setActiveProvider(this.config.primaryProvider);
    
    // Start health checks
    this.startHealthChecks();
  }

  /**
   * Set active provider
   */
  async setActiveProvider(type: ProviderType): Promise<boolean> {
    const config = this.providerConfigs.get(type);
    if (!config) {
      console.warn(`No configuration found for provider: ${type}`);
      return false;
    }

    try {
      const provider = this.factory.createProvider(type, config);
      const status = await provider.getStatus();
      
      if (status.isConfigured && status.isHealthy) {
        this.activeProvider = provider;
        this.updateProviderHealth(type, true);
        console.log(`Active provider set to: ${type}`);
        return true;
      } else {
        this.updateProviderHealth(type, false, 'Provider not healthy or configured');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateProviderHealth(type, false, errorMessage);
      console.error(`Failed to set active provider ${type}:`, errorMessage);
      return false;
    }
  }

  /**
   * Get current active provider
   */
  getActiveProvider(): IKinopoiskProvider | null {
    return this.activeProvider;
  }

  /**
   * Get active provider type
   */
  getActiveProviderType(): ProviderType | null {
    if (!this.activeProvider) return null;
    
    // Find provider type by checking instance
    for (const [type, config] of this.providerConfigs) {
      const provider = this.factory.getCachedProvider(type, config.apiKey);
      if (provider === this.activeProvider) {
        return type;
      }
    }
    
    return null;
  }

  /**
   * Execute method with fallback support
   */
  private async executeWithFallback<T>(
    method: (provider: IKinopoiskProvider) => Promise<T>,
    methodName: string
  ): Promise<T> {
    const providers = [this.config.primaryProvider, ...this.config.fallbackProviders];
    let lastError: Error | null = null;

    for (const providerType of providers) {
      const config = this.providerConfigs.get(providerType);
      if (!config) continue;

      const health = this.providerHealth.get(providerType);
      if (health && !health.isHealthy && health.errorCount > 5) {
        continue; // Skip unhealthy providers
      }

      try {
        const provider = this.factory.createProvider(providerType, config);
        
        // Retry logic
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
          try {
            const result = await method(provider);
            
            // Update active provider if this one succeeded and it's not the current one
            if (this.activeProvider !== provider) {
              this.activeProvider = provider;
              console.log(`Switched to provider: ${providerType}`);
            }
            
            this.updateProviderHealth(providerType, true);
            return result;
          } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
            
            if (attempt < this.config.retryAttempts) {
              await this.delay(this.config.retryDelay * attempt);
            }
          }
        }
        
        // Mark provider as unhealthy after all retries failed
        this.updateProviderHealth(providerType, false, lastError?.message);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.updateProviderHealth(providerType, false, lastError.message);
      }
    }

    throw new ProviderError(
      ProviderErrorType.ALL_PROVIDERS_FAILED,
      `All providers failed for ${methodName}. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Search movies with fallback
   */
  async searchMovies(query: string, params?: SearchParams): Promise<SearchResponse> {
    return this.executeWithFallback(
      (provider) => provider.searchMovies(query, params),
      'searchMovies'
    );
  }

  /**
   * Get movie by ID with fallback
   */
  async getMovieById(id: number): Promise<Movie> {
    return this.executeWithFallback(
      (provider) => provider.getMovieById(id),
      'getMovieById'
    );
  }

  /**
   * Get popular movies with fallback
   */
  async getPopularMovies(params?: SearchParams): Promise<SearchResponse> {
    return this.executeWithFallback(
      (provider) => provider.getPopularMovies(params),
      'getPopularMovies'
    );
  }

  /**
   * Get new movies with fallback
   */
  async getNewMovies(params?: SearchParams): Promise<SearchResponse> {
    return this.executeWithFallback(
      (provider) => provider.getNewMovies(params),
      'getNewMovies'
    );
  }

  /**
   * Get movies by genre and type with fallback
   */
  async getMoviesByGenreAndType(genre?: string, type?: string, params?: SearchParams): Promise<SearchResponse> {
    return this.executeWithFallback(
      (provider) => provider.getMoviesByGenreAndType(genre, type, params),
      'getMoviesByGenreAndType'
    );
  }

  /**
   * Get random movie with fallback
   */
  async getRandomMovie(): Promise<Movie> {
    return this.executeWithFallback(
      (provider) => provider.getRandomMovie(),
      'getRandomMovie'
    );
  }

  /**
   * Get movie reviews with fallback
   */
  async getMovieReviews(movieId: number, params?: SearchParams): Promise<ReviewsResponse> {
    return this.executeWithFallback(
      (provider) => provider.getMovieReviews(movieId, params),
      'getMovieReviews'
    );
  }

  /**
   * Get movie posters with fallback
   */
  async getMoviePosters(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    return this.executeWithFallback(
      (provider) => provider.getMoviePosters(movieId, params),
      'getMoviePosters'
    );
  }

  /**
   * Get movie screenshots with fallback
   */
  async getMovieScreenshots(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    return this.executeWithFallback(
      (provider) => provider.getMovieScreenshots(movieId, params),
      'getMovieScreenshots'
    );
  }

  /**
   * Get movie backdrops with fallback
   */
  async getMovieBackdrops(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    return this.executeWithFallback(
      (provider) => provider.getMovieBackdrops(movieId, params),
      'getMovieBackdrops'
    );
  }

  /**
   * Get movie frames with fallback
   */
  async getMovieFrames(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    return this.executeWithFallback(
      (provider) => provider.getMovieFrames(movieId, params),
      'getMovieFrames'
    );
  }

  /**
   * Get provider health status
   */
  getProviderHealth(): Map<ProviderType, ProviderHealth> {
    return new Map(this.providerHealth);
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(type: ProviderType, config: ProviderConfig): void {
    this.providerConfigs.set(type, config);
    
    // Remove from cache to force recreation
    this.factory.removeFromCache(type, config.apiKey);
    
    // Reset health status
    this.providerHealth.set(type, {
      type,
      isHealthy: false,
      lastCheck: new Date(),
      errorCount: 0
    });
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health checks on all providers
   */
  private async performHealthChecks(): Promise<void> {
    for (const [type, config] of this.providerConfigs) {
      try {
        const provider = this.factory.createProvider(type, config);
        const status = await provider.getStatus();
        
        this.updateProviderHealth(type, status.isHealthy && status.isConfigured);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Health check failed';
        this.updateProviderHealth(type, false, errorMessage);
      }
    }
  }

  /**
   * Update provider health status
   */
  private updateProviderHealth(type: ProviderType, isHealthy: boolean, error?: string): void {
    const current = this.providerHealth.get(type);
    
    this.providerHealth.set(type, {
      type,
      isHealthy,
      lastCheck: new Date(),
      errorCount: isHealthy ? 0 : (current?.errorCount || 0) + 1,
      lastError: error
    });
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
    
    this.factory.clearCache();
    this.activeProvider = null;
    this.providerConfigs.clear();
    this.providerHealth.clear();
  }
}