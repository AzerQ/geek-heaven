<script lang="ts">
  import { settings, validateApiKey, type AppSettings } from '../../shared/stores/settings';
  import { kinopoiskService } from '../../shared/services/kinopoisk';
  import { Button, Input, Badge, NotificationHistory } from '../../shared/ui';
  import { onMount } from 'svelte';

  let currentSettings: AppSettings;
  let apiKeyInput = '';
  let isValidating = false;
  let validationResult: 'success' | 'error' | null = null;
  let validationMessage = '';

  // Subscribe to settings
  settings.subscribe(value => {
    currentSettings = value;
    apiKeyInput = value.kinopoiskApiKey;
  });

  onMount(() => {
    // Set current API key to service
    if (currentSettings.kinopoiskApiKey) {
      kinopoiskService.setApiKey(currentSettings.kinopoiskApiKey);
    }
  });

  async function validateAndSaveApiKey() {
    if (!apiKeyInput.trim()) {
      validationResult = 'error';
      validationMessage = 'Введите API ключ';
      return;
    }

    if (!validateApiKey(apiKeyInput)) {
      validationResult = 'error';
      validationMessage = 'Неверный формат API ключа';
      return;
    }

    isValidating = true;
    validationResult = null;
    validationMessage = '';

    try {
      const isValid = await kinopoiskService.validateApiKey(apiKeyInput);
      
      if (isValid) {
        settings.updateApiKey(apiKeyInput);
        kinopoiskService.setApiKey(apiKeyInput);
        validationResult = 'success';
        validationMessage = 'API ключ успешно сохранен';
      } else {
        validationResult = 'error';
        validationMessage = 'Неверный API ключ или нет доступа к API';
      }
    } catch (error) {
      validationResult = 'error';
      validationMessage = 'Ошибка при проверке API ключа';
      console.error('API key validation error:', error);
    } finally {
      isValidating = false;
    }
  }

  function updateTheme(theme: 'light' | 'dark') {
    settings.updateTheme(theme);
  }

  function resetSettings() {
    if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
      settings.reset();
      validationResult = null;
      validationMessage = '';
    }
  }
</script>

<div class="settings">
  <div class="settings__header">
    <h1>Настройки</h1>
    <p>Настройте приложение под себя</p>
  </div>

  <div class="settings__content">
    <!-- API Configuration -->
    <section class="settings__section">
      <h2>API Конфигурация</h2>
      <p class="settings__description">
        Для работы с фильмами необходим API ключ от Kinopoisk API.
        <a href="https://kinopoisk.dev/" target="_blank" rel="noopener noreferrer">
          Получить ключ
        </a>
      </p>
      
      <div class="settings__field">
        <Input
          label="API Ключ Kinopoisk"
          type="password"
          bind:value={apiKeyInput}
          placeholder="Введите ваш API ключ"
          error={validationResult === 'error' ? validationMessage : ''}
          success={validationResult === 'success' ? validationMessage : ''}
        />
        
        <div class="settings__actions">
          <Button
            variant="primary"
            disabled={isValidating || !apiKeyInput.trim()}
            on:click={validateAndSaveApiKey}
          >
            {isValidating ? 'Проверка...' : 'Сохранить ключ'}
          </Button>
          
          {#if currentSettings.kinopoiskApiKey}
            <Badge variant="success" text="Ключ настроен" />
          {:else}
            <Badge variant="warning" text="Ключ не настроен" />
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