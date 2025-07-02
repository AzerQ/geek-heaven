/**
 * Types for Kinopoisk Unofficial API
 * Maps unofficial API responses to unified provider types
 */

/**
 * Unofficial API film response structure
 */
export interface UnofficialFilmResponse {
  kinopoiskId: number;
  nameRu?: string;
  nameEn?: string;
  nameOriginal?: string;
  year: number;
  filmLength?: number;
  slogan?: string;
  description?: string;
  shortDescription?: string;
  type: 'FILM' | 'TV_SERIES' | 'TV_SHOW' | 'MINI_SERIES';
  ratingKinopoisk?: number;
  ratingImdb?: number;
  ratingFilmCritics?: number;
  ratingAwait?: number;
  ratingRfCritics?: number;
  webUrl: string;
  posterUrl?: string;
  posterUrlPreview?: string;
  coverUrl?: string;
  logoUrl?: string;
  reviewsCount: number;
  ratingGoodReview?: number;
  ratingGoodReviewVoteCount?: number;
  ratingKinopoiskVoteCount?: number;
  ratingImdbVoteCount?: number;
  ratingFilmCriticsVoteCount?: number;
  ratingAwaitCount?: number;
  ratingRfCriticsVoteCount?: number;
  serial?: boolean;
  shortFilm?: boolean;
  completed?: boolean;
  hasImax?: boolean;
  has3D?: boolean;
  lastSync: string;
  countries: Array<{ country: string }>;
  genres: Array<{ genre: string }>;
  startYear?: number;
  endYear?: number;
  premiereRu?: string;
  premiereWorld?: string;
  premiereDigital?: string;
  premiereWorldCountry?: string;
  premiereDvd?: string;
  premiereBluRay?: string;
}

/**
 * Unofficial API search response
 */
export interface UnofficialSearchResponse {
  keyword: string;
  pagesCount: number;
  films: UnofficialFilmResponse[];
  searchFilmsCountResult: number;
}

/**
 * Unofficial API search by filters response
 */
export interface UnofficialFiltersResponse {
  total: number;
  totalPages: number;
  items: UnofficialFilmResponse[];
}

/**
 * Unofficial API image types
 */
export type UnofficialImageType = 
  | 'STILL' 
  | 'SHOOTING' 
  | 'POSTER' 
  | 'FAN_ART' 
  | 'PROMO' 
  | 'CONCEPT' 
  | 'WALLPAPER' 
  | 'COVER' 
  | 'SCREENSHOT';

/**
 * Unofficial API image response
 */
export interface UnofficialImageResponse {
  total: number;
  totalPages: number;
  items: Array<{
    imageUrl: string;
    previewUrl: string;
  }>;
}

/**
 * Unofficial API frames response
 */
export interface UnofficialFramesResponse {
  total: number;
  totalPages: number;
  items: Array<{
    image: string;
    preview: string;
  }>;
}

/**
 * Unofficial API review response
 */
export interface UnofficialReviewResponse {
  total: number;
  totalPages: number;
  totalPositiveReviews: number;
  totalNegativeReviews: number;
  totalNeutralReviews: number;
  items: Array<{
    kinopoiskId: number;
    type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN';
    date: string;
    positiveRating: number;
    negativeRating: number;
    author: string;
    title?: string;
    description: string;
  }>;
}

/**
 * Unofficial API seasons response
 */
export interface UnofficialSeasonsResponse {
  total: number;
  items: Array<{
    number: number;
    episodes: Array<{
      seasonNumber: number;
      episodeNumber: number;
      nameRu?: string;
      nameEn?: string;
      synopsis?: string;
      releaseDate?: string;
    }>;
  }>;
}

/**
 * Unofficial API top films response
 */
export interface UnofficialTopResponse {
  pagesCount: number;
  films: Array<{
    filmId: number;
    nameRu?: string;
    nameEn?: string;
    year: string;
    filmLength: string;
    countries: Array<{ country: string }>;
    genres: Array<{ genre: string }>;
    rating: string;
    ratingVoteCount: number;
    posterUrl: string;
    posterUrlPreview: string;
    ratingChange?: string;
  }>;
}

/**
 * Mapping functions from unofficial API to unified types
 */
import type { Movie, SearchResponse, Review, ReviewsResponse, MovieImage, ImagesResponse } from './types';

/**
 * Map unofficial film to unified movie type
 */
export function mapUnofficialFilmToMovie(film: UnofficialFilmResponse): Movie {
  const typeMap: Record<string, 'movie' | 'tv-series' | 'cartoon' | 'anime'> = {
    'FILM': 'movie',
    'TV_SERIES': 'tv-series',
    'TV_SHOW': 'tv-series',
    'MINI_SERIES': 'tv-series'
  };

  return {
    id: film.kinopoiskId,
    name: film.nameRu || film.nameOriginal || film.nameEn || '',
    alternativeName: film.nameEn,
    enName: film.nameEn,
    type: typeMap[film.type] || 'movie',
    year: film.year,
    description: film.description,
    shortDescription: film.shortDescription,
    rating: {
      kp: film.ratingKinopoisk,
      imdb: film.ratingImdb,
      filmCritics: film.ratingFilmCritics,
      await: film.ratingAwait
    },
    votes: {
      kp: film.ratingKinopoiskVoteCount,
      imdb: film.ratingImdbVoteCount,
      filmCritics: film.ratingFilmCriticsVoteCount,
      await: film.ratingAwaitCount
    },
    movieLength: film.filmLength,
    genres: film.genres.map(g => ({ name: g.genre })),
    countries: film.countries.map(c => ({ name: c.country })),
    poster: {
      url: film.posterUrl,
      previewUrl: film.posterUrlPreview
    },
    premiere: {
      world: film.premiereWorld,
      russia: film.premiereRu
    }
  };
}

/**
 * Map unofficial search response to unified search response
 */
export function mapUnofficialSearchToSearchResponse(response: UnofficialSearchResponse, page: number = 1, limit: number = 20): SearchResponse {
  return {
    docs: response.films.map(mapUnofficialFilmToMovie),
    total: response.searchFilmsCountResult,
    limit: limit,
    page: page,
    pages: response.pagesCount
  };
}

/**
 * Map unofficial filters response to unified search response
 */
export function mapUnofficialFiltersToSearchResponse(response: UnofficialFiltersResponse, page: number = 1, limit: number = 20): SearchResponse {
  return {
    docs: response.items.map(mapUnofficialFilmToMovie),
    total: response.total,
    limit: limit,
    page: page,
    pages: response.totalPages
  };
}

/**
 * Map unofficial review to unified review type
 */
export function mapUnofficialReviewToReview(review: any, movieId: number): Review {
  const typeMap: Record<string, 'Позитивный' | 'Негативный' | 'Нейтральный'> = {
    'POSITIVE': 'Позитивный',
    'NEGATIVE': 'Негативный',
    'NEUTRAL': 'Нейтральный',
    'UNKNOWN': 'Нейтральный'
  };

  return {
    id: `${movieId}_${review.author}_${review.date}`,
    movieId: movieId,
    title: review.title,
    type: typeMap[review.type] || 'Нейтральный',
    review: review.description,
    date: review.date,
    author: review.author,
    reviewLikes: review.positiveRating || 0,
    reviewDislikes: review.negativeRating || 0
  };
}

/**
 * Map unofficial reviews response to unified reviews response
 */
export function mapUnofficialReviewsToReviewsResponse(response: UnofficialReviewResponse, movieId: number, page: number = 1, limit: number = 10): ReviewsResponse {
  return {
    docs: response.items.map(review => mapUnofficialReviewToReview(review, movieId)),
    total: response.total,
    limit: limit,
    page: page,
    pages: response.totalPages
  };
}

/**
 * Map unofficial image to unified movie image type
 */
export function mapUnofficialImageToMovieImage(image: any, movieId: number, type: string): MovieImage {
  const typeMap: Record<string, 'cover' | 'backdrops' | 'screenshot' | 'frame'> = {
    'POSTER': 'cover',
    'COVER': 'cover',
    'WALLPAPER': 'backdrops',
    'FAN_ART': 'backdrops',
    'SCREENSHOT': 'screenshot',
    'STILL': 'frame',
    'SHOOTING': 'frame',
    'PROMO': 'frame',
    'CONCEPT': 'frame'
  };

  return {
    movieId: movieId,
    type: typeMap[type] || 'frame',
    url: image.imageUrl || image.image,
    previewUrl: image.previewUrl || image.preview
  };
}

/**
 * Map unofficial images response to unified images response
 */
export function mapUnofficialImagesToImagesResponse(
  response: UnofficialImageResponse | UnofficialFramesResponse, 
  movieId: number, 
  type: string, 
  page: number = 1, 
  limit: number = 20
): ImagesResponse {
  return {
    docs: response.items.map(image => mapUnofficialImageToMovieImage(image, movieId, type)),
    total: response.total,
    limit: limit,
    page: page,
    pages: response.totalPages
  };
}