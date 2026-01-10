/**
 * Schema Validator
 * 
 * Validates platform schemas against the schema type definitions.
 * 
 * @module utils/schemaValidator
 */

import {
  PlatformSchema,
  SettingsSchema,
  EditorSchema,
  PreviewSchema,
  FieldDefinition,
  ContentBlock,
  ValidationRule,
  isPlatformSchema,
  isSchemaVersionCompatible
} from '../types/platformSchema.js'
import {
  SchemaValidationError,
  FieldValidationError,
  SchemaVersionError
} from '../types/validationErrors.js'

/**
 * Minimum required schema version
 */
const MIN_SCHEMA_VERSION = '1.0.0'

/**
 * Validate platform schema structure
 */
export function validateSchemaStructure(schema: any): schema is PlatformSchema {
  if (!isPlatformSchema(schema)) {
    throw new SchemaValidationError(
      'Invalid schema structure: schema must be a valid PlatformSchema object',
      'schema'
    )
  }

  // Validate schema version
  if (!isSchemaVersionCompatible(schema.version, MIN_SCHEMA_VERSION)) {
    throw new SchemaVersionError(
      `Schema version ${schema.version} is not compatible. Minimum required: ${MIN_SCHEMA_VERSION}`,
      schema.version,
      MIN_SCHEMA_VERSION
    )
  }

  return true
}

/**
 * Validate settings schema
 */
export function validateSettingsSchema(settings: any): settings is SettingsSchema {
  const errors: Array<{ field: string; message: string; rule?: string }> = []

  if (!settings || typeof settings !== 'object') {
    throw new SchemaValidationError(
      'Settings schema must be an object',
      'settings',
      [{ field: 'settings', message: 'Settings schema is required' }]
    )
  }

  if (!settings.version || typeof settings.version !== 'string') {
    errors.push({ field: 'settings.version', message: 'Version is required and must be a string' })
  }

  if (!settings.title || typeof settings.title !== 'string') {
    errors.push({ field: 'settings.title', message: 'Title is required and must be a string' })
  }

  if (!Array.isArray(settings.fields)) {
    errors.push({ field: 'settings.fields', message: 'Fields must be an array' })
  } else {
    // Validate each field
    settings.fields.forEach((field: any, index: number) => {
      try {
        validateFieldDefinition(field)
      } catch (error) {
        if (error instanceof FieldValidationError) {
          errors.push({
            field: `settings.fields[${index}].${error.field}`,
            message: error.message,
            rule: error.rule
          })
        } else {
          errors.push({
            field: `settings.fields[${index}]`,
            message: error instanceof Error ? error.message : 'Invalid field definition'
          })
        }
      }
    })
  }

  // Validate groups if present
  if (settings.groups && Array.isArray(settings.groups)) {
    settings.groups.forEach((group: any, index: number) => {
      if (!group.id || typeof group.id !== 'string') {
        errors.push({
          field: `settings.groups[${index}].id`,
          message: 'Group ID is required and must be a string'
        })
      }
      if (!Array.isArray(group.fields)) {
        errors.push({
          field: `settings.groups[${index}].fields`,
          message: 'Group fields must be an array'
        })
      }
    })
  }

  if (errors.length > 0) {
    throw new SchemaValidationError(
      'Settings schema validation failed',
      'settings',
      errors
    )
  }

  return true
}

/**
 * Validate field definition
 */
export function validateFieldDefinition(field: any): field is FieldDefinition {
  if (!field || typeof field !== 'object') {
    throw new FieldValidationError('Field definition must be an object', 'field')
  }

  if (!field.name || typeof field.name !== 'string') {
    throw new FieldValidationError('Field name is required and must be a string', 'name')
  }

  if (!field.type || typeof field.type !== 'string') {
    throw new FieldValidationError('Field type is required and must be a string', 'type')
  }

  if (!field.label || typeof field.label !== 'string') {
    throw new FieldValidationError('Field label is required and must be a string', 'label')
  }

  // Validate field type
  const validTypes = [
    'text', 'textarea', 'number', 'password', 'url', 'date', 'time',
    'datetime', 'boolean', 'select', 'multiselect', 'radio', 'checkbox',
    'file', 'image', 'color', 'range', 'json'
  ]
  if (!validTypes.includes(field.type)) {
    throw new FieldValidationError(
      `Invalid field type: ${field.type}. Must be one of: ${validTypes.join(', ')}`,
      'type',
      'type_validation'
    )
  }

  // Validate options for select/multiselect/radio
  if (['select', 'multiselect', 'radio'].includes(field.type)) {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      throw new FieldValidationError(
        `Field type ${field.type} requires options array with at least one option`,
        'options',
        'options_required'
      )
    }
    field.options.forEach((option: any, index: number) => {
      if (!option.label || typeof option.label !== 'string') {
        throw new FieldValidationError(
          `Option[${index}] label is required and must be a string`,
          `options[${index}].label`
        )
      }
      if (option.value === undefined || option.value === null) {
        throw new FieldValidationError(
          `Option[${index}] value is required`,
          `options[${index}].value`
        )
      }
    })
  }

  // Validate validation rules
  if (field.validation && Array.isArray(field.validation)) {
    field.validation.forEach((rule: any, index: number) => {
      validateValidationRule(rule, `validation[${index}]`)
    })
  }

  return true
}

/**
 * Validate validation rule
 */
export function validateValidationRule(rule: any, path?: string): rule is ValidationRule {
  if (!rule || typeof rule !== 'object') {
    throw new FieldValidationError('Validation rule must be an object', path || 'rule')
  }

  if (!rule.type || typeof rule.type !== 'string') {
    throw new FieldValidationError('Validation rule type is required', path ? `${path}.type` : 'type')
  }

  const validTypes = [
    'required', 'min', 'max', 'minLength', 'maxLength', 'pattern',
    'url', 'custom'
  ]
  if (!validTypes.includes(rule.type)) {
    throw new FieldValidationError(
      `Invalid validation rule type: ${rule.type}`,
      path ? `${path}.type` : 'type',
      'rule_type_validation'
    )
  }

  // Validate custom validator function
  if (rule.type === 'custom' && typeof rule.validator !== 'function') {
    throw new FieldValidationError(
      'Custom validation rule requires a validator function',
      path ? `${path}.validator` : 'validator',
      'custom_validator_required'
    )
  }

  return true
}

/**
 * Validate editor schema
 */
export function validateEditorSchema(editor: any): editor is EditorSchema {
  const errors: Array<{ field: string; message: string; rule?: string }> = []

  if (!editor || typeof editor !== 'object') {
    throw new SchemaValidationError(
      'Editor schema must be an object',
      'editor',
      [{ field: 'editor', message: 'Editor schema is required' }]
    )
  }

  if (!editor.version || typeof editor.version !== 'string') {
    errors.push({ field: 'editor.version', message: 'Version is required and must be a string' })
  }

  if (!editor.title || typeof editor.title !== 'string') {
    errors.push({ field: 'editor.title', message: 'Title is required and must be a string' })
  }

  if (!Array.isArray(editor.blocks)) {
    errors.push({ field: 'editor.blocks', message: 'Blocks must be an array' })
  } else {
    // Validate each block
    editor.blocks.forEach((block: any, index: number) => {
      try {
        validateContentBlock(block)
      } catch (error) {
        if (error instanceof FieldValidationError) {
          errors.push({
            field: `editor.blocks[${index}].${error.field}`,
            message: error.message,
            rule: error.rule
          })
        } else {
          errors.push({
            field: `editor.blocks[${index}]`,
            message: error instanceof Error ? error.message : 'Invalid block definition'
          })
        }
      }
    })
  }

  // Validate mode if present
  if (editor.mode) {
    const validModes = ['simple', 'advanced', 'rich', 'markdown']
    if (!validModes.includes(editor.mode)) {
      errors.push({
        field: 'editor.mode',
        message: `Invalid mode: ${editor.mode}. Must be one of: ${validModes.join(', ')}`
      })
    }
  }

  if (errors.length > 0) {
    throw new SchemaValidationError(
      'Editor schema validation failed',
      'editor',
      errors
    )
  }

  return true
}

/**
 * Validate content block
 */
export function validateContentBlock(block: any): block is ContentBlock {
  if (!block || typeof block !== 'object') {
    throw new FieldValidationError('Content block must be an object', 'block')
  }

  if (!block.type || typeof block.type !== 'string') {
    throw new FieldValidationError('Block type is required and must be a string', 'type')
  }

  if (!block.id || typeof block.id !== 'string') {
    throw new FieldValidationError('Block ID is required and must be a string', 'id')
  }

  if (!block.label || typeof block.label !== 'string') {
    throw new FieldValidationError('Block label is required and must be a string', 'label')
  }

  // Validate block type
  const validTypes = [
    'text', 'heading', 'paragraph', 'image', 'video', 'link',
    'hashtag', 'mention', 'list', 'quote', 'code', 'custom'
  ]
  if (!validTypes.includes(block.type)) {
    throw new FieldValidationError(
      `Invalid block type: ${block.type}. Must be one of: ${validTypes.join(', ')}`,
      'type',
      'block_type_validation'
    )
  }

  return true
}

/**
 * Validate preview schema
 */
export function validatePreviewSchema(preview: any): preview is PreviewSchema {
  const errors: Array<{ field: string; message: string; rule?: string }> = []

  if (!preview || typeof preview !== 'object') {
    throw new SchemaValidationError(
      'Preview schema must be an object',
      'preview',
      [{ field: 'preview', message: 'Preview schema is required' }]
    )
  }

  if (!preview.version || typeof preview.version !== 'string') {
    errors.push({ field: 'preview.version', message: 'Version is required and must be a string' })
  }

  if (!preview.title || typeof preview.title !== 'string') {
    errors.push({ field: 'preview.title', message: 'Title is required and must be a string' })
  }

  if (!preview.defaultMode || typeof preview.defaultMode !== 'string') {
    errors.push({
      field: 'preview.defaultMode',
      message: 'Default mode is required and must be a string'
    })
  }

  if (!Array.isArray(preview.modes)) {
    errors.push({ field: 'preview.modes', message: 'Modes must be an array' })
  } else {
    // Validate each mode
    preview.modes.forEach((mode: any, index: number) => {
      if (!mode.id || typeof mode.id !== 'string') {
        errors.push({
          field: `preview.modes[${index}].id`,
          message: 'Mode ID is required and must be a string'
        })
      }
      if (!mode.label || typeof mode.label !== 'string') {
        errors.push({
          field: `preview.modes[${index}].label`,
          message: 'Mode label is required and must be a string'
        })
      }
    })
  }

  if (errors.length > 0) {
    throw new SchemaValidationError(
      'Preview schema validation failed',
      'preview',
      errors
    )
  }

  return true
}

/**
 * Validate complete platform schema
 */
export function validatePlatformSchema(schema: any): schema is PlatformSchema {
  const errors: Array<{ field: string; message: string; rule?: string }> = []

  // Validate structure
  try {
    validateSchemaStructure(schema)
  } catch (error) {
    if (error instanceof SchemaValidationError) {
      if (error.errors) {
        errors.push(...error.errors)
      } else {
        errors.push({ field: 'schema', message: error.message })
      }
    } else {
      errors.push({ field: 'schema', message: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Validate settings
  try {
    validateSettingsSchema(schema.settings)
  } catch (error) {
    if (error instanceof SchemaValidationError && error.errors) {
      errors.push(...error.errors)
    } else {
      errors.push({
        field: 'settings',
        message: error instanceof Error ? error.message : 'Settings validation failed'
      })
    }
  }

  // Validate editor
  try {
    validateEditorSchema(schema.editor)
  } catch (error) {
    if (error instanceof SchemaValidationError && error.errors) {
      errors.push(...error.errors)
    } else {
      errors.push({
        field: 'editor',
        message: error instanceof Error ? error.message : 'Editor validation failed'
      })
    }
  }

  // Validate preview
  try {
    validatePreviewSchema(schema.preview)
  } catch (error) {
    if (error instanceof SchemaValidationError && error.errors) {
      errors.push(...error.errors)
    } else {
      errors.push({
        field: 'preview',
        message: error instanceof Error ? error.message : 'Preview validation failed'
      })
    }
  }

  if (errors.length > 0) {
    throw new SchemaValidationError(
      'Platform schema validation failed',
      'schema',
      errors
    )
  }

  return true
}

