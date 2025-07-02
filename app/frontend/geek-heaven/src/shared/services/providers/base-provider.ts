/**
 * Base abstract class for Kinopoisk providers
 * Contains common functionality and enforces interface implementation
 */

import type {
  IKinopoiskProvider,
  ProviderConfig,
  ValidationResult,
  ProviderStatus,
  SearchResponse,
  Movie,
  ReviewsResponse,
  ImagesResponse,
  ImageType,
  ProviderError,
  ProviderErrorType
} from './types';

export abstract class BaseKinopoiskProvider implements IKinopoiskProvider {
  protected apiKey: string = '';
  
  constructor(public readonly config: ProviderConfig) {}
  
  /**
   * Set API key for the provider
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }
  
  /**
   * Get provider status
   */
  async getStatus(): Promise<ProviderStatus> {
    const startTime = Date.now();
    
    try {
      const isConfigured = this.isConfigured();
      
      if (!isConfigured) {
        return {
          isAvailable: false,
          isConfigured: false,
          lastError: 'API key not configured'
        };
      }
      
      // Test API availability with a simple request
      await this.testConnection();
      
      const responseTime = Date.now() - startTime;
      
      return {
        isAvailable: true,
        isConfigured: true,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        isAvailable: false,
        isConfigured: this.isConfigured(),
        lastError: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
    }
  }
  
  /**
   * Create standardized error
   */
  protected createError(
    type: ProviderErrorType,
    message: string,
    statusCode?: number,
    originalError?: Error
  ): ProviderError {
    const { ProviderError } = require('./types');
    return new ProviderError(type, message, statusCode, originalError);
  }
  
  /**
   * Handle HTTP response errors
   */
  protected handleHttpError(response: Response, originalError?: Error): ProviderError {
    const { ProviderErrorType } = require('./types');
    
    switch (response.status) {
      case 401:
        return this.createError(
          ProviderErrorType.API_KEY_INVALID,
          'Invalid API key',
          401,
          originalError
        );
      case 403:
        return this.createError(
          ProviderErrorType.API_KEY_INVALID,
          'Access forbidden - check your API key',
          403,
          originalError
        );
      case 404:
        return this.createError(
          ProviderErrorType.NOT_FOUND,
          'Resource not found',
          404,
          originalError
        );
      case 429:
        return this.createError(
          ProviderErrorType.RATE_LIMIT,
          'Rate limit exceeded',
          429,
          originalError
        );
      case 500:
      case 502:
      case 503:
        return this.createError(
          ProviderErrorType.SERVER_ERROR,
          'Server error',
          response.status,
          originalError
        );
      default:
        return this.createError(
          ProviderErrorType.UNKNOWN_ERROR,
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          originalError
        );
    }
  }
  
  /**
   * Handle network errors
   */
  protected handleNetworkError(error: Error): ProviderError {
    const { ProviderErrorType } = require('./types');
    
    return this.createError(
      ProviderErrorType.NETWORK_ERROR,
      `Network error: ${error.message}`,
      undefined,
      error
    );
  }
  
  /**
   * Validate API key format (to be overridden by specific providers)
   */
  protected validateApiKeyFormat(apiKey: string): boolean {
    return apiKey.length > 0;
  }
  
  /**
   * Test connection to API (to be implemented by specific providers)
   */
  protected abstract testConnection(): Promise<void>;
  
  // Abstract methods that must be implemented by concrete providers
  abstract validateApiKey(apiKey: string): Promise<ValidationResult>;
  abstract searchMovies(query: string, page?: number, limit?: number): Promise<SearchResponse>;
  abstract getMovieById(id: number): Promise<Movie>;
  abstract getPopularMovies(page?: number, limit?: number): Promise<SearchResponse>;
  abstract getMoviesByGenre(genre: string, page?: number, limit?: number): Promise<SearchResponse>;
  abstract getNewMovies(page?: number, limit?: number): Promise<SearchResponse>;
  abstract getMoviesByType(type: string, page?: number, limit?: number): Promise<SearchResponse>;
  abstract getRandomMovie(): Promise<Movie>;
  abstract getMovieReviews(movieId: number, page?: number, limit?: number): Promise<ReviewsResponse>;
  abstract getPopularMoviesByCategory(
    category: 'movies' | 'series' | 'anime',
    page?: number,
    limit?: number
  ): Promise<SearchResponse>;
  abstract getMovieImages(
    movieId: number,
    type?: ImageType,
    page?: number,
    limit?: number
  ): Promise<ImagesResponse>;
  abstract getMoviePosters(movieId: number, page?: number, limit?: number): Promise<ImagesResponse>;
  abstract getMovieScreenshots(movieId: number, page?: number, limit?: number): Promise<ImagesResponse>;
  abstract getMovieBackdrops(movieId: number, page?: number, limit?: number): Promise<ImagesResponse>;
  abstract getMovieFrames(movieId: number, page?: number, limit?: number): Promise<ImagesResponse>;
}