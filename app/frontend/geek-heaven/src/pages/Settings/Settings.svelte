<script lang="ts">
  import { settings, validateOpenRouterApiKey, type AppSettings, getProviderManagerConfig } from '../../shared/stores/settings';
  import { AI_MODELS, getAIModelById, validateAIModelId, type AIModel } from '../../shared/constants/aiModels';
  import { kinopoiskService } from '../../shared/services/kinopoisk';
  import { openRouterService } from '../../shared/services/openrouter';
  import { Button, Input, Badge, NotificationHistory, Select } from '../../shared/ui';
  import { ProviderSelector, ProviderConfig, ProviderStatus, FallbackConfig } from '../../lib/components/settings';
  import type { ProviderType, KinopoiskProviderConfig } from '../../shared/services/providers';
  import { onMount } from 'svelte';

  let currentSettings: AppSettings;
  let openRouterApiKeyInput = '';
  let selectedAiModel = '';
  let customAiModel = '';
  let showCustomModel = false;
  let isValidatingOpenRouter = false;
  let openRouterValidationResult: 'success' | 'error' | null = null;
  let openRouterValidationMessage = '';
  
  // Provider-related state
  let selectedProvider: ProviderType;
  let providerConfigs: Map<ProviderType, KinopoiskProviderConfig> = new Map();
  let showMigrationNotice = false;

  // Subscribe to settings
  settings.subscribe(value => {
    currentSettings = value;
    openRouterApiKeyInput = value.openrouterApiKey;
    selectedProvider = value.selectedKinopoiskProvider;
    providerConfigs = getProviderManagerConfig(value);
    
    // Check if migration is needed
    showMigrationNotice = value.kinopoiskApiKey && !value.kinopoiskProviders?.dev?.apiKey;
    
    // Initialize AI model selection
    const isKnownModel = AI_MODELS.some(model => model.id === value.aiModel);
    if (isKnownModel) {
      selectedAiModel = value.aiModel;
      showCustomModel = false;
      customAiModel = '';
    } else {
      selectedAiModel = 'custom';
      showCustomModel = true;
      customAiModel = value.aiModel;
    }
  });

  onMount(async () => {
    // Initialize KinopoiskService with new provider system
    await kinopoiskService.initialize();
    
    // Set OpenRouter API key
    if (currentSettings.openrouterApiKey) {
      openRouterService.setApiKey(currentSettings.openrouterApiKey);
    }
  });

  // Migration function
  async function migrateLegacyApiKey() {
    if (currentSettings.kinopoiskApiKey) {
      // Migrate to new provider system
      await settings.updateKinopoiskProviderConfig('dev', {
        apiKey: currentSettings.kinopoiskApiKey,
        enabled: true
      });
      
      // Clear legacy API key
      await settings.updateKinopoiskApiKey('');
      showMigrationNotice = false;
    }
  }

  async function validateAndSaveOpenRouterApiKey() {
    if (!openRouterApiKeyInput.trim()) {
      openRouterValidationResult = 'error';
      openRouterValidationMessage = 'Введите API ключ OpenRouter';
      return;
    }

    if (!validateOpenRouterApiKey(openRouterApiKeyInput)) {
      openRouterValidationResult = 'error';
      openRouterValidationMessage = 'Неверный формат API ключа OpenRouter';
      return;
    }

    isValidatingOpenRouter = true;
    openRouterValidationResult = null;
    openRouterValidationMessage = '';

    try {
      const isValid = await openRouterService.testConnection(openRouterApiKeyInput);
      
      if (isValid) {
        settings.updateOpenRouterApiKey(openRouterApiKeyInput);
        openRouterService.setApiKey(openRouterApiKeyInput);
        openRouterValidationResult = 'success';
        openRouterValidationMessage = 'API ключ OpenRouter успешно сохранен';
      } else {
        openRouterValidationResult = 'error';
        openRouterValidationMessage = 'Неверный API ключ OpenRouter или нет доступа к API';
      }
    } catch (error) {
      openRouterValidationResult = 'error';
      openRouterValidationMessage = 'Ошибка при проверке API ключа OpenRouter';
      console.error('OpenRouter API key validation error:', error);
    } finally {
      isValidatingOpenRouter = false;
    }
  }

  function updateTheme(theme: 'light' | 'dark') {
    settings.updateTheme(theme);
  }

  function handleAiModelChange() {
    if (selectedAiModel === 'custom') {
      showCustomModel = true;
    } else {
      showCustomModel = false;
      customAiModel = '';
      settings.updateAiModel(selectedAiModel);
    }
  }

  function saveCustomAiModel() {
    if (customAiModel.trim() && validateAIModelId(customAiModel.trim())) {
      settings.updateAiModel(customAiModel.trim());
    }
  }

  function resetSettings() {
    if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
      settings.reset();
      validationResult = null;
      validationMessage = '';
      openRouterValidationResult = null;
      openRouterValidationMessage = '';
    }
  }
</script>

<div class="settings">
  <div class="settings__header">
    <h1>Настройки</h1>
    <p>Настройте приложение под себя</p>
  </div>

  <div class="settings__content">
    <!-- Migration Notice -->
    {#if showMigrationNotice}
      <section class="settings__section migration-notice">
        <h2>Обновление конфигурации</h2>
        <div class="migration-content">
          <p>Обнаружен устаревший API ключ Kinopoisk. Мигрировать в новую систему провайдеров?</p>
          <Button variant="primary" on:click={migrateLegacyApiKey}>
            Мигрировать настройки
          </Button>
        </div>
      </section>
    {/if}

    <!-- Kinopoisk Providers Configuration -->
    <section class="settings__section">
      <h2>Провайдеры Kinopoisk</h2>
      
      <!-- Provider Selection -->
      <div class="settings__field">
        <ProviderSelector bind:selectedProvider />
      </div>
      
      <!-- Provider Configuration -->
      <div class="settings__field">
        <ProviderConfig {providerConfigs} />
      </div>
      
      <!-- Provider Status -->
      <div class="settings__field">
        <ProviderStatus />
      </div>
      
      <!-- Fallback Configuration -->
      <div class="settings__field">
        <FallbackConfig />
      </div>
    </section>

    <!-- OpenRouter API Configuration -->
    <section class="settings__section">
      <h2>OpenRouter API Конфигурация</h2>
      <p class="settings__description">
        Для работы с AI поиском фильмов необходим API ключ от OpenRouter.
        <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
          Получить ключ
        </a>
      </p>
      
      <div class="settings__field">
        <Input
          label="API Ключ OpenRouter"
          type="password"
          bind:value={openRouterApiKeyInput}
          placeholder="Введите ваш API ключ OpenRouter"
          error={openRouterValidationResult === 'error' ? openRouterValidationMessage : ''}
          success={openRouterValidationResult === 'success' ? openRouterValidationMessage : ''}
        />
        
        <div class="settings__actions">
          <Button
            variant="primary"
            disabled={isValidatingOpenRouter || !openRouterApiKeyInput.trim()}
            on:click={validateAndSaveOpenRouterApiKey}
          >
            {isValidatingOpenRouter ? 'Проверка...' : 'Сохранить ключ'}
          </Button>
          
          {#if currentSettings.openrouterApiKey}
            <Badge variant="success" text="Ключ настроен" />
          {:else}
            <Badge variant="warning" text="Ключ не настроен" />
          {/if}
        </div>
      </div>
    </section>

    <!-- AI Model Selection -->
    <section class="settings__section">
      <h2>Модель ИИ</h2>
      <p class="settings__description">
        Выберите модель искусственного интеллекта для анализа описаний фильмов.
        <a href="https://openrouter.ai/docs#models" target="_blank" rel="noopener noreferrer">
          Список всех моделей
        </a>
      </p>
      
      <div class="settings__field">
        <Select
          label="Модель ИИ"
          bind:value={selectedAiModel}
          on:change={handleAiModelChange}
          options={[
            ...AI_MODELS.map(model => ({
              value: model.id,
              label: `${model.name} (${model.provider})${model.recommended ? ' - Рекомендуется' : ''}`,
              description: model.description
            })),
            {
              value: 'custom',
              label: 'Другая модель...',
              description: 'Введите идентификатор модели вручную'
            }
          ]}
        />
        
        {#if showCustomModel}
          <div class="settings__custom-model">
            <Input
              label="Идентификатор модели"
              bind:value={customAiModel}
              placeholder="Например: anthropic/claude-3.5-sonnet"
              on:blur={saveCustomAiModel}
            />
            <p class="settings__help-text">
              Формат: provider/model-name (например: anthropic/claude-3.5-sonnet)
            </p>
          </div>
        {/if}
        
        <div class="settings__model-info">
          {#if selectedAiModel !== 'custom'}
            {@const modelInfo = getAIModelById(selectedAiModel)}
            {#if modelInfo}
              <div class="settings__current-model">
                <strong>Текущая модель:</strong> {modelInfo.name} ({modelInfo.provider})
                <br>
                <span class="settings__model-description">{modelInfo.description}</span>
              </div>
            {/if}
          {:else if customAiModel}
            <div class="settings__current-model">
              <strong>Кастомная модель:</strong> {customAiModel}
            </div>
          {/if}
        </div>
      </div>
    </section>

    <!-- Theme Settings -->
    <section class="settings__section">
      <h2>Внешний вид</h2>
      
      <div class="settings__field">
        <div class="settings__label">Тема</div>
        <div class="settings__theme-buttons">
          <Button
            variant={currentSettings.theme === 'dark' ? 'primary' : 'outline'}
            on:click={() => updateTheme('dark')}
          >
            Темная
          </Button>
          <Button
            variant={currentSettings.theme === 'light' ? 'primary' : 'outline'}
            on:click={() => updateTheme('light')}
          >
            Светлая
          </Button>
        </div>
      </div>
    </section>

    <!-- Notifications History -->
    <section class="settings__section">
      <h2>История уведомлений</h2>
      <p class="settings__description">
        Просматривайте все ваши уведомления и управляйте ими.
      </p>
      
      <div class="settings__notifications">
        <NotificationHistory showSearch={true} itemsPerPage={10} />
      </div>
    </section>

    <!-- App Info -->
    <section class="settings__section">
      <h2>О приложении</h2>
      <div class="settings__info">
        <p><strong>Версия:</strong> 1.0.0</p>
        <p><strong>Разработчик:</strong> Geek Heaven Team</p>
        <p><strong>API:</strong> Kinopoisk API</p>
      </div>
    </section>

    <!-- Danger Zone -->
    <section class="settings__section settings__section--danger">
      <h2>Опасная зона</h2>
      <p class="settings__description">
        Эти действия необратимы. Будьте осторожны.
      </p>
      
      <div class="settings__actions">
        <Button
          variant="outline"
          on:click={resetSettings}
        >
          Сбросить все настройки
        </Button>
      </div>
    </section>
  </div>
</div>

<style lang="scss">
  .settings {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-lg);

    &__header {
      margin-bottom: var(--spacing-xl);
      
      h1 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
      }
    }

    &__content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    &__section {
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--color-border);
      
      &--danger {
        border-color: var(--color-danger);
        background: color-mix(in srgb, var(--color-danger) 5%, var(--color-surface));
      }
      
      h2 {
        margin: 0 0 var(--spacing-md) 0;
        color: var(--color-text-primary);
        font-size: 1.25rem;
      }
    }

    // Migration notice styles
    .migration-notice {
      border-color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning) 5%, var(--color-surface));
      
      h2 {
        color: var(--color-warning);
      }
    }

    .migration-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
      }
    }

    &__description {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--color-text-secondary);
      line-height: 1.5;
      
      a {
        color: var(--color-primary);
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    &__field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    &__label {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    &__theme-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }

    &__notifications {
      margin-top: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--color-background);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--color-border);
    }

    &__info {
      p {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-text-secondary);
        
        &:last-child {
          margin-bottom: 0;
        }
        
        strong {
          color: var(--color-text-primary);
        }
      }
    }

    &__custom-model {
      margin-top: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--color-border);
    }

    &__help-text {
      margin: var(--spacing-sm) 0 0 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-style: italic;
    }

    &__model-info {
      margin-top: var(--spacing-md);
    }

    &__current-model {
      padding: var(--spacing-md);
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
      border-radius: var(--border-radius-md);
      border: 1px solid color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
      
      strong {
        color: var(--color-text-primary);
      }
    }

    &__model-description {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  }

  @media (max-width: 768px) {
    .settings {
      padding: var(--spacing-md);
      
      &__section {
        padding: var(--spacing-md);
      }
      
      &__actions {
        flex-direction: column;
        align-items: stretch;
      }
      
      &__theme-buttons {
        flex-direction: column;
      }
    }
  }
</style>