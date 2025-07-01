<script lang="ts">
  import { Button, Badge, Input, GalleryButton, GalleryModal } from '../../shared/ui';
  import { StarRating } from '../../shared/ui/StarRating';
  import { MediaGallery } from '../../entities/MediaGallery';
  import { kinopoiskService, type Movie, type Review, type ReviewsResponse } from '../../shared/services/kinopoisk';
  import { userLibrary, getMovieFromLibrary } from '../../shared/stores/movies';
  import { settings } from '../../shared/stores/settings';
  import { 
    getMoviePosterUrl, 
    formatMovieRating, 
    formatMovieDuration, 
    formatMovieGenres,
    formatMovieCountries,
    getMovieTypeDisplayName
  } from '../../shared/utils/movie';
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let movieId: number;
  export let movie: Movie | null = null;
  
  const dispatch = createEventDispatcher();
  
  let isLoading = false;
  let error: string | null = null;
  let userRating = 0;
  let userNotes = '';
  let showNotesInput = false;
  let libraryData: any[] = [];
  let isGalleryOpen = false;
  
  // Reviews state
  let reviews: Review[] = [];
  let reviewsLoading = false;
  let reviewsError = '';
  let showReviews = false;
  let currentReviewPage = 1;
  let totalReviewPages = 1;
  let totalReviews = 0;
  const reviewsPerPage = 5;
  
  // Subscribe to user library
  userLibrary.subscribe(value => {
    libraryData = value;
    updateUserData();
  });
  
  // Subscribe to settings to check API key
  settings.subscribe(value => {
    if (value.kinopoiskApiKey) {
      kinopoiskService.setApiKey(value.kinopoiskApiKey);
    }
  });
  
  $: movieInLibrary = getMovieFromLibrary(movieId, libraryData);
  $: isInLibrary = !!movieInLibrary;
  $: currentStatus = movieInLibrary?.status || 'want-to-watch';
  
  onMount(async () => {
    if (!movie) {
      await loadMovie();
    }
    updateUserData();
  });
  
  function updateUserData() {
    if (movieInLibrary) {
      userRating = movieInLibrary.userRating || 0;
      userNotes = movieInLibrary.notes || '';
    }
  }
  
  async function loadMovie() {
    if (!movieId) return;
    
    isLoading = true;
    error = '';
    
    try {
      movie = await kinopoiskService.getMovieById(movieId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Произошла ошибка при загрузке фильма';
      console.error('Error loading movie:', err);
    } finally {
      isLoading = false;
    }
  }
  
  async function loadReviews(page = 1, append = false) {
    if (reviewsLoading) return;
    
    reviewsLoading = true;
    reviewsError = '';
    
    try {
      const response = await kinopoiskService.getMovieReviews(movieId, page, reviewsPerPage);
      
      if (append) {
        reviews = [...reviews, ...(response.docs || [])];
      } else {
        reviews = response.docs || [];
      }
      
      currentReviewPage = response.page || page;
      totalReviewPages = response.pages || 1;
      totalReviews = response.total || 0;
    } catch (err) {
      reviewsError = err instanceof Error ? err.message : 'Произошла ошибка при загрузке отзывов';
      console.error('Error loading reviews:', err);
    } finally {
      reviewsLoading = false;
    }
  }
  
  function toggleReviews() {
    showReviews = !showReviews;
    if (showReviews && reviews.length === 0) {
      loadReviews();
    }
  }

  // Pagination functions
  function goToReviewPage(page: number) {
    if (page >= 1 && page <= totalReviewPages && page !== currentReviewPage) {
      loadReviews(page);
    }
  }

  function nextReviewPage() {
    if (currentReviewPage < totalReviewPages) {
      goToReviewPage(currentReviewPage + 1);
    }
  }

  function prevReviewPage() {
    if (currentReviewPage > 1) {
      goToReviewPage(currentReviewPage - 1);
    }
  }
  
  function addToLibrary() {
    if (movie) {
      userLibrary.addMovie(movie, currentStatus, userRating || undefined);
    }
  }
  
  function removeFromLibrary() {
    userLibrary.removeMovie(movieId);
  }
  
  function updateStatus(newStatus: string) {
    if (isInLibrary) {
      userLibrary.updateMovieStatus(movieId, newStatus as any);
    } else if (movie) {
      userLibrary.addMovie(movie, newStatus as any, userRating || undefined);
    }
  }
  
  function updateRating(newRating: number) {
    userRating = newRating;
    if (isInLibrary) {
      userLibrary.updateMovieRating(movieId, newRating);
    } else if (movie) {
      userLibrary.addMovie(movie, currentStatus as any, newRating);
    }
  }
  
  function saveNotes() {
    if (isInLibrary) {
      userLibrary.updateMovieNotes(movieId, userNotes);
    } else if (movie) {
      userLibrary.addMovie(movie, currentStatus as any, userRating || undefined);
      userLibrary.updateMovieNotes(movieId, userNotes);
    }
    showNotesInput = false;
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'watching': return 'Смотрю';
      case 'watched': return 'Просмотрено';
      case 'want-to-watch': return 'Хочу посмотреть';
      default: return 'Не в библиотеке';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'watching': return 'primary';
      case 'watched': return 'success';
      case 'want-to-watch': return 'warning';
      default: return 'secondary';
    }
  }
  
  function handleBack() {
    dispatch('back');
  }
  
  function handleOpenGallery(event: Event) {
    event.stopPropagation();
    isGalleryOpen = true;
  }
  
  function handleCloseGallery() {
    isGalleryOpen = false;
  }
</script>

<div class="movie-details">
  {#if isLoading}
    <div class="movie-details__loading">
      <p>Загрузка...</p>
    </div>
  {:else if error}
    <div class="movie-details__error">
      <h2>Ошибка</h2>
      <p>{error}</p>
      <Button variant="primary" on:click={handleBack}>
        Назад
      </Button>
    </div>
  {:else if movie}
    <div class="movie-details__header">
      <Button variant="outline" on:click={handleBack}>
        ← Назад
      </Button>
    </div>

    <div class="movie-details__content">
      <div class="movie-details__poster">
        <img 
          src={getMoviePosterUrl(movie)}
          alt={movie.name || movie.alternativeName}
          loading="lazy"
        />
        
        <div class="movie-details__actions">
          <Button 
            variant={isInLibrary ? 'danger' : 'primary'}
            on:click={isInLibrary ? removeFromLibrary : addToLibrary}
          >
            {isInLibrary ? 'Удалить из библиотеки' : 'Добавить в библиотеку'}
          </Button>
          
          <GalleryButton on:click={handleOpenGallery} />
          
          {#if isInLibrary}
            <div class="movie-details__status">
              <label>Статус:</label>
              <select bind:value={currentStatus} on:change={() => updateStatus(currentStatus)}>
                <option value="want-to-watch">Хочу посмотреть</option>
                <option value="watching">Смотрю</option>
                <option value="watched">Просмотрено</option>
              </select>
            </div>
          {/if}
        </div>
      </div>

      <div class="movie-details__info">
        <div class="movie-details__title">
          <h1>{movie.name || movie.alternativeName}</h1>
          {#if movie.alternativeName && movie.name !== movie.alternativeName}
            <p class="movie-details__alt-title">{movie.alternativeName}</p>
          {/if}
        </div>

        <div class="movie-details__meta">
          <div class="movie-details__badges">
            {#if movie.year}
              <Badge variant="secondary" text={movie.year.toString()} />
            {/if}
            
            {#if movie.movieLength}
              <Badge variant="secondary" text={formatMovieDuration(movie.movieLength)} />
            {/if}
            
            {#if movie.type}
              <Badge variant="outline" text={getMovieTypeDisplayName(movie.type)} />
            {/if}
            
            <Badge 
              variant={getStatusColor(currentStatus)} 
              text={getStatusLabel(currentStatus)} 
            />
          </div>

          {#if movie.rating?.kp}
            <div class="movie-details__rating">
              <span class="movie-details__rating-label">Рейтинг Кинопоиск:</span>
              <StarRating rating={movie.rating.kp} size="lg" />
            </div>
          {/if}
          
          {#if movie.rating?.imdb}
            <div class="movie-details__rating">
              <span class="movie-details__rating-label">Рейтинг IMDb:</span>
              <StarRating rating={movie.rating.imdb} size="lg" />
            </div>
          {/if}
        </div>

        {#if movie.description}
          <div class="movie-details__description">
            <h3>Описание</h3>
            <p>{movie.description}</p>
          </div>
        {/if}

        {#if movie.genres && movie.genres.length > 0}
          <div class="movie-details__section">
            <h3>Жанры</h3>
            <p>{formatMovieGenres(movie.genres)}</p>
          </div>
        {/if}

        {#if movie.countries && movie.countries.length > 0}
          <div class="movie-details__section">
            <h3>Страны</h3>
            <p>{formatMovieCountries(movie.countries)}</p>
          </div>
        {/if}

        {#if movie.persons && movie.persons.length > 0}
          <div class="movie-details__section">
            <h3>Актёры и режиссёры</h3>
            <div class="movie-details__persons">
              {#each movie.persons.slice(0, 10) as person}
                <div class="movie-details__person">
                  {#if person.photo}
                    <img src={person.photo} alt={person.name} loading="lazy" />
                  {/if}
                  <div class="movie-details__person-info">
                    <p class="movie-details__person-name">{person.name}</p>
                    {#if person.profession}
                      <p class="movie-details__person-role">{person.profession}</p>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- User Rating -->
        <div class="movie-details__user-section">
          <h3>Моя оценка</h3>
          <div class="movie-details__user-rating">
            {#each Array(10) as _, i}
              <button 
                class="movie-details__star"
                class:active={i < userRating}
                on:click={() => updateRating(i + 1)}
              >
                ★
              </button>
            {/each}
            {#if userRating > 0}
              <span class="movie-details__rating-text">{userRating}/10</span>
              <Button 
                variant="outline" 
                size="sm"
                on:click={() => updateRating(0)}
              >
                Сбросить
              </Button>
            {/if}
          </div>
        </div>

        <!-- User Notes -->
        <div class="movie-details__user-section">
          <div class="movie-details__notes-header">
            <h3>Мои заметки</h3>
            <Button 
              variant="outline" 
              size="sm"
              on:click={() => showNotesInput = !showNotesInput}
            >
              {showNotesInput ? 'Отмена' : 'Редактировать'}
            </Button>
          </div>
          
          {#if showNotesInput}
            <div class="movie-details__notes-input">
              <Input
                placeholder="Добавьте свои заметки о фильме..."
                bind:value={userNotes}
                multiline
              />
              <Button variant="primary" on:click={saveNotes}>
                Сохранить
              </Button>
            </div>
          {:else if userNotes}
            <p class="movie-details__notes-text">{userNotes}</p>
          {:else}
            <p class="movie-details__notes-empty">Заметок пока нет</p>
          {/if}
        </div>
        
        <!-- Reviews Section -->
        <div class="movie-details__section">
          <div class="movie-details__reviews-header">
            <h3>Отзывы пользователей</h3>
            <Button 
              variant="outline" 
              size="sm"
              on:click={toggleReviews}
            >
              {showReviews ? 'Скрыть отзывы' : 'Показать отзывы'}
            </Button>
          </div>
          
          {#if showReviews}
            {#if reviewsLoading}
              <div class="movie-details__reviews-loading">
                <p>Загрузка отзывов...</p>
              </div>
            {:else if reviewsError}
              <div class="movie-details__reviews-error">
                <p>{reviewsError}</p>
              </div>
            {:else if reviews.length > 0}
              <div class="movie-details__reviews">
                {#each reviews as review}
                  <div class="movie-details__review">
                    <div class="movie-details__review-header">
                      <div class="movie-details__review-author">
                        {review.author || 'Аноним'}
                      </div>
                      <div class="movie-details__review-meta">
                        <Badge 
                           variant={review.type === 'Позитивный' ? 'success' : review.type === 'Негативный' ? 'danger' : 'outline'}
                           text={review.type}
                         />
                        {#if review.date}
                          <span class="movie-details__review-date">
                            {new Date(review.date).toLocaleDateString('ru-RU')}
                          </span>
                        {/if}
                      </div>
                    </div>
                    {#if review.title}
                      <h4 class="movie-details__review-title">{review.title}</h4>
                    {/if}
                    {#if review.review}
                       <div class="movie-details__review-text">{@html review.review}</div>
                     {/if}
                     {#if review.userRating !== undefined}
                       <div class="movie-details__review-rating">
                         <span 
                            class="movie-details__review-likes" 
                            title="{review.reviewLikes || 0} {(review.reviewLikes || 0) === 1 ? 'человек посчитал' : 'людей посчитали'} этот отзыв полезным"
                          >
                            <span class="emoji-like">▲</span> {review.reviewLikes || 0}
                          </span>
                          <span 
                            class="movie-details__review-dislikes" 
                            title="{review.reviewDislikes || 0} {(review.reviewDislikes || 0) === 1 ? 'человеку' : 'людям'} отзыв не понравился"
                          >
                            <span class="emoji-dislike">▼</span> {review.reviewDislikes || 0}
                          </span>
                       </div>
                     {/if}
                  </div>
                {/each}
                
                {#if totalReviewPages > 1}
                  <div class="movie-details__reviews-pagination">
                    <div class="movie-details__pagination-info">
                      <span>Страница {currentReviewPage} из {totalReviewPages}</span>
                      <span class="movie-details__total-reviews">Всего отзывов: {totalReviews}</span>
                    </div>
                    <div class="movie-details__pagination-controls">
                      <Button 
                        variant="outline" 
                        disabled={currentReviewPage === 1}
                        on:click={prevReviewPage}
                      >
                        ← Предыдущая
                      </Button>
                      
                      <div class="movie-details__page-numbers">
                        {#each Array.from({length: Math.min(5, totalReviewPages)}, (_, i) => {
                          const start = Math.max(1, currentReviewPage - 2);
                          const end = Math.min(totalReviewPages, start + 4);
                          const adjustedStart = Math.max(1, end - 4);
                          return adjustedStart + i;
                        }) as pageNum}
                          {#if pageNum <= totalReviewPages}
                            <Button 
                              variant={pageNum === currentReviewPage ? 'primary' : 'outline'}
                              size="sm"
                              on:click={() => goToReviewPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          {/if}
                        {/each}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        disabled={currentReviewPage === totalReviewPages}
                        on:click={nextReviewPage}
                      >
                        Следующая →
                      </Button>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="movie-details__reviews-empty">
                <p>Отзывы не найдены</p>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Gallery Modal -->
  {#if movie}
    <GalleryModal 
      isOpen={isGalleryOpen}
      movieId={movie.id}
      movieTitle={movie.name || movie.alternativeName}
      on:close={handleCloseGallery}
    />
  {/if}
</div>

<style lang="scss">
  .movie-details {
    padding: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;

    &__loading,
    &__error {
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

    &__header {
      margin-bottom: var(--spacing-lg);
    }

    &__content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: var(--spacing-xl);
    }

    &__poster {
      img {
        width: 100%;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-md);
      }
    }

    &__actions {
      margin-top: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    &__status {
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
        
        &:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: -2px;
        }
      }
    }

    &__title {
      margin-bottom: var(--spacing-lg);
      
      h1 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-text-primary);
        font-size: 2.5rem;
        line-height: 1.2;
      }
    }

    &__alt-title {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 1.25rem;
    }

    &__meta {
      margin-bottom: var(--spacing-xl);
    }

    &__badges {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      flex-wrap: wrap;
    }

    &__rating {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
      
      &-label {
        color: var(--color-text-secondary);
      }
      
      &-value {
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    &__description,
    &__section,
    &__user-section {
      margin-bottom: var(--spacing-xl);
      
      h3 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
        font-size: 1.25rem;
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
        line-height: 1.6;
      }
    }

    &__persons {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    &__person {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
      
      img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    &__person-info {
      flex: 1;
    }

    &__person-name {
      margin: 0 0 var(--spacing-xs) 0;
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: 0.875rem;
    }

    &__person-role {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.75rem;
    }

    &__user-rating {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    &__star {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--color-border);
      cursor: pointer;
      transition: color 0.2s ease;
      
      &:hover,
      &.active {
        color: #ffd700;
      }
    }

    &__rating-text {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &__notes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    &__notes-input {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    &__notes-text {
      background: var(--color-surface);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--color-border);
      white-space: pre-wrap;
    }

    &__notes-empty {
      color: var(--color-text-secondary);
      font-style: italic;
    }
    
    &__reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }
    
    &__reviews {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }
    
    &__review {
      background: var(--color-surface-secondary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--color-border);
    }
    
    &__review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }
    
    &__review-author {
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 0.875rem;
    }
    
    &__review-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    
    &__review-date {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
    }
    
    &__review-title {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-text-primary);
      font-size: 1rem;
      font-weight: 600;
    }
    
    &__review-text {
      margin: 0;
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 0.875rem;
      text-align: left;
      
      // Handle HTML content in reviews
      :global(p) {
        margin: 0 0 var(--spacing-sm) 0;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      :global(br) {
        line-height: 1.6;
      }
    }
    
    &__review-rating {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    
    &__review-likes,
    &__review-dislikes {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 1.2rem;
      color: var(--color-text-secondary);
    }
    
    &__review-likes {
        color: #22c55e;
        cursor: help;
        transition: opacity 0.2s ease;
        
        &:hover {
          opacity: 0.8;
        }
        
        .emoji-like {
          color: #22c55e;
          font-weight: bold;
          font-size: 1.3rem;
        }
      }
      
      &__review-dislikes {
        color: #ef4444;
        cursor: help;
        transition: opacity 0.2s ease;
        
        &:hover {
          opacity: 0.8;
        }
        
        .emoji-dislike {
          color: #ef4444;
          font-weight: bold;
          font-size: 1.3rem;
        }
      }
    
    &__reviews-loading,
    &__reviews-error,
    &__reviews-empty {
      text-align: center;
      padding: var(--spacing-lg);
      color: var(--color-text-secondary);
      font-style: italic;
      
      p {
        margin: 0;
      }
    }
    
    &__reviews-error {
      color: var(--color-error);
    }
    
    &__reviews-pagination {
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
    }
    
    &__pagination-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
    
    &__total-reviews {
      font-weight: 500;
    }
    
    &__pagination-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }
    
    &__page-numbers {
       display: flex;
       gap: var(--spacing-xs);
       margin: 0 var(--spacing-md);
     }
   }
 
   @media (max-width: 768px) {
     .movie-details {
       &__pagination-controls {
         flex-direction: column;
         gap: var(--spacing-md);
       }
 
       &__page-numbers {
         margin: 0;
       }
 
       &__pagination-info {
         flex-direction: column;
         gap: var(--spacing-sm);
         text-align: center;
       }
     }
   }

  @media (max-width: 768px) {
    .movie-details {
      padding: var(--spacing-md);
      
      &__content {
        grid-template-columns: 1fr;
        gap: var(--spacing-lg);
      }
      
      &__title h1 {
        font-size: 2rem;
      }
      
      &__persons {
        grid-template-columns: 1fr;
      }
    }
  }
  


</style>