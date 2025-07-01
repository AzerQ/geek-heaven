<script lang="ts">
  export let rating: number = 0;
  export let maxRating: number = 10;
  export let showTooltip: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  $: normalizedRating = Math.max(0, Math.min(maxRating, rating));
  $: fullStars = Math.floor(normalizedRating / 2);
  $: hasHalfStar = (normalizedRating % 2) >= 1;
  $: emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  function getRatingText(rating: number): string {
    if (rating >= 9) return 'Шедевр';
    if (rating >= 8) return 'Отлично';
    if (rating >= 7) return 'Хорошо';
    if (rating >= 6) return 'Неплохо';
    if (rating >= 5) return 'Средне';
    if (rating >= 4) return 'Средне-паршиво';
    if (rating >= 3) return 'Плохо';
    if (rating >= 2) return 'Очень плохо';
    if (rating >= 1) return 'Отвратительно';
    return 'Без оценки';
  }

  $: tooltipText = showTooltip ? `${rating}/10 - ${getRatingText(rating)}` : '';
</script>

<div 
  class="star-rating star-rating--{size}" 
  title={tooltipText}
  role="img" 
  aria-label="Рейтинг {rating} из {maxRating}"
>
  <!-- Full stars -->
  {#each Array(fullStars) as _}
    <span class="star star--full">★</span>
  {/each}
  
  <!-- Half star -->
  {#if hasHalfStar}
    <span class="star star--half">★</span>
  {/if}
  
  <!-- Empty stars -->
  {#each Array(emptyStars) as _}
    <span class="star star--empty">★</span>
  {/each}
  
  <span class="rating-value">{rating}</span>
</div>

<style>
  .star-rating {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    cursor: help;
  }

  .star {
    color: #d1d5db;
    transition: color 0.2s ease;
  }

  .star--full {
    color: #fbbf24;
  }

  .star--half {
    background: linear-gradient(90deg, #fbbf24 50%, #d1d5db 50%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #fbbf24;
  }

  .star--empty {
    color: #d1d5db;
  }

  .rating-value {
    margin-left: 0.25rem;
    font-weight: 500;
    color: var(--color-text-primary, #1f2937);
  }

  /* Size variants */
  .star-rating--sm {
    font-size: 1rem;
  }

  .star-rating--sm .star {
    font-size: 0.875rem;
  }

  .star-rating--sm .rating-value {
    font-size: 0.875rem;
  }

  .star-rating--md {
    font-size: 1.25rem;
  }

  .star-rating--md .star {
    font-size: 1.125rem;
  }

  .star-rating--md .rating-value {
    font-size: 1rem;
  }

  .star-rating--lg {
    font-size: 1.5rem;
  }

  .star-rating--lg .star {
    font-size: 1.375rem;
  }

  .star-rating--lg .rating-value {
    font-size: 1.125rem;
  }

  @media (max-width: 768px) {
    .star-rating--lg {
      font-size: 1.25rem;
    }

    .star-rating--lg .star {
      font-size: 1.125rem;
    }

    .star-rating--lg .rating-value {
      font-size: 1rem;
    }
  }
</style>