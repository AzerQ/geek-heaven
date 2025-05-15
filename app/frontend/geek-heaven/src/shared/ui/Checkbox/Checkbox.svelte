<script>
  /**
   * Checkbox component for forms
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

  // Генерируем уникальный ID, если не был передан
  if (!id && name) {
    id = name;
  } else if (!id) {
    id = `checkbox-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Обработчик изменения значения
  function handleChange(event) {
    checked = event.target.checked;
  }

  // Определяем классы для стилизации
  $: checkboxClasses = [
    'checkbox',
    error ? 'checkbox--error' : '',
    disabled ? 'checkbox--disabled' : ''
  ].filter(Boolean).join(' ');
</script>

<div class="checkbox-wrapper">
  <label class="checkbox-label" for={id}>
    <input
      type="checkbox"
      {id}
      {name}
      {value}
      {disabled}
      {required}
      class={checkboxClasses}
      checked={checked}
      on:change={handleChange}
      on:blur
      on:focus
    />
    <span class="checkbox-custom"></span>
    {#if label}
      <span class="checkbox-text">
        {label}
        {#if required}<span class="checkbox-required">*</span>{/if}
      </span>
    {/if}
  </label>
  
  {#if error}
    <div class="checkbox-error">{error}</div>
  {/if}
  
  {#if helperText && !error}
    <div class="checkbox-helper">{helperText}</div>
  {/if}
</div>

<style>
  .checkbox-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
  }
  
  .checkbox-label input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .checkbox-custom {
    position: relative;
    display: inline-block;
    width: 18px;
    height: 18px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 3px;
    margin-right: 0.5rem;
    transition: all 0.2s;
  }
  
  .checkbox-label input[type="checkbox"]:checked ~ .checkbox-custom {
    background-color: #2196f3;
    border-color: #2196f3;
  }
  
  .checkbox-label input[type="checkbox"]:checked ~ .checkbox-custom::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .checkbox-label input[type="checkbox"]:focus ~ .checkbox-custom {
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
  
  .checkbox-label input[type="checkbox"].checkbox--error ~ .checkbox-custom {
    border-color: #e53935;
  }
  
  .checkbox-label input[type="checkbox"].checkbox--error:focus ~ .checkbox-custom {
    box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.2);
  }
  
  .checkbox-label input[type="checkbox"].checkbox--disabled ~ .checkbox-custom,
  .checkbox-label input[type="checkbox"].checkbox--disabled ~ .checkbox-text {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .checkbox-text {
    font-size: 0.875rem;
    color: #333;
  }
  
  .checkbox-required {
    color: #e53935;
    margin-left: 0.25rem;
  }
  
  .checkbox-error {
    color: #e53935;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    margin-left: 1.75rem;
  }
  
  .checkbox-helper {
    color: #757575;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    margin-left: 1.75rem;
  }
</style>