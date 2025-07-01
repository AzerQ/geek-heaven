<script lang="ts">
  import { Badge, Button } from '../../shared/ui';
  import { userLibrary, type UserMovieData } from '../../shared/stores/movies';
  import type { Movie } from '../../shared/services/kinopoisk';
  import { 
    getMoviePosterUrl, 
    formatMovieRating, 
    formatMovieDuration, 
    getMovieTypeDisplayName,
    getPrimaryRating
  } from '../../shared/utils/movie';
  import { createEventDispatcher } from 'svelte';
  
  export let movie: Movie;
  
  const dispatch = createEventDispatcher();
  
  $: userMovieData = $userLibrary.find(item => item.id === movie.id);
  $: isInLibrary = !!userMovieData;
  $: userRating = userMovieData?.userRating;
  $: primaryRating = getPrimaryRating(movie);
  $: movieStatus = userMovieData?.status;
  
  function getStatusLabel(status: string): string {
    switch (status) {
      case 'watching': return 'Смотрю';
      case 'watched': return 'Просмотрено';
      case 'want-to-watch': return 'Хочу посмотреть';
      case 'favorite': return 'Избранное';
      case 'dropped': return 'Брошено';
      default: return '';
    }
  }
  
  function getStatusVariant(status: string): string {
    switch (status) {
      case 'watching': return 'info';
      case 'watched': return 'success';
      case 'want-to-watch': return 'warning';
      case 'favorite': return 'danger';
      case 'dropped': return 'secondary';
      default: return 'secondary';
    }
  }
  
  function handleClick() {
    dispatch('click', { movie });
  }
  
  function handleAddToLibrary(event: Event) {
    event.stopPropagation();
    dispatch('addToLibrary', { movie });
  }
</script>

<div class="media-card" on:click={handleClick} on:keydown={(e) => e.key === 'Enter' && handleClick()} tabindex="0" role="button">
  <div class="media-card__poster">
    <img 
      class="poster__image"
      src={getMoviePosterUrl(movie)}
      alt={movie.name || movie.alternativeName}
      loading="lazy"
    />
    
    <!-- Status Badge -->
    {#if movieStatus}
      <div class="media-card__status-badge">
        <Badge 
          variant={getStatusVariant(movieStatus)}
          text={getStatusLabel(movieStatus)}
        />
      </div>
    {/if}
    
    <!-- Add to Library Button -->
    {#if !isInLibrary}
      <div class="media-card__add-button">
        <Button 
          variant="primary"
          size="sm"
          on:click={handleAddToLibrary}
        >
          +
        </Button>
      </div>
    {/if}
  </div>
  
  <div class="media-card__content">
    <div class="media-card__header">
      <h3 class="media-card__title">{movie.name || movie.alternativeName}</h3>
      
      <div class="media-card__meta">
        {#if movie.year}
          <Badge variant="secondary" text={movie.year.toString()} />
        {/if}
        
        {#if movie.type}
          <Badge variant="outline" text={getMovieTypeDisplayName(movie.type)} />
        {/if}
        
        {#if movie.movieLength}
          <Badge variant="secondary" text={formatMovieDuration(movie.movieLength)} />
        {/if}
      </div>
    </div>
    
    <div class="media-card__footer">
      <div class="media-card__ratings">
        {#if primaryRating}
          <div class="rating rating--primary">
            <span class="rating__label">{movie.rating.kp ? 'КП:' : 'IMDB:'}</span>
            <span class="rating__value">{formatMovieRating(primaryRating)}</span>
          </div>
        {/if}
        
        {#if userRating}
          <div class="rating rating--user">
            <span class="rating__label">Моя:</span>
            <span class="rating__value">{userRating}/10</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .media-card {
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid var(--color-border);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: var(--color-primary);
    }
    
    &:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    &__poster {
      position: relative;
      aspect-ratio: 2/3;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      
      &:hover img {
        transform: scale(1.05);
      }
    }





    &__content {
      padding: var(--spacing-md);
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    &__title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &__meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    &__footer {
      margin-top: auto;
    }

    &__ratings {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    &__status-badge {
      position: absolute;
      top: var(--spacing-sm);
      left: var(--spacing-sm);
      z-index: 1;
    }
    
    &__add-button {
      position: absolute;
      bottom: var(--spacing-sm);
      right: var(--spacing-sm);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    &:hover &__add-button {
      opacity: 1;
    }
  }
  
  .rating {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-warning);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }
  


  @media (max-width: 768px) {
    .media-card {
      &__content {
        padding: var(--spacing-sm);
      }
      
      &__title {
        font-size: 0.875rem;
      }
      
      &__meta {
        font-size: 0.75rem;
      }
      

    }
  }
</style>