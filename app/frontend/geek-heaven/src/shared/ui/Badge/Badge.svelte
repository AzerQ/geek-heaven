<script lang="ts">
  import type { BadgeProps } from '../types';

  /**
   * Badge component for visual elements
   * @component Badge
   */
  export let text: BadgeProps['text'] = '';
  export let variant: BadgeProps['variant'] = 'primary';
  export let size: BadgeProps['size'] = 'medium';
  export let rounded: BadgeProps['rounded'] = false;
  export let outlined: BadgeProps['outlined'] = false;
  export let icon: BadgeProps['icon'] = '';
  
  // Определяем классы для стилизации
  $: badgeClasses = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    rounded ? 'badge--rounded' : '',
    outlined ? 'badge--outlined' : ''
  ].filter(Boolean).join(' ');
</script>

<span class={badgeClasses}>
  {#if icon}
    <span class="badge-icon">{icon}</span>
  {/if}
  {#if text}
    <span class="badge-text">{text}</span>
  {/if}
  <slot></slot>
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }
  
  .badge--small {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  
  .badge--medium {
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
  }
  
  .badge--large {
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
  }
  
  .badge--rounded {
    border-radius: 9999px;
  }
  
  /* Цветовые варианты */
  .badge--primary {
    background-color: #2196f3;
    color: white;
  }
  
  .badge--secondary {
    background-color: #757575;
    color: white;
  }
  
  .badge--success {
    background-color: #4caf50;
    color: white;
  }
  
  .badge--warning {
    background-color: #ff9800;
    color: white;
  }
  
  .badge--danger {
    background-color: #e53935;
    color: white;
  }
  
  .badge--info {
    background-color: #00bcd4;
    color: white;
  }
  
  /* Обводка */
  .badge--outlined {
    background-color: transparent;
  }
  
  .badge--outlined.badge--primary {
    border: 1px solid #2196f3;
    color: #2196f3;
  }
  
  .badge--outlined.badge--secondary {
    border: 1px solid #757575;
    color: #757575;
  }
  
  .badge--outlined.badge--success {
    border: 1px solid #4caf50;
    color: #4caf50;
  }
  
  .badge--outlined.badge--warning {
    border: 1px solid #ff9800;
    color: #ff9800;
  }
  
  .badge--outlined.badge--danger {
    border: 1px solid #e53935;
    color: #e53935;
  }
  
  .badge--outlined.badge--info {
    border: 1px solid #00bcd4;
    color: #00bcd4;
  }
  
  .badge-icon {
    margin-right: 0.25rem;
  }
</style>