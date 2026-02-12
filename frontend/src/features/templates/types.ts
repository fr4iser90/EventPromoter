import type { ReactNode } from 'react'
import type { Template } from '@eventpromoter/types'
import type { SchemaValues } from '../schema/types'

export type TemplateVariable = {
  name: string
  label?: string
  description?: string
}

export type TemplateRecord = {
  id: string
  name: string
  description?: string
  category?: string
  isDefault?: boolean
  platform?: string
  template?: Record<string, string>
  translations?: Record<string, Record<string, string>>
  variables?: string[]
  variableDefinitions?: TemplateVariableDefinition[]
}

export type TemplateVariableDefinition = {
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

export type TemplateSelectorFileRef = {
  id: string
  filename?: string
  name?: string
  type?: string
  visibility?: string
}

export type TargetsSelection = SchemaValues & {
  mode?: string
  individual?: string[]
  groups?: string[]
  templateLocale?: string
}

export type TemplateListProps = {
  platform: string
  searchQuery?: string
  selectedCategory?: string
  selectedTemplate?: TemplateRecord | null
  onSelectTemplate?: (template: TemplateRecord) => void
  onEditTemplate?: (template: TemplateRecord) => void
}

export type TemplatePreviewProps = {
  template: TemplateRecord | null
  platform: string
  onEdit?: () => void
}

export type TemplatePreviewPlatformSchema = {
  template?: {
    variables?: TemplateVariable[]
  }
}

export type TemplateSchemaField = {
  type?: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  default?: string
}

export type TemplateSchema = {
  defaultStructure?: Record<string, TemplateSchemaField>
  variables?: TemplateVariable[]
}

export type TemplateEditorPlatformSchema = {
  template?: TemplateSchema
}

export type TemplateChoice = {
  id?: string
  templateId?: string
  name?: string
  templateName?: string
}

export type PlatformTemplateInfo = {
  platformId: string
  hasTemplate: boolean
  templateId?: string
  templateName?: string
  availableTemplates?: TemplateChoice[]
}

export type ApplyResultEntry = {
  platformId: string
  reason?: string
  templateName?: string
  error?: string
}

export type ApplyResults = {
  applied: ApplyResultEntry[]
  skipped: ApplyResultEntry[]
  errors: ApplyResultEntry[]
}

export type VisualBuilderBlockData = {
  value?: string
  [key: string]: unknown
}

export type TemplateBlock = {
  id: string
  fieldName: string
  fieldType: string
  position: number
  data: {
    value: string
    [key: string]: unknown
  }
}

export type TemplateFieldSchema = {
  type?: string
  label?: string
  description?: string
  placeholder?: string
  default?: string
}

export type BuilderSchema = {
  template?: {
    defaultStructure?: Record<string, { type?: string; default?: string }>
    variables?: TemplateVariable[]
  }
}

export type BuilderTemplate = {
  template?: Record<string, unknown>
}

export type LivePreviewBlock = {
  id: string
  fieldName: string
  position: number
  data: { value: string }
}

export type LivePreviewSchema = {
  template?: {
    defaultStructure?: Record<string, { type?: string }>
  }
}

export type BlockRendererBlock = {
  id: string
  data: VisualBuilderBlockData
  [key: string]: unknown
}

export type SortableBlockItemProps = {
  block: BlockRendererBlock
  fieldSchema: TemplateFieldSchema
  schema: unknown
  isSelected: boolean
  onSelect: () => void
  onUpdate: (data: Record<string, unknown>) => void
  onInsertVariable: (variable: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export type RichTextBlockProps = {
  block: { id: string; data: { value?: string; [key: string]: unknown } }
  fieldSchema: TemplateFieldSchema
  isSelected: boolean
  onUpdate: (data: Record<string, unknown>) => void
  onInsertVariable: (variable: string) => void
}

export type DraggableBlockItemProps = {
  fieldName: string
  fieldSchema: TemplateFieldSchema
  icon: ReactNode
}

export type ConverterSchemaField = { type?: string; default?: string }
export type ConverterSchemaTemplate = { template?: { defaultStructure?: Record<string, ConverterSchemaField> } }
export type ConverterBlock = {
  id: string
  fieldName: string
  fieldType?: string
  position: number
  data: { value: string }
}

export type DragBlock = { id: string; position?: number; [key: string]: unknown }

export type TemplateMode = 'preview' | 'export' | 'raw'
export type ApiErrorResponse = { error?: string }
export type TemplateMutationResult = { success: true; template?: Template } | { success: false; error: string }
export type DeleteTemplateResult = { success: true } | { success: false; error: string }
