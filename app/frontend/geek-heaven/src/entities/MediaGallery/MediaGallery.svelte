<script lang="ts">
  import type { MovieImage, ImageType } from '../../shared/services/kinopoisk';
  import { kinopoiskService } from '../../shared/services/kinopoisk';
  import ImageGrid from './ImageGrid.svelte';
  import ImageModal from './ImageModal.svelte';
  import { Button, Badge } from '../../shared/ui';
  import { onMount } from 'svelte';
  
  export let movieId: number;
  export let initialType: ImageType = 'cover';
  export let showTypeFilter: boolean = true;
  export let columns: number = 4;
  
  let images: MovieImage[] = [];
  let loading = false;
  let error: string | null = null;
  let currentType: ImageType = initialType;
  let isModalOpen = false;
  let modalCurrentIndex = 0;
  
  const imageTypes: { type: ImageType; label: string }[] = [
    { type: 'cover', label: 'Постеры' },
    { type: 'screenshot', label: 'Скриншоты' },
    { type: 'backdrops', label: 'Фоны' },
    { type: 'frame', label: 'Кадры' }
  ];
  
  $: filteredImages = images.filter(img => img.type === currentType);
  
  async function loadImages(type: ImageType) {
    loading = true;
    error = null;
    
    try {
      const response = await kinopoiskService.getMovieImages(movieId, type, 1, 50);
      images = response.docs;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Ошибка загрузки изображений';
      images = [];
    } finally {
      loading = false;
    }
  }
  
  function handleTypeChange(type: ImageType) {
    if (currentType !== type) {
      currentType = type;
      loadImages(type);
    }
  }
  
  function handleImageClick(event: CustomEvent) {
    const { index } = event.detail;
    modalCurrentIndex = index;
    isModalOpen = true;
  }
  
  function handleModalClose() {
    isModalOpen = false;
  }
  
  onMount(() => {
    loadImages(currentType);
  });
</script>

<div class="media-gallery">
  <!-- Header -->
  <div class="media-gallery__header">
    <h3 class="media-gallery__title">Галерея изображений</h3>
    
    {#if showTypeFilter}
      <div class="media-gallery__filters">
        {#each imageTypes as { type, label }}
          <Button
            variant={currentType === type ? 'primary' : 'outline'}
            size="sm"
            on:click={() => handleTypeChange(type)}
            disabled={loading}
          >
            {label}
          </Button>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- Content -->
  <div class="media-gallery__content">
    {#if loading}
      <div class="media-gallery__loading">
        <div class="loading-spinner"></div>
        <p>Загрузка изображений...</p>
      </div>
    {:else if error}
      <div class="media-gallery__error">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          on:click={() => loadImages(currentType)}
        >
          Попробовать снова
        </Button>
      </div>
    {:else}
      <div class="media-gallery__grid">
        <ImageGrid 
          images={filteredImages} 
          {columns}
          on:imageClick={handleImageClick}
        />
      </div>
      
      {#if filteredImages.length > 0}
        <div class="media-gallery__stats">
          <Badge 
            variant="secondary" 
            text="{filteredImages.length} изображений"
          />
        </div>
      {/if}
    {/if}
  </div>
  
  <!-- Modal -->
  <ImageModal 
    images={filteredImages}
    currentIndex={modalCurrentIndex}
    isOpen={isModalOpen}
    on:close={handleModalClose}
  />
</div>

<style lang="scss">
  .media-gallery {
    width: 100%;
    
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
      gap: var(--spacing-md);
      
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md);
      }
    }
    
    &__title {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    
    &__filters {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      
      @media (max-width: 768px) {
        justify-content: center;
      }
    }
    
    &__content {
      min-height: 200px;
    }
    
    &__loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
      
      .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--color-border);
        border-top: 3px solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: var(--spacing-md);
      }
      
      p {
        margin: 0;
        font-size: var(--font-size-md);
      }
    }
    
    &__error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
      text-align: center;
      
      .error-icon {
        width: 48px;
        height: 48px;
        margin-bottom: var(--spacing-md);
        color: var(--color-danger);
      }
      
      p {
        margin: 0 0 var(--spacing-md) 0;
        font-size: var(--font-size-md);
      }
    }
    
    &__grid {
      margin-bottom: var(--spacing-md);
    }
    
    &__stats {
      display: flex;
      justify-content: center;
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>