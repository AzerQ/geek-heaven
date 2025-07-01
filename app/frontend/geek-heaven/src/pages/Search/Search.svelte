<script lang="ts">
  import { Input, Button, Badge } from '../../shared/ui';
  import { MediaCard } from '../../entities/Media';
  import { kinopoiskService, type Movie } from '../../shared/services/kinopoisk';
  import { movies } from '../../shared/stores/movies';
  import { settings } from '../../shared/stores/settings';
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let category: string = ''; // Category from navigation
  export let contentType: string = ''; // Content type from navigation

  let searchQuery = '';
  let searchResults: Movie[] = [];
  let isLoading = false;
  let error: string | null = null;
  let currentPage = 1;
  let totalPages = 1;
  let hasSearched = false;
  let selectedGenre = '';
  let selectedType = '';
  let selectedYear = '';
  
  // Заголовки для разных категорий
  const categoryTitles: Record<string, string> = {
    'movies': 'Поиск фильмов',
    'series': 'Поиск сериалов',
    'anime': 'Поиск аниме'
  };
  
  // Получаем заголовок в зависимости от категории
  $: pageTitle = category ? categoryTitles[category] || 'Поиск фильмов' : 'Поиск фильмов';
  $: pageDescription = category ? `Найдите интересные ${category === 'movies' ? 'фильмы' : category === 'series' ? 'сериалы' : category === 'anime' ? 'аниме' : 'фильмы и сериалы'}` : 'Найдите интересные фильмы и сериалы';
  
  // Блокируем фильтр типа если задана категория
  $: isTypeFilterDisabled = !!contentType;

  const genres = [
    'драма', 'комедия', 'боевик', 'триллер', 'ужасы', 'фантастика',
    'мелодрама', 'детектив', 'приключения', 'семейный', 'мультфильм',
    'документальный', 'биография', 'история', 'военный', 'криминал'
  ];

  const types = [
    { value: 'movie', label: 'Фильмы' },
    { value: 'tv-series', label: 'Сериалы' },
    { value: 'cartoon', label: 'Мультфильмы' },
    { value: 'anime', label: 'Аниме' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  let apiKeyConfigured = false;

  // Subscribe to settings to check API key
  settings.subscribe(value => {
    apiKeyConfigured = !!value.kinopoiskApiKey;
    if (value.kinopoiskApiKey) {
      kinopoiskService.setApiKey(value.kinopoiskApiKey);
    }
  });

  onMount(() => {
    // Load popular movies on mount if API key is configured
    if (apiKeyConfigured) {
      if (category) {
        loadCategoryMovies(category);
      } else {
        loadPopularMovies();
      }
    }
  });

  // Watch for category changes
  $: if (category && apiKeyConfigured) {
    loadCategoryMovies(category);
  }
  
  // Автоматически устанавливаем тип контента при изменении contentType
  $: if (contentType && contentType !== selectedType) {
    selectedType = contentType;
    if (apiKeyConfigured && hasSearched) {
      handleSearch();
    }
  }

  async function loadCategoryMovies(cat: string) {
    if (!apiKeyConfigured) return;
    
    isLoading = true;
    error = null;
    
    try {
      const response = await kinopoiskService.getPopularMoviesByCategory(cat as 'movies' | 'series' | 'anime', 1, 20);
      searchResults = response.docs;
      totalPages = response.pages;
      hasSearched = true;
      currentPage = 1;
    } catch (err) {
      error = err instanceof Error ? err.message : `Ошибка при загрузке ${cat}`;
      console.error('Error loading category movies:', err);
    } finally {
      isLoading = false;
    }
  }

  async function loadPopularMovies() {
    if (!apiKeyConfigured) return;
    
    isLoading = true;
    error = null;
    
    try {
      const response = await kinopoiskService.getPopularMovies(1, 20);
      searchResults = response.docs;
      totalPages = response.pages;
      hasSearched = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Ошибка при загрузке популярных фильмов';
      console.error('Error loading popular movies:', err);
    } finally {
      isLoading = false;
    }
  }

  async function handleSearch() {
    if (!apiKeyConfigured) {
      error = 'API ключ не настроен. Перейдите в настройки.';
      return;
    }

    if (!searchQuery.trim() && !selectedGenre && !selectedType && !selectedYear) {
      return;
    }

    isLoading = true;
    error = null;
    currentPage = 1;
    hasSearched = true;

    try {
      let response;
      
      if (searchQuery.trim()) {
        response = await kinopoiskService.searchMovies(searchQuery, currentPage, 20);
      } else if (selectedGenre) {
        response = await kinopoiskService.getMoviesByGenre(selectedGenre, currentPage, 20);
      } else if (selectedType) {
        response = await kinopoiskService.getMoviesByType(selectedType, currentPage, 20);
      } else {
        response = await kinopoiskService.getPopularMovies(currentPage, 20);
      }
      
      searchResults = response.docs;
      totalPages = response.pages;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Ошибка при поиске';
      console.error('Search error:', err);
      searchResults = [];
    } finally {
      isLoading = false;
    }
  }

  async function loadMore() {
    if (currentPage >= totalPages || isLoading) return;
    
    isLoading = true;
    currentPage += 1;
    
    try {
      let response;
      
      if (searchQuery.trim()) {
        response = await kinopoiskService.searchMovies(searchQuery, currentPage, 20);
      } else if (selectedGenre) {
        response = await kinopoiskService.getMoviesByGenre(selectedGenre, currentPage, 20);
      } else if (selectedType) {
        response = await kinopoiskService.getMoviesByType(selectedType, currentPage, 20);
      } else {
        response = await kinopoiskService.getPopularMovies(currentPage, 20);
      }
      
      searchResults = [...searchResults, ...response.docs];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Ошибка при загрузке';
      console.error('Load more error:', err);
    } finally {
      isLoading = false;
    }
  }

  function clearFilters() {
    searchQuery = '';
    selectedGenre = '';
    // Не очищаем selectedType если он задан через категорию
    if (!isTypeFilterDisabled) {
      selectedType = '';
    }
    selectedYear = '';
    searchResults = [];
    hasSearched = false;
    error = null;
    
    if (apiKeyConfigured) {
      if (category) {
        loadCategoryMovies(category);
      } else {
        loadPopularMovies();
      }
    }
  }

  async function handleMovieClick(event: CustomEvent) {
    const { movie } = event.detail;
    
    try {
      // Загружаем полные данные фильма из API
      const fullMovie = await kinopoiskService.getMovieById(movie.id);
      dispatch('movieSelect', { movie: fullMovie });
    } catch (error) {
      console.error('Ошибка при загрузке полных данных фильма:', error);
      // В случае ошибки используем данные из поиска
      dispatch('movieSelect', { movie });
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<div class="search">
  <div class="search__header">
    <h1>{pageTitle}</h1>
    <p>{pageDescription}</p>
  </div>

  {#if !apiKeyConfigured}
    <div class="search__no-api">
      <h2>API ключ не настроен</h2>
      <p>Для поиска фильмов необходимо настроить API ключ Kinopoisk в настройках.</p>
      <Button variant="primary" on:click={() => dispatch('navigate', { page: 'settings' })}>
        Перейти в настройки
      </Button>
    </div>
  {:else}
    <div class="search__controls">
      <!-- Search Input -->
      <div class="search__input">
        <Input
          placeholder="Введите название фильма или сериала..."
          bind:value={searchQuery}
          on:keypress={handleKeyPress}
        />
        <Button 
          variant="primary" 
          disabled={isLoading}
          on:click={handleSearch}
        >
          {isLoading ? 'Поиск...' : 'Найти'}
        </Button>
      </div>

      <!-- Filters -->
      <div class="search__filters">
        <div class="search__filter">
          <label>Жанр:</label>
          <select bind:value={selectedGenre} on:change={handleSearch}>
            <option value="">Все жанры</option>
            {#each genres as genre}
              <option value={genre}>{genre}</option>
            {/each}
          </select>
        </div>

        <div class="search__filter">
          <label>Тип:</label>
          <select bind:value={selectedType} on:change={handleSearch} disabled={isTypeFilterDisabled}>
            <option value="">Все типы</option>
            {#each types as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
        </div>

        <div class="search__filter">
          <label>Год:</label>
          <select bind:value={selectedYear} on:change={handleSearch}>
            <option value="">Любой год</option>
            {#each years as year}
              <option value={year}>{year}</option>
            {/each}
          </select>
        </div>

        <Button variant="outline" on:click={clearFilters}>
          Очистить
        </Button>
      </div>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="search__error">
        <p>{error}</p>
      </div>
    {/if}

    <!-- Results -->
    {#if hasSearched}
      <div class="search__results">
        {#if searchResults.length > 0}
          <div class="search__results-header">
            <h2>Результаты поиска</h2>
            <Badge variant="secondary" text={`Найдено: ${searchResults.length}`} />
          </div>
          
          <div class="search__grid">
            {#each searchResults as movie (movie.id)}
              <MediaCard 
                {movie} 
                on:click={handleMovieClick}
              />
            {/each}
          </div>

          {#if currentPage < totalPages}
            <div class="search__load-more">
              <Button 
                variant="outline" 
                disabled={isLoading}
                on:click={loadMore}
              >
                {isLoading ? 'Загрузка...' : 'Загрузить ещё'}
              </Button>
            </div>
          {/if}
        {:else if !isLoading}
          <div class="search__no-results">
            <h2>Ничего не найдено</h2>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        {/if}
      </div>
    {:else if !isLoading}
      <div class="search__welcome">
        <h2>Добро пожаловать в поиск!</h2>
        <p>Введите название фильма или используйте фильтры для поиска</p>
      </div>
    {/if}

    <!-- Loading -->
    {#if isLoading && searchResults.length === 0}
      <div class="search__loading">
        <p>Загрузка...</p>
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .search {
    padding: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;

    &__header {
      margin-bottom: var(--spacing-xl);
      
      h1 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
      }
    }

    &__no-api {
      text-align: center;
      padding: var(--spacing-xl);
      background: var(--color-surface);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--color-border);
      
      h2 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0 0 var(--spacing-lg) 0;
        color: var(--color-text-secondary);
      }
    }

    &__controls {
      margin-bottom: var(--spacing-xl);
    }

    &__input {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      
      :global(.input) {
        flex: 1;
      }
    }

    &__filters {
      display: flex;
      gap: var(--spacing-md);
      align-items: end;
      flex-wrap: wrap;
    }

    &__filter {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      
      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text-primary);
      }
      
      select {
        padding: var(--spacing-sm);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        background: var(--color-surface);
        color: var(--color-text-primary);
        font-size: 0.875rem;
        min-width: 120px;
        
        &:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: -2px;
        }
        
        &:disabled {
          background: var(--color-background);
          color: var(--color-text-secondary);
          border-color: var(--color-border);
          cursor: not-allowed;
          opacity: 0.6;
        }
      }
    }

    &__error {
      padding: var(--spacing-md);
      background: color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
      border: 1px solid var(--color-danger);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
      
      p {
        margin: 0;
        color: var(--color-danger);
      }
    }

    &__results {
      &-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-lg);
        
        h2 {
          margin: 0;
          color: var(--color-text-primary);
        }
      }
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    &__load-more {
      text-align: center;
    }

    &__no-results,
    &__welcome,
    &__loading {
      text-align: center;
      padding: var(--spacing-xl);
      
      h2 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
      }
    }
  }

  @media (max-width: 768px) {
    .search {
      padding: var(--spacing-md);
      
      &__input {
        flex-direction: column;
      }
      
      &__filters {
        flex-direction: column;
        align-items: stretch;
      }
      
      &__filter {
        select {
          min-width: auto;
        }
      }
      
      &__grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--spacing-md);
      }
    }
  }
</style>