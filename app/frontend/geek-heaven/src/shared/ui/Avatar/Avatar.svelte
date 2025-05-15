<script lang="ts">
  import type { AvatarProps } from '../types';

  /**
   * Avatar component for displaying user profile images or initials
   * @component Avatar
   */
  export let src: AvatarProps['src'] = '';
  export let alt: AvatarProps['alt'] = 'Avatar';
  export let size: AvatarProps['size'] = 'medium';
  export let rounded: AvatarProps['rounded'] = true;
  export let fallback: AvatarProps['fallback'] = '';


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