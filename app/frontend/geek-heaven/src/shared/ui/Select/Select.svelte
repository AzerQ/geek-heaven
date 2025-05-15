<script lang="ts">
  import type { ChangeEventHandler, FormEventHandler } from 'svelte/elements';
  import type { SelectProps, SelectOption } from '../types';

  /**
   * Select component for forms
   * @component Select
   */
  export let label: SelectProps['label'] = '';
  export let value: SelectProps['value'] = '';
  export let name: SelectProps['name'] = '';
  export let id: SelectProps['id'] = '';
  export let disabled: SelectProps['disabled'] = false;
  export let readonly: SelectProps['readonly'] = false;
  export let required: SelectProps['required'] = false;
  export let error: SelectProps['error'] = '';
  export let success: SelectProps['success'] = '';
  export let helperText: SelectProps['helperText'] = '';
  export let placeholder: SelectProps['placeholder'] = 'Выберите...';
  export let options: SelectOption[] = [];

  // Генерируем уникальный ID, если не был передан
  if (!id && name) {
    id = name;
  } else if (!id) {
    id = `select-${Math.random().toString(36).substring(2, 9)}`;
  }

   const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    value = event.currentTarget.value;
  }

  // Определяем классы для стилизации
  $: selectClasses = [
    'select',
    error ? 'select--error' : '',
    success ? 'select--success' : '',
    disabled ? 'select--disabled' : '',
    readonly ? 'select--readonly' : ''
  ].filter(Boolean).join(' ');
</script>

<div class="select-wrapper">
  {#if label}
    <label for={id} class="select-label">
      {label}
      {#if required}<span class="select-required">*</span>{/if}
    </label>
  {/if}
  
  <div class="select-container">
    <select
      {id}
      {name}
      {disabled}
      {required}
      class={selectClasses}
      value={value}
      on:change={handleChange}
      on:blur
      on:focus
    >
      {#if placeholder}
        <option value="" disabled selected={!value}>{placeholder}</option>
      {/if}
      
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    <div class="select-arrow"></div>
  </div>
  
  {#if error}
    <div class="select-error">{error}</div>
  {/if}
  
  {#if success}
    <div class="select-success">{success}</div>
  {/if}
  
  {#if helperText && !error && !success}
    <div class="select-helper">{helperText}</div>
  {/if}
</div>

<style>
  .select-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
  }
  
  .select-label {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  .select-required {
    color: #e53935;
    margin-left: 0.25rem;
  }
  
  .select-container {
    position: relative;
    width: 100%;
  }
  
  .select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding: 0.75rem 1rem;
    padding-right: 2.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    background-color: #fff;
    cursor: pointer;
  }
  
  .select:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
  
  .select--error {
    border-color: #e53935;
  }
  
  .select--error:focus {
    box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.2);
  }
  
  .select--success {
    border-color: #4caf50;
  }
  
  .select--success:focus {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
  
  .select--disabled,
  .select--readonly {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  .select-arrow {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #757575;
    pointer-events: none;
  }
  
  .select-error {
    color: #e53935;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .select-success {
    color: #4caf50;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .select-helper {
    color: #757575;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
</style>