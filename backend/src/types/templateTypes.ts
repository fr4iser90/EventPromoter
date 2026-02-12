// Template Types for Template Management System

export interface Template {
  id: string
  name: string
  description?: string
  platform: string
  category: string // Category ID from TEMPLATE_CATEGORIES (shared/templateCategories.ts)
  template: Record<string, any> // Platform-specific structure (defined by platform schema)
  variables: string[]
  /**
   * Optional backend-driven variable metadata for renderer-only frontend.
   * This enables canonical grouping (e.g. title/eventTitle/name), source metadata,
   * and editability without hardcoded frontend maps.
   */
  variableDefinitions?: Array<{
    name: string
    canonicalName?: string
    aliases?: string[]
    label: string
    description?: string
    type?: 'string' | 'date' | 'number' | 'url' | 'image'
    source?: 'parsed' | 'parsed_optional' | 'manual' | 'target' | 'computed'
    parsedField?: string
    editable?: boolean
    showWhenEmpty?: boolean
    icon?: string
    defaultValue?: string
  }>
  isDefault: boolean // true for hardcoded templates, false for custom user templates
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface TemplateValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface TemplateCreateRequest {
  name: string
  description?: string
  category: string
  template: Record<string, any>
  variables: string[]
  variableDefinitions?: Template['variableDefinitions']
}

export interface TemplateUpdateRequest {
  name?: string
  description?: string
  category?: string
  template?: Record<string, any>
  variables?: string[]
  variableDefinitions?: Template['variableDefinitions']
}

export interface TemplateListResponse {
  success: boolean
  templates: Template[]
  defaultCount: number
  customCount: number
}

export interface TemplateResponse {
  success: boolean
  template: Template
}

export interface TemplateCategoriesResponse {
  success: boolean
  categories: {
    id: string
    name: string
    description: string
    platform: string
  }[]
}
