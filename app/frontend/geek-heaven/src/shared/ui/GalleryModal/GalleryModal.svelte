<script lang="ts">
  import { Button } from '../Button';
  import { MediaGallery } from '../../../entities/MediaGallery';
  import { createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  export let movieId: number;
  export let movieTitle: string;
  
  const dispatch = createEventDispatcher();
  
  function handleClose() {
    dispatch('close');
  }
  
  function handleBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

{#if isOpen}
  <div class="gallery-modal" on:click={handleBackdropClick} role="dialog" aria-modal="true">
    <div class="gallery-modal__content" on:click={(e) => e.stopPropagation()}>
      <div class="gallery-modal__header">
        <h3 class="gallery-modal__title">{movieTitle}</h3>
        <Button 
          variant="outline" 
          size="sm"
          on:click={handleClose}
          aria-label="Закрыть галерею"
        >
          ✕
        </Button>
      </div>
      
      <div class="gallery-modal__body">
        <MediaGallery {movieId} />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .gallery-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-lg);
    
    &__content {
      background: var(--color-surface);
      border-radius: var(--border-radius-lg);
      max-width: 90vw;
      max-height: 90vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    
    &__title {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    &__body {
      flex: 1;
      overflow: auto;
      padding: var(--spacing-lg);
    }
  }
  
  @media (max-width: 768px) {
    .gallery-modal {
      padding: var(--spacing-sm);
      
      &__content {
        max-width: 95vw;
        max-height: 95vh;
      }
      
      &__header {
        padding: var(--spacing-md);
      }
      
      &__body {
        padding: var(--spacing-md);
      }
    }
  }
</style>