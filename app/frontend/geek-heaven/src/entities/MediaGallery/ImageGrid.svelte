<script lang="ts">
  import type { MovieImage } from '../../shared/services/kinopoisk';
  import ImagePreview from './ImagePreview.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let images: MovieImage[] = [];
  export let columns: number = 4;
  export let gap: string = 'var(--spacing-md)';
  export let lazy: boolean = true;
  
  const dispatch = createEventDispatcher();
  
  function handleImageClick(event: CustomEvent) {
    dispatch('imageClick', event.detail);
  }
</script>

<div 
  class="image-grid" 
  style="--columns: {columns}; --gap: {gap}"
>
  {#each images as image, index}
    <ImagePreview 
      {image} 
      {index} 
      {lazy}
      on:click={handleImageClick}
    />
  {/each}
  
  {#if images.length === 0}
    <div class="image-grid__empty">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21,15 16,10 5,21"></polyline>
      </svg>
      <p>Изображения не найдены</p>
    </div>
  {/if}
</div>

<style lang="scss">
  .image-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: var(--gap);
    width: 100%;
    
    &__empty {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
      
      .empty-icon {
        width: 48px;
        height: 48px;
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
      }
      
      p {
        margin: 0;
        font-size: var(--font-size-md);
        opacity: 0.7;
      }
    }
  }
  
  @media (max-width: 1200px) {
    .image-grid {
      --columns: 3;
    }
  }
  
  @media (max-width: 768px) {
    .image-grid {
      --columns: 2;
    }
  }
  
  @media (max-width: 480px) {
    .image-grid {
      --columns: 1;
    }
  }
</style>