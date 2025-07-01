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
  
  interface CategoryItem {
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
  
  const categoryItems: CategoryItem[] = [
    { id: 'movies', title: 'Фильмы', icon: 'movie' },
    { id: 'series', title: 'Сериалы', icon: 'tv' },
    { id: 'anime', title: 'Аниме', icon: 'anime' }
  ];
  
  // Mapping категорий на типы контента для API
  const categoryToTypeMapping: Record<string, string> = {
    'movies': 'movie',
    'series': 'tv-series', 
    'anime': 'anime'
  };
  
  function handleNavClick(itemId: string) {
    dispatch('navigate', { page: itemId });
  }
  
  function handleCategoryClick(categoryId: string) {
    // Navigate to search with category filter and content type
    dispatch('navigate', { 
      page: 'search', 
      category: categoryId,
      contentType: categoryToTypeMapping[categoryId] || ''
    });
  }
</script>

<nav class="side-nav">
  <!-- Основная навигация -->
  <ul class="nav-list">
    {#each navigationItems as item}
      <li class="nav-item" class:active={currentPage === item.id}>
        <button 
          type="button" 
          class="nav-link"
          on:click={() => handleNavClick(item.id)}
        >
          <Icon name={item.icon} size="18" />
          <span>{item.title}</span>
        </button>
      </li>
    {/each}
  </ul>
  
  <!-- Категории контента -->
  <div class="categories">
    <h3 class="categories__title">КАТЕГОРИИ КОНТЕНТА</h3>
    <ul class="categories__list">
      {#each categoryItems as category}
        <li class="category-item">
          <button 
            type="button" 
            class="category-link"
            on:click={() => handleCategoryClick(category.id)}
          >
            <Icon name={category.icon} size="16" />
            <span>{category.title}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style lang="scss">
  .side-nav {
    position: fixed;
    top: 70px;
    left: 0;
    bottom: 0;
    width: 240px;
    background-color: var(--color-dark-background);
    box-shadow: var(--shadow-md);
    z-index: 90;
    overflow-y: auto;
    padding: var(--spacing-lg) 0;
  }
  
  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    margin-bottom: var(--spacing-xl);
  }
  
  .nav-item {
    &.active {
      background-color: rgba(92, 107, 192, 0.2);
      border-left: 4px solid var(--color-primary);
      
      .nav-link {
        color: var(--color-text-light);
        font-weight: var(--font-weight-medium);
      }
    }
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: var(--font-size-md);
    font-family: var(--font-family-body);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(92, 107, 192, 0.1);
      color: var(--color-text-light);
    }
    
    span {
      flex: 1;
    }
  }
  
  .categories {
    &__title {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 var(--spacing-lg) var(--spacing-md);
    }
    
    &__list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  }
  
  .category-item {
    // Стили аналогичны nav-item, но без активного состояния
  }
  
  .category-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-lg);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-body);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(92, 107, 192, 0.1);
      color: var(--color-text-light);
    }
    
    span {
      flex: 1;
    }
  }
  
  @media (max-width: 768px) {
    .side-nav {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      
      &.open {
        transform: translateX(0);
      }
    }
  }
</style>