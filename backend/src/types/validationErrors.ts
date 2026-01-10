/**
 * Validation Error Types
 * 
 * Custom error types for schema and platform validation.
 * 
 * @module types/validationErrors
 */

/**
 * Base validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Schema validation error
 */
export class SchemaValidationError extends ValidationError {
  constructor(
    message: string,
    public schemaPath?: string,
    public errors?: Array<{ field: string; message: string; rule?: string }>
  ) {
    super(message, undefined, 'SCHEMA_VALIDATION_ERROR')
    this.name = 'SchemaValidationError'
    Object.setPrototypeOf(this, SchemaValidationError.prototype)
  }
}

/**
 * Field validation error
 */
export class FieldValidationError extends ValidationError {
  constructor(
    message: string,
    public field: string,
    public rule?: string,
    public value?: any
  ) {
    super(message, field, 'FIELD_VALIDATION_ERROR')
    this.name = 'FieldValidationError'
    Object.setPrototypeOf(this, FieldValidationError.prototype)
  }
}

/**
 * Platform validation error
 */
export class PlatformValidationError extends ValidationError {
  constructor(
    message: string,
    public platformId?: string,
    public validationErrors?: Array<{ field: string; message: string }>
  ) {
    super(message, undefined, 'PLATFORM_VALIDATION_ERROR')
    this.name = 'PlatformValidationError'
    Object.setPrototypeOf(this, PlatformValidationError.prototype)
  }
}

/**
 * Platform discovery error
 */
export class PlatformDiscoveryError extends Error {
  constructor(
    message: string,
    public platformPath?: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'PlatformDiscoveryError'
    Object.setPrototypeOf(this, PlatformDiscoveryError.prototype)
  }
}

/**
 * Schema version error
 */
export class SchemaVersionError extends ValidationError {
  constructor(
    message: string,
    public currentVersion?: string,
    public requiredVersion?: string
  ) {
    super(message, undefined, 'SCHEMA_VERSION_ERROR')
    this.name = 'SchemaVersionError'
    Object.setPrototypeOf(this, SchemaVersionError.prototype)
  }
}

