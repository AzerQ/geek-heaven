<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button, Icon } from '../';
  import type { Notification } from '../../stores/notifications';
  
  /**
   * NotificationToast component for displaying individual notifications
   * @component NotificationToast
   */
  export let notification: Notification;
  export let showActions: boolean = true;
  export let showCloseButton: boolean = true;
  
  const dispatch = createEventDispatcher();
  
  function handleClose() {
    dispatch('close', { notificationId: notification.id });
  }
  
  function handleAction(action: () => void) {
    action();
    handleClose();
  }
  
  function getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'alert-triangle';
      case 'info': return 'info';
      default: return 'bell';
    }
  }
  
  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
</script>

<div class="notification-toast notification-toast--{notification.type}" role="alert" aria-live="polite">
  <div class="notification-toast__icon">
    <Icon name={getNotificationIcon(notification.type)} size="medium" />
  </div>
  
  <div class="notification-toast__content">
    <div class="notification-toast__header">
      <h4 class="notification-toast__title">{notification.title}</h4>
      <span class="notification-toast__timestamp">{formatTimestamp(notification.timestamp)}</span>
    </div>
    
    {#if notification.message}
      <p class="notification-toast__message">{notification.message}</p>
    {/if}
    
    {#if showActions && notification.actions && notification.actions.length > 0}
      <div class="notification-toast__actions">
        {#each notification.actions as action}
          <Button
            variant={action.variant || 'secondary'}
            size="sm"
            on:click={() => handleAction(action.action)}
          >
            {action.label}
          </Button>
        {/each}
      </div>
    {/if}
  </div>
  
  {#if showCloseButton}
    <button 
      class="notification-toast__close"
      on:click={handleClose}
      aria-label="Закрыть уведомление"
      type="button"
    >
      <Icon name="x" size="small" />
    </button>
  {/if}
</div>

<style lang="scss">
  .notification-toast {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--color-surface);
    border-radius: var(--border-radius-lg);
    border-left: 4px solid;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 320px;
    max-width: 480px;
    position: relative;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    
    &--success {
      border-left-color: var(--color-success);
      
      .notification-toast__icon {
        color: var(--color-success);
      }
    }
    
    &--error {
      border-left-color: var(--color-danger);
      
      .notification-toast__icon {
        color: var(--color-danger);
      }
    }
    
    &--warning {
      border-left-color: var(--color-warning);
      
      .notification-toast__icon {
        color: var(--color-warning);
      }
    }
    
    &--info {
      border-left-color: var(--color-info);
      
      .notification-toast__icon {
        color: var(--color-info);
      }
    }
    
    &__icon {
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    &__content {
      flex: 1;
      min-width: 0;
    }
    
    &__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }
    
    &__title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.4;
    }
    
    &__timestamp {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    &__message {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.4;
      word-wrap: break-word;
    }
    
    &__actions {
      display: flex;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
      flex-wrap: wrap;
    }
    
    &__close {
      position: absolute;
      top: var(--spacing-sm);
      right: var(--spacing-sm);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
      padding: var(--spacing-xs);
      border-radius: var(--border-radius-sm);
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text-primary);
      }
      
      &:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
    }
  }
  
  @media (max-width: 768px) {
    .notification-toast {
      min-width: 280px;
      max-width: calc(100vw - 2 * var(--spacing-md));
      
      &__header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
      }
      
      &__timestamp {
        font-size: var(--font-size-xs);
      }
      
      &__actions {
        flex-direction: column;
      }
    }
  }
</style>