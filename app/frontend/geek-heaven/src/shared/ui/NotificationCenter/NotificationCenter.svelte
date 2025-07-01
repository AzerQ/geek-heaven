<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button, Badge, Icon } from '../';
  import { NotificationHistory } from '../NotificationHistory';
  import { unreadNotificationsCount, notifications } from '../../stores/notifications';
  
  /**
   * NotificationCenter component for managing notifications
   * @component NotificationCenter
   */
  export let showBadge: boolean = true;
  export let showHistory: boolean = true;
  export let variant: 'button' | 'icon' = 'icon';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  const dispatch = createEventDispatcher();
  
  let isOpen = false;
  let dropdownElement: HTMLDivElement;
  
  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      dispatch('open');
    } else {
      dispatch('close');
    }
  }
  
  function closeDropdown() {
    isOpen = false;
    dispatch('close');
  }
  
  function handleClickOutside(event: MouseEvent) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      closeDropdown();
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeDropdown();
    }
  }
  
  function handleMarkAllAsRead() {
    notifications.markAllAsRead();
  }
  
  function handleClearAll() {
    notifications.clearActive();
  }
  
  // Close dropdown when clicking outside
  $: if (typeof window !== 'undefined') {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    }
  }
</script>

<div class="notification-center" bind:this={dropdownElement}>
  <div class="notification-center__trigger">
    {#if variant === 'button'}
      <Button
        variant="secondary"
        {size}
        on:click={toggleDropdown}
        aria-label="Центр уведомлений"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Icon name="bell" size="small" />
        Уведомления
        {#if showBadge && $unreadNotificationsCount > 0}
          <Badge variant="danger" text={$unreadNotificationsCount.toString()} />
        {/if}
      </Button>
    {:else}
      <button
        class="notification-center__icon-button notification-center__icon-button--{size}"
        on:click={toggleDropdown}
        aria-label="Центр уведомлений"
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        <Icon name="bell" size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'} />
        {#if showBadge && $unreadNotificationsCount > 0}
          <span class="notification-center__badge">
            {$unreadNotificationsCount > 99 ? '99+' : $unreadNotificationsCount}
          </span>
        {/if}
      </button>
    {/if}
  </div>
  
  {#if isOpen}
    <div class="notification-center__dropdown" role="dialog" aria-label="Панель уведомлений">
      <div class="notification-center__header">
        <h3>Уведомления</h3>
        
        <div class="notification-center__header-actions">
          {#if $unreadNotificationsCount > 0}
            <button
              class="header-action"
              on:click={handleMarkAllAsRead}
              title="Отметить все как прочитанные"
              type="button"
            >
              <Icon name="check" size="small" />
            </button>
          {/if}
          
          <button
            class="header-action"
            on:click={handleClearAll}
            title="Очистить активные уведомления"
            type="button"
          >
            <Icon name="x" size="small" />
          </button>
          
          <button
            class="header-action"
            on:click={closeDropdown}
            title="Закрыть"
            type="button"
          >
            <Icon name="x" size="small" />
          </button>
        </div>
      </div>
      
      <div class="notification-center__content">
        {#if showHistory}
          <NotificationHistory
            showFilters={false}
            showActions={false}
            itemsPerPage={10}
          />
        {:else}
          <div class="quick-notifications">
            <p class="empty-message">
              Для просмотра полной истории уведомлений перейдите в настройки.
            </p>
          </div>
        {/if}
      </div>
      
      <div class="notification-center__footer">
        <Button
          variant="secondary"
          size="sm"
          on:click={() => dispatch('viewAll')}
          fullWidth
        >
          Посмотреть все уведомления
        </Button>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .notification-center {
    position: relative;
    display: inline-block;
    
    &__trigger {
      position: relative;
    }
    
    &__icon-button {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: var(--border-radius-md);
      transition: all 0.2s ease;
      color: white;
      
      &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text-primary);
      }
      
      &:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
      
      &--sm {
        padding: var(--spacing-xs);
      }
      
      &--md {
        padding: var(--spacing-sm);
      }
      
      &--lg {
        padding: var(--spacing-md);
      }
    }
    
    &__badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: var(--color-danger);
      color: white;
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    
    &__dropdown {
      position: absolute;
      top: calc(100% + var(--spacing-xs));
      right: 0;
      width: 400px;
      max-height: 600px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface);
      
      h3 {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      }
    }
    
    &__header-actions {
      display: flex;
      gap: var(--spacing-xs);
    }
    
    &__content {
      flex: 1;
      overflow-y: auto;
      max-height: 400px;
    }
    
    &__footer {
      padding: var(--spacing-md);
      border-top: 1px solid var(--color-border);
      background: var(--color-surface);
    }
  }
  
  .header-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: var(--border-radius-sm);
    transition: all 0.2s ease;
    color: var(--color-text-secondary);
    
    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text-primary);
    }
    
    &:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }
  
  .quick-notifications {
    padding: var(--spacing-lg);
    text-align: center;
    
    .empty-message {
      color: var(--color-text-secondary);
      margin: 0;
    }
  }
  
  @media (max-width: 768px) {
    .notification-center {
      &__dropdown {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-height: 100%;
        border-radius: 0;
        border: none;
      }
      
      &__content {
        max-height: calc(100vh - 120px);
      }
    }
  }
  
  @media (max-width: 480px) {
    .notification-center {
      &__dropdown {
        width: 100vw;
      }
    }
  }
</style>