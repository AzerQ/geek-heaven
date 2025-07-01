<script lang="ts">
  import { MediaCard } from '../../entities/Media';
  import { Card, Typography, Button } from '../../shared/ui';
  import { kinopoiskService, type Movie } from '../../shared/services/kinopoisk';
  import { userLibrary, favoriteMovies, watchingMovies } from '../../shared/stores/movies';
  import { settings } from '../../shared/stores/settings';
  import { getMoviePosterUrl } from '../../shared/utils/movie';
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let popularMovies: Movie[] = [];
  let isLoading = false;
  let apiKeyConfigured = false;
  
  // Subscribe to settings to check API key
  settings.subscribe(value => {
    apiKeyConfigured = !!value.kinopoiskApiKey;
    if (value.kinopoiskApiKey) {
      kinopoiskService.setApiKey(value.kinopoiskApiKey);
    }
  });
  
  onMount(async () => {
    if (apiKeyConfigured) {
      await loadPopularMovies();
    }
  });
  
  async function loadPopularMovies() {
    if (!apiKeyConfigured) return;
    
    isLoading = true;
    try {
      const response = await kinopoiskService.getPopularMovies(1, 8);
      popularMovies = response.docs;
    } catch (error) {
      console.error('Error loading popular movies:', error);
    } finally {
      isLoading = false;
    }
  }
  
  $: libraryStats = {
    total: Object.keys($userLibrary).length,
    favorites: $favoriteMovies.length,
    watching: $watchingMovies.length
  };
  
  
  async function handleMovieClick(event: CustomEvent) {
    const { movie } = event.detail;
    
    try {
      // Загружаем полные данные фильма из API
      const fullMovie = await kinopoiskService.getMovieById(movie.id);
      dispatch('movieSelect', { movie: fullMovie });
    } catch (error) {
      console.error('Ошибка при загрузке полных данных фильма:', error);
      // В случае ошибки используем имеющиеся данные
      dispatch('movieSelect', { movie });
    }
  }
  
  function navigateToSearch() {
    dispatch('navigate', { page: 'search' });
  }
  
  function navigateToLibrary() {
    dispatch('navigate', { page: 'library' });
  }
  
  function navigateToSettings() {
    dispatch('navigate', { page: 'settings' });
  }
</script>

<main class="dashboard">
  <!-- Приветствие -->
  <section class="welcome">
    <Typography variant="h1" gutterBottom>Добро пожаловать в GeekHeaven!</Typography>
    <Typography variant="body1" color="secondary">
      Ваша персональная платформа для отслеживания игр, фильмов, книг и многого другого.
    </Typography>
  </section>
  
  <!-- Популярные фильмы -->
  <section class="featured">
    <div class="section-header">
      <Typography variant="h2">Популярные фильмы</Typography>
      <Button variant="text" size="sm" on:click={navigateToSearch}>Посмотреть все</Button>
    </div>
    
    {#if !apiKeyConfigured}
      <Card>
        <div class="no-api-message">
          <Typography variant="h4">API ключ не настроен</Typography>
          <Typography variant="body1" color="secondary">
            Для отображения популярных фильмов необходимо настроить API ключ Kinopoisk в настройках.
          </Typography>
          <Button variant="primary" on:click={navigateToSettings}>
            Перейти в настройки
          </Button>
        </div>
      </Card>
    {:else if isLoading}
      <div class="loading-message">
        <Typography variant="body1">Загрузка популярных фильмов...</Typography>
      </div>
    {:else if popularMovies.length > 0}
      <div class="media-grid">
        {#each popularMovies as movie}
          <MediaCard {movie} on:click={handleMovieClick} />
        {/each}
      </div>
    {:else}
      <Card>
        <div class="no-content-message">
          <Typography variant="body1" color="secondary">
            Не удалось загрузить популярные фильмы. Попробуйте позже.
          </Typography>
        </div>
      </Card>
    {/if}
  </section>
  
  <!-- Статистика библиотеки -->
  <div class="dashboard-grid">
    <!-- Статистика -->
    <section class="stats">
      <Card>
        <div slot="header">
          <Typography variant="h3">Моя библиотека</Typography>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <Typography variant="h2" color="primary">{libraryStats.total}</Typography>
            <Typography variant="body2" color="secondary">Всего фильмов</Typography>
          </div>
          
          <div class="stat-item">
            <Typography variant="h2" color="primary">{libraryStats.favorites}</Typography>
            <Typography variant="body2" color="secondary">В избранном</Typography>
          </div>
          
          <div class="stat-item">
            <Typography variant="h2" color="primary">{libraryStats.watching}</Typography>
            <Typography variant="body2" color="secondary">Смотрю сейчас</Typography>
          </div>
        </div>
        
        <div slot="footer">
          <Button variant="text" size="sm" fullWidth on:click={navigateToLibrary}>
            Перейти в библиотеку
          </Button>
        </div>
      </Card>
    </section>
    
    <!-- Избранные фильмы -->
    <section class="favorites">
      <Card>
        <div slot="header">
          <Typography variant="h3">Избранное</Typography>
        </div>
        
        {#if $favoriteMovies.length > 0}
          <div class="favorites-list">
            {#each $favoriteMovies.slice(0, 5) as movie}
              <div class="favorite-item" on:click={() => handleMovieClick({ detail: { movie } })} on:keydown={(e) => e.key === 'Enter' && handleMovieClick({ detail: { movie } })} tabindex="0" role="button">
                <img src={getMoviePosterUrl(movie)} alt={movie.name} />
                <div class="favorite-info">
                  <Typography variant="body2" weight="medium">{movie.name || movie.alternativeName}</Typography>
                  <Typography variant="caption" color="secondary">{movie.year}</Typography>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-favorites">
            <Typography variant="body2" color="secondary">Избранных фильмов пока нет</Typography>
          </div>
        {/if}
        
        <div slot="footer">
          <Button variant="text" size="sm" fullWidth on:click={navigateToLibrary}>
            Посмотреть все избранные
          </Button>
        </div>
      </Card>
    </section>
  </div>
  
  <!-- Быстрые действия -->
  <section class="quick-actions">
    <Typography variant="h3" gutterBottom>Быстрые действия</Typography>
    
    <div class="actions-grid">
      <Card class="action-card" on:click={navigateToSearch}>
        <div class="action-content">
          <Typography variant="h4">Найти фильмы</Typography>
          <Typography variant="body2" color="secondary">Ищите и добавляйте новые фильмы в свою библиотеку</Typography>
          <Button variant="primary" size="sm">Поиск</Button>
        </div>
      </Card>
      
      <Card class="action-card" on:click={navigateToLibrary}>
        <div class="action-content">
          <Typography variant="h4">Моя библиотека</Typography>
          <Typography variant="body2" color="secondary">Управляйте своей коллекцией фильмов и сериалов</Typography>
          <Button variant="secondary" size="sm">Открыть</Button>
        </div>
      </Card>
      
      <Card class="action-card" on:click={navigateToSettings}>
        <div class="action-content">
          <Typography variant="h4">Настройки</Typography>
          <Typography variant="body2" color="secondary">Настройте API ключ и персонализируйте приложение</Typography>
          <Button variant="text" size="sm">Настроить</Button>
        </div>
      </Card>
    </div>
  </section>
</main>

<style lang="scss">
  .dashboard {
    padding: var(--spacing-xl);
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .welcome {
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }
  
  .featured {
    margin-bottom: var(--spacing-xl);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }
  
  .no-api-message,
  .no-content-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px;
    text-align: center;
  }
  
  .loading-message {
    display: flex;
    justify-content: center;
    padding: 32px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 16px 0;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }
  
  .favorites-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .favorite-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 8px;
    background: var(--color-surface-secondary);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .favorite-item:hover {
    background: var(--color-surface-tertiary);
  }
  
  .favorite-item img {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .favorite-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }
  
  .empty-favorites {
    display: flex;
    justify-content: center;
    padding: 32px;
    text-align: center;
  }
  
  .quick-actions {
    margin-bottom: var(--spacing-xl);
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }
  
  :global(.action-card) {
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  }
  
  .action-content {
    padding: var(--spacing-lg);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  @media (max-width: 768px) {
    .dashboard {
      padding: var(--spacing-md);
    }
    
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    
    .media-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--spacing-md);
    }
    
    .actions-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .stat-item {
      padding: 16px;
      background: var(--color-surface-secondary);
      border-radius: 8px;
    }
  }
</style>