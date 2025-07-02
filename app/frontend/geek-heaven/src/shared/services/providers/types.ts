/**
 * Common types and interfaces for Kinopoisk providers
 * Defines unified API for all movie data providers
 */

// Re-export existing types from kinopoisk service
export type {
  Movie,
  SearchResponse,
  Review,
  ReviewsResponse,
  MovieImage,
  ImagesResponse,
  ImageType,
  ApiError
} from '../kinopoisk';

/**
 * Provider types enum
 */
export enum ProviderType {
  KINOPOISK_DEV = 'kinopoisk-dev',
  KINOPOISK_UNOFFICIAL = 'kinopoisk-unofficial'
}

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
  type: ProviderType;
  apiKey: string;
  baseUrl: string;
  name: string;
  description: string;
}

/**
 * Provider validation result
 */
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Search parameters interface
 */
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  genre?: string;
  type?: string;
  year?: string;
  sortField?: string;
  sortType?: string;
  [key: string]: any;
}

/**
 * Provider status interface
 */
export interface ProviderStatus {
  isAvailable: boolean;
  isConfigured: boolean;
  lastError?: string;
  responseTime?: number;
}

/**
 * Main provider interface that all providers must implement
 */
export interface IKinopoiskProvider {
  /**
   * Provider configuration
   */
  readonly config: ProviderConfig;
  
  /**
   * Set API key for the provider
   */
  setApiKey(apiKey: string): void;
  
  /**
   * Validate API key
   */
  validateApiKey(apiKey: string): Promise<ValidationResult>;
  
  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;
  
  /**
   * Get provider status
   */
  getStatus(): Promise<ProviderStatus>;
  
  /**
   * Search movies by query
   */
  searchMovies(query: string, page?: number, limit?: number): Promise<SearchResponse>;
  
  /**
   * Get movie by ID
   */
  getMovieById(id: number): Promise<Movie>;
  
  /**
   * Get popular movies
   */
  getPopularMovies(page?: number, limit?: number): Promise<SearchResponse>;
  
  /**
   * Get movies by genre
   */
  getMoviesByGenre(genre: string, page?: number, limit?: number): Promise<SearchResponse>;
  
  /**
   * Get new movies
   */
  getNewMovies(page?: number, limit?: number): Promise<SearchResponse>;
  
  /**
   * Get movies by type
   */
  getMoviesByType(type: string, page?: number, limit?: number): Promise<SearchResponse>;
  
  /**
   * Get random movie
   */
  getRandomMovie(): Promise<Movie>;
  
  /**
   * Get movie reviews
   */
  getMovieReviews(movieId: number, page?: number, limit?: number): Promise<ReviewsResponse>;
  
  /**
   * Get popular movies by category
   */
  getPopularMoviesByCategory(
    category: 'movies' | 'series' | 'anime',
    page?: number,
    limit?: number
  ): Promise<SearchResponse>;
  
  /**
   * Get movie images
   */
  getMovieImages(
    movieId: number,
    type?: ImageType,
    page?: number,
    limit?: number
  ): Promise<ImagesResponse>;
  
  /**
   * Get movie posters
   */
  getMoviePosters(movieId: number, page?: number, limit?: number): Promise<ImagesResponse>;
  
  /**
   * Get movie screenshots
   */
  getMovieScreenshots(movieId: number, page?: number, limit?: number): Promise<ImagesResponse>;
  
  /**
   * Get movie backdrops
   */
  getMovieBackdrops(movieId: number, page?: number, limit?: number): Promise<ImagesResponse>;
  
  /**
   * Get movie frames
   */
  getMovieFrames(movieId: number, page?: number, limit?: number): Promise<ImagesResponse>;
}

/**
 * Provider factory interface
 */
export interface IProviderFactory {
  /**
   * Create provider instance by type
   */
  createProvider(type: ProviderType, apiKey?: string): IKinopoiskProvider;
  
  /**
   * Get available provider types
   */
  getAvailableProviders(): ProviderConfig[];
  
  /**
   * Get default provider type
   */
  getDefaultProviderType(): ProviderType;
}

/**
 * Provider error types
 */
export enum ProviderErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_KEY_INVALID = 'API_KEY_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Provider error class
 */
export class ProviderError extends Error {
  constructor(
    public type: ProviderErrorType,
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}