<script lang="ts">
  import type { MovieImage } from '../../shared/services/kinopoisk';
  import { createEventDispatcher } from 'svelte';
  
  export let image: MovieImage;
  export let index: number;
  export let lazy: boolean = true;
  
  const dispatch = createEventDispatcher();
  
  let imageElement: HTMLImageElement;
  let isLoaded = false;
  let hasError = false;
  let isIntersecting = false;
  
  // Intersection Observer for lazy loading
  let observer: IntersectionObserver;
  
  function setupIntersectionObserver(element: HTMLElement) {
    if (!lazy) {
      isIntersecting = true;
      return;
    }
    
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isIntersecting = true;
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(element);
    
    return {
      destroy() {
        if (observer) {
          observer.disconnect();
        }
      }
    };
  }
  
  function handleImageLoad() {
    isLoaded = true;
  }
  
  function handleImageError() {
    hasError = true;
  }
  
  function handleClick() {
    dispatch('click', { image, index });
  }
</script>

<div 
  class="image-preview" 
  use:setupIntersectionObserver
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
  tabindex="0"
  role="button"
>
  {#if isIntersecting}
    <img
      bind:this={imageElement}
      src={image.previewUrl || image.url}
      alt="{image.type} {index + 1}"
      class="image-preview__img"
      class:loaded={isLoaded}
      class:error={hasError}
      on:load={handleImageLoad}
      on:error={handleImageError}
      loading={lazy ? 'lazy' : 'eager'}
    />
  {/if}
  
  {#if !isLoaded && !hasError && isIntersecting}
    <div class="image-preview__skeleton">
      <div class="skeleton-animation"></div>
    </div>
  {/if}
  
  {#if hasError}
    <div class="image-preview__error">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7,10 12,15 17,10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>Ошибка загрузки</span>
    </div>
  {/if}
  
  <div class="image-preview__overlay">
    <div class="image-preview__type">{image.type}</div>
  </div>
</div>

<style lang="scss">
  .image-preview {
    position: relative;
    aspect-ratio: 16/9;
    border-radius: var(--border-radius-md);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--color-surface-secondary);
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    &__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      &.loaded {
        opacity: 1;
      }
      
      &.error {
        display: none;
      }
    }
    
    &__skeleton {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--color-surface-secondary);
      
      .skeleton-animation {
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
        animation: skeleton-loading 1.5s infinite;
      }
    }
    
    &__error {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      color: var(--color-text-secondary);
      background: var(--color-surface-secondary);
      
      .error-icon {
        width: 24px;
        height: 24px;
        opacity: 0.5;
      }
      
      span {
        font-size: var(--font-size-sm);
        opacity: 0.7;
      }
    }
    
    &__overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      padding: var(--spacing-md) var(--spacing-sm) var(--spacing-sm);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    &:hover &__overlay {
      opacity: 1;
    }
    
    &__type {
      color: white;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-transform: capitalize;
    }
  }
  
  @keyframes skeleton-loading {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @media (max-width: 768px) {
    .image-preview {
      &:hover {
        transform: none;
      }
      
      &__overlay {
        opacity: 1;
      }
    }
  }
</style>