# Руководство по миграции структуры данных Kinopoisk API

## Обзор изменений

В рамках обновления приложения была изменена структура данных для работы с Kinopoisk API, чтобы соответствовать актуальному формату ответов API.

## Основные изменения

### 1. Структура постеров и бэкдропов

**Было:**
```typescript
poster: {
  url?: string;
  previewUrl?: string;
}
```

**Стало:**
```typescript
poster: Array<{
  url?: string;
  previewUrl?: string;
}>;
```

### 2. Расширенная структура рейтингов и голосов

**Было:**
```typescript
rating: {
  kp?: number;
  imdb?: number;
  filmCritics?: number;
  russianFilmCritics?: number;
};
votes: {
  kp?: number;
  imdb?: number;
};
```

**Стало:**
```typescript
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
```

## Обновленные файлы

### 1. Типы данных
- `src/shared/services/kinopoisk.ts` - обновлена структура интерфейса `Movie`

### 2. Утилиты
- `src/shared/utils/movie.ts` - новый файл с вспомогательными функциями для работы с данными фильмов

### 3. Компоненты
- `src/entities/Media/MediaCard.svelte` - обновлен для работы с новой структурой постеров
- `src/pages/MovieDetails/MovieDetails.svelte` - обновлен для использования новых утилит
- `src/pages/Dashboard/Dashboard.svelte` - обновлен для работы с новой структурой постеров

## Новые утилиты

В файле `src/shared/utils/movie.ts` добавлены следующие функции:

- `getMoviePosterUrl(movie: Movie): string` - получение URL постера
- `getMovieBackdropUrl(movie: Movie): string | null` - получение URL бэкдропа
- `formatMovieRating(rating?: number): string` - форматирование рейтинга
- `getPrimaryRating(movie: Movie): number | undefined` - получение основного рейтинга
- `formatMovieDuration(minutes?: number): string` - форматирование длительности
- `formatMovieGenres(genres: Array<{ name: string }>): string` - форматирование жанров
- `formatMovieCountries(countries: Array<{ name: string }>): string` - форматирование стран
- `getMovieTypeDisplayName(type: string): string` - получение отображаемого названия типа
- `isHighRatedMovie(movie: Movie, threshold?: number): boolean` - проверка высокого рейтинга
- `getMovieYearDisplay(movie: Movie): string` - получение года для отображения

## Миграция кода

### Обращение к постерам

**Было:**
```typescript
movie.poster?.url || movie.poster?.previewUrl
```

**Стало:**
```typescript
getMoviePosterUrl(movie)
// или
movie.poster?.[0]?.url || movie.poster?.[0]?.previewUrl
```

### Форматирование данных

**Было:**
```typescript
import { formatRating, formatDuration } from '../services/kinopoisk';
```

**Стало:**
```typescript
import { formatMovieRating, formatMovieDuration } from '../utils/movie';
```

## Обратная совместимость

Все изменения были внесены с учетом обратной совместимости. Старые поля продолжают поддерживаться через опциональные операторы (`?.`).

## Тестирование

После миграции рекомендуется протестировать:

1. Отображение карточек фильмов на главной странице
2. Поиск фильмов
3. Детальную страницу фильма
4. Добавление фильмов в библиотеку
5. Отображение рейтингов и метаданных

## Дополнительные улучшения

- Улучшена типизация данных
- Добавлены вспомогательные функции для работы с данными
- Упрощена логика обработки постеров и рейтингов
- Повышена читаемость кода