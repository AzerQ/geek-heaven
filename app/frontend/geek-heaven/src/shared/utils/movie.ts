/**
 * Utility functions for working with movie data
 */

import type { Movie } from '../services/kinopoisk';

/**
 * Get the best available poster URL from movie data
 */
export function getMoviePosterUrl(movie: Movie): string {
  // Handle different poster data structures
  if (movie.poster) {
    // If poster is an array
    if (Array.isArray(movie.poster) && movie.poster.length > 0) {
      return movie.poster[0].url || movie.poster[0].previewUrl || '/placeholder-poster.svg';
    }
    // If poster is an object with url property
    if (typeof movie.poster === 'object' && 'url' in movie.poster) {
      return (movie.poster as any).url || (movie.poster as any).previewUrl || '/placeholder-poster.svg';
    }
    // If poster is a direct string URL
    if (typeof movie.poster === 'string') {
      return movie.poster;
    }
  }
  return '/placeholder-poster.svg';
}

/**
 * Get the best available backdrop URL from movie data
 */
export function getMovieBackdropUrl(movie: Movie): string | null {
  if (movie.backdrop && movie.backdrop.length > 0) {
    return movie.backdrop[0].url || movie.backdrop[0].previewUrl || null;
  }
  return null;
}

/**
 * Format movie rating for display
 */
export function formatMovieRating(rating?: number): string {
  if (!rating) return 'N/A';
  return rating.toFixed(1);
}

/**
 * Get the primary rating for a movie (prioritize KP, then IMDB)
 */
export function getPrimaryRating(movie: Movie): number | undefined {
  return movie.rating.kp || movie.rating.imdb;
}

/**
 * Format movie duration
 */
export function formatMovieDuration(minutes?: number): string {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}ч ${remainingMinutes}м`;
  }
  return `${minutes}м`;
}

/**
 * Format movie genres
 */
export function formatMovieGenres(genres: Array<{ name: string }>): string {
  return genres.map(genre => genre.name).join(', ');
}

/**
 * Format movie countries
 */
export function formatMovieCountries(countries: Array<{ name: string }>): string {
  return countries.map(country => country.name).join(', ');
}

/**
 * Get movie type display name
 */
export function getMovieTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    'movie': 'Фильм',
    'tv-series': 'Сериал',
    'cartoon': 'Мультфильм',
    'anime': 'Аниме'
  };
  
  return typeMap[type] || type;
}

/**
 * Check if movie has high rating
 */
export function isHighRatedMovie(movie: Movie, threshold: number = 7.5): boolean {
  const rating = getPrimaryRating(movie);
  return rating ? rating >= threshold : false;
}

/**
 * Get movie year display
 */
export function getMovieYearDisplay(movie: Movie): string {
  return movie.year ? movie.year.toString() : 'Неизвестно';
}