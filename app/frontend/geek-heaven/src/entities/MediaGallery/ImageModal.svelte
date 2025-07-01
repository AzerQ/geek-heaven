<script lang="ts">
  import type { MovieImage } from '../../shared/services/kinopoisk';
  import { createEventDispatcher } from 'svelte';
  import { Button } from '../../shared/ui';
  
  export let images: MovieImage[] = [];
  export let currentIndex: number = 0;
  export let isOpen: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  $: currentImage = images[currentIndex];
  $: canGoPrev = currentIndex > 0;
  $: canGoNext = currentIndex < images.length - 1;
  
  function close() {
    dispatch('close');
  }
  
  function goToPrev() {
    if (canGoPrev) {
      currentIndex = currentIndex - 1;
    }
  }
  
  function goToNext() {
    if (canGoNext) {
      currentIndex = currentIndex + 1;
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
    
    switch (event.key) {
      case 'Escape':
        close();
        break;
      case 'ArrowLeft':
        goToPrev();
        break;
      case 'ArrowRight':
        goToNext();
        break;
    }
  }
  
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen && currentImage}
  <div 
    class="image-modal" 
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-label="Просмотр изображения"
  >
    <div class="image-modal__content">
      <!-- Header -->
      <div class="image-modal__header">
        <div class="image-modal__info">
          <span class="image-modal__counter">
            {currentIndex + 1} из {images.length}
          </span>
          <span class="image-modal__type">
            {currentImage.type}
          </span>
        </div>
        
        <button 
          class="image-modal__close"
          on:click={close}
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>
      
      <!-- Image Container -->
      <div class="image-modal__image-container">
        {#if canGoPrev}
          <button 
            class="image-modal__nav image-modal__nav--prev"
            on:click={goToPrev}
            aria-label="Предыдущее изображение"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
        {/if}
        
        <img 
          src={currentImage.url}
          alt="{currentImage.type} {currentIndex + 1}"
          class="image-modal__image"
        />
        
        {#if canGoNext}
          <button 
            class="image-modal__nav image-modal__nav--next"
            on:click={goToNext}
            aria-label="Следующее изображение"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        {/if}
      </div>
      
      <!-- Thumbnails -->
      {#if images.length > 1}
        <div class="image-modal__thumbnails">
          {#each images as image, index}
            <button
              class="image-modal__thumbnail"
              class:active={index === currentIndex}
              on:click={() => currentIndex = index}
              aria-label="Изображение {index + 1}"
            >
              <img 
                src={image.previewUrl || image.url} 
                alt="{image.type} {index + 1}"
              />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style lang="scss">
  .image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-lg);
    
    &__content {
      display: flex;
      flex-direction: column;
      max-width: 90vw;
      max-height: 90vh;
      width: 100%;
      height: 100%;
    }
    
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) 0;
      color: white;
    }
    
    &__info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
    
    &__counter {
      font-size: var(--font-size-sm);
      opacity: 0.8;
    }
    
    &__type {
      background: rgba(255, 255, 255, 0.2);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      text-transform: capitalize;
    }
    
    &__close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }
      
      svg {
        width: 24px;
        height: 24px;
        stroke-width: 2;
      }
    }
    
    &__image-container {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }
    
    &__image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: var(--border-radius-md);
    }
    
    &__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.6);
      border: none;
      color: white;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
      
      &:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: translateY(-50%) scale(1.1);
      }
      
      &--prev {
        left: var(--spacing-lg);
      }
      
      &--next {
        right: var(--spacing-lg);
      }
      
      svg {
        width: 32px;
        height: 32px;
        stroke-width: 2;
      }
    }
    
    &__thumbnails {
      display: flex;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) 0;
      overflow-x: auto;
      justify-content: center;
      
      &::-webkit-scrollbar {
        height: 4px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
      }
    }
    
    &__thumbnail {
      flex-shrink: 0;
      width: 60px;
      height: 40px;
      border: 2px solid transparent;
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      background: none;
      padding: 0;
      
      &.active {
        border-color: var(--color-primary);
      }
      
      &:hover {
        border-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.05);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  
  @media (max-width: 768px) {
    .image-modal {
      padding: var(--spacing-md);
      
      &__nav {
        width: 48px;
        height: 48px;
        
        &--prev {
          left: var(--spacing-md);
        }
        
        &--next {
          right: var(--spacing-md);
        }
        
        svg {
          width: 28px;
          height: 28px;
        }
      }
      
      &__thumbnail {
        width: 50px;
        height: 35px;
      }
    }
  }
</style>