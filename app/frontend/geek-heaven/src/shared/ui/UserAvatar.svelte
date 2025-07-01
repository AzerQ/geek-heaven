<script lang="ts">
  export let src: string | null = null;
  export let alt: string = 'Аватар пользователя';
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let className: string = '';
  
  import placeholderSvg from '../assets/user-avatar-placeholder.svg';
  
  let imageError = false;
  
  function handleImageError() {
    imageError = true;
  }
  
  $: displaySrc = (src && !imageError) ? src : placeholderSvg;
</script>

<div class="user-avatar user-avatar--{size} {className}">
  <img 
    src={displaySrc} 
    {alt} 
    on:error={handleImageError}
    class="user-avatar__image"
  />
</div>

<style lang="scss">
  .user-avatar {
    display: inline-block;
    border-radius: 50%;
    overflow: hidden;
    background: var(--color-surface-secondary, #f3f4f6);
    border: 2px solid var(--color-border, #e5e7eb);
    
    &--sm {
      width: 24px;
      height: 24px;
    }
    
    &--md {
      width: 40px;
      height: 40px;
    }
    
    &--lg {
      width: 56px;
      height: 56px;
    }
    
    &--xl {
      width: 80px;
      height: 80px;
    }
    
    &__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
</style>