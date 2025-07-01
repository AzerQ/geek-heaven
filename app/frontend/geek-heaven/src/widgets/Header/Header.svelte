<script lang="ts">
  import { Icon } from '../../shared/ui';
  import { createEventDispatcher } from 'svelte';
  import UserAvatar from '../../shared/ui/UserAvatar.svelte';
  
  const dispatch = createEventDispatcher();
  
  export let searchQuery = '';
  
  function handleSearch() {
    if (searchQuery.trim()) {
      dispatch('navigate', { page: 'search', query: searchQuery });
      // Очищаем поле поиска после отправки
      searchQuery = '';
    }
  }
  
  function handleLogoClick() {
    dispatch('navigate', { page: 'dashboard' });
  }
  
  function handleNotifications() {
    // TODO: Implement notifications
    console.log('Notifications clicked');
  }
</script>

<header class="header">
  <div class="header__container">
    <!-- Логотип -->
    <div class="header__logo">
      <h1 class="logo" on:click={handleLogoClick}>GeekHeaven</h1>
    </div>
    
    <!-- Поиск -->
    <div class="header__search">
      <div class="search-bar">
        <input 
          type="text" 
          placeholder="Поиск..."
          bind:value={searchQuery}
          on:keydown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button type="button" on:click={handleSearch} class="search-button">
          <Icon name="search" size="16" />
        </button>
      </div>
    </div>
    
    <!-- Пользовательское меню -->
    <div class="header__user-menu">
      <button type="button" class="notifications-btn" on:click={handleNotifications}>
        <Icon name="bell" size="20" />
      </button>
      
     <UserAvatar/>
    </div>
  </div>
</header>

<style lang="scss">
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    background-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    z-index: 100;
    
    &__container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 var(--spacing-lg);
      max-width: 100%;
    }
    
    &__logo {
      .logo {
        font-family: var(--font-family-heading);
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-light);
        margin: 0;
        cursor: pointer;
        transition: opacity 0.2s ease;
        
        &:hover {
          opacity: 0.8;
        }
      }
    }
    
    &__search {
      flex: 1;
      max-width: 500px;
      margin: 0 var(--spacing-lg);
      
      .search-bar {
        display: flex;
        background-color: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: var(--radius-full);
        overflow: hidden;
        
        input {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          border: none;
          background: transparent;
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
          outline: none;
          
          &::placeholder {
            color: rgba(255, 255, 255, 0.8);
          }
        }
        
        .search-button {
          background: none;
          border: none;
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--color-text-light);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }
    
    &__user-menu {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      
      .notifications-btn {
        background: none;
        border: none;
        color: var(--color-text-light);
        cursor: pointer;
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        overflow: hidden;
        cursor: pointer;
        border: 2px solid rgba(255, 255, 255, 0.2);
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        &:hover {
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    .header {
      &__search {
        max-width: 200px;
        margin: 0 var(--spacing-sm);
      }
      
      &__logo .logo {
        font-size: var(--font-size-lg);
      }
    }
  }
</style>