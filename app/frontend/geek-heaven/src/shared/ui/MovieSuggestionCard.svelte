<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MovieSuggestion } from '../services/openrouter';

  export let suggestion: MovieSuggestion;
  
  const dispatch = createEventDispatcher();

  // Map content types to display labels
  const typeLabels: Record<string, string> = {
    'movie': 'Фильм',
    'tv-series': 'Сериал',
    'cartoon': 'Мультфильм',
    'anime': 'Аниме'
  };

  // Get confidence color based on value
  function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'var(--color-success)';
    if (confidence >= 0.6) return 'var(--color-warning)';
    return 'var(--color-danger)';
  }

  // Format confidence as percentage
  function formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  function handleClick() {
    dispatch('select', { suggestion });
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<div 
  class="suggestion-card"
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keypress={handleKeyPress}
>
  <div class="suggestion-card__header">
    <h3 class="suggestion-card__title">{suggestion.title}</h3>
    <div class="suggestion-card__badges">
      <span class="suggestion-card__type">{typeLabels[suggestion.type] || suggestion.type}</span>
      <span 
        class="suggestion-card__confidence"
        style="color: {getConfidenceColor(suggestion.confidence)}"
      >
        {formatConfidence(suggestion.confidence)}
      </span>
    </div>
  </div>
  
  <p class="suggestion-card__description">{suggestion.description}</p>
  
  <div class="suggestion-card__action">
    <span class="suggestion-card__hint">Нажмите для поиска</span>
  </div>
</div>

<style lang="scss">
  .suggestion-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    
    &:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    &:active {
      transform: translateY(0);
    }

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);
      gap: var(--spacing-sm);
    }

    &__title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      line-height: 1.3;
      flex: 1;
    }

    &__badges {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--spacing-xs);
      flex-shrink: 0;
    }

    &__type {
      background: var(--color-primary);
      color: white;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    &__confidence {
      font-size: 0.875rem;
      font-weight: 600;
      padding: var(--spacing-xs);
    }

    &__description {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--color-text-secondary);
      line-height: 1.5;
      font-size: 0.9rem;
    }

    &__action {
      display: flex;
      justify-content: center;
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--color-border);
    }

    &__hint {
      color: var(--color-text-tertiary);
      font-size: 0.8rem;
      font-style: italic;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover &__hint {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .suggestion-card {
      padding: var(--spacing-md);
      
      &__header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }
      
      &__badges {
        flex-direction: row;
        align-items: center;
        align-self: stretch;
        justify-content: space-between;
      }
      
      &__title {
        font-size: 1rem;
      }
    }
  }
</style>