export type Primitive = string | number | boolean | null | undefined
export type FieldValue = Primitive | Primitive[]

export type FieldAction = {
  schemaId?: string
  dataEndpoint?: string
  saveEndpoint?: string
  method?: string
}

export type TableColumn = {
  id: string
  label?: string
  width?: string | number
  clickable?: boolean
  action?: FieldAction
}

export type SchemaField = {
  id?: string
  name?: string
  type?: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  default?: Primitive | Primitive[] | Record<string, Primitive>
  readOnly?: boolean
  validation?: Array<{
    type: string
    value?: number | string
    message?: string
    validator?: (value: unknown) => boolean | string
  }>
  options?: Array<{ value: Primitive; label: string; disabled?: boolean }>
  optionsSource?: {
    endpoint: string
    responsePath: string
  }
  ui?: {
    disabled?: boolean
    hidden?: boolean
    order?: number
    width?: number
    isFilterFor?: string
    renderAsTable?: boolean
    tableColumns?: TableColumn[]
  }
  helper?: string
  source?: string
  visibleWhen?: {
    field: string
    value: Primitive
  }
  action?: string
}

export type DataRow = {
  id?: string
  name?: string
  [key: string]: FieldValue
}

export type GroupListProps = {
  data?: { groups?: DataRow[] | Record<string, DataRow> } | null
  platformId?: string
  title?: string
  description?: string
  fields: SchemaField[]
  onUpdate?: () => void
}

export type TargetListProps = {
  field: SchemaField & { name: string }
  platformId?: string
  onUpdate?: () => void
  allFields?: Array<SchemaField & { name: string }>
  values?: Record<string, string>
}

export type FieldGroup = {
  id: string
  title?: string
  description?: string
  fields: string[]
  method?: 'api' | 'playwright' | 'n8n' | 'custom' | string
}

export type SchemaValues = Record<string, unknown>
export type SchemaErrors = Record<string, string | null | undefined>
