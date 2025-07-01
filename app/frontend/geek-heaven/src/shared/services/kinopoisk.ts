/**
 * Kinopoisk API service
 * Handles all interactions with Kinopoisk API
 */

export interface Review {
  reviewDislikes: number;
  reviewLikes: number;
  id: string;
  movieId: number;
  title?: string;
  type: 'Позитивный' | 'Негативный' | 'Нейтральный';
  review?: string;
  date?: string;
  author?: string;
  userRating?: number;
}

export interface ReviewsResponse {
  docs: Review[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

export interface Movie {
  id: number;
  name: string;
  alternativeName?: string;
  enName?: string;
  type: 'movie' | 'tv-series' | 'cartoon' | 'anime';
  year: number;
  description?: string;
  shortDescription?: string;
  rating: {
    kp?: number;
    imdb?: number;
    filmCritics?: number;
    russianFilmCritics?: number;
    await?: number;
  };
  votes: {
    kp?: number;
    imdb?: number;
    filmCritics?: number;
    russianFilmCritics?: number;
    await?: number;
  };
  movieLength?: number;
  seriesLength?: number;
  totalSeriesLength?: number;
  genres: Array<{ name: string }>;
  countries: Array<{ name: string }>;
  poster: Array<{
    url?: string;
    previewUrl?: string;
  }> | {
    url?: string;
    previewUrl?: string;
  } | string;
  backdrop?: Array<{
    url?: string;
    previewUrl?: string;
  }>;
  persons?: Array<{
    id: number;
    name: string;
    enName?: string;
    profession: string;
    photo?: string;
  }>;
  seasonsInfo?: Array<{
    number: number;
    episodesCount: number;
  }>;
  status?: string;
  premiere?: {
    world?: string;
    russia?: string;
  };
  reviews?: Review[];
}

export interface SearchResponse {
  docs: Movie[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

class KinopoiskService {
  private baseUrl = 'https://api.kinopoisk.dev/v1.4';
  private apiKey: string = '';

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('API ключ не настроен. Перейдите в настройки и добавьте ключ Kinopoisk API.');
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
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Неизвестная ошибка при запросе к API');
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
  async getPopularMoviesByCategory(category: 'movies' | 'series' | 'anime', page: number = 1, limit: number = 20): Promise<SearchResponse> {
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
   * Validate API key
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    const tempKey = this.apiKey;
    this.apiKey = apiKey;
    
    try {
      await this.makeRequest('/movie', { limit: 1 });
      return true;
    } catch (error) {
      return false;
    } finally {
      this.apiKey = tempKey;
    }
  }
}

export const kinopoiskService = new KinopoiskService();