<script lang="ts">
  import { Button } from '../Button';
  import { createEventDispatcher } from 'svelte';
  
  export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'outline';
  export let size: 'sm' | 'md' | 'lg' = 'sm';
  export let disabled = false;
  
  const dispatch = createEventDispatcher();
  
  function handleClick(event: Event) {
    event.stopPropagation();
    dispatch('click', event);
  }
</script>

<Button 
  {variant}
  {size}
  {disabled}
  on:click={handleClick}
  aria-label="Открыть галерею изображений"
>
  <svg class="gallery-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21,15 16,10 5,21"></polyline>
  </svg>
  Галерея
</Button>

<style lang="scss">
  .gallery-icon {
    width: 16px;
    height: 16px;
    margin-right: var(--spacing-xs);
  }
</style>