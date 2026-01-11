/**
 * PlatformSchema Type System
 * 
 * Schema-driven UI definitions for platforms.
 * Enables generic frontend rendering based on backend-defined schemas.
 * 
 * @module types/platformSchema
 */

/**
 * Field types supported by the schema system
 */
export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'password'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'image'
  | 'color'
  | 'range'
  | 'json'

/**
 * Validation rule types
 */
export interface ValidationRule {
  /** Rule type */
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'url' | 'custom'
  /** Rule value (e.g., min: 0, max: 100, pattern: '^[a-z]+$') */
  value?: any
  /** Error message for this rule */
  message?: string
  /** Custom validation function (for 'custom' type) */
  validator?: (value: any) => boolean | string
}

/**
 * Field definition for schema-driven forms
 */
export interface FieldDefinition {
  /** Field name (used as key in form data) */
  name: string
  /** Field type */
  type: FieldType
  /** Field label */
  label: string
  /** Field description/help text */
  description?: string
  /** Placeholder text */
  placeholder?: string
  /** Default value */
  default?: any
  /** Whether field is required */
  required?: boolean
  /** Validation rules */
  validation?: ValidationRule[]
  /** Field options (for select, multiselect, radio) */
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  /** Dynamic options source (loads options from API) */
  optionsSource?: {
    /** API endpoint pattern (use :platformId placeholder) */
    endpoint: string
    /** HTTP method */
    method?: 'GET' | 'POST'
    /** Response path to extract options (e.g., 'data.available' or 'items') */
    responsePath?: string
    /** Transform function for mapping items to {label, value} */
    transform?: 'custom' | ((item: any) => { label: string; value: any })
  }
  /** Field action (triggered on value change or submit) */
  action?: {
    /** API endpoint pattern (use :platformId placeholder) */
    endpoint: string
    /** HTTP method */
    method: 'POST' | 'PUT' | 'DELETE'
    /** When to trigger action: 'change' (immediate) | 'submit' (on form submit/enter) | 'blur' (on field blur) */
    trigger?: 'change' | 'submit' | 'blur'
    /** Request body mapping (field value will be sent as 'value' or custom mapping) */
    bodyMapping?: Record<string, string>
    /** On success action */
    onSuccess?: 'reload' | 'clear' | 'refresh' | 'none'
    /** Reload options source after action */
    reloadOptions?: boolean
  }
  /** Field dependencies (show/hide based on other fields) */
  dependencies?: {
    field: string
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan'
    value: any
  }
  /** UI hints */
  ui?: {
    /** Field width (1-12 grid system) */
    width?: number
    /** Field order */
    order?: number
    /** Custom CSS class */
    className?: string
    /** Whether to show field */
    hidden?: boolean
    /** Whether field is disabled */
    disabled?: boolean
    /** Custom component to render (overrides default) */
    component?: string
  }
}

/**
 * Settings schema
 * Defines the form structure for platform settings/configuration
 */
export interface SettingsSchema {
  /** Schema version */
  version: string
  /** Schema title */
  title: string
  /** Schema description */
  description?: string
  /** Form fields */
  fields: FieldDefinition[]
  /** Field groups/sections */
  groups?: Array<{
    id: string
    title: string
    description?: string
    fields: string[] // Field names in this group
    collapsible?: boolean
    collapsed?: boolean
  }>
  /** Form-level validation */
  validate?: (data: Record<string, any>) => { isValid: boolean; errors: Record<string, string[]> }
}

/**
 * Content block types for editor
 */
export type ContentBlockType = 
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'video'
  | 'link'
  | 'hashtag'
  | 'mention'
  | 'list'
  | 'quote'
  | 'code'
  | 'custom'

/**
 * Content block definition
 */
export interface ContentBlock {
  /** Block type */
  type: ContentBlockType
  /** Block identifier (used as field name in content object) */
  id: string
  /** Block label */
  label: string
  /** Block description */
  description?: string
  /** Whether block is required */
  required?: boolean
  /** Block constraints */
  constraints?: {
    /** Maximum length */
    maxLength?: number
    /** Minimum length */
    minLength?: number
    /** Maximum number of items (for lists) */
    maxItems?: number
    /** Minimum number of items */
    minItems?: number
    /** Allowed formats (for media) */
    allowedFormats?: string[]
    /** Maximum file size (bytes) */
    maxFileSize?: number
    /** Maximum dimensions (for images) */
    maxDimensions?: { width: number; height: number }
    /** Aspect ratio (for images/videos) */
    aspectRatio?: string
  }
  /** Block validation rules */
  validation?: ValidationRule[]
  /** Block UI configuration */
  ui?: {
    /** Icon identifier */
    icon?: string
    /** Custom component */
    component?: string
    /** Whether block is enabled */
    enabled?: boolean
    /** Block order */
    order?: number
  }
  /** Block rendering configuration (for schema-driven rendering) */
  rendering?: {
    /** Field type for SchemaRenderer (if block should be rendered as form field) */
    fieldType?: FieldType
    /** Placeholder text */
    placeholder?: string
    /** Default value */
    default?: any
    /** For media blocks: upload endpoint */
    uploadEndpoint?: string
    /** For hashtag/mention blocks: suggestions endpoint */
    suggestionsEndpoint?: string
    /** For select/list blocks: options source */
    optionsSource?: {
      endpoint: string
      method?: 'GET' | 'POST'
      responsePath?: string
      transform?: 'custom' | ((item: any) => { label: string; value: any })
    }
  }
}

/**
 * Editor schema
 * Defines the content editor structure and allowed blocks
 */
export interface EditorSchema {
  /** Schema version */
  version: string
  /** Schema title */
  title: string
  /** Schema description */
  description?: string
  /** Allowed content blocks */
  blocks: ContentBlock[]
  /** Editor mode */
  mode?: 'simple' | 'advanced' | 'rich' | 'markdown'
  /** Editor features */
  features?: {
    /** Enable formatting toolbar */
    formatting?: boolean
    /** Enable media upload */
    mediaUpload?: boolean
    /** Enable link insertion */
    linkInsertion?: boolean
    /** Enable hashtag suggestions */
    hashtagSuggestions?: boolean
    /** Enable mention suggestions */
    mentionSuggestions?: boolean
    /** Enable preview */
    preview?: boolean
    /** Enable word count */
    wordCount?: boolean
    /** Enable character count */
    characterCount?: boolean
  }
  /** Editor constraints */
  constraints?: {
    /** Maximum total length */
    maxLength?: number
    /** Minimum total length */
    minLength?: number
    /** Maximum number of blocks */
    maxBlocks?: number
  }
}

/**
 * Preview mode types
 */
export type PreviewMode = 
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'feed'
  | 'story'
  | 'post'
  | 'custom'

/**
 * Preview schema
 * Defines how content should be previewed
 */
export interface PreviewSchema {
  /** Schema version */
  version: string
  /** Schema title */
  title: string
  /** Schema description */
  description?: string
  /** Default preview mode */
  defaultMode: PreviewMode
  /** Available preview modes */
  modes: Array<{
    id: PreviewMode
    label: string
    description?: string
    width?: number
    height?: number
    aspectRatio?: string
  }>
  /** Content field mapping (defines which content fields to render and how) */
  contentMapping?: Array<{
    /** Content field name (from editor blocks) */
    field: string
    /** How to render this field */
    renderAs: 'text' | 'heading' | 'paragraph' | 'html' | 'image' | 'video' | 'link' | 'list' | 'quote' | 'code' | 'markdown' | 'markdown' | 'markdown'
    /** Display label (optional, uses block label if not specified) */
    label?: string
    /** CSS class for this field */
    className?: string
    /** Whether to show this field */
    show?: boolean
    /** Display order */
    order?: number
    /** Custom renderer component (optional) */
    component?: string
  }>
  /** Preview options */
  options?: {
    /** Show metadata */
    showMetadata?: boolean
    /** Show engagement metrics */
    showMetrics?: boolean
    /** Show timestamp */
    showTimestamp?: boolean
    /** Enable interactive preview */
    interactive?: boolean
    /** Custom preview component */
    component?: string
  }
  /** Preview styling */
  styling?: {
    /** Background color */
    backgroundColor?: string
    /** Text color */
    textColor?: string
    /** Font family */
    fontFamily?: string
    /** Custom CSS */
    customCSS?: string
  }
}

/**
 * Panel section definition
 * Defines a section within a platform panel
 * Uses schema-driven fields (like SettingsSchema) instead of hardcoded components
 */
export interface PanelSection {
  /** Section identifier */
  id: string
  /** Section title */
  title: string
  /** Section description */
  description?: string
  /** Fields to render in this section (schema-driven, rendered by SchemaRenderer) */
  fields: FieldDefinition[]
  /** Whether section is required */
  required?: boolean
  /** Section order */
  order?: number
}

/**
 * Panel schema
 * Defines the platform feature panel structure (NOT settings/credentials)
 */
export interface PanelSchema {
  /** Schema version */
  version: string
  /** Panel title */
  title: string
  /** Panel description */
  description?: string
  /** Panel sections */
  sections: PanelSection[]
  /** Panel tabs (optional) */
  tabs?: Array<{
    id: string
    label: string
    sections: string[] // Section IDs in this tab
  }>
}

/**
 * Template schema
 * Defines template structure and variables for a platform
 */
export interface TemplateSchema {
  /** Schema version */
  version: string
  /** Template title */
  title: string
  /** Template description */
  description?: string
  /** Default template structure (fields that templates should have) */
  defaultStructure: Record<string, {
    /** Field label */
    label: string
    /** Field type */
    type: 'text' | 'textarea' | 'html' | 'rich'
    /** Default value (with variable placeholders) */
    default?: string
    /** Placeholder text */
    placeholder?: string
    /** Whether field is required */
    required?: boolean
    /** Field description */
    description?: string
  }>
  /** Available template variables (from event data) */
  variables?: Array<{
    /** Variable name (e.g., 'eventTitle') */
    name: string
    /** Variable label */
    label: string
    /** Variable description */
    description?: string
    /** Variable type */
    type?: 'string' | 'date' | 'number' | 'url' | 'image'
    /** Default value if not available */
    defaultValue?: string
  }>
  /** Template categories */
  categories?: Array<{
    id: string
    label: string
    description?: string
  }>
  /** Template validation rules */
  validation?: {
    /** Required fields */
    requiredFields?: string[]
    /** Variable pattern (e.g., /\{[^}]+\}/) */
    variablePattern?: string
  }
}

/**
 * Complete platform schema
 * Combines settings, editor, preview, panel, and template schemas
 */
export interface PlatformSchema {
  /** Schema version */
  version: string
  /** Settings schema (for credentials/API keys - shown in modal) */
  settings: SettingsSchema
  /** Editor schema (for content editing) */
  editor: EditorSchema
  /** Preview schema (for content preview) */
  preview: PreviewSchema
  /** Panel schema (for platform features/options - shown in sidebar) */
  panel?: PanelSchema
  /** Template schema (for template management) */
  template?: TemplateSchema
  /** Schema metadata */
  metadata?: {
    /** Last updated timestamp */
    lastUpdated?: string
    /** Schema author */
    author?: string
    /** Schema description */
    description?: string
  }
}

/**
 * Type guard to check if an object is a valid PlatformSchema
 */
export function isPlatformSchema(obj: any): obj is PlatformSchema {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.version === 'string' &&
    obj.settings &&
    typeof obj.settings === 'object' &&
    Array.isArray(obj.settings.fields) &&
    obj.editor &&
    typeof obj.editor === 'object' &&
    Array.isArray(obj.editor.blocks) &&
    obj.preview &&
    typeof obj.preview === 'object' &&
    typeof obj.preview.defaultMode === 'string'
  )
}

/**
 * Schema version compatibility
 */
export interface SchemaVersion {
  major: number
  minor: number
  patch: number
}

/**
 * Parse schema version string (e.g., "1.2.3")
 */
export function parseSchemaVersion(version: string): SchemaVersion {
  const parts = version.split('.').map(Number)
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  }
}

/**
 * Check if schema version is compatible
 */
export function isSchemaVersionCompatible(version: string, minVersion: string): boolean {
  const v = parseSchemaVersion(version)
  const min = parseSchemaVersion(minVersion)
  
  if (v.major > min.major) return true
  if (v.major < min.major) return false
  if (v.minor > min.minor) return true
  if (v.minor < min.minor) return false
  return v.patch >= min.patch
}

