// Type definitions for the EventPromoter backend

export interface Event {
  id: string
  name: string
  created: string
  uploadedFileRefs: UploadedFile[] // References to uploaded files on server
  selectedHashtags: string[]
  selectedPlatforms: string[]
  platformContent: Record<string, any>
  emailRecipients: string[]
  contentTemplates: any[]
}

export interface EventWorkspace {
  currentEvent: Event
}

export interface PlatformContent {
  text: string
  media?: string[]
  metadata?: Record<string, any>
}

export interface PlatformParser {
  parse(eventData: ParsedEventData): PlatformContent
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
  Events: HistoryEntry[]
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

// New interface for uploaded files (stored on server)
export interface UploadedFile {
  id: string
  name: string
  filename: string
  url: string
  path: string
  size: number
  type: string
  uploadedAt: string
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
