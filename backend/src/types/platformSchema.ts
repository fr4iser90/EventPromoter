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
  | 'target-list'
  | 'button'

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
  // ✅ NEW: Environment Variable Support
  /** Environment variable name or configuration */
  envVar?: string | {
    name: string
    required?: boolean
    default?: string
    transform?: (value: string) => any
  }
  // ✅ NEW: Conditional Visibility (alternative to dependencies, more explicit)
  /** Show field only when condition is met */
  visibleWhen?: {
    field: string
    operator: 'equals' | 'notEquals' | 'exists' | 'notExists'
    value?: any
  }
  // ✅ NEW: Field Dependencies
  /** Fields this field depends on */
  dependsOn?: string[]
  // ✅ NEW: Field Help/Examples
  /** Help text for this field */
  help?: string
  /** Example values for this field */
  examples?: string[]
  // ✅ NEW: Field Encryption
  /** Whether field value should be encrypted (for passwords, API keys, etc.) */
  encrypted?: boolean
  // ✅ NEW: Field Masking
  /** Mask value in UI (for sensitive data) */
  mask?: boolean
  // ✅ NEW: Field Autocomplete
  /** Autocomplete configuration */
  autocomplete?: {
    source: 'api' | 'static'
    endpoint?: string
    options?: Array<{ label: string; value: any }>
  }
  // ✅ NEW: Helper System
  /** Helper ID for displaying help information */
  helper?: string
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
  // ✅ NEW: Environment Variable Mapping
  /** Map field names to environment variable names */
  envMapping?: {
    [fieldName: string]: string | {
      envVar: string
      required?: boolean
      default?: string
      transform?: (value: string) => any
    }
  }
  // ✅ NEW: Settings Categories
  /** Settings categories for better organization */
  categories?: Array<{
    id: string
    label: string
    description?: string
    fields: string[] // Field names in this category
    icon?: string
    order?: number
  }>
  // ✅ NEW: Settings Transformation
  /** Transform settings before saving or after loading */
  transform?: {
    /** Transform settings before saving */
    beforeSave?: (settings: Record<string, any>) => Record<string, any>
    /** Transform settings after loading */
    afterLoad?: (settings: Record<string, any>) => Record<string, any>
  }
  // ✅ NEW: Settings Dependencies
  /** Field dependencies (e.g., show field only when another field has specific value) */
  dependencies?: Array<{
    field: string
    dependsOn: string
    condition: 'equals' | 'notEquals' | 'exists' | 'notExists'
    value?: any
  }>
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
  | 'targets' // Generic block type for platform-specific targets (e.g., recipients for email, subreddits for reddit)

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
    /** Minimum number of recipients (for recipients block) */
    minRecipients?: number
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
    /** Rendering strategy: 'schema' (single field), 'composite' (multiple fields), 'custom' (special component) */
    strategy?: 'schema' | 'composite' | 'custom'
    
    /** For 'schema' strategy: Field type for SchemaRenderer */
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
    
    /** For 'composite' strategy: Schema for multiple fields */
    schema?: Record<string, {
      fieldType: FieldType | 'mapping'
      label: string
      description?: string
      source: string // Key in dataEndpoints
      required?: boolean
      default?: any
      /** Conditional visibility: show field only when another field has a specific value */
      visibleWhen?: {
        field: string // Field name to watch
        value: any // Value that triggers visibility
      }
    }>
    /** For 'composite' strategy: Data endpoints for loading options */
    dataEndpoints?: Record<string, string>
    
    /** For 'custom' strategy: Component name */
    component?: string
    /** For 'custom' strategy: Contract version */
    contract?: string
    /** For 'custom' strategy: Endpoints for loading data */
    endpoints?: Record<string, string>
  }
  // ✅ NEW: Helper System
  /** Helper ID for displaying help information */
  helper?: string
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
 * Preview Slot Definition
 * Defines a layout slot where content should be placed
 * Schema defines LAYOUT, not rendering - Renderer handles how to render
 */
export interface PreviewSlot {
  /** Slot identifier (e.g., 'header', 'hero', 'body', 'footer') */
  slot: string
  /** Content field name (from editor blocks) to fill this slot */
  field: string
  /** Display order */
  order?: number
  /** Optional: Field fallback chain (try first field, then fallback to second, etc.) */
  fallback?: string[]
  /** Optional: Conditional rendering (only show if condition is met) */
  condition?: {
    field: string
    operator: 'exists' | 'notEmpty' | 'equals' | 'notEquals'
    value?: any
  }
}

/**
 * Preview schema
 * Defines LAYOUT (slots) and MODES, not rendering details
 * Renderer (platform service) handles actual HTML generation
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
    /** Optional: Client-specific mode (e.g., 'gmail', 'outlook' for email) */
    client?: string
  }>
  /** Layout slots - defines WHERE content goes, not HOW it's rendered */
  slots: PreviewSlot[]
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
  }
  /** Preview styling tokens (resolved by backend based on darkMode) */
  styling?: {
    /** Background color token */
    backgroundColor?: string
    /** Text color token */
    textColor?: string
    /** Font family (concrete value, not token) */
    fontFamily?: string
  }
  /** Legacy: contentMapping (deprecated, use slots instead) */
  contentMapping?: Array<{
    field: string
    renderAs?: string
    label?: string
    className?: string
    show?: boolean
    order?: number
    component?: string
  }>
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
 * Target Schema Definition
 * Defines the structure for platform targets (recipients, subreddits, users, etc.)
 */
export interface TargetSchema {
  /** Base field name (e.g., 'email', 'subreddit', 'username') */
  baseField: string
  /** Base field label */
  baseFieldLabel: string
  /** Base field validation rules */
  baseFieldValidation?: ValidationRule[]
  /** Additional custom fields for personalization */
  customFields?: FieldDefinition[]
  /** Whether targets can be grouped */
  supportsGroups?: boolean
}

/**
 * Target Object Structure
 */
export interface Target {
  /** Unique target identifier */
  id: string
  /** Metadata (optional additional data) */
  metadata?: Record<string, any>
  /** Timestamps */
  createdAt?: string
  updatedAt?: string
  /** Base field value and custom fields (index signature for dynamic properties) */
  [key: string]: any
}

/**
 * Group Object Structure
 * Groups have UUIDs like targets for consistency
 */
export interface Group {
  /** Unique group identifier (UUID) */
  id: string
  /** Group name (display name) */
  name: string
  /** Array of target IDs in this group */
  targetIds: string[]
  /** Timestamps */
  createdAt?: string
  updatedAt?: string
  /** Optional metadata */
  metadata?: Record<string, any>
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
  // ✅ NEW: Target Schema for target management
  /** Target schema for managing platform targets (recipients, subreddits, etc.) */
  targetSchema?: TargetSchema
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

