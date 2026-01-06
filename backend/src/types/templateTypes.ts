// Template Types for Template Management System

export interface Template {
  id: string
  name: string
  description?: string
  platform: string
  category: string
  template: Record<string, any> // Platform-specific structure (subject+html for email, text for social, etc.)
  variables: string[]
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
}

export interface TemplateUpdateRequest {
  name?: string
  description?: string
  category?: string
  template?: Record<string, any>
  variables?: string[]
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
