# Kinopoisk API Unofficial - Примеры использования для React + TypeScript

Этот документ содержит подробные инструкции и примеры кода для работы с Kinopoisk API Unofficial в React + TypeScript приложении.

## Получение API ключа

1. Перейдите на [RapidAPI](https://rapidapi.com/)
2. Зарегистрируйтесь или войдите в аккаунт
3. Найдите "Kinopoisk API Unofficial"
4. Подпишитесь на план (есть бесплатный тариф)
5. Скопируйте ваш API ключ из раздела "Headers"

**Важно**: В нашем приложении пользователь вводит API ключ самостоятельно через интерфейс настройки, и ключ сохраняется в LocalStorage.

## TypeScript типы для API

```typescript
// types/api.ts
export interface Movie {
  kinopoiskId: number;
  imdbId?: string;
  nameRu?: string;
  nameEn?: string;
  nameOriginal?: string;
  countries: Country[];
  genres: Genre[];
  ratingKinopoisk?: number;
  ratingImdb?: number;
  year?: number;
  type: 'FILM' | 'TV_SERIES' | 'TV_SHOW' | 'MINI_SERIES';
  filmLength?: number;
  description?: string;
  shortDescription?: string;
  slogan?: string;
  posterUrl: string;
  posterUrlPreview: string;
  coverUrl?: string;
  logoUrl?: string;
  reviewsCount?: number;
  ratingGoodReview?: number;
  ratingGoodReviewVoteCount?: number;
  ratingKinopoiskVoteCount?: number;
  ratingImdbVoteCount?: number;
  newsCount?: number;
  hasImax?: boolean;
  has3D?: boolean;
  lastSync?: string;
}

export interface Country {
  id: number;
  country: string;
}

export interface Genre {
  id: number;
  genre: string;
}

export interface SearchResponse {
  keyword: string;
  pagesCount: number;
  films: Movie[];
  searchFilmsCountResult: number;
}

export interface TopMoviesResponse {
  pagesCount: number;
  films: Movie[];
}

export interface ApiError {
  message: string;
  type: string;
}
```

## Базовая настройка API сервиса

```typescript
// services/api.ts
const API_BASE_URL = 'https://kinopoiskapiunofficial.tech/api';

class KinopoiskAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Поиск фильмов по ключевому слову
  async searchByKeyword(keyword: string, page: number = 1): Promise<SearchResponse> {
    const endpoint = `/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(keyword)}&page=${page}`;
    return this.makeRequest<SearchResponse>(endpoint);
  }

  // Получение детальной информации о фильме
  async getMovieDetails(id: number): Promise<Movie> {
    const endpoint = `/v2.2/films/${id}`;
    return this.makeRequest<Movie>(endpoint);
  }

  // Получение топ фильмов
  async getTopMovies(type: 'TOP_100_POPULAR_FILMS' | 'TOP_250_BEST_FILMS' = 'TOP_100_POPULAR_FILMS', page: number = 1): Promise<TopMoviesResponse> {
    const endpoint = `/v2.2/films/top?type=${type}&page=${page}`;
    return this.makeRequest<TopMoviesResponse>(endpoint);
  }

  // Поиск с фильтрами
  async getFilteredMovies(filters: {
    countries?: number[];
    genres?: number[];
    order?: 'RATING' | 'NUM_VOTE' | 'YEAR';
    type?: 'ALL' | 'FILM' | 'TV_SHOW';
    ratingFrom?: number;
    ratingTo?: number;
    yearFrom?: number;
    yearTo?: number;
    page?: number;
  }): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    if (filters.countries?.length) {
      params.append('countries', filters.countries.join(','));
    }
    if (filters.genres?.length) {
      params.append('genres', filters.genres.join(','));
    }
    if (filters.order) params.append('order', filters.order);
    if (filters.type) params.append('type', filters.type);
    if (filters.ratingFrom) params.append('ratingFrom', filters.ratingFrom.toString());
    if (filters.ratingTo) params.append('ratingTo', filters.ratingTo.toString());
    if (filters.yearFrom) params.append('yearFrom', filters.yearFrom.toString());
    if (filters.yearTo) params.append('yearTo', filters.yearTo.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const endpoint = `/v2.2/films?${params.toString()}`;
    return this.makeRequest<SearchResponse>(endpoint);
  }

  // Получение списка жанров и стран
  async getFilters(): Promise<{ genres: Genre[]; countries: Country[] }> {
    const endpoint = '/v2.2/films/filters';
    return this.makeRequest<{ genres: Genre[]; countries: Country[] }>(endpoint);
  }

  // Валидация API ключа
  async validateApiKey(): Promise<boolean> {
    try {
      await this.getTopMovies('TOP_100_POPULAR_FILMS', 1);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Базовая функция для выполнения запросов
async function apiRequest(endpoint, params = {}) {
  const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
  
  // Добавляем параметры к URL
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: API_CONFIG.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

## Основные функции API

### 1. Поиск фильмов по ключевому слову

```javascript
/**
 * Поиск фильмов по названию
 * @param {string} keyword - Ключевое слово для поиска
 * @param {number} page - Номер страницы (по умолчанию 1)
 * @returns {Promise<Object>} Результаты поиска
 */
async function searchMoviesByKeyword(keyword, page = 1) {
  const endpoint = '/v2.1/films/search-by-keyword';
  const params = {
    keyword: keyword,
    page: page
  };
  
  return await apiRequest(endpoint, params);
}

// Пример использования
searchMoviesByKeyword('Матрица', 1)
  .then(data => {
    console.log('Найдено фильмов:', data.searchFilmsCountResult);
    console.log('Фильмы:', data.films);
  })
  .catch(error => {
    console.error('Ошибка поиска:', error);
  });
```

**Пример ответа:**
```json
{
  "keyword": "Матрица",
  "pagesCount": 1,
  "searchFilmsCountResult": 3,
  "films": [
    {
      "filmId": 301,
      "nameRu": "Матрица",
      "nameEn": "The Matrix",
      "type": "FILM",
      "year": "1999",
      "description": "Жизнь Томаса Андерсона разделена на две части...",
      "filmLength": "2:16",
      "countries": [{"country": "США"}],
      "genres": [{"genre": "фантастика"}, {"genre": "боевик"}],
      "rating": "8.5",
      "ratingVoteCount": 524108,
      "posterUrl": "https://kinopoiskapiunofficial.tech/images/posters/kp/301.jpg",
      "posterUrlPreview": "https://kinopoiskapiunofficial.tech/images/posters/kp_small/301.jpg"
    }
  ]
}
```

### 2. Получение детальной информации о фильме

```javascript
/**
 * Получение подробной информации о фильме
 * @param {number} filmId - ID фильма в Кинопоиске
 * @returns {Promise<Object>} Детальная информация о фильме
 */
async function getMovieDetails(filmId) {
  const endpoint = `/v2.2/films/${filmId}`;
  return await apiRequest(endpoint);
}

// Пример использования
getMovieDetails(301)
  .then(movie => {
    console.log('Название:', movie.nameRu);
    console.log('Год:', movie.year);
    console.log('Рейтинг:', movie.ratingKinopoisk);
    console.log('Описание:', movie.description);
  })
  .catch(error => {
    console.error('Ошибка получения деталей:', error);
  });
```

**Пример ответа:**
```json
{
  "kinopoiskId": 301,
  "nameRu": "Матрица",
  "nameEn": "The Matrix",
  "nameOriginal": "The Matrix",
  "posterUrl": "https://kinopoiskapiunofficial.tech/images/posters/kp/301.jpg",
  "posterUrlPreview": "https://kinopoiskapiunofficial.tech/images/posters/kp_small/301.jpg",
  "coverUrl": "https://kinopoiskapiunofficial.tech/images/covers/301.jpg",
  "logoUrl": "https://kinopoiskapiunofficial.tech/images/logos/301.png",
  "reviewsCount": 293,
  "ratingGoodReview": 88.1,
  "ratingGoodReviewVoteCount": 257,
  "ratingKinopoisk": 8.5,
  "ratingKinopoiskVoteCount": 524108,
  "ratingImdb": 8.7,
  "ratingImdbVoteCount": 1635992,
  "ratingFilmCritics": 7.2,
  "ratingFilmCriticsVoteCount": 131,
  "ratingAwait": null,
  "ratingAwaitCount": 0,
  "ratingRfCritics": null,
  "ratingRfCriticsVoteCount": 0,
  "webUrl": "https://www.kinopoisk.ru/film/301/",
  "year": 1999,
  "filmLength": 136,
  "slogan": "Добро пожаловать в реальный мир",
  "description": "Жизнь Томаса Андерсона разделена на две части...",
  "shortDescription": "Хакер Нео узнает, что его мир — виртуальная реальность...",
  "editorAnnotation": null,
  "isTicketsAvailable": false,
  "productionStatus": null,
  "type": "FILM",
  "ratingMpaa": "r",
  "ratingAgeLimits": "age16",
  "hasImax": false,
  "has3D": false,
  "lastSync": "2021-07-29T20:07:49.109817",
  "countries": [{"country": "США"}],
  "genres": [{"genre": "фантастика"}, {"genre": "боевик"}],
  "startYear": null,
  "endYear": null,
  "serial": false,
  "shortFilm": false,
  "completed": false
}
```

### 3. Получение топ фильмов

```javascript
/**
 * Получение топ фильмов
 * @param {string} type - Тип топа (TOP_100_POPULAR_FILMS, TOP_250_BEST_FILMS, TOP_AWAIT_FILMS)
 * @param {number} page - Номер страницы
 * @returns {Promise<Object>} Список топ фильмов
 */
async function getTopMovies(type = 'TOP_100_POPULAR_FILMS', page = 1) {
  const endpoint = '/v2.2/films/top';
  const params = {
    type: type,
    page: page
  };
  
  return await apiRequest(endpoint, params);
}

// Примеры использования
// Топ 100 популярных фильмов
getTopMovies('TOP_100_POPULAR_FILMS')
  .then(data => {
    console.log('Популярные фильмы:', data.films);
  });

// Топ 250 лучших фильмов
getTopMovies('TOP_250_BEST_FILMS')
  .then(data => {
    console.log('Лучшие фильмы:', data.films);
  });

// Самые ожидаемые фильмы
getTopMovies('TOP_AWAIT_FILMS')
  .then(data => {
    console.log('Ожидаемые фильмы:', data.films);
  });
```

### 4. Фильтрация фильмов

```javascript
/**
 * Поиск фильмов с фильтрами
 * @param {Object} filters - Объект с параметрами фильтрации
 * @returns {Promise<Object>} Отфильтрованные фильмы
 */
async function getFilteredMovies(filters = {}) {
  const endpoint = '/v2.2/films';
  const defaultFilters = {
    order: 'RATING', // RATING, NUM_VOTE, YEAR
    type: 'ALL', // ALL, FILM, TV_SERIES
    ratingFrom: 0,
    ratingTo: 10,
    yearFrom: 1000,
    yearTo: 3000,
    page: 1
  };
  
  const params = { ...defaultFilters, ...filters };
  return await apiRequest(endpoint, params);
}

// Примеры использования
// Фильмы с высоким рейтингом
getFilteredMovies({
  ratingFrom: 8,
  ratingTo: 10,
  order: 'RATING'
})
.then(data => {
  console.log('Высокорейтинговые фильмы:', data.items);
});

// Фильмы определенного жанра и года
getFilteredMovies({
  genres: 1, // ID жанра (1 - триллер)
  yearFrom: 2020,
  yearTo: 2023,
  order: 'YEAR'
})
.then(data => {
  console.log('Триллеры 2020-2023:', data.items);
});

// Только сериалы
getFilteredMovies({
  type: 'TV_SERIES',
  ratingFrom: 7,
  order: 'RATING'
})
.then(data => {
  console.log('Хорошие сериалы:', data.items);
});
```

### 5. Получение списка жанров и стран

```javascript
/**
 * Получение доступных фильтров (жанры, страны)
 * @returns {Promise<Object>} Список жанров и стран
 */
async function getFilters() {
  const endpoint = '/v2.2/films/filters';
  return await apiRequest(endpoint);
}

// Пример использования
getFilters()
  .then(data => {
    console.log('Доступные жанры:', data.genres);
    console.log('Доступные страны:', data.countries);
    
    // Сохраняем для использования в фильтрах
    localStorage.setItem('movieGenres', JSON.stringify(data.genres));
    localStorage.setItem('movieCountries', JSON.stringify(data.countries));
  })
  .catch(error => {
    console.error('Ошибка получения фильтров:', error);
  });
```

**Пример ответа:**
```json
{
  "genres": [
    {"id": 1, "genre": "триллер"},
    {"id": 2, "genre": "драма"},
    {"id": 3, "genre": "криминал"},
    {"id": 4, "genre": "мелодрама"},
    {"id": 5, "genre": "детектив"}
  ],
  "countries": [
    {"id": 1, "country": "США"},
    {"id": 2, "country": "Франция"},
    {"id": 3, "country": "Великобритания"},
    {"id": 34, "country": "Россия"}
  ]
}
```

## Полный пример модуля API

```javascript
// api.js - Модуль для работы с Kinopoisk API
class KinopoiskAPI {
  constructor(apiKey) {
    this.baseUrl = 'https://kinopoiskapiunofficial.tech/api';
    this.apiKey = apiKey;
    this.headers = {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Выполнение HTTP запроса к API
   * @param {string} endpoint - Конечная точка API
   * @param {Object} params - Параметры запроса
   * @returns {Promise<Object>} Ответ от API
   */
  async request(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Поиск фильмов по ключевому слову
   */
  async searchByKeyword(keyword, page = 1) {
    return await this.request('/v2.1/films/search-by-keyword', {
      keyword,
      page
    });
  }

  /**
   * Получение деталей фильма
   */
  async getMovieDetails(filmId) {
    return await this.request(`/v2.2/films/${filmId}`);
  }

  /**
   * Получение топ фильмов
   */
  async getTopMovies(type = 'TOP_100_POPULAR_FILMS', page = 1) {
    return await this.request('/v2.2/films/top', { type, page });
  }

  /**
   * Фильтрация фильмов
   */
  async getFilteredMovies(filters = {}) {
    return await this.request('/v2.2/films', filters);
  }

  /**
   * Получение списка жанров и стран
   */
  async getFilters() {
    return await this.request('/v2.2/films/filters');
  }

  /**
   * Получение актеров и создателей фильма
   */
  async getMovieStaff(filmId) {
    return await this.request('/v1/staff', { filmId });
  }

  /**
   * Получение изображений к фильму
   */
  async getMovieImages(filmId, type = 'STILL', page = 1) {
    return await this.request('/v2.2/films/{id}/images', {
      id: filmId,
      type, // STILL, SHOOTING, POSTER, FAN_ART, PROMO, CONCEPT, WALLPAPER, COVER, SCREENSHOT
      page
    });
  }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KinopoiskAPI;
} else {
  window.KinopoiskAPI = KinopoiskAPI;
}
```

## Использование в приложении

```javascript
// Инициализация API
const api = new KinopoiskAPI('YOUR_API_KEY_HERE');

// Пример поиска и отображения результатов
async function searchAndDisplayMovies(query) {
  try {
    const searchResults = await api.searchByKeyword(query);
    
    if (searchResults.films && searchResults.films.length > 0) {
      displayMovies(searchResults.films);
    } else {
      showMessage('Фильмы не найдены');
    }
  } catch (error) {
    showError('Ошибка поиска: ' + error.message);
  }
}

// Функция отображения фильмов
function displayMovies(movies) {
  const container = document.getElementById('movies-container');
  container.innerHTML = '';
  
  movies.forEach(movie => {
    const movieCard = createMovieCard(movie);
    container.appendChild(movieCard);
  });
}

// Создание карточки фильма
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <img src="${movie.posterUrlPreview}" alt="${movie.nameRu}" class="movie-poster">
    <h3 class="movie-title">${movie.nameRu || movie.nameEn}</h3>
    <p class="movie-year">${movie.year}</p>
    <p class="movie-rating">★ ${movie.rating}</p>
    <button onclick="showMovieDetails(${movie.filmId})" class="details-btn">
      Подробнее
    </button>
  `;
  return card;
}

// Показ деталей фильма
async function showMovieDetails(filmId) {
  try {
    const movie = await api.getMovieDetails(filmId);
    displayMovieDetails(movie);
  } catch (error) {
    showError('Ошибка загрузки деталей: ' + error.message);
  }
}
```

## Обработка ошибок

```javascript
// Типы ошибок API
const API_ERRORS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500
};

// Обработчик ошибок
function handleApiError(error, response) {
  switch (response?.status) {
    case API_ERRORS.UNAUTHORIZED:
      return 'Неверный API ключ. Проверьте настройки.';
    case API_ERRORS.NOT_FOUND:
      return 'Запрашиваемый ресурс не найден.';
    case API_ERRORS.RATE_LIMIT:
      return 'Превышен лимит запросов. Попробуйте позже.';
    case API_ERRORS.SERVER_ERROR:
      return 'Ошибка сервера. Попробуйте позже.';
    default:
      return `Произошла ошибка: ${error.message}`;
  }
}

// Использование обработчика ошибок
async function safeApiCall(apiFunction, ...args) {
  try {
    return await apiFunction(...args);
  } catch (error) {
    const errorMessage = handleApiError(error, error.response);
    showError(errorMessage);
    throw error;
  }
}
```

## Кэширование запросов

```javascript
// Простой кэш для API запросов
class APICache {
  constructor(ttl = 300000) { // 5 минут по умолчанию
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Использование кэша в API классе
class CachedKinopoiskAPI extends KinopoiskAPI {
  constructor(apiKey) {
    super(apiKey);
    this.cache = new APICache();
  }

  async request(endpoint, params = {}) {
    const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
    
    // Проверяем кэш
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Выполняем запрос
    const result = await super.request(endpoint, params);
    
    // Сохраняем в кэш
    this.cache.set(cacheKey, result);
    
    return result;
  }
}
```

## Лимиты API

- **Бесплатный тариф**: 500 запросов в день
- **Платный тариф**: до 100,000 запросов в день
- **Рекомендации**:
  - Используйте кэширование для часто запрашиваемых данных
  - Реализуйте debounce для поиска
  - Показывайте пользователю количество оставшихся запросов
  - Предусмотрите fallback на локальные данные

## React хуки для работы с API

### useApi хук

```typescript
// hooks/useApi.ts
import { useState, useEffect, useContext } from 'react';
import { ApiContext } from '../contexts/ApiContext';
import KinopoiskAPI from '../services/api';
import type { SearchResponse, Movie } from '../types/api';

export function useApi() {
  const { apiKey } = useContext(ApiContext);
  const [api, setApi] = useState<KinopoiskAPI | null>(null);

  useEffect(() => {
    if (apiKey) {
      setApi(new KinopoiskAPI(apiKey));
    } else {
      setApi(null);
    }
  }, [apiKey]);

  return api;
}

// Хук для поиска с состоянием загрузки
export function useMovieSearch() {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const search = async (keyword: string, page: number = 1) => {
    if (!api) {
      setError('API не инициализирован');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.searchByKeyword(keyword, page);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  return { search, loading, error, results };
}

// Хук для получения деталей фильма
export function useMovieDetails(movieId: number | null) {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (!api || !movieId) return;

    const fetchMovie = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.getMovieDetails(movieId);
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки фильма');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [api, movieId]);

  return { movie, loading, error };
}
```

## Context для управления API ключом

```typescript
// contexts/ApiContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ApiContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isValidated: boolean;
  setIsValidated: (validated: boolean) => void;
}

export const ApiContext = createContext<ApiContextType>({
  apiKey: null,
  setApiKey: () => {},
  clearApiKey: () => {},
  isValidated: false,
  setIsValidated: () => {}
});

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  // Загрузка API ключа из LocalStorage при инициализации
  useEffect(() => {
    const savedKey = localStorage.getItem('kinopoisk_api_key');
    if (savedKey) {
      setApiKeyState(savedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('kinopoisk_api_key', key);
  };

  const clearApiKey = () => {
    setApiKeyState(null);
    setIsValidated(false);
    localStorage.removeItem('kinopoisk_api_key');
  };

  return (
    <ApiContext.Provider value={{
      apiKey,
      setApiKey,
      clearApiKey,
      isValidated,
      setIsValidated
    }}>
      {children}
    </ApiContext.Provider>
  );
}
```

## Примеры использования в React компонентах

### Компонент поиска фильмов

```typescript
// components/MovieSearch.tsx
import React, { useState } from 'react';
import { useMovieSearch } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import MovieCard from './MovieCard';

const MovieSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const { search, loading, error, results } = useMovieSearch();

  React.useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery);
    }
  }, [debouncedQuery, search]);

  return (
    <div className="movie-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск фильмов..."
        className="search-input"
      />
      
      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      
      {results && (
        <div className="search-results">
          <p>Найдено: {results.searchFilmsCountResult} фильмов</p>
          <div className="movies-grid">
            {results.films.map(movie => (
              <MovieCard key={movie.kinopoiskId} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieSearch;
```

### Компонент настройки API ключа

```typescript
// components/ApiKeySetup.tsx
import React, { useState, useContext } from 'react';
import { ApiContext } from '../contexts/ApiContext';
import KinopoiskAPI from '../services/api';

const ApiKeySetup: React.FC = () => {
  const { setApiKey, setIsValidated } = useContext(ApiContext);
  const [inputKey, setInputKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputKey.trim()) {
      setError('Введите API ключ');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const api = new KinopoiskAPI(inputKey);
      const isValid = await api.validateApiKey();
      
      if (isValid) {
        setApiKey(inputKey);
        setIsValidated(true);
      } else {
        setError('Неверный API ключ');
      }
    } catch (err) {
      setError('Ошибка проверки API ключа');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="api-setup">
      <h2>Настройка API ключа</h2>
      <p>Для работы приложения необходим API ключ от Kinopoisk API Unofficial</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Введите ваш API ключ"
          disabled={validating}
        />
        <button type="submit" disabled={validating}>
          {validating ? 'Проверка...' : 'Сохранить'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      <div className="help">
        <h3>Как получить API ключ:</h3>
        <ol>
          <li>Перейдите на <a href="https://rapidapi.com/" target="_blank">RapidAPI</a></li>
          <li>Найдите "Kinopoisk API Unofficial"</li>
          <li>Подпишитесь на план (есть бесплатный)</li>
          <li>Скопируйте ключ из раздела "Headers"</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiKeySetup;
```

## Полезные советы для React приложения

1. **Кэширование**: Используйте React Query или SWR для кэширования API запросов
2. **Debounce**: Обязательно используйте debounce для поиска в реальном времени
3. **Error Boundaries**: Оберните компоненты в Error Boundaries для обработки ошибок
4. **Lazy Loading**: Используйте React.lazy() для ленивой загрузки компонентов
5. **Мемоизация**: Используйте React.memo, useMemo, useCallback для оптимизации
6. **TypeScript**: Строго типизируйте все API ответы и состояния
7. **LocalStorage**: Сохраняйте пользовательские данные и настройки
8. **Accessibility**: Не забывайте про доступность (aria-labels, keyboard navigation)

## Заключение

Этот API предоставляет мощные возможности для создания React приложений с фильмами. Следуйте примерам выше и адаптируйте их под свои нужды. Обязательно используйте TypeScript для лучшей типизации и React хуки для управления состоянием.

Этот файл содержит все необходимые примеры для быстрого старта работы с Kinopoisk API в вашем прототипе приложения.