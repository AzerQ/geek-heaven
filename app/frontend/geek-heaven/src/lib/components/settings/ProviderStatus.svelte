<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ProviderManager, ProviderFactory } from '../../../shared/services/providers';
  import { Badge } from '../../../shared/ui';
  import type { ProviderType, ProviderHealth } from '../../../shared/services/providers';
  
  export let showDetails = true;
  export let refreshInterval = 30000; // 30 seconds
  
  const manager = ProviderManager.getInstance();
  const factory = ProviderFactory.getInstance();
  
  let healthStatus: Map<ProviderType, ProviderHealth> = new Map();
  let activeProvider: ProviderType | null = null;
  let refreshTimer: NodeJS.Timeout;
  
  onMount(() => {
    updateStatus();
    
    if (refreshInterval > 0) {
      refreshTimer = setInterval(updateStatus, refreshInterval);
    }
  });
  
  onDestroy(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
  });
  
  function updateStatus() {
    healthStatus = manager.getProviderHealth();
    activeProvider = manager.getActiveProviderType();
  }
  
  function getStatusVariant(health: ProviderHealth): 'success' | 'warning' | 'error' {
    if (!health.isHealthy) return 'error';
    if (health.responseTime && health.responseTime > 5000) return 'warning';
    return 'success';
  }
  
  function getStatusText(health: ProviderHealth): string {
    if (!health.isHealthy) return 'Недоступен';
    if (health.responseTime && health.responseTime > 5000) return 'Медленно';
    return 'Работает';
  }
  
  function formatResponseTime(ms: number): string {
    if (ms < 1000) return `${ms}мс`;
    return `${(ms / 1000).toFixed(1)}с`;
  }
  
  function formatLastCheck(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    return new Date(timestamp).toLocaleDateString();
  }
</script>

<div class="provider-status">
  <div class="status-header">
    <h3>Статус провайдеров</h3>
    <button class="refresh-btn" on:click={updateStatus} title="Обновить статус">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
    </button>
  </div>
  
  <div class="status-list">
    {#each Array.from(healthStatus.entries()) as [providerType, health]}
      {@const providerName = factory.getProviderDisplayName(providerType)}
      {@const isActive = activeProvider === providerType}
      
      <div class="status-item" class:active={isActive}>
        <div class="status-main">
          <div class="provider-info">
            <span class="provider-name">{providerName}</span>
            {#if isActive}
              <Badge variant="primary" text="Активный" size="small" />
            {/if}
          </div>
          
          <Badge 
            variant={getStatusVariant(health)} 
            text={getStatusText(health)}
            size="small"
          />
        </div>
        
        {#if showDetails}
          <div class="status-details">
            <div class="detail-row">
              <span class="detail-label">Последняя проверка:</span>
              <span class="detail-value">
                {health.lastCheck ? formatLastCheck(health.lastCheck) : 'Никогда'}
              </span>
            </div>
            
            {#if health.responseTime}
              <div class="detail-row">
                <span class="detail-label">Время ответа:</span>
                <span class="detail-value">{formatResponseTime(health.responseTime)}</span>
              </div>
            {/if}
            
            {#if health.errorCount && health.errorCount > 0}
              <div class="detail-row">
                <span class="detail-label">Ошибки:</span>
                <span class="detail-value error">{health.errorCount}</span>
              </div>
            {/if}
            
            {#if health.lastError}
              <div class="detail-row">
                <span class="detail-label">Последняя ошибка:</span>
                <span class="detail-value error" title={health.lastError}>
                  {health.lastError.length > 50 ? health.lastError.substring(0, 50) + '...' : health.lastError}
                </span>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
    
    {#if healthStatus.size === 0}
      <div class="no-providers">
        <p>Нет настроенных провайдеров</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .provider-status {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface);
    overflow: hidden;
  }
  
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--color-surface-secondary);
    border-bottom: 1px solid var(--color-border);
  }
  
  .status-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .refresh-btn {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .refresh-btn:hover {
    color: var(--color-primary);
    background: var(--color-surface-tertiary);
  }
  
  .status-list {
    display: flex;
    flex-direction: column;
  }
  
  .status-item {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    transition: background-color 0.2s ease;
  }
  
  .status-item:last-child {
    border-bottom: none;
  }
  
  .status-item.active {
    background: var(--color-primary-light);
  }
  
  .status-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .provider-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .provider-name {
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  .status-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-light);
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
  }
  
  .detail-label {
    color: var(--color-text-secondary);
    font-weight: 500;
  }
  
  .detail-value {
    color: var(--color-text-primary);
  }
  
  .detail-value.error {
    color: var(--color-error);
  }
  
  .no-providers {
    padding: 2rem;
    text-align: center;
    color: var(--color-text-secondary);
  }
  
  .no-providers p {
    margin: 0;
  }
</style>