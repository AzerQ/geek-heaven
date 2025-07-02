<script lang="ts">
  import { settings } from '../../../shared/stores/settings';
  import { ProviderFactory } from '../../../shared/services/providers';
  import { Button, Input, Select } from '../../../shared/ui';
  import type { ProviderType } from '../../../shared/services/providers';
  
  export let fallbackProviders: ProviderType[];
  export let retryAttempts: number;
  export let healthCheckInterval: number;
  export let onConfigChange: () => void = () => {};
  
  const factory = ProviderFactory.getInstance();
  const availableProviders = factory.getAvailableProviders();
  
  let selectedProvider: ProviderType = availableProviders[0];
  let draggedIndex: number | null = null;
  
  $: availableForFallback = availableProviders.filter(p => !fallbackProviders.includes(p));
  
  function addFallbackProvider() {
    if (selectedProvider && !fallbackProviders.includes(selectedProvider)) {
      const newFallbacks = [...fallbackProviders, selectedProvider];
      settings.updateFallbackProviders(newFallbacks);
      onConfigChange();
    }
  }
  
  function removeFallbackProvider(provider: ProviderType) {
    const newFallbacks = fallbackProviders.filter(p => p !== provider);
    settings.updateFallbackProviders(newFallbacks);
    onConfigChange();
  }
  
  function moveProvider(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= fallbackProviders.length) return;
    
    const newFallbacks = [...fallbackProviders];
    const [movedProvider] = newFallbacks.splice(fromIndex, 1);
    newFallbacks.splice(toIndex, 0, movedProvider);
    
    settings.updateFallbackProviders(newFallbacks);
    onConfigChange();
  }
  
  function handleDragStart(event: DragEvent, index: number) {
    draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }
  
  function handleDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveProvider(draggedIndex, dropIndex);
    }
    draggedIndex = null;
  }
  
  function updateRetryAttempts() {
    settings.updateProviderRetryAttempts(retryAttempts);
    onConfigChange();
  }
  
  function updateHealthCheckInterval() {
    settings.updateProviderHealthCheckInterval(healthCheckInterval);
    onConfigChange();
  }
</script>

<div class="fallback-config">
  <div class="config-header">
    <h3>Резервные провайдеры</h3>
    <p class="config-description">
      Настройте порядок резервных провайдеров. Если основной провайдер недоступен, 
      система автоматически переключится на следующий в списке.
    </p>
  </div>
  
  <div class="config-body">
    <!-- Add Fallback Provider -->
    <div class="add-provider">
      <div class="add-provider-controls">
        <Select
          label="Добавить резервный провайдер"
          bind:value={selectedProvider}
          options={availableForFallback.map(provider => ({
            value: provider,
            label: factory.getProviderDisplayName(provider)
          }))}
          disabled={availableForFallback.length === 0}
        />
        
        <Button
          variant="outline"
          size="small"
          disabled={!selectedProvider || fallbackProviders.includes(selectedProvider)}
          on:click={addFallbackProvider}
        >
          Добавить
        </Button>
      </div>
      
      {#if availableForFallback.length === 0}
        <p class="no-providers-message">
          Все доступные провайдеры уже добавлены в резервные
        </p>
      {/if}
    </div>
    
    <!-- Fallback Providers List -->
    <div class="fallback-list">
      <h4>Порядок резервных провайдеров</h4>
      
      {#if fallbackProviders.length > 0}
        <div class="providers-list">
          {#each fallbackProviders as provider, index}
            <div 
              class="provider-item"
              draggable="true"
              on:dragstart={(e) => handleDragStart(e, index)}
              on:dragover={handleDragOver}
              on:drop={(e) => handleDrop(e, index)}
            >
              <div class="provider-info">
                <div class="drag-handle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="12" r="1"/>
                    <circle cx="9" cy="5" r="1"/>
                    <circle cx="9" cy="19" r="1"/>
                    <circle cx="15" cy="12" r="1"/>
                    <circle cx="15" cy="5" r="1"/>
                    <circle cx="15" cy="19" r="1"/>
                  </svg>
                </div>
                
                <div class="provider-details">
                  <span class="provider-name">{factory.getProviderDisplayName(provider)}</span>
                  <span class="provider-priority">Приоритет: {index + 1}</span>
                </div>
              </div>
              
              <div class="provider-actions">
                <button 
                  class="move-btn"
                  disabled={index === 0}
                  on:click={() => moveProvider(index, index - 1)}
                  title="Переместить вверх"
                >
                  ↑
                </button>
                
                <button 
                  class="move-btn"
                  disabled={index === fallbackProviders.length - 1}
                  on:click={() => moveProvider(index, index + 1)}
                  title="Переместить вниз"
                >
                  ↓
                </button>
                
                <button 
                  class="remove-btn"
                  on:click={() => removeFallbackProvider(provider)}
                  title="Удалить"
                >
                  ×
                </button>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-list">Резервные провайдеры не настроены</p>
      {/if}
    </div>
    
    <!-- Advanced Settings -->
    <div class="advanced-settings">
      <h4>Дополнительные настройки</h4>
      
      <div class="settings-row">
        <Input
          label="Количество попыток"
          type="number"
          bind:value={retryAttempts}
          min="1"
          max="10"
          on:blur={updateRetryAttempts}
        />
        
        <Input
          label="Интервал проверки здоровья (мс)"
          type="number"
          bind:value={healthCheckInterval}
          min="10000"
          max="300000"
          step="5000"
          on:blur={updateHealthCheckInterval}
        />
      </div>
      
      <div class="settings-help">
        <p><strong>Количество попыток:</strong> Сколько раз повторить запрос при ошибке</p>
        <p><strong>Интервал проверки:</strong> Как часто проверять доступность провайдеров</p>
      </div>
    </div>
  </div>
</div>

<style>
  .fallback-config {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface);
    overflow: hidden;
  }
  
  .config-header {
    padding: 1rem;
    background: var(--color-surface-secondary);
    border-bottom: 1px solid var(--color-border);
  }
  
  .config-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .config-description {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }
  
  .config-body {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .add-provider-controls {
    display: flex;
    gap: 1rem;
    align-items: end;
  }
  
  .add-provider-controls :global(.select-container) {
    flex: 1;
  }
  
  .no-providers-message {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    font-style: italic;
  }
  
  .fallback-list h4,
  .advanced-settings h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .providers-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .provider-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--color-surface-secondary);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: move;
    transition: all 0.2s ease;
  }
  
  .provider-item:hover {
    background: var(--color-surface-tertiary);
    border-color: var(--color-primary);
  }
  
  .provider-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .drag-handle {
    color: var(--color-text-secondary);
    cursor: grab;
  }
  
  .drag-handle:active {
    cursor: grabbing;
  }
  
  .provider-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .provider-name {
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  .provider-priority {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
  }
  
  .provider-actions {
    display: flex;
    gap: 0.25rem;
  }
  
  .move-btn,
  .remove-btn {
    background: none;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }
  
  .move-btn:hover:not(:disabled) {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  
  .remove-btn:hover {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
  }
  
  .move-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .empty-list {
    margin: 0;
    padding: 2rem;
    text-align: center;
    color: var(--color-text-secondary);
    font-style: italic;
    background: var(--color-surface-secondary);
    border-radius: 6px;
  }
  
  .settings-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .settings-help {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--color-surface-secondary);
    border-radius: 6px;
    border: 1px solid var(--color-border);
  }
  
  .settings-help p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }
  
  .settings-help p:last-child {
    margin-bottom: 0;
  }
</style>