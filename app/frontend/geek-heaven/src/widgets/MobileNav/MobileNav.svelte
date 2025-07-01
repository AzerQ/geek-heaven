<script lang="ts">
  import { Icon } from '../../shared/ui';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let currentPage: string = 'dashboard';
  
  interface NavItem {
    id: string;
    title: string;
    icon: string;
  }
  
  const navigationItems: NavItem[] = [
    { id: 'dashboard', title: 'Главная', icon: 'home' },
    { id: 'search', title: 'Поиск', icon: 'search' },
    { id: 'library', title: 'Библиотека', icon: 'book' },
    { id: 'settings', title: 'Настройки', icon: 'settings' }
  ];
  
  function handleNavClick(itemId: string) {
    dispatch('navigate', { page: itemId });
  }
</script>

<nav class="mobile-nav">
  <ul class="nav-list">
    {#each navigationItems as item}
      <li class="nav-item" class:active={currentPage === item.id}>
        <button 
          type="button" 
          class="nav-link"
          on:click={() => handleNavClick(item.id)}
        >
          <Icon name={item.icon} size="20" />
          <span class="nav-title">{item.title}</span>
        </button>
      </li>
    {/each}
  </ul>
</nav>

<style lang="scss">
  .mobile-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--color-surface);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 90;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: space-around;
  }
  
  .nav-item {
    flex: 1;
    
    &.active {
      .nav-link {
        color: var(--color-primary);
        
        :global(svg) {
          color: var(--color-primary);
        }
      }
    }
  }
  
  .nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    width: 100%;
    padding: var(--spacing-sm);
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-body);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      color: var(--color-primary);
      
      :global(svg) {
        color: var(--color-primary);
      }
    }
  }
  
  .nav-title {
    font-size: var(--font-size-xs);
    line-height: 1;
  }
  
  @media (max-width: 768px) {
    .mobile-nav {
      display: block;
    }
  }
</style>