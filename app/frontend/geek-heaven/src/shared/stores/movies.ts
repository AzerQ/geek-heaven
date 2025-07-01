/**
 * Movies store for managing movie data and user library
 */

import { writable, derived } from 'svelte/store';
import type { Movie } from '../services/kinopoisk';

// Browser detection without SvelteKit dependency
const browser = typeof window !== 'undefined';

export interface UserMovieData {
  id: number;
  status: 'want-to-watch' | 'watching' | 'watched' | 'dropped' | 'favorite';
  userRating?: number;
  dateAdded: string;
  dateWatched?: string;
  notes?: string;
  // Basic movie info for display in library
  movieInfo?: {
    name?: string;
    alternativeName?: string;
    year?: number;
    poster?: any;
    rating?: {
      kp?: number;
      imdb?: number;
    };
    type?: string;
    movieLength?: number;
  };
}

export interface MoviesState {
  popular: Movie[];
  new: Movie[];
  searchResults: Movie[];
  currentMovie: Movie | null;
  loading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  popular: [],
  new: [],
  searchResults: [],
  currentMovie: null,
  loading: false,
  error: null
};

// Load user library from localStorage
function loadUserLibrary(): UserMovieData[] {
  if (!browser) return [];
  
  try {
    const stored = localStorage.getItem('geek-heaven-library');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load user library:', error);
    return [];
  }
}

// Save user library to localStorage
function saveUserLibrary(library: UserMovieData[]): void {
  if (!browser) return;
  
  try {
    localStorage.setItem('geek-heaven-library', JSON.stringify(library));
  } catch (error) {
    console.error('Failed to save user library:', error);
  }
}

// Movies store
function createMoviesStore() {
  const { subscribe, set, update } = writable<MoviesState>(initialState);

  return {
    subscribe,
    setLoading: (loading: boolean) => {
      update(state => ({ ...state, loading }));
    },
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    setPopular: (movies: Movie[]) => {
      update(state => ({ ...state, popular: movies }));
    },
    setNew: (movies: Movie[]) => {
      update(state => ({ ...state, new: movies }));
    },
    setSearchResults: (movies: Movie[]) => {
      update(state => ({ ...state, searchResults: movies }));
    },
    setCurrentMovie: (movie: Movie | null) => {
      update(state => ({ ...state, currentMovie: movie }));
    },
    clearSearchResults: () => {
      update(state => ({ ...state, searchResults: [] }));
    },
    reset: () => {
      set(initialState);
    }
  };
}

// User library store
function createUserLibraryStore() {
  const { subscribe, set, update } = writable<UserMovieData[]>(loadUserLibrary());

  return {
    subscribe,
    addMovie: (movie: Movie, status: UserMovieData['status'], userRating?: number) => {
      update(library => {
        const existingIndex = library.findIndex(item => item.id === movie.id);
        const newItem: UserMovieData = {
          id: movie.id,
          status,
          userRating,
          dateAdded: new Date().toISOString(),
          dateWatched: status === 'watched' ? new Date().toISOString() : undefined,
          movieInfo: {
            name: movie.name,
            alternativeName: movie.alternativeName,
            year: movie.year,
            poster: movie.poster,
            rating: movie.rating,
            type: movie.type,
            movieLength: movie.movieLength
          }
        };

        let newLibrary;
        if (existingIndex >= 0) {
          newLibrary = [...library];
          newLibrary[existingIndex] = { ...library[existingIndex], ...newItem };
        } else {
          newLibrary = [...library, newItem];
        }

        saveUserLibrary(newLibrary);
        return newLibrary;
      });
    },
    removeMovie: (movieId: number) => {
      update(library => {
        const newLibrary = library.filter(item => item.id !== movieId);
        saveUserLibrary(newLibrary);
        return newLibrary;
      });
    },
    updateMovieStatus: (movieId: number, status: UserMovieData['status']) => {
      update(library => {
        const newLibrary = library.map(item => {
          if (item.id === movieId) {
            return {
              ...item,
              status,
              dateWatched: status === 'watched' ? new Date().toISOString() : item.dateWatched
            };
          }
          return item;
        });
        saveUserLibrary(newLibrary);
        return newLibrary;
      });
    },
    updateMovieRating: (movieId: number, userRating: number) => {
      update(library => {
        const newLibrary = library.map(item => {
          if (item.id === movieId) {
            return { ...item, userRating };
          }
          return item;
        });
        saveUserLibrary(newLibrary);
        return newLibrary;
      });
    },
    updateMovieNotes: (movieId: number, notes: string) => {
      update(library => {
        const newLibrary = library.map(item => {
          if (item.id === movieId) {
            return { ...item, notes };
          }
          return item;
        });
        saveUserLibrary(newLibrary);
        return newLibrary;
      });
    },
    clear: () => {
      set([]);
      saveUserLibrary([]);
    }
  };
}

export const movies = createMoviesStore();
export const userLibrary = createUserLibraryStore();

// Helper function to convert UserMovieData to Movie object for display
function userMovieDataToMovie(userData: UserMovieData): Movie {
  return {
    id: userData.id,
    name: userData.movieInfo?.name || '',
    alternativeName: userData.movieInfo?.alternativeName || '',
    year: userData.movieInfo?.year || 0,
    poster: userData.movieInfo?.poster || null,
    rating: userData.movieInfo?.rating || { kp: 0, imdb: 0 },
    type: userData.movieInfo?.type || '',
    movieLength: userData.movieInfo?.movieLength || 0,
    // Default values for other required Movie properties
    description: '',
    shortDescription: '',
    genres: [],
    countries: [],
    persons: [],
    backdrop: null,
    videos: { trailers: [] },
    facts: [],
    seasonsInfo: [],
    sequelsAndPrequels: [],
    similarMovies: [],
    budget: null,
    fees: null,
    premiere: null,
    slogan: '',
    technology: null,
    watchability: null,
    releaseYears: [],
    top10: null,
    top250: null,
    typeNumber: 0,
    status: null,
    names: [],
    productionCompanies: [],
    spokenLanguages: [],
    updatedAt: '',
    createdAt: ''
  } as Movie;
}

// Derived stores for filtered library data
export const favoriteMovies = derived(
  userLibrary,
  $userLibrary => $userLibrary
    .filter(item => item.status === 'favorite')
    .map(userMovieDataToMovie)
);

export const watchedMovies = derived(
  userLibrary,
  $userLibrary => $userLibrary
    .filter(item => item.status === 'watched')
    .map(userMovieDataToMovie)
);

export const watchingMovies = derived(
  userLibrary,
  $userLibrary => $userLibrary
    .filter(item => item.status === 'watching')
    .map(userMovieDataToMovie)
);

export const wantToWatchMovies = derived(
  userLibrary,
  $userLibrary => $userLibrary
    .filter(item => item.status === 'want-to-watch')
    .map(userMovieDataToMovie)
);

// Derived store for all movies in library as Movie objects
export const allLibraryMovies = derived(
  userLibrary,
  $userLibrary => $userLibrary.map(userMovieDataToMovie)
);

// Helper functions
export function getMovieFromLibrary(movieId: number, library: UserMovieData[]): UserMovieData | undefined {
  return library.find(item => item.id === movieId);
}

export function isMovieInLibrary(movieId: number, library: UserMovieData[]): boolean {
  return library.some(item => item.id === movieId);
}

export function getMovieStatus(movieId: number, library: UserMovieData[]): UserMovieData['status'] | null {
  const movie = getMovieFromLibrary(movieId, library);
  return movie?.status || null;
}

export function getMovieUserRating(movieId: number, library: UserMovieData[]): number | undefined {
  const movie = getMovieFromLibrary(movieId, library);
  return movie?.userRating;
}