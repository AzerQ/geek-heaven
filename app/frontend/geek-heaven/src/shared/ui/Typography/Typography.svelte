<script lang="ts">
  /**
   * Компонент типографики
   * 
   * @component Typography
   */
  
  // Варианты типографики
  type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  
  // Выравнивание текста
  type TextAlign = 'left' | 'center' | 'right' | 'justify';
  
  // Пропсы компонента
  export let variant: TypographyVariant = 'body1';
  export let align: TextAlign = 'left';
  export let color: string | null = null;
  export let gutterBottom: boolean = false;
  export let noWrap: boolean = false;
</script>

{#if variant === 'h1'}
  <h1
    class="typography typography--h1"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </h1>
{:else if variant === 'h2'}
  <h2
    class="typography typography--h2"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </h2>
{:else if variant === 'h3'}
  <h3
    class="typography typography--h3"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </h3>
{:else if variant === 'h4'}
  <h4
    class="typography typography--h4"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </h4>
{:else if variant === 'h5'}
  <h5
    class="typography typography--h5"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </h5>
{:else if variant === 'h6'}
  <h6
    class="typography typography--h6"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </h6>
{:else if variant === 'body1'}
  <p
    class="typography typography--body1"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </p>
{:else if variant === 'body2'}
  <p
    class="typography typography--body2"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </p>
{:else if variant === 'caption'}
  <span
    class="typography typography--caption"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </span>
{:else if variant === 'overline'}
  <span
    class="typography typography--overline"
    class:typography--gutter-bottom={gutterBottom}
    class:typography--no-wrap={noWrap}
    class:typography--align-left={align === 'left'}
    class:typography--align-center={align === 'center'}
    class:typography--align-right={align === 'right'}
    class:typography--align-justify={align === 'justify'}
    style={color ? `color: ${color}` : ''}
    {...$$restProps}
  >
    <slot></slot>
  </span>
{/if}

<style lang="scss">
  .typography {
    margin: 0;
    
    /* Варианты */
    &--h1 {
      font-size: var(--font-size-4xl);
      font-weight: 600;
      line-height: 1.2;
    }
    
    &--h2 {
      font-size: var(--font-size-3xl);
      font-weight: 600;
      line-height: 1.2;
    }
    
    &--h3 {
      font-size: var(--font-size-2xl);
      font-weight: 600;
      line-height: 1.3;
    }
    
    &--h4 {
      font-size: var(--font-size-xl);
      font-weight: 600;
      line-height: 1.3;
    }
    
    &--h5 {
      font-size: var(--font-size-lg);
      font-weight: 600;
      line-height: 1.4;
    }
    
    &--h6 {
      font-size: var(--font-size-md);
      font-weight: 600;
      line-height: 1.4;
    }
    
    &--body1 {
      font-size: var(--font-size-md);
      font-weight: 400;
      line-height: 1.5;
    }
    
    &--body2 {
      font-size: var(--font-size-sm);
      font-weight: 400;
      line-height: 1.5;
    }
    
    &--caption {
      font-size: var(--font-size-xs);
      font-weight: 400;
      line-height: 1.5;
      display: block;
    }
    
    &--overline {
      font-size: var(--font-size-xs);
      font-weight: 500;
      line-height: 1.5;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      display: block;
    }
    
    /* Модификаторы */
    &--gutter-bottom {
      margin-bottom: var(--spacing-md);
    }
    
    &--no-wrap {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Выравнивание */
    &--align-left {
      text-align: left;
    }
    
    &--align-center {
      text-align: center;
    }
    
    &--align-right {
      text-align: right;
    }
    
    &--align-justify {
      text-align: justify;
    }
  }
</style>