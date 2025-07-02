/**
 * Kinopoisk.dev API provider
 * Implementation of IKinopoiskProvider for api.kinopoisk.dev
 */

import { BaseKinopoiskProvider } from './base-provider';
import type {
  ProviderConfig,
  ValidationResult,
  SearchResponse,
  Movie,
  ReviewsResponse,
  ImagesResponse,
  ImageType,
  ProviderErrorType
} from './types';
import { ProviderType } from './types';

export class KinopoiskDevProvider extends BaseKinopoiskProvider {
  private readonly baseUrl = 'https://api.kinopoisk.dev/v1.4';
  
  constructor() {
    const config: ProviderConfig = {
      type: ProviderType.KINOPOISK_DEV,
      apiKey: '',
      baseUrl: 'https://api.kinopoisk.dev/v1.4',
      name: 'Kinopoisk.dev',
      description: 'Официальный API Kinopoisk.dev'
    };
    
    super(config);
  }
  
  /**
   * Test connection to API
   */
  protected async testConnection(): Promise<void> {
    await this.makeRequest('/movie', { limit: 1 });
  }
  
  /**
   * Validate API key format for Kinopoisk.dev
   */
  protected validateApiKeyFormat(apiKey: string): boolean {
    return apiKey.length > 0 && /^[a-zA-Z0-9-_]+$/.test(apiKey);
  }
  
  /**
   * Validate API key by making a test request
   */
  async validateApiKey(apiKey: string): Promise<ValidationResult> {
    if (!this.validateApiKeyFormat(apiKey)) {
      return {
        isValid: false,
        message: 'Неверный формат API ключа'
      };
    }
    
    const tempKey = this.apiKey;
    this.apiKey = apiKey;
    
    try {
      await this.testConnection();
      return {
        isValid: true,
        message: 'API ключ действителен'
      };
    } catch (error) {
      return {
        isValid: false,
        message: error instanceof Error ? error.message : 'Ошибка валидации API ключа'
      };
    } finally {
      this.apiKey = tempKey;
    }
  }
  
  /**
   * Make HTTP request to Kinopoisk.dev API
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      const { ProviderErrorType } = await import('./types');
      throw this.createError(
        ProviderErrorType.API_KEY_MISSING,
        'API ключ не настроен. Перейдите в настройки и добавьте ключ Kinopoisk API.'
      );
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw this.handleHttpError(response);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'ProviderError') {
        throw error;
      }
      
      if (error instanceof Error) {
        throw this.handleNetworkError(error);
      }
      
      const { ProviderErrorType } = await import('./types');
      throw this.createError(
        ProviderErrorType.UNKNOWN_ERROR,
        'Неизвестная ошибка при запросе к API'
      );
    }
  }
  
  /**
   * Search movies by query
   */
  async searchMovies(query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> {
    return this.makeRequest<SearchResponse>('/movie/search', {
      query,
      page,
      limit
    });
  }
  
  /**
   * Get movie by ID
   */
  async getMovieById(id: number): Promise<Movie> {
    return this.makeRequest<Movie>(`/movie/${id}`);
  }
  
  /**
   * Get popular movies
   */
  async getPopularMovies(page: number = 1, limit: number = 20): Promise<SearchResponse> {
    return this.makeRequest<SearchResponse>('/movie', {
      page,
      limit,
      sortField: 'rating.kp',
      sortType: '-1',
      'rating.kp': '7-10',
      'votes.kp': '100000-6666666'
    });
  }
  
  /**
   * Get movies by genre
   */
  async getMoviesByGenre(genre: string, page: number = 1, limit: number = 20): Promise<SearchResponse> {
    return this.makeRequest<SearchResponse>('/movie', {
      page,
      limit,
      'genres.name': genre,
      sortField: 'rating.kp',
      sortType: '-1'
    });
  }
  
  /**
   * Get new movies
   */
  async getNewMovies(page: number = 1, limit: number = 20): Promise<SearchResponse> {
    const currentYear = new Date().getFullYear();
    return this.makeRequest<SearchResponse>('/movie', {
      page,
      limit,
      year: `${currentYear - 1}-${currentYear}`,
      sortField: 'premiere.world',
      sortType: '-1'
    });
  }
  
  /**
   * Get movies by type
   */
  async getMoviesByType(type: string, page: number = 1, limit: number = 20): Promise<SearchResponse> {
    return this.makeRequest<SearchResponse>('/movie', {
      page,
      limit,
      type,
      sortField: 'rating.kp',
      sortType: '-1'
    });
  }
  
  /**
   * Get random movie
   */
  async getRandomMovie(): Promise<Movie> {
    const response = await this.makeRequest<SearchResponse>('/movie/random');
    return response.docs[0];
  }
  
  /**
   * Get movie reviews
   */
  async getMovieReviews(movieId: number, page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    return this.makeRequest<ReviewsResponse>('/review', {
      movieId,
      page,
      limit,
      sortField: 'date',
      sortType: '-1'
    });
  }
  
  /**
   * Get popular movies by category
   */
  async getPopularMoviesByCategory(
    category: 'movies' | 'series' | 'anime',
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    const typeMap = {
      movies: 'movie',
      series: 'tv-series',
      anime: 'anime'
    };

    return this.makeRequest<SearchResponse>('/movie', {
      page,
      limit,
      type: typeMap[category],
      sortField: 'rating.kp',
      sortType: '-1',
      'rating.kp': '7-10',
      'votes.kp': '10000-6666666'
    });
  }
  
  /**
   * Get images for a specific movie
   */
  async getMovieImages(
    movieId: number,
    type?: ImageType,
    page: number = 1,
    limit: number = 20
  ): Promise<ImagesResponse> {
    const params: Record<string, any> = {
      movieId,
      page,
      limit
    };
    
    if (type) {
      params.type = type;
    }
    
    return this.makeRequest<ImagesResponse>('/image', params);
  }
  
  /**
   * Get posters for a specific movie
   */
  async getMoviePosters(movieId: number, page: number = 1, limit: number = 10): Promise<ImagesResponse> {
    return this.getMovieImages(movieId, 'cover', page, limit);
  }
  
  /**
   * Get screenshots for a specific movie
   */
  async getMovieScreenshots(movieId: number, page: number = 1, limit: number = 10): Promise<ImagesResponse> {
    return this.getMovieImages(movieId, 'screenshot', page, limit);
  }
  
  /**
   * Get backdrops for a specific movie
   */
  async getMovieBackdrops(movieId: number, page: number = 1, limit: number = 10): Promise<ImagesResponse> {
    return this.getMovieImages(movieId, 'backdrops', page, limit);
  }
  
  /**
   * Get frames for a specific movie
   */
  async getMovieFrames(movieId: number, page: number = 1, limit: number = 10): Promise<ImagesResponse> {
    return this.getMovieImages(movieId, 'frame', page, limit);
  }
}