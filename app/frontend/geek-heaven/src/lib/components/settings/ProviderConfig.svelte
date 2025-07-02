<script lang="ts">
  import { settings } from '../../../shared/stores/settings';
  import { ProviderFactory } from '../../../shared/services/providers';
  import { Input, Button, Badge } from '../../../shared/ui';
  import type { ProviderType, KinopoiskProviderConfig } from '../../../shared/services/providers';
  
  export let providerType: ProviderType;
  export let config: KinopoiskProviderConfig;
  export let onConfigChange: (config: KinopoiskProviderConfig) => void = () => {};
  
  const factory = ProviderFactory.getInstance();
  
  let apiKeyInput = config.apiKey || '';
  let isValidating = false;
  let validationResult: 'success' | 'error' | null = null;
  let validationMessage = '';
  
  $: providerName = factory.getProviderDisplayName(providerType);
  $: registrationUrl = factory.getProviderRegistrationUrl(providerType);
  
  async function validateAndSaveApiKey() {
    if (!apiKeyInput.trim()) {
      validationResult = 'error';
      validationMessage = 'Введите API ключ';
      return;
    }
    
    isValidating = true;
    validationResult = null;
    validationMessage = '';
    
    try {
      const validation = await factory.validateProviderConfig(providerType, { apiKey: apiKeyInput });
      
      if (validation.isValid) {
        const newConfig = {
          ...config,
          apiKey: apiKeyInput,
          enabled: true
        };
        
        settings.updateKinopoiskProviderConfig(providerType, newConfig);
        onConfigChange(newConfig);
        
        validationResult = 'success';
        validationMessage = 'API ключ успешно сохранен';
      } else {
        validationResult = 'error';
        validationMessage = validation.error || 'Неверный API ключ';
      }
    } catch (error) {
      validationResult = 'error';
      validationMessage = 'Ошибка при проверке API ключа';
      console.error(`${providerType} API key validation error:`, error);
    } finally {
      isValidating = false;
    }
  }
  
  function toggleProvider() {
    const newConfig = {
      ...config,
      enabled: !config.enabled
    };
    
    settings.updateKinopoiskProviderConfig(providerType, newConfig);
    onConfigChange(newConfig);
  }
  
  function clearApiKey() {
    apiKeyInput = '';
    const newConfig = {
      ...config,
      apiKey: '',
      enabled: false
    };
    
    settings.updateKinopoiskProviderConfig(providerType, newConfig);
    onConfigChange(newConfig);
    
    validationResult = null;
    validationMessage = '';
  }
</script>

<div class="provider-config">
  <div class="provider-header">
    <div class="provider-title">
      <h3>{providerName}</h3>
      <div class="provider-status">
        {#if config.enabled && config.apiKey}
          <Badge variant="success" text="Активен" />
        {:else if config.apiKey}
          <Badge variant="warning" text="Отключен" />
        {:else}
          <Badge variant="error" text="Не настроен" />
        {/if}
      </div>
    </div>
    
    <div class="provider-toggle">
      <label class="toggle-switch">
        <input 
          type="checkbox" 
          checked={config.enabled}
          on:change={toggleProvider}
          disabled={!config.apiKey}
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>
  
  <div class="provider-body">
    <div class="api-key-section">
      <Input
        label="API Ключ"
        type="password"
        bind:value={apiKeyInput}
        placeholder="Введите API ключ для {providerName}"
        error={validationResult === 'error' ? validationMessage : ''}
        success={validationResult === 'success' ? validationMessage : ''}
      />
      
      <div class="api-key-actions">
        <Button
          variant="primary"
          size="small"
          disabled={isValidating || !apiKeyInput.trim()}
          on:click={validateAndSaveApiKey}
        >
          {isValidating ? 'Проверка...' : 'Сохранить'}
        </Button>
        
        {#if config.apiKey}
          <Button
            variant="outline"
            size="small"
            on:click={clearApiKey}
          >
            Очистить
          </Button>
        {/if}
        
        <a 
          href={registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="get-key-link"
        >
          Получить ключ
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .provider-config {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface);
    overflow: hidden;
  }
  
  .provider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--color-surface-secondary);
    border-bottom: 1px solid var(--color-border);
  }
  
  .provider-title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .provider-title h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .provider-body {
    padding: 1rem;
  }
  
  .api-key-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .get-key-link {
    color: var(--color-primary);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    margin-left: auto;
  }
  
  .get-key-link:hover {
    text-decoration: underline;
  }
  
  /* Toggle Switch Styles */
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
  }
  
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-border);
    transition: 0.3s;
    border-radius: 24px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-slider {
    background-color: var(--color-primary);
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(24px);
  }
  
  input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>