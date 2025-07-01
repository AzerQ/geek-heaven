<script lang="ts">
  import { Button, Badge, Icon } from '../';
  import { NotificationToast } from '../NotificationToast';
  import { notificationsHistory, unreadNotificationsCount, notifications } from '../../stores/notifications';
  import type { Notification, NotificationType } from '../../stores/notifications';
  
  /**
   * NotificationHistory component for viewing notification history
   * @component NotificationHistory
   */
  export let showFilters: boolean = true;
  export let showActions: boolean = true;
  export let itemsPerPage: number = 20;
  
  let selectedFilter: NotificationType | 'all' = 'all';
  let currentPage = 1;
  let searchQuery = '';
  
  $: filteredNotifications = $notificationsHistory
    .filter(notification => {
      const matchesFilter = selectedFilter === 'all' || notification.type === selectedFilter;
      const matchesSearch = !searchQuery || 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  $: totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  $: paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  $: unreadNotifications = filteredNotifications.filter(n => !n.read);
  
  function handleMarkAsRead(notificationId: string) {
    notifications.markAsRead(notificationId);
  }
  
  function handleMarkAllAsRead() {
    notifications.markAllAsRead();
  }
  
  function handleClearHistory() {
    if (confirm('Вы уверены, что хотите очистить всю историю уведомлений?')) {
      notifications.clearHistory();
      currentPage = 1;
    }
  }
  
  function getFilterLabel(filter: NotificationType | 'all'): string {
    switch (filter) {
      case 'all': return 'Все';
      case 'success': return 'Успех';
      case 'error': return 'Ошибки';
      case 'warning': return 'Предупреждения';
      case 'info': return 'Информация';
      default: return 'Все';
    }
  }
  
  function getFilterCount(filter: NotificationType | 'all'): number {
    if (filter === 'all') return $notificationsHistory.length;
    return $notificationsHistory.filter(n => n.type === filter).length;
  }
  
  function handlePageChange(page: number) {
    currentPage = page;
  }
  
  function resetPagination() {
    currentPage = 1;
  }
  
  // Reset pagination when filters change
  $: selectedFilter, searchQuery, resetPagination();
</script>

<div class="notification-history">
  <div class="notification-history__header">
    <div class="notification-history__title">
      <h2>История уведомлений</h2>
      {#if $unreadNotificationsCount > 0}
        <Badge variant="danger" text={$unreadNotificationsCount.toString()} />
      {/if}
    </div>
    
    {#if showActions}
      <div class="notification-history__actions">
        {#if unreadNotifications.length > 0}
          <Button
            variant="secondary"
            size="sm"
            on:click={handleMarkAllAsRead}
          >
            <Icon name="check" size="small" />
            Отметить все как прочитанные
          </Button>
        {/if}
        
        {#if $notificationsHistory.length > 0}
          <Button
            variant="danger"
            size="sm"
            on:click={handleClearHistory}
          >
            <Icon name="trash-2" size="small" />
            Очистить историю
          </Button>
        {/if}
      </div>
    {/if}
  </div>
  
  {#if showFilters}
    <div class="notification-history__filters">
      <div class="filter-tabs">
        {#each ['all', 'success', 'error', 'warning', 'info'] as filter}
          <button
            class="filter-tab"
            class:filter-tab--active={selectedFilter === filter}
            on:click={() => selectedFilter = filter}
            type="button"
          >
            {getFilterLabel(filter)}
            <span class="filter-count">({getFilterCount(filter)})</span>
          </button>
        {/each}
      </div>
      
      <div class="search-input">
        <Icon name="search" size="small" />
        <input
          type="text"
          placeholder="Поиск по уведомлениям..."
          bind:value={searchQuery}
        />
      </div>
    </div>
  {/if}
  
  <div class="notification-history__content">
    {#if paginatedNotifications.length === 0}
      <div class="empty-state">
        <Icon name="bell-off" size="large" />
        <h3>Нет уведомлений</h3>
        <p>
          {#if searchQuery || selectedFilter !== 'all'}
            Не найдено уведомлений по заданным критериям.
          {:else}
            У вас пока нет уведомлений.
          {/if}
        </p>
      </div>
    {:else}
      <div class="notifications-list">
        {#each paginatedNotifications as notification (notification.id)}
          <div 
            class="notification-item"
            class:notification-item--unread={!notification.read}
          >
            <NotificationToast
              {notification}
              showActions={false}
              showCloseButton={false}
            />
            
            <div class="notification-item__actions">
              {#if !notification.read}
                <Button
                  variant="secondary"
                  size="sm"
                  on:click={() => handleMarkAsRead(notification.id)}
                >
                  <Icon name="check" size="small" />
                  Прочитано
                </Button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      
      {#if totalPages > 1}
        <div class="pagination">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            on:click={() => handlePageChange(currentPage - 1)}
          >
            <Icon name="chevron-left" size="small" />
            Назад
          </Button>
          
          <span class="pagination__info">
            Страница {currentPage} из {totalPages}
          </span>
          
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            on:click={() => handlePageChange(currentPage + 1)}
          >
            Вперед
            <Icon name="chevron-right" size="small" />
          </Button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style lang="scss">
  .notification-history {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }
    
    &__title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      
      h2 {
        margin: 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      }
    }
    
    &__actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }
    
    &__filters {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
    
    &__content {
      min-height: 200px;
    }
  }
  
  .filter-tabs {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }
  
  .filter-tab {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--font-size-sm);
    
    &:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-primary);
    }
    
    &--active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }
    
    .filter-count {
      font-size: var(--font-size-xs);
      opacity: 0.8;
    }
  }
  
  .search-input {
    position: relative;
    max-width: 300px;
    
    :global(.icon) {
      position: absolute;
      left: var(--spacing-sm);
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-secondary);
      pointer-events: none;
    }
    
    input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) calc(var(--spacing-sm) * 2 + 16px);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      background: var(--color-surface);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      
      &:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
        border-color: var(--color-primary);
      }
      
      &::placeholder {
        color: var(--color-text-secondary);
      }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    text-align: center;
    color: var(--color-text-secondary);
    
    h3 {
      margin: var(--spacing-md) 0 var(--spacing-sm);
      color: var(--color-text-primary);
    }
    
    p {
      margin: 0;
      max-width: 400px;
    }
  }
  
  .notifications-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .notification-item {
    position: relative;
    padding: var(--spacing-md);
    background: var(--color-surface);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border);
    
    &--unread {
      border-left: 4px solid var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));
    }
    
    &__actions {
      margin-top: var(--spacing-md);
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-xs);
    }
  }
  
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
    
    &__info {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  }
  
  @media (max-width: 768px) {
    .notification-history {
      &__header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      &__actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
    
    .filter-tabs {
      overflow-x: auto;
      padding-bottom: var(--spacing-xs);
    }
    
    .search-input {
      max-width: none;
    }
    
    .notification-item {
      &__actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  }
</style>