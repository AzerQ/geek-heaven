/**
 * Kinopoisk Unofficial Provider
 * Implementation for https://kinopoiskapiunofficial.tech/ API
 */

import { BaseKinopoiskProvider } from './base-provider';
import type {
  ProviderType,
  ProviderConfig,
  ValidationResult,
  SearchParams,
  Movie,
  SearchResponse,
  Review,
  ReviewsResponse,
  MovieImage,
  ImagesResponse
} from './types';
import type {
  UnofficialFilmResponse,
  UnofficialSearchResponse,
  UnofficialFiltersResponse,
  UnofficialImageResponse,
  UnofficialFramesResponse,
  UnofficialReviewResponse,
  UnofficialTopResponse,
  UnofficialImageType
} from './types-unofficial';
import {
  mapUnofficialFilmToMovie,
  mapUnofficialSearchToSearchResponse,
  mapUnofficialFiltersToSearchResponse,
  mapUnofficialReviewsToReviewsResponse,
  mapUnofficialImagesToImagesResponse
} from './types-unofficial';

export class KinopoiskUnofficialProvider extends BaseKinopoiskProvider {
  private readonly baseUrl = 'https://kinopoiskapiunofficial.tech/api';
  
  constructor(config?: ProviderConfig) {
    super(ProviderType.UNOFFICIAL, config);
  }

  /**
   * Validate API key format for unofficial API
   */
  protected validateApiKeyFormat(apiKey: string): boolean {
    // Unofficial API keys are typically UUID format or similar
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const simpleKeyRegex = /^[a-zA-Z0-9]{20,}$/; // At least 20 alphanumeric characters
    
    return uuidRegex.test(apiKey) || simpleKeyRegex.test(apiKey);
  }

  /**
   * Make HTTP request to unofficial API
   */
  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    this.checkConfiguration();
    
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-KEY': this.config!.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw this.createError('AUTHENTICATION_ERROR', 'Invalid API key');
        }
        if (response.status === 429) {
          throw this.createError('RATE_LIMIT_ERROR', 'Rate limit exceeded');
        }
        if (response.status >= 500) {
          throw this.createError('SERVER_ERROR', `Server error: ${response.status}`);
        }
        throw this.createError('API_ERROR', `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'ProviderError') {
        throw error;
      }
      throw this.handleNetworkError(error);
    }
  }

  /**
   * Validate API key by making a test request
   */
  async validateApiKey(apiKey: string): Promise<ValidationResult> {
    if (!this.validateApiKeyFormat(apiKey)) {
      return {
        isValid: false,
        error: 'Invalid API key format. Expected UUID or alphanumeric string (20+ characters)'
      };
    }

    try {
      // Test with a simple request to get a popular film
      const testUrl = `${this.baseUrl}/v2.2/films/top`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { isValid: true };
      } else if (response.status === 401) {
        return {
          isValid: false,
          error: 'Invalid API key'
        };
      } else {
        return {
          isValid: false,
          error: `API validation failed: ${response.status}`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: `Network error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Search movies by keyword
   */
  async searchMovies(query: string, params?: SearchParams): Promise<SearchResponse> {
    const page = params?.page || 1;
    
    const response = await this.makeRequest<UnofficialSearchResponse>('/v2.1/films/search-by-keyword', {
      keyword: query,
      page: page
    });

    return mapUnofficialSearchToSearchResponse(response, page, 20);
  }

  /**
   * Get movie by ID
   */
  async getMovieById(id: number): Promise<Movie> {
    const response = await this.makeRequest<UnofficialFilmResponse>(`/v2.2/films/${id}`);
    return mapUnofficialFilmToMovie(response);
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(params?: SearchParams): Promise<SearchResponse> {
    const page = params?.page || 1;
    
    const response = await this.makeRequest<UnofficialTopResponse>('/v2.2/films/top', {
      type: 'TOP_100_POPULAR_FILMS',
      page: page
    });

    const movies = response.films.map(film => ({
      id: film.filmId,
      name: film.nameRu || film.nameEn || '',
      alternativeName: film.nameEn,
      enName: film.nameEn,
      type: 'movie' as const,
      year: parseInt(film.year),
      description: '',
      shortDescription: '',
      rating: {
        kp: parseFloat(film.rating) || undefined
      },
      votes: {
        kp: film.ratingVoteCount
      },
      movieLength: parseInt(film.filmLength) || undefined,
      genres: film.genres.map(g => ({ name: g.genre })),
      countries: film.countries.map(c => ({ name: c.country })),
      poster: {
        url: film.posterUrl,
        previewUrl: film.posterUrlPreview
      }
    }));

    return {
      docs: movies,
      total: response.pagesCount * 20, // Estimate total
      limit: 20,
      page: page,
      pages: response.pagesCount
    };
  }

  /**
   * Get new movies
   */
  async getNewMovies(params?: SearchParams): Promise<SearchResponse> {
    const page = params?.page || 1;
    
    const response = await this.makeRequest<UnofficialTopResponse>('/v2.2/films/top', {
      type: 'TOP_AWAIT_FILMS',
      page: page
    });

    const movies = response.films.map(film => ({
      id: film.filmId,
      name: film.nameRu || film.nameEn || '',
      alternativeName: film.nameEn,
      enName: film.nameEn,
      type: 'movie' as const,
      year: parseInt(film.year),
      description: '',
      shortDescription: '',
      rating: {
        kp: parseFloat(film.rating) || undefined
      },
      votes: {
        kp: film.ratingVoteCount
      },
      movieLength: parseInt(film.filmLength) || undefined,
      genres: film.genres.map(g => ({ name: g.genre })),
      countries: film.countries.map(c => ({ name: c.country })),
      poster: {
        url: film.posterUrl,
        previewUrl: film.posterUrlPreview
      }
    }));

    return {
      docs: movies,
      total: response.pagesCount * 20,
      limit: 20,
      page: page,
      pages: response.pagesCount
    };
  }

  /**
   * Filter movies by genre and type
   */
  async getMoviesByGenreAndType(genre?: string, type?: string, params?: SearchParams): Promise<SearchResponse> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    const filterParams: Record<string, any> = {
      page: page
    };

    if (genre) {
      filterParams.genres = genre;
    }
    
    if (type) {
      const typeMap: Record<string, string> = {
        'movie': 'FILM',
        'tv-series': 'TV_SERIES',
        'cartoon': 'FILM',
        'anime': 'FILM'
      };
      filterParams.type = typeMap[type] || 'FILM';
    }

    const response = await this.makeRequest<UnofficialFiltersResponse>('/v2.2/films', filterParams);
    return mapUnofficialFiltersToSearchResponse(response, page, limit);
  }

  /**
   * Get random movie
   */
  async getRandomMovie(): Promise<Movie> {
    // Get a random page from popular movies and pick a random movie
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const response = await this.getPopularMovies({ page: randomPage });
    
    if (response.docs.length === 0) {
      throw this.createError('NOT_FOUND_ERROR', 'No movies found');
    }
    
    const randomIndex = Math.floor(Math.random() * response.docs.length);
    const randomMovie = response.docs[randomIndex];
    
    // Get full movie details
    return this.getMovieById(randomMovie.id);
  }

  /**
   * Get movie reviews
   */
  async getMovieReviews(movieId: number, params?: SearchParams): Promise<ReviewsResponse> {
    const page = params?.page || 1;
    
    // Note: Unofficial API doesn't have reviews endpoint in the documented version
    // This is a placeholder implementation
    return {
      docs: [],
      total: 0,
      limit: 10,
      page: page,
      pages: 0
    };
  }

  /**
   * Get movie posters
   */
  async getMoviePosters(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    const response = await this.makeRequest<UnofficialImageResponse>(`/v2.2/films/${movieId}/images`, {
      type: 'POSTER',
      page: page
    });

    return mapUnofficialImagesToImagesResponse(response, movieId, 'POSTER', page, limit);
  }

  /**
   * Get movie screenshots
   */
  async getMovieScreenshots(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    const response = await this.makeRequest<UnofficialImageResponse>(`/v2.2/films/${movieId}/images`, {
      type: 'SCREENSHOT',
      page: page
    });

    return mapUnofficialImagesToImagesResponse(response, movieId, 'SCREENSHOT', page, limit);
  }

  /**
   * Get movie backdrops
   */
  async getMovieBackdrops(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    const response = await this.makeRequest<UnofficialImageResponse>(`/v2.2/films/${movieId}/images`, {
      type: 'WALLPAPER',
      page: page
    });

    return mapUnofficialImagesToImagesResponse(response, movieId, 'WALLPAPER', page, limit);
  }

  /**
   * Get movie frames
   */
  async getMovieFrames(movieId: number, params?: SearchParams): Promise<ImagesResponse> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    const response = await this.makeRequest<UnofficialFramesResponse>(`/v2.1/films/${movieId}/frames`);
    return mapUnofficialImagesToImagesResponse(response, movieId, 'STILL', page, limit);
  }
}