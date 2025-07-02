/**
 * Kinopoisk API Service
 * Unified service that uses ProviderManager for improved reliability and provider switching
 */

import { ProviderManager, ProviderFactory } from './providers';
import type {
  ProviderType,
  ProviderManagerConfig,
  ProviderHealth,
  Movie,
  SearchResponse,
  ReviewsResponse,
  ImagesResponse,
  SearchParams
} from './providers';
import { settings, getProviderManagerConfig, type AppSettings } from '../stores/settings';
import { get } from 'svelte/store';

// Re-export types for backward compatibility
export type {
  Review,
  ReviewsResponse,
  Movie,
  SearchResponse,
  ApiError,
  MovieImage,
  ImagesResponse
} from './providers/types';

/**
 * Unified Kinopoisk Service
 * Uses ProviderManager to handle multiple providers with fallback support
 */
export class KinopoiskService {
  private static instance: KinopoiskService;
  private providerManager: ProviderManager;
  private factory: ProviderFactory;
  private isInitialized = false;

  private constructor() {
    this.factory = ProviderFactory.getInstance();
    this.providerManager = ProviderManager.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): KinopoiskService {
    if (!KinopoiskService.instance) {
      KinopoiskService.instance = new KinopoiskService();
    }
    return KinopoiskService.instance;
  }

  /**
   * Initialize service with current settings
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const currentSettings = get(settings);
    const providerConfigs = getProviderManagerConfig(currentSettings);

    if (providerConfigs.size === 0) {
      console.warn('No Kinopoisk providers configured');
      return;
    }

    const managerConfig: Partial<ProviderManagerConfig> = {
      primaryProvider: currentSettings.selectedKinopoiskProvider,
      fallbackProviders: currentSettings.fallbackProviders,
      retryAttempts: currentSettings.providerRetryAttempts,
      healthCheckInterval: currentSettings.providerHealthCheckInterval
    };

    // Reinitialize ProviderManager with new config
    this.providerManager = ProviderManager.getInstance(managerConfig);
    await this.providerManager.initialize(providerConfigs);
    
    this.isInitialized = true;
    console.log('KinopoiskService initialized with ProviderManager');
  }

  /**
   * Ensure service is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Reinitialize service (useful when settings change)
   */
  async reinitialize(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
  }

  /**
   * Set API key for specific provider (legacy method)
   */
  setApiKey(apiKey: string): void {
    // This method is kept for backward compatibility
    // In the new architecture, API keys are managed through settings
    console.warn('setApiKey is deprecated. Use settings to manage API keys.');
  }

  /**
   * Search movies
   */
  async searchMovies(query: string, params?: SearchParams): Promise<SearchResponse> {
    await this.ensureInitialized();
    return this.providerManager.searchMovies(query, params);
  }

  /**
   * Get movie by ID
   */
  async getMovieById(id: number): Promise<Movie> {
    await this.ensureInitialized();
    return this.providerManager.getMovieById(id);
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(params?: SearchParams): Promise<SearchResponse> {
    await this.ensureInitialized();
    return this.providerManager.getPopularMovies(params);
  }

  /**
   * Get new movies
   */
  async getNewMovies(params?: SearchParams): Promise<SearchResponse> {
    await this.ensureInitialized();
    return this.providerManager.getNewMovies(params);
  }

  /**
   * Get movies by type (legacy method)
   */
  async getMoviesByType(type: string, params?: SearchParams): Promise<SearchResponse> {
    await this.ensureInitialized();
    
    // Map legacy types to new format
    const typeMap: Record<string, string> = {
      'popular': 'popular',
      'new': 'new',
      'top': 'popular'
    };
    
    const mappedType = typeMap[type] || type;
    
    if (mappedType === 'popular') {
      return this.getPopularMovies(params);
    } else if (mappedType === 'new') {
      return this.getNewMovies(params);
    } else {
      return this.getMoviesByGenreAndType(undefined, mappedType, params);
    }
  }

  /**
   * Get movies by genre and type
   */
  async getMoviesByGenreAndType(genre?: string, type?: string, params?: SearchParams): Promise<SearchResponse> {
    await this.ensureInitialized();
    return this.providerManager.getMoviesByGenreAndType(genre, type, params);
  }

  /**
   * Get random movie
   */
  async getRandomMovie(): Promise<Movie> {
    await this.ensureInitialized();
    return this.providerManager.getRandomMovie();
  }

  /**
   * Get movie reviews
   */
  async getMovieReviews(movieId: number, params?: SearchParams): Promise<ReviewsResponse> {
    await this.ensureInitialized();
    return this.providerManager.getMovieReviews(movieId, params);
  }

  /**
   * Get movie posters
   */
  async getMoviePosters(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    await this.ensureInitialized();
    return this.providerManager.getMoviePosters(movieId, params);
  }

  /**
   * Get movie screenshots
   */
  async getMovieScreenshots(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    await this.ensureInitialized();
    return this.providerManager.getMovieScreenshots(movieId, params);
  }

  /**
   * Get movie backdrops
   */
  async getMovieBackdrops(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    await this.ensureInitialized();
    return this.providerManager.getMovieBackdrops(movieId, params);
  }

  /**
   * Get movie frames
   */
  async getMovieFrames(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    await this.ensureInitialized();
    return this.providerManager.getMovieFrames(movieId, params);
  }

  /**
   * Validate API key for specific provider
   */
  async validateApiKey(apiKey: string, providerType?: ProviderType): Promise<{ isValid: boolean; error?: string }> {
    const currentSettings = get(settings);
    const type = providerType || currentSettings.selectedKinopoiskProvider;
    
    return this.factory.validateProviderConfig(type, { apiKey });
  }

  /**
   * Get current active provider type
   */
  getActiveProviderType(): ProviderType | null {
    return this.providerManager.getActiveProviderType();
  }

  /**
   * Get provider health status
   */
  getProviderHealth(): Map<ProviderType, ProviderHealth> {
    return this.providerManager.getProviderHealth();
  }

  /**
   * Switch to specific provider
   */
  async switchProvider(providerType: ProviderType): Promise<boolean> {
    await this.ensureInitialized();
    return this.providerManager.setActiveProvider(providerType);
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): ProviderType[] {
    return this.factory.getAvailableProviders();
  }

  /**
   * Get provider display information
   */
  getProviderInfo(providerType: ProviderType): {
    name: string;
    description: string;
    documentationUrl: string;
    registrationUrl: string;
  } {
    return {
      name: this.factory.getProviderDisplayName(providerType),
      description: this.factory.getProviderDescription(providerType),
      documentationUrl: this.factory.getProviderDocumentationUrl(providerType),
      registrationUrl: this.factory.getProviderRegistrationUrl(providerType)
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.providerManager.destroy();
    this.isInitialized = false;
  }
}

// Export singleton instance for backward compatibility
export const kinopoiskService = KinopoiskService.getInstance();

// Legacy export for backward compatibility
export { KinopoiskService as KinopoiskDevProvider };

/**
 * Image types available from Kinopoisk API
 */
export type ImageType = 'cover' | 'backdrops' | 'screenshot' | 'frame';

/**
 * Image data structure from Kinopoisk API
 */
export interface MovieImage {
  movieId: number;
  type: ImageType;
  language?: string;
  url: string;
  previewUrl: string;
  height?: number;
  width?: number;
}

/**
 * Response structure for images API
 */
export interface ImagesResponse {
  docs: MovieImage[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}