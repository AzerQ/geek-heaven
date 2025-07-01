<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { activeNotifications, notifications } from '../../stores/notifications';
  import { NotificationToast } from '../NotificationToast';
  
  /**
   * NotificationContainer component for displaying active notifications
   * @component NotificationContainer
   */
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' = 'top-right';
  export let maxVisible: number = 5;
  
  $: visibleNotifications = $activeNotifications.slice(-maxVisible);
  
  function handleCloseNotification(event: CustomEvent) {
    const { notificationId } = event.detail;
    notifications.removeNotification(notificationId);
  }
  
  function getPositionClasses(pos: typeof position): string {
    const baseClasses = 'notification-container';
    return `${baseClasses} notification-container--${pos}`;
  }
  
  function getTransitionParams(pos: typeof position) {
    switch (pos) {
      case 'top-right':
      case 'bottom-right':
        return { x: 300, duration: 300 };
      case 'top-left':
      case 'bottom-left':
        return { x: -300, duration: 300 };
      case 'top-center':
        return { y: -100, duration: 300 };
      case 'bottom-center':
        return { y: 100, duration: 300 };
      default:
        return { x: 300, duration: 300 };
    }
  }
</script>

{#if visibleNotifications.length > 0}
  <div class={getPositionClasses(position)} role="region" aria-label="Уведомления">
    {#each visibleNotifications as notification (notification.id)}
      <div
        class="notification-item"
        in:fly={getTransitionParams(position)}
        out:fade={{ duration: 200 }}
        animate:flip={{ duration: 300 }}
      >
        <NotificationToast
          {notification}
          on:close={handleCloseNotification}
        />
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  .notification-container {
    position: fixed;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    pointer-events: none;
    
    &--top-right {
      top: var(--spacing-lg);
      right: var(--spacing-lg);
    }
    
    &--top-left {
      top: var(--spacing-lg);
      left: var(--spacing-lg);
    }
    
    &--bottom-right {
      bottom: var(--spacing-lg);
      right: var(--spacing-lg);
      flex-direction: column-reverse;
    }
    
    &--bottom-left {
      bottom: var(--spacing-lg);
      left: var(--spacing-lg);
      flex-direction: column-reverse;
    }
    
    &--top-center {
      top: var(--spacing-lg);
      left: 50%;
      transform: translateX(-50%);
    }
    
    &--bottom-center {
      bottom: var(--spacing-lg);
      left: 50%;
      transform: translateX(-50%);
      flex-direction: column-reverse;
    }
  }
  
  .notification-item {
    pointer-events: auto;
  }
  
  @media (max-width: 768px) {
    .notification-container {
      &--top-right,
      &--top-left {
        top: var(--spacing-md);
        left: var(--spacing-md);
        right: var(--spacing-md);
      }
      
      &--bottom-right,
      &--bottom-left {
        bottom: var(--spacing-md);
        left: var(--spacing-md);
        right: var(--spacing-md);
      }
      
      &--top-center {
        top: var(--spacing-md);
        left: var(--spacing-md);
        right: var(--spacing-md);
        transform: none;
      }
      
      &--bottom-center {
        bottom: var(--spacing-md);
        left: var(--spacing-md);
        right: var(--spacing-md);
        transform: none;
      }
    }
  }
</style>