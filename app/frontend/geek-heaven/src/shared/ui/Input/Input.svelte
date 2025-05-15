<script>
  /**
   * Input component for forms with validation support
   */
  export let type = 'text'; // text, password, email, number, etc.
  export let label = '';
  export let placeholder = '';
  export let value = '';
  export let name = '';
  export let id = '';
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let error = '';
  export let success = '';
  export let helperText = '';
  export let autocomplete = 'off';
  export let maxlength = undefined;
  export let minlength = undefined;
  export let pattern = undefined;
  export let min = undefined;
  export let max = undefined;
  export let step = undefined;

  // Генерируем уникальный ID, если не был передан
  if (!id && name) {
    id = name;
  } else if (!id) {
    id = `input-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Обработчик изменения значения
  function handleInput(event) {
    value = event.target.value;
  }

  // Определяем классы для стилизации
  $: inputClasses = [
    'input',
    error ? 'input--error' : '',
    success ? 'input--success' : '',
    disabled ? 'input--disabled' : '',
    readonly ? 'input--readonly' : ''
  ].filter(Boolean).join(' ');
</script>

<div class="input-wrapper">
  {#if label}
    <label for={id} class="input-label">
      {label}
      {#if required}<span class="input-required">*</span>{/if}
    </label>
  {/if}
  
  <input
    {id}
    {name}
    {type}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    {autocomplete}
    {pattern}
    {maxlength}
    {minlength}
    {min}
    {max}
    {step}
    class={inputClasses}
    value={value}
    on:input={handleInput}
    on:blur
    on:focus
    on:keydown
    on:keyup
    on:keypress
  />
  
  {#if error}
    <div class="input-error">{error}</div>
  {/if}
  
  {#if success}
    <div class="input-success">{success}</div>
  {/if}
  
  {#if helperText && !error && !success}
    <div class="input-helper">{helperText}</div>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
  }
  
  .input-label {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  .input-required {
    color: #e53935;
    margin-left: 0.25rem;
  }
  
  .input {
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    background-color: #fff;
  }
  
  .input:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
  
  .input--error {
    border-color: #e53935;
  }
  
  .input--error:focus {
    box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.2);
  }
  
  .input--success {
    border-color: #4caf50;
  }
  
  .input--success:focus {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
  
  .input--disabled,
  .input--readonly {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  .input-error {
    color: #e53935;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .input-success {
    color: #4caf50;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .input-helper {
    color: #757575;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
</style>