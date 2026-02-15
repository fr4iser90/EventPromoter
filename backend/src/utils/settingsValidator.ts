/**
 * Settings Validator
 * 
 * Validates settings values against SettingsSchema validation rules.
 * Supports both field-level and form-level validation.
 * 
 * @module utils/settingsValidator
 */

import { CredentialsSchema, FieldDefinition, ValidationRule } from '@/types/schema/index.js'
import { createSafeValidationRegex } from './safeRegex.js'

/**
 * Validation result
 */
export interface SettingsValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
}

/**
 * Validate credentials values against schema
 */
export function validateSettingsValues(
  schema: CredentialsSchema,
  values: Record<string, any>
): SettingsValidationResult {
  const errors: Record<string, string[]> = {}

  // Field-level Validation
  for (const field of schema.fields) {
    const value = values[field.name]
    const fieldErrors: string[] = []

    // Check required
    if (field.required && (value === undefined || value === null || value === '')) {
      const requiredRule = field.validation?.find((r: ValidationRule) => r.type === 'required')
      fieldErrors.push(requiredRule?.message || `${field.label} is required`)
    }

    // Check validation rules (only if value is provided)
    if (field.validation && value !== undefined && value !== null && value !== '') {
      for (const rule of field.validation) {
        // Skip required rule if we already checked it
        if (rule.type === 'required') continue

        const error = validateFieldRule(field, value, rule)
        if (error) {
          fieldErrors.push(error)
        }
      }
    }

    if (fieldErrors.length > 0) {
      errors[field.name] = fieldErrors
    }
  }

  // Form-level Validation (optional)
  if (schema.validate) {
    const formValidation = schema.validate(values)
    if (!formValidation.isValid) {
      // Merge form-level errors
      for (const [field, fieldErrors] of Object.entries(formValidation.errors)) {
        if (errors[field]) {
          errors[field].push(...fieldErrors)
        } else {
          errors[field] = fieldErrors
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate a single field rule
 */
export function validateFieldRule(
  field: FieldDefinition,
  value: any,
  rule: ValidationRule
): string | null {
  switch (rule.type) {
    case 'required':
      if (field.required && (!value || value === '')) {
        return rule.message || `${field.label} is required`
      }
      break

    case 'minLength':
      if (typeof value === 'string' && value.length < (rule.value as number)) {
        return rule.message || `${field.label} must be at least ${rule.value} characters`
      }
      break

    case 'maxLength':
      if (typeof value === 'string' && value.length > (rule.value as number)) {
        return rule.message || `${field.label} must be at most ${rule.value} characters`
      }
      break

    case 'min':
      if (typeof value === 'number' && value < (rule.value as number)) {
        return rule.message || `${field.label} must be at least ${rule.value}`
      }
      // Also check string numbers
      if (typeof value === 'string' && !isNaN(Number(value)) && Number(value) < (rule.value as number)) {
        return rule.message || `${field.label} must be at least ${rule.value}`
      }
      break

    case 'max':
      if (typeof value === 'number' && value > (rule.value as number)) {
        return rule.message || `${field.label} must be at most ${rule.value}`
      }
      // Also check string numbers
      if (typeof value === 'string' && !isNaN(Number(value)) && Number(value) > (rule.value as number)) {
        return rule.message || `${field.label} must be at most ${rule.value}`
      }
      break

    case 'pattern':
      if (typeof value === 'string') {
        const regex = createSafeValidationRegex(rule.value)
        if (!regex || !regex.test(value)) {
          return rule.message || `${field.label} format is invalid`
        }
      }
      break

    case 'url':
      if (typeof value === 'string' && !/^https?:\/\/.+/.test(value)) {
        return rule.message || `${field.label} must be a valid URL`
      }
      break

    case 'custom':
      if (rule.validator) {
        const result = rule.validator(value)
        if (result !== true) {
          return typeof result === 'string' ? result : rule.message || `${field.label} is invalid`
        }
      }
      break
  }

  return null
}
