<script>
  /**
   * Radio component for forms
   */
  export let label = '';
  export let checked = false;
  export let value = '';
  export let name = '';
  export let id = '';
  export let disabled = false;
  export let required = false;
  export let error = '';
  export let helperText = '';
  export let group = undefined;

  // Генерируем уникальный ID, если не был передан
  if (!id && name) {
    id = `${name}-${value}`;
  } else if (!id) {
    id = `radio-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Обработчик изменения значения
  function handleChange() {
    if (group !== undefined) {
      group = value;
    } else {
      checked = true;
    }
  }

  // Определяем выбран ли элемент
  $: isChecked = group !== undefined ? group === value : checked;

  // Определяем классы для стилизации
  $: radioClasses = [
    'radio',
    error ? 'radio--error' : '',
    disabled ? 'radio--disabled' : ''
  ].filter(Boolean).join(' ');
</script>

<div class="radio-wrapper">
  <label class="radio-label" for={id}>
    <input
      type="radio"
      {id}
      {name}
      {value}
      {disabled}
      {required}
      class={radioClasses}
      checked={isChecked}
      on:change={handleChange}
      on:blur
      on:focus
    />
    <span class="radio-custom"></span>
    {#if label}
      <span class="radio-text">
        {label}
        {#if required}<span class="radio-required">*</span>{/if}
      </span>
    {/if}
  </label>
  
  {#if error}
    <div class="radio-error">{error}</div>
  {/if}
  
  {#if helperText && !error}
    <div class="radio-helper">{helperText}</div>
  {/if}
</div>

<style>
  .radio-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
  }
  
  .radio-label input[type="radio"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .radio-custom {
    position: relative;
    display: inline-block;
    width: 18px;
    height: 18px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 50%;
    margin-right: 0.5rem;
    transition: all 0.2s;
  }
  
  .radio-label input[type="radio"]:checked ~ .radio-custom {
    border-color: #2196f3;
  }
  
  .radio-label input[type="radio"]:checked ~ .radio-custom::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #2196f3;
  }
  
  .radio-label input[type="radio"]:focus ~ .radio-custom {
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
  
  .radio-label input[type="radio"].radio--error ~ .radio-custom {
    border-color: #e53935;
  }
  
  .radio-label input[type="radio"].radio--error:focus ~ .radio-custom {
    box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.2);
  }
  
  .radio-label input[type="radio"].radio--disabled ~ .radio-custom,
  .radio-label input[type="radio"].radio--disabled ~ .radio-text {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .radio-text {
    font-size: 0.875rem;
    color: #333;
  }
  
  .radio-required {
    color: #e53935;
    margin-left: 0.25rem;
  }
  
  .radio-error {
    color: #e53935;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    margin-left: 1.75rem;
  }
  
  .radio-helper {
    color: #757575;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    margin-left: 1.75rem;
  }
</style>