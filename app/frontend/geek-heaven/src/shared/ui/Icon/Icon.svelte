<script>
  /**
   * Icon component for displaying SVG or font icons
   * @prop {string} name - Icon name (for sprite or font)
   * @prop {string} size - Icon size: 'small', 'medium', 'large', 'custom'
   * @prop {string} color - Icon color
   * @prop {string} viewBox - SVG viewBox (if using SVG)
   * @prop {string} svg - Inline SVG markup (optional)
   */
  export let name = '';
  export let size = 'medium'; // small, medium, large, custom
  export let color = '';
  export let viewBox = '0 0 24 24';
  export let svg = '';

  $: iconClass = [
    'icon',
    `icon--${size}`,
    color ? '' : ''
  ].filter(Boolean).join(' ');
</script>

<span class={iconClass} aria-hidden="true" style={color ? `color: ${color}` : ''}>
  {#if svg}
    {@html svg}
  {:else if name}
    <svg viewBox={viewBox} fill="currentColor" width="1em" height="1em">
      <use href={`#${name}`}></use>
    </svg>
  {/if}
  <slot></slot>
</span>

<style>
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    line-height: 1;
    user-select: none;
  }
  .icon--small {
    font-size: 1rem;
    width: 20px;
    height: 20px;
  }
  .icon--medium {
    font-size: 1.5rem;
    width: 24px;
    height: 24px;
  }
  .icon--large {
    font-size: 2rem;
    width: 32px;
    height: 32px;
  }
</style>