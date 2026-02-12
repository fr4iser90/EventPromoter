export interface TemplateVariableDefinition {
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
}

export interface Template {
  id: string
  name: string
  description?: string
  platform: string
  category: string
  template: Record<string, any>
  variables: string[]
  variableDefinitions?: TemplateVariableDefinition[]
  isDefault: boolean
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

export interface TemplateByCategoryEntry {
  platformId: string
  templateId: string | null
  templateName: string | null
  hasTemplate: boolean
  availableTemplates: Array<{ id: string; name: string }>
}

export interface TemplatesByCategoryResponse {
  success: boolean
  category: string
  templates: TemplateByCategoryEntry[]
}

export interface TemplateMutationResponse {
  success: boolean
  template?: Template
  message?: string
  error?: string
}
