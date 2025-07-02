<script lang="ts">
  import { settings } from '../../../shared/stores/settings';
  import { ProviderFactory } from '../../../shared/services/providers';
  import { Select } from '../../../shared/ui';
  import type { ProviderType } from '../../../shared/services/providers';
  
  export let selectedProvider: ProviderType;
  export let onProviderChange: (provider: ProviderType) => void = () => {};
  
  const factory = ProviderFactory.getInstance();
  const availableProviders = factory.getAvailableProviders();
  
  $: providerOptions = availableProviders.map(provider => ({
    value: provider,
    label: factory.getProviderDisplayName(provider),
    description: factory.getProviderDescription(provider)
  }));
  
  function handleProviderChange() {
    onProviderChange(selectedProvider);
    settings.updateSelectedKinopoiskProvider(selectedProvider);
  }
</script>

<div class="provider-selector">
  <Select
    label="Основной провайдер"
    bind:value={selectedProvider}
    on:change={handleProviderChange}
    options={providerOptions}
  />
  
  <div class="provider-info">
    {#if selectedProvider}
      {@const info = factory.getProviderDescription(selectedProvider)}
      <p class="provider-description">{info}</p>
      
      <div class="provider-links">
        <a 
          href={factory.getProviderDocumentationUrl(selectedProvider)} 
          target="_blank" 
          rel="noopener noreferrer"
          class="provider-link"
        >
          Документация
        </a>
        <a 
          href={factory.getProviderRegistrationUrl(selectedProvider)} 
          target="_blank" 
          rel="noopener noreferrer"
          class="provider-link"
        >
          Получить API ключ
        </a>
      </div>
    {/if}
  </div>
</div>

<style>
  .provider-selector {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .provider-info {
    padding: 1rem;
    background: var(--color-surface-secondary);
    border-radius: 8px;
    border: 1px solid var(--color-border);
  }
  
  .provider-description {
    margin: 0 0 1rem 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .provider-links {
    display: flex;
    gap: 1rem;
  }
  
  .provider-link {
    color: var(--color-primary);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  
  .provider-link:hover {
    color: var(--color-primary-hover);
    text-decoration: underline;
  }
</style>