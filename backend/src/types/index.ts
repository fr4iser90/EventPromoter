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

export interface ParsedEventData {
  title?: string
  date?: string
  time?: string
  venue?: string
  city?: string
  description?: string
  price?: string
  organizer?: string
  website?: string
  lineup?: string[] // Array of artists/DJs/bands
  genre?: string // Music genre or event type
  platformContent?: Record<string, any> // Platform-specific content
  rawText: string
  confidence: number
  parsedAt: string
  hash: string // For duplicate detection
}

// Platform Plugin Architecture
export interface PlatformPlugin {
  name: string
  version: string
  displayName: string
  capabilities: PlatformCapability[]
  parser: PlatformParser
  service?: PlatformService
  validator: ContentValidator
  templates?: ContentTemplates
  config?: PlatformConfig
  uiConfig?: UIConfig // Dynamic UI configuration
}

export interface UIConfig {
  panel?: PanelConfig
}

export interface PanelConfig {
  title?: string
  sections: PanelSection[]
}

export interface PanelSection {
  id: string
  title: string
  component: string // Component name from registry
  props: Record<string, any> // Props for the component
}

export interface PlatformCapability {
  type: 'text' | 'image' | 'video' | 'link' | 'hashtag' | 'mention' | 'poll'
  maxLength?: number
  required?: boolean
}

export interface PlatformService {
  // Core service methods (may be optional for different implementations)
  validateContent?(content: any): any
  transformForAPI?(content: any): any
  generateHashtags?(baseTags: string[]): string[]
  getRequirements?(): any
  getOptimizationTips?(content: any): string[]

  // API integration methods (for future use)
  authenticate?(credentials: any): Promise<boolean>
  validateCredentials?(credentials: any): Promise<boolean>
  post?(content: any, credentials: any): Promise<PostResult>
}

export interface ContentValidator {
  validate(content: any): ValidationResult
  getLimits(): ContentLimits
}

export interface ContentTemplates {
  [templateName: string]: any
}

export interface PlatformConfig {
  apiEndpoints: Record<string, string>
  rateLimits: {
    requestsPerHour: number
    requestsPerDay: number
  }
  supportedFormats: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface ContentLimits {
  maxLength: number
  maxImages?: number
  maxVideos?: number
  allowedFormats: string[]
}

// Platform Parser Interface
export interface PlatformParser {
  parse(eventData: ParsedEventData): PlatformContent
}

export interface PostResult {
  success: boolean
  postId?: string
  url?: string
  error?: string
}

export interface HistoryEntry {
  id: string
  name: string
  status: 'draft' | 'published' | 'archived'
  platforms: string[]
  publishedAt?: string
  eventData?: EventData
  files?: UploadedFile[] // Files associated with this event
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

export interface PlatformValidationResult {
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
