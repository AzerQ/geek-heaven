<script>
  /**
   * Avatar component for displaying user profile images or initials
   * @prop {string} src - Image source URL
   * @prop {string} alt - Alternative text
   * @prop {string} size - Size of avatar: 'small', 'medium', 'large'
   * @prop {boolean} rounded - Make avatar round
   * @prop {string} fallback - Fallback text (e.g., initials)
   */
  export let src = '';
  export let alt = 'Avatar';
  export let size = 'medium'; // small, medium, large
  export let rounded = true;
  export let fallback = '';

  $: avatarClass = [
    'avatar',
    `avatar--${size}`,
    rounded ? 'avatar--rounded' : ''
  ].filter(Boolean).join(' ');
</script>

<span class={avatarClass} aria-label={alt} role="img">
  {#if src}
    <img src={src} alt={alt} class="avatar-img" />
  {:else if fallback}
    <span class="avatar-fallback">{fallback}</span>
  {:else}
    <span class="avatar-fallback">?</span>
  {/if}
  <slot></slot>
</span>

<style>
  .avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #e0e0e0;
    color: #757575;
    font-weight: 500;
    overflow: hidden;
    position: relative;
    user-select: none;
  }
  .avatar--small {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  .avatar--medium {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
  .avatar--large {
    width: 72px;
    height: 72px;
    font-size: 1.5rem;
  }
  .avatar--rounded {
    border-radius: 50%;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: inherit;
    background: inherit;
    color: inherit;
  }
</style>