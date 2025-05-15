/**
 * Общие типы для компонентов UI Kit
 */

import type { FullAutoFill } from "svelte/elements"

// Button
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  fullWidth?: boolean
  icon?: string | null
  iconPosition?: 'left' | 'right'
}

// Input
export interface InputProps {
  type?: string
  label?: string
  placeholder?: string
  value?: string
  name?: string
  id?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  success?: string
  helperText?: string
  autocomplete?: FullAutoFill | null | undefined
  maxlength?: number
  minlength?: number
  pattern?: string
  min?: number
  max?: number
  step?: number
}

// Checkbox
export interface CheckboxProps {
  label?: string
  checked?: boolean
  value?: string
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helperText?: string
}

// Radio
export interface RadioProps {
  label?: string
  checked?: boolean
  value?: string
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helperText?: string
  group?: any
}

// Select
export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label?: string
  value?: string
  name?: string
  id?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  success?: string
  helperText?: string
  placeholder?: string
  options: SelectOption[]
}

// Badge
export interface BadgeProps {
  text?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'small' | 'medium' | 'large'
  rounded?: boolean
  outlined?: boolean
  icon?: string
}

// Avatar
export interface AvatarProps {
  src?: string
  alt?: string
  size?: 'small' | 'medium' | 'large'
  rounded?: boolean
  fallback?: string
}

// Icon
export interface IconProps {
  name?: string
  size?: 'small' | 'medium' | 'large' | 'custom'
  color?: string
  viewBox?: string
  svg?: string
}