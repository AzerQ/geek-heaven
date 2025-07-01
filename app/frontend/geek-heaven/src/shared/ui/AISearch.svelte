<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button, Input } from '.';
  import MovieSuggestionCard from './MovieSuggestionCard.svelte';
  import { openRouterService, type MovieSuggestion, type AISearchResponse } from '../services/openrouter';
  import { settings } from '../stores/settings';
  import { isOpenRouterApiKeyConfigured } from '../stores/settings';

  const dispatch = createEventDispatcher();

  let description = '';
  let suggestions: MovieSuggestion[] = [];
  let isLoading = false;
  let error: string | null = null;
  let hasSearched = false;
  let apiKeyConfigured = false;

  // Subscribe to settings to check OpenRouter API key
  settings.subscribe(value => {
    apiKeyConfigured = isOpenRouterApiKeyConfigured(value.openrouterApiKey);
    if (value.openrouterApiKey) {
      openRouterService.setApiKey(value.openrouterApiKey);
    }
  });

  /**
   * Handle AI search by description
   */
  async function handleAISearch() {
    if (!apiKeyConfigured) {
      error = 'OpenRouter API ключ не настроен. Перейдите в настройки.';
      return;
    }

    if (!description.trim()) {
      error = 'Пожалуйста, введите описание фильма';
      return;
    }

    isLoading = true;
    error = null;
    hasSearched = true;
    suggestions = [];

    try {
      const response: AISearchResponse = await openRouterService.searchByDescription(description);
      suggestions = response.suggestions;
      
      if (suggestions.length === 0) {
        error = 'AI не смог найти подходящие фильмы по вашему описанию. Попробуйте изменить описание.';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Ошибка при поиске с помощью AI';
      console.error('AI Search error:', err);
      suggestions = [];
    } finally {
      isLoading = false;
    }
  }

  /**
   * Handle suggestion selection
   */
  function handleSuggestionSelect(event: CustomEvent) {
    const { suggestion } = event.detail;
    dispatch('suggestionSelect', { 
      query: suggestion.title,
      type: suggestion.type
    });
  }

  /**
   * Handle key press in description input
   */
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAISearch();
    }
  }

  /**
   * Clear search results
   */
  function clearSearch() {
    description = '';
    suggestions = [];
    error = null;
    hasSearched = false;
  }

  /**
   * Navigate to settings
   */
  function goToSettings() {
    dispatch('navigate', { page: 'settings' });
  }
</script>

<div class="ai-search">
  <div class="ai-search__header">
    <h2>🤖 Поиск по описанию</h2>
    <p>Опишите фильм, который вы ищете, и AI предложит варианты</p>
  </div>

  {#if !apiKeyConfigured}
    <div class="ai-search__no-api">
      <h3>OpenRouter API ключ не настроен</h3>
      <p>Для использования AI поиска необходимо настроить API ключ OpenRouter в настройках.</p>
      <Button variant="primary" on:click={goToSettings}>
        Перейти в настройки
      </Button>
    </div>
  {:else}
    <div class="ai-search__input">
      <div class="ai-search__textarea-container">
        <textarea
          bind:value={description}
          placeholder="Например: 'Фильм про космонавта, который застрял на Марсе и выращивает картошку' или 'Сериал про учителя химии, который варит наркотики'"
          rows="3"
          maxlength="500"
          on:keypress={handleKeyPress}
          disabled={isLoading}
        ></textarea>
        <div class="ai-search__char-count">
          {description.length}/500
        </div>
      </div>
      
      <div class="ai-search__buttons">
        <Button 
          variant="primary" 
          disabled={isLoading || !description.trim()}
          on:click={handleAISearch}
        >
          {isLoading ? '🔍 Ищу...' : '🔍 Найти с помощью AI'}
        </Button>
        
        {#if hasSearched}
          <Button variant="outline" on:click={clearSearch}>
            Очистить
          </Button>
        {/if}
      </div>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="ai-search__error">
        <p>{error}</p>
      </div>
    {/if}

    <!-- Loading State -->
    {#if isLoading}
      <div class="ai-search__loading">
        <div class="ai-search__spinner"></div>
        <p>AI анализирует ваше описание...</p>
      </div>
    {/if}

    <!-- Results -->
    {#if suggestions.length > 0}
      <div class="ai-search__results">
        <div class="ai-search__results-header">
          <h3>Предложения от AI</h3>
          <span class="ai-search__results-count">{suggestions.length} вариант{suggestions.length === 1 ? '' : suggestions.length < 5 ? 'а' : 'ов'}</span>
        </div>
        
        <div class="ai-search__suggestions">
          {#each suggestions as suggestion (suggestion.title)}
            <MovieSuggestionCard 
              {suggestion} 
              on:select={handleSuggestionSelect}
            />
          {/each}
        </div>
      </div>
    {:else if hasSearched && !isLoading && !error}
      <div class="ai-search__no-results">
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить описание или добавить больше деталей</p>
      </div>
    {/if}

    <!-- Help Section -->
    {#if !hasSearched}
      <div class="ai-search__help">
        <h3>💡 Советы для лучшего поиска</h3>
        <ul>
          <li>Опишите сюжет, персонажей или ключевые сцены</li>
          <li>Укажите жанр или настроение фильма</li>
          <li>Добавьте детали, которые запомнились больше всего</li>
          <li>Можно указать примерный год выхода или страну</li>
        </ul>
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .ai-search {
    &__header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
      
      h2 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-text-primary);
        font-size: 1.5rem;
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
      }
    }

    &__no-api {
      text-align: center;
      padding: var(--spacing-xl);
      background: var(--color-surface);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--color-border);
      
      h3 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0 0 var(--spacing-lg) 0;
        color: var(--color-text-secondary);
      }
    }

    &__input {
      margin-bottom: var(--spacing-xl);
    }

    &__textarea-container {
      position: relative;
      margin-bottom: var(--spacing-md);
      
      textarea {
        width: 100%;
        padding: var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        background: var(--color-surface);
        color: var(--color-text-primary);
        font-family: inherit;
        font-size: 0.9rem;
        line-height: 1.5;
        resize: vertical;
        min-height: 80px;
        
        &:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: -2px;
          border-color: var(--color-primary);
        }
        
        &:disabled {
          background: var(--color-background);
          color: var(--color-text-secondary);
          cursor: not-allowed;
        }
        
        &::placeholder {
          color: var(--color-text-tertiary);
        }
      }
    }

    &__char-count {
      position: absolute;
      bottom: var(--spacing-xs);
      right: var(--spacing-sm);
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      background: var(--color-surface);
      padding: 2px 4px;
      border-radius: var(--border-radius-sm);
    }

    &__buttons {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
    }

    &__error {
      padding: var(--spacing-md);
      background: color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
      border: 1px solid var(--color-danger);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
      
      p {
        margin: 0;
        color: var(--color-danger);
        text-align: center;
      }
    }

    &__loading {
      text-align: center;
      padding: var(--spacing-xl);
      
      p {
        margin: var(--spacing-md) 0 0 0;
        color: var(--color-text-secondary);
      }
    }

    &__spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--color-border);
      border-top: 3px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    &__results {
      margin-bottom: var(--spacing-xl);
      
      &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        
        h3 {
          margin: 0;
          color: var(--color-text-primary);
        }
        
        &-count {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }
      }
    }

    &__suggestions {
      display: grid;
      gap: var(--spacing-lg);
    }

    &__no-results {
      text-align: center;
      padding: var(--spacing-xl);
      
      h3 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
      }
    }

    &__help {
      background: var(--color-surface);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      border: 1px solid var(--color-border);
      
      h3 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
      }
      
      ul {
        margin: 0;
        padding-left: var(--spacing-lg);
        
        li {
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-xs);
          line-height: 1.4;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .ai-search {
      &__buttons {
        flex-direction: column;
      }
      
      &__results-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
      }
    }
  }
</style>