<script lang="ts">
  import { Button, Badge, Input } from '../../shared/ui';
  import { MediaCard } from '../../entities/Media';
  import { userLibrary, favoriteMovies, watchedMovies, watchingMovies, wantToWatchMovies } from '../../shared/stores/movies';
  import { kinopoiskService } from '../../shared/services/kinopoisk';
  import { createEventDispatcher } from 'svelte';
  import type { Movie } from '../../shared/services/kinopoisk';

  const dispatch = createEventDispatcher();

  let activeTab: 'all' | 'favorites' | 'watched' | 'watching' | 'want-to-watch' = 'all';
  let searchQuery = '';
  let sortBy: 'name' | 'rating' | 'year' | 'added' = 'added';
  let sortOrder: 'asc' | 'desc' = 'desc';

  $: currentMovies = getCurrentMovies(activeTab, $userLibrary, $favoriteMovies, $watchedMovies, $watchingMovies, $wantToWatchMovies);
  $: filteredMovies = filterAndSortMovies(currentMovies, searchQuery, sortBy, sortOrder);

  function getCurrentMovies(
    tab: string, 
    library: any, 
    favorites: Movie[], 
    watched: Movie[], 
    watching: Movie[], 
    wantToWatch: Movie[]
  ): Movie[] {
    switch (tab) {
      case 'favorites':
        return favorites.filter(movie => movie && typeof movie === 'object' && movie.id && typeof movie.id === 'number');
      case 'watched':
        return watched.filter(movie => movie && typeof movie === 'object' && movie.id && typeof movie.id === 'number');
      case 'watching':
        return watching.filter(movie => movie && typeof movie === 'object' && movie.id && typeof movie.id === 'number');
      case 'want-to-watch':
        return wantToWatch.filter(movie => movie && typeof movie === 'object' && movie.id && typeof movie.id === 'number');
      default:
        // Для вкладки "Все" возвращаем все фильмы из библиотеки
        return library
          .map((userData: any) => {
            if (!userData?.movieInfo) return null;
            
            // Создаем объект Movie из userData
            return {
              id: userData.id,
              name: userData.movieInfo.name || '',
              alternativeName: userData.movieInfo.alternativeName || '',
              year: userData.movieInfo.year || 0,
              poster: userData.movieInfo.poster || null,
              rating: userData.movieInfo.rating || { kp: 0, imdb: 0 },
              type: userData.movieInfo.type || '',
              movieLength: userData.movieInfo.movieLength || 0,
              // Добавляем остальные обязательные поля
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
          })
          .filter(movie => movie && typeof movie === 'object' && movie.id && typeof movie.id === 'number');
    }
  }

  function filterAndSortMovies(movies: Movie[], query: string, sort: string, order: string): Movie[] {
    // First filter out any undefined or invalid movies
    let filtered = movies.filter(movie => movie && typeof movie === 'object' && movie.id && typeof movie.id === 'number');

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.name?.toLowerCase().includes(lowerQuery) ||
        movie.alternativeName?.toLowerCase().includes(lowerQuery) ||
        movie.genres?.some(genre => genre.name?.toLowerCase().includes(lowerQuery))
      );
    }

    // Sort movies
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort) {
        case 'name':
          aValue = a.name || a.alternativeName || '';
          bValue = b.name || b.alternativeName || '';
          break;
        case 'rating':
          aValue = a.rating?.kp || 0;
          bValue = b.rating?.kp || 0;
          break;
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case 'added':
        default:
          const aData = $userLibrary[a.id];
          const bData = $userLibrary[b.id];
          aValue = aData?.addedAt ? new Date(aData.addedAt).getTime() : 0;
          bValue = bData?.addedAt ? new Date(bData.addedAt).getTime() : 0;
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }

  function getTabCount(tab: string): number {
    switch (tab) {
      case 'favorites':
        return $favoriteMovies.length;
      case 'watched':
        return $watchedMovies.length;
      case 'watching':
        return $watchingMovies.length;
      case 'want-to-watch':
        return $wantToWatchMovies.length;
      default:
        return Object.keys($userLibrary).length;
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
      // В случае ошибки используем данные из библиотеки
      dispatch('movieSelect', { movie });
    }
  }

  function clearLibrary() {
    if (confirm('Вы уверены, что хотите очистить всю библиотеку? Это действие нельзя отменить.')) {
      userLibrary.clear();
    }
  }

  function exportLibrary() {
    const data = JSON.stringify($userLibrary, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geek-heaven-library-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importLibrary(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        userLibrary.importData(data);
        alert('Библиотека успешно импортирована!');
      } catch (error) {
        alert('Ошибка при импорте библиотеки. Проверьте формат файла.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    input.value = '';
  }
</script>

<div class="library">
  <div class="library__header">
    <div class="library__title">
      <h1>Моя библиотека</h1>
      <p>Управляйте своей коллекцией фильмов и сериалов</p>
    </div>
    
    <div class="library__actions">
      <Button variant="outline" on:click={exportLibrary}>
        Экспорт
      </Button>
      
      <label class="library__import">
        <Button variant="outline">Импорт</Button>
        <input 
          type="file" 
          accept=".json" 
          on:change={importLibrary}
          style="display: none;"
        />
      </label>
      
      <Button variant="danger" on:click={clearLibrary}>
        Очистить
      </Button>
    </div>
  </div>

  <!-- Tabs -->
  <div class="library__tabs">
    <button 
      class="library__tab" 
      class:active={activeTab === 'all'}
      on:click={() => activeTab = 'all'}
    >
      Все
      <Badge variant="secondary" text={getTabCount('all').toString()} />
    </button>
    
    <button 
      class="library__tab" 
      class:active={activeTab === 'favorites'}
      on:click={() => activeTab = 'favorites'}
    >
      Избранное
      <Badge variant="secondary" text={getTabCount('favorites').toString()} />
    </button>
    
    <button 
      class="library__tab" 
      class:active={activeTab === 'watching'}
      on:click={() => activeTab = 'watching'}
    >
      Смотрю
      <Badge variant="secondary" text={getTabCount('watching').toString()} />
    </button>
    
    <button 
      class="library__tab" 
      class:active={activeTab === 'watched'}
      on:click={() => activeTab = 'watched'}
    >
      Просмотрено
      <Badge variant="secondary" text={getTabCount('watched').toString()} />
    </button>
    
    <button 
      class="library__tab" 
      class:active={activeTab === 'want-to-watch'}
      on:click={() => activeTab = 'want-to-watch'}
    >
      Хочу посмотреть
      <Badge variant="secondary" text={getTabCount('want-to-watch').toString()} />
    </button>
  </div>

  <!-- Controls -->
  <div class="library__controls">
    <div class="library__search">
      <Input
        placeholder="Поиск в библиотеке..."
        bind:value={searchQuery}
      />
    </div>
    
    <div class="library__sort">
      <select bind:value={sortBy}>
        <option value="added">По дате добавления</option>
        <option value="name">По названию</option>
        <option value="rating">По рейтингу</option>
        <option value="year">По году</option>
      </select>
      
      <button 
        class="library__sort-order"
        on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
        title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  </div>

  <!-- Content -->
  <div class="library__content">
    {#if filteredMovies.length > 0}
      <div class="library__grid">
        {#each filteredMovies as movie (movie.id)}
          <MediaCard 
            {movie} 
            on:click={handleMovieClick}
          />
        {/each}
      </div>
    {:else if Object.keys($userLibrary).length === 0}
      <div class="library__empty">
        <h2>Библиотека пуста</h2>
        <p>Добавьте фильмы и сериалы в свою библиотеку, чтобы они появились здесь</p>
        <Button variant="primary" on:click={() => dispatch('navigate', { page: 'search' })}>
          Найти фильмы
        </Button>
      </div>
    {:else}
      <div class="library__no-results">
        <h2>Ничего не найдено</h2>
        <p>Попробуйте изменить параметры поиска или фильтрации</p>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .library {
    padding: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-xl);
      gap: var(--spacing-lg);
    }

    &__title {
      h1 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
      }
    }

    &__actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-shrink: 0;
    }

    &__import {
      display: inline-block;
    }

    &__tabs {
      display: flex;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      overflow-x: auto;
    }

    &__tab {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--color-text-primary);
        background: var(--color-surface-hover);
      }
      
      &.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }
    }

    &__controls {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      align-items: center;
    }

    &__search {
      flex: 1;
      max-width: 400px;
    }

    &__sort {
      display: flex;
      gap: var(--spacing-xs);
      align-items: center;
      
      select {
        padding: var(--spacing-sm);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        background: var(--color-surface);
        color: var(--color-text-primary);
        font-size: 0.875rem;
        
        &:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: -2px;
        }
      }
    }

    &__sort-order {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      color: var(--color-text-primary);
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--color-surface-hover);
        border-color: var(--color-primary);
      }
    }

    &__content {
      min-height: 400px;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-lg);
    }

    &__empty,
    &__no-results {
      text-align: center;
      padding: var(--spacing-xl);
      
      h2 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0 0 var(--spacing-lg) 0;
        color: var(--color-text-secondary);
      }
    }
  }

  @media (max-width: 768px) {
    .library {
      padding: var(--spacing-md);
      
      &__header {
        flex-direction: column;
        align-items: stretch;
      }
      
      &__actions {
        justify-content: center;
      }
      
      &__controls {
        flex-direction: column;
        align-items: stretch;
      }
      
      &__search {
        max-width: none;
      }
      
      &__grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--spacing-md);
      }
    }
  }
</style>