import type { SchemaField } from '../schema/types'

export type GenericRecord = Record<string, unknown>

export type UploadedFileRef = {
  id?: string
  name?: string
  filename?: string
  url?: string
  type?: string
  isImage?: boolean
}

export type TargetsConfig = {
  mode?: string
  individual?: string[]
  groups?: string[]
  targetNames?: string[]
  groupNames?: string[]
  templateLocale?: string
  [key: string]: unknown
}

export type AppliedTemplateEntry = {
  id: string
  templateId: string
  templateName?: string
  targets?: TargetsConfig
  specificFiles?: string[]
  appliedAt?: string
}

export type TemplateDefinition = {
  name: string
  canonicalName?: string
  aliases?: string[]
  label?: string
  type?: string
  source?: string
  parsedField?: string
  editable?: boolean
  showWhenEmpty?: boolean
  icon?: string
}

export type PlatformTemplateRecord = {
  id?: string
  name?: string
  template?: Record<string, unknown>
  translations?: Record<string, { name?: string }>
  variableDefinitions?: TemplateDefinition[]
}

export type EditorBlock = {
  id?: string
  type?: string
  label?: string
  description?: string
  rendering?: {
    dataEndpoints?: Record<string, string>
  }
}

export type EditorSchema = {
  blocks?: EditorBlock[]
  constraints?: {
    maxLength?: number
  }
}

export type PlatformConfig = {
  name?: string
  limits?: {
    maxLength?: number
  }
  schema?: {
    editor?: EditorSchema
  }
}

export type ContentState = Record<string, unknown> & {
  _templates?: AppliedTemplateEntry[]
  _templateId?: string
  globalFiles?: Array<string | { id?: string }>
}

export type TemplateDisplayVar = {
  canonicalName: string
  aliases: string[]
  label?: string
  type?: string
  source?: string
  parsedField?: string
  editable?: boolean
  showWhenEmpty?: boolean
  icon?: string
}

export type PlatformData = {
  name?: string
  icon?: string
  color?: string
  metadata?: { displayName?: string; icon?: string; color?: string }
}

export type PreviewItem = {
  html: string
  css?: string
  group?: string
  target?: string
  targets?: string[]
  metadata?: { targets?: string[] }
  templateId?: string
  dimensions?: { width?: number; height?: number }
}

export type PreviewTargetsValue = {
  mode?: string
  individual?: string[]
  groups?: string[]
  templateLocale?: string
}

export type PanelField = SchemaField & {
  name: string
  action?: {
    trigger?: 'change' | 'submit' | 'blur'
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    bodyMapping?: Record<string, string>
    onSuccess?: 'clear' | 'reload'
    reloadOptions?: boolean
  }
}

export type PanelSection = {
  id: string
  title?: string
  description?: string
  fields?: PanelField[]
}

export type PanelConfig = {
  title?: string
  description?: string
  sections?: PanelSection[]
}

export type SettingsGenericValues = Record<string, unknown>
export type SettingsBackendErrors = Record<string, string | string[]>
export type SettingsFieldConfig = {
  name: string
  type?: string
  default?: unknown
  label?: string
  placeholder?: string
}
export type SettingsSectionConfig = {
  id: string
  title?: string
  description?: string
  fields: SettingsFieldConfig[]
}
export type SettingsEditAction = {
  type?: string
  schemaId?: string
  dataEndpoint?: string
  endpoint?: string
  method?: string
  onSuccess?: string
}
export type SettingsPlatformSchema = {
  settings?: {
    sections: SettingsSectionConfig[]
  }
  credentials?: {
    fields: SettingsFieldConfig[]
    groups?: Array<{ id: string; fields: string[] }>
  }
}

export type PlatformMeta = {
  id: string
  name?: string
  icon?: string
  color?: string
  metadata?: { displayName?: string; icon?: string; color?: string }
}

export type PlatformStatus = {
  status?: 'working' | 'partial' | 'not-tested' | 'not-implemented' | 'broken'
  message?: string
}
export type PlatformMetadata = {
  icon?: string
  color?: string
  displayName?: string
}
export type PlatformItem = {
  id: string
  name?: string
  icon?: string
  color?: string
  description?: string
  displayName?: string
  metadata?: PlatformMetadata
  availableModes?: string[]
  publishingModeStatus?: Record<string, PlatformStatus>
}
export type SettingsDialogState = {
  open: boolean
  platform: PlatformItem | null
}

export type HashtagSelectorProps = {
  value?: string[]
  onChange: (hashtags: string[]) => void
  maxHashtags?: number
}

export type FileSelectionFileRef = {
  id: string
  filename: string
  type: string
}
export type FileSelectionBlockProps = {
  block: {
    id: string
    label?: string
    description?: string
    settings?: {
      enableToggle?: { label: string; default: boolean }
      selectionLimit?: { max: number; message: string }
      fileFilter?: { allowedMimeTypes: string[]; allowedExtensions: string[]; noFilesMessage: string }
    }
  }
  content: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  uploadedFileRefs: FileSelectionFileRef[]
}

export type PlatformSchemaState<T = unknown> = {
  schema: T | null
  loading: boolean
  error: string | null
}

export type PlatformTranslationErrorMap = Record<string, string>

export type PlatformMetadataState<T = unknown> = {
  platform: T | null
  loading: boolean
  error: string | null
}

export type PlatformsState<T = unknown> = {
  platforms: T[]
  loading: boolean
  error: string | null
}

export type PlatformTranslationsState = {
  loading: boolean
  error: string | null
  loaded: boolean
}

export type MultiplePlatformTranslationsState = {
  loading: boolean
  errors: PlatformTranslationErrorMap
  loaded: string[]
}
