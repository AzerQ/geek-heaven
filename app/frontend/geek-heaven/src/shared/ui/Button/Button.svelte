<script lang="ts">
  /**
   * Компонент кнопки
   * 
   * @component Button
   */
  
  // Варианты кнопки
  type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
  
  // Размеры кнопки
  type ButtonSize = 'sm' | 'md' | 'lg';
  
  // Пропсы компонента
  export let variant: ButtonVariant = 'primary';
  export let size: ButtonSize = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled: boolean = false;
  export let fullWidth: boolean = false;
  export let icon: string | null = null;
  export let iconPosition: 'left' | 'right' = 'left';
</script>

<button
  {type}
  class="button"
  class:button--primary={variant === 'primary'}
  class:button--secondary={variant === 'secondary'}
  class:button--outline={variant === 'outline'}
  class:button--ghost={variant === 'ghost'}
  class:button--sm={size === 'sm'}
  class:button--md={size === 'md'}
  class:button--lg={size === 'lg'}
  class:button--full-width={fullWidth}
  class:button--icon-only={!!icon && !$$slots.default}
  class:button--icon-left={!!icon && iconPosition === 'left' && $$slots.default}
  class:button--icon-right={!!icon && iconPosition === 'right' && $$slots.default}
  {disabled}
  on:click
  {...$$restProps}
>
  {#if icon && (iconPosition === 'left' || !$$slots.default)}
    <span class="button__icon">{icon}</span>
  {/if}
  
  {#if $$slots.default}
    <span class="button__text">
      <slot></slot>
    </span>
  {/if}
  
  {#if icon && iconPosition === 'right' && $$slots.default}
    <span class="button__icon">{icon}</span>
  {/if}
</button>

<style lang="scss">
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    font-family: var(--font-family);
    font-weight: 500;
    border-radius: var(--radius-md);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Варианты */
    &--primary {
      background-color: var(--color-primary);
      color: white;
      
      &:hover:not(:disabled) {
        background-color: var(--color-primary-dark);
      }
    }
    
    &--secondary {
      background-color: var(--color-secondary);
      color: white;
      
      &:hover:not(:disabled) {
        background-color: var(--color-secondary-dark);
      }
    }
    
    &--outline {
      background-color: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      
      &:hover:not(:disabled) {
        background-color: rgba(99, 102, 241, 0.1);
      }
    }
    
    &--ghost {
      background-color: transparent;
      color: var(--color-primary);
      
      &:hover:not(:disabled) {
        background-color: rgba(99, 102, 241, 0.1);
      }
    }
    
    /* Размеры */
    &--sm {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-sm);
    }
    
    &--md {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-md);
    }
    
    &--lg {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--font-size-lg);
    }
    
    /* Полная ширина */
    &--full-width {
      width: 100%;
    }
    
    /* Иконки */
    &__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    &--icon-only {
      padding: var(--spacing-sm);
      aspect-ratio: 1;
    }
  }
</style>