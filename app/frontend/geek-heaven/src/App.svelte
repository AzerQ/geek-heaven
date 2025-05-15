<script lang="ts">
  import svelteLogo from './assets/svelte.svg';
  import viteLogo from '/vite.svg';
  import { Typography, UIKitDemo } from './shared/ui';
  import './app/styles/global.scss';
</script>

<main class="container">
  <div class="logo-container">
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  
  <Typography variant="h1" gutterBottom>GeekHeaven</Typography>
  <Typography variant="body1" gutterBottom>Платформа для истинных гиков</Typography>
  
  <UIKitDemo />
  
  <p class="info">
    Проект организован по архитектуре Feature Sliced Design
  </p>
</main>

<style lang="scss">
  .logo-container {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }
  
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
    
    &:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    
    &.svelte:hover {
      filter: drop-shadow(0 0 2em #ff3e00aa);
    }
  }
  
  h1 {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-xs);
  }
  
  .button-showcase {
    margin-top: var(--spacing-xl);
    padding: var(--spacing-lg);
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }
  
  .button-row {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    flex-wrap: wrap;
  }
  
  .info {
    margin-top: var(--spacing-xl);
    color: var(--color-text-secondary);
  }
  
  .typography-showcase {
    margin-bottom: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
</style>
