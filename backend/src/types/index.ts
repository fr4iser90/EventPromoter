// Type definitions for the EventPromoter backend

export interface Project {
  id: string
  name: string
  created: string
  uploadedFiles: FileData[]
  selectedHashtags: string[]
  selectedPlatforms: string[]
  platformContent: Record<string, any>
  emailRecipients: string[]
  contentTemplates: any[]
}

export interface Workspace {
  currentProject: Project
}

export interface HistoryEntry {
  id: string
  name: string
  status: 'draft' | 'published' | 'archived'
  platforms: string[]
  publishedAt?: string
  eventData?: EventData
  stats?: Record<string, any>
}

export interface History {
  projects: HistoryEntry[]
}

export interface EventData {
  title?: string
  date?: string
  time?: string
  venue?: string
  city?: string
}

export interface FileData {
  name: string
  type: string
  size: number
  base64: string
  isImage: boolean
}

export interface EmailConfig {
  recipients: string[]
  groups: Record<string, string[]>
}

export interface AppConfig {
  n8nWebhookUrl: string
  darkMode: boolean
  lastUpdated: string
}

export interface ValidationResult {
  isValid: boolean
  results?: PlatformValidation[]
  errors?: string[]
}

export interface PlatformValidation {
  platform: string
  valid: boolean
  errors?: string[]
  supports?: string[]
}
