<script lang="ts">
  /**
   * Компонент карточки
   * 
   * @component Card
   */
  
  // Варианты карточки
  type CardVariant = 'default' | 'outlined' | 'elevated';
  
  // Пропсы компонента
  export let variant: CardVariant = 'default';
  export let padding: boolean = true;
  export let fullWidth: boolean = false;
</script>

<div
  class="card"
  class:card--default={variant === 'default'}
  class:card--outlined={variant === 'outlined'}
  class:card--elevated={variant === 'elevated'}
  class:card--padding={padding}
  class:card--full-width={fullWidth}
  {...$$restProps}
>
  <slot></slot>
</div>

<style lang="scss">
  .card {
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    overflow: hidden;
    
    /* Варианты */
    &--default {
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    &--outlined {
      border: 1px solid rgba(0, 0, 0, 0.2);
    }
    
    &--elevated {
      box-shadow: var(--shadow-md);
    }
    
    /* Модификаторы */
    &--padding {
      padding: var(--spacing-md);
    }
    
    &--full-width {
      width: 100%;
    }
  }
  
  /* Темная тема */
  @media (prefers-color-scheme: dark) {
    .card {
      &--default {
        border-color: rgba(255, 255, 255, 0.1);
      }
      
      &--outlined {
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
</style>