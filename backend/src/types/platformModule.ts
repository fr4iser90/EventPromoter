/**
 * PlatformModule Interface
 * 
 * Enhanced interface for self-discovering platform architecture.
 * Extends the existing PlatformPlugin with schema-driven capabilities.
 * 
 * @module types/platformModule
 */

import { PlatformPlugin, PlatformParser, PlatformService, ContentValidator, ContentTemplates, PlatformConfig } from './index.js'
import { PlatformSchema } from './platformSchema.js'

/**
 * Platform metadata information
 */
export interface PlatformMetadata {
  /** Unique platform identifier */
  id: string
  /** Human-readable display name */
  displayName: string
  /** Platform version */
  version: string
  /** Platform category */
  category?: string
  /** Platform icon identifier or URL */
  icon?: string
  /** Platform brand color (hex code) */
  color?: string
  /** Platform description */
  description?: string
  /** Author information */
  author?: string
  /** License information */
  license?: string
}

/**
 * Platform capabilities flags
 */
export interface PlatformCapabilities {
  /** Supports text content */
  supportsText: boolean
  /** Supports image content */
  supportsImages: boolean
  /** Supports video content */
  supportsVideo: boolean
  /** Supports links */
  supportsLinks: boolean
  /** Supports hashtags */
  supportsHashtags: boolean
  /** Supports mentions */
  supportsMentions: boolean
  /** Supports polls */
  supportsPolls: boolean
  /** Supports scheduling */
  supportsScheduling: boolean
  /** Requires authentication */
  requiresAuth: boolean
}

/**
 * Platform route definitions (optional)
 * Allows platforms to define custom API routes
 */
export interface PlatformRoutes {
  /** Custom route path (e.g., '/api/platforms/:id/custom') */
  path: string
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** Route handler function */
  handler: (req: any, res: any) => Promise<any> | any
  /** Route middleware (optional) */
  middleware?: Array<(req: any, res: any, next: any) => void>
}

/**
 * PlatformModule Interface
 * 
 * Complete platform module definition with schema-driven architecture.
 * Combines metadata, schema, capabilities, and service implementation.
 */
export interface PlatformModule {
  /** Platform metadata */
  metadata: PlatformMetadata
  
  /** Platform schema definitions */
  schema: PlatformSchema
  
  /** Platform capabilities flags */
  capabilities: PlatformCapabilities
  
  /** Core platform service implementation */
  service: PlatformService
  
  /** Platform parser for content transformation */
  parser: PlatformParser
  
  /** Content validator */
  validator: ContentValidator
  
  /** Optional content templates */
  templates?: ContentTemplates
  
  /** Optional platform configuration */
  config?: PlatformConfig
  
  /** Optional custom route definitions */
  routes?: PlatformRoutes[]
  
  /** Optional translation keys (for i18n) */
  translations?: Record<string, Record<string, string>>
  
  /** Optional UI configuration (for backward compatibility) */
  uiConfig?: PlatformPlugin['uiConfig']
}

/**
 * Platform manifest structure
 * Used for platform discovery and validation
 */
export interface PlatformManifest {
  /** Platform metadata */
  metadata: PlatformMetadata
  /** Schema version */
  schemaVersion: string
  /** Platform entry point */
  entryPoint?: string
  /** Dependencies (if any) */
  dependencies?: string[]
}

/**
 * Type guard to check if an object is a valid PlatformModule
 */
export function isPlatformModule(obj: any): obj is PlatformModule {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.metadata &&
    typeof obj.metadata.id === 'string' &&
    typeof obj.metadata.displayName === 'string' &&
    typeof obj.metadata.version === 'string' &&
    obj.schema &&
    obj.capabilities &&
    obj.service &&
    obj.parser &&
    obj.validator
  )
}

/**
 * Helper to convert legacy PlatformPlugin to PlatformModule
 * Maintains backward compatibility during migration
 */
export function convertPlatformPluginToModule(
  plugin: PlatformPlugin,
  schema: PlatformSchema,
  metadata: Partial<PlatformMetadata> = {}
): PlatformModule {
  return {
    metadata: {
      id: plugin.name,
      displayName: plugin.displayName,
      version: plugin.version,
      category: metadata.category,
      icon: metadata.icon,
      color: metadata.color,
      description: metadata.description,
      author: metadata.author,
      license: metadata.license
    },
    schema,
    capabilities: {
      supportsText: plugin.capabilities.some(c => c.type === 'text'),
      supportsImages: plugin.capabilities.some(c => c.type === 'image'),
      supportsVideo: plugin.capabilities.some(c => c.type === 'video'),
      supportsLinks: plugin.capabilities.some(c => c.type === 'link'),
      supportsHashtags: plugin.capabilities.some(c => c.type === 'hashtag'),
      supportsMentions: plugin.capabilities.some(c => c.type === 'mention'),
      supportsPolls: plugin.capabilities.some(c => c.type === 'poll'),
      supportsScheduling: false, // Default, can be overridden
      requiresAuth: !!plugin.service?.authenticate
    },
    service: plugin.service || {} as PlatformService,
    parser: plugin.parser,
    validator: plugin.validator,
    templates: plugin.templates,
    config: plugin.config,
    // Preserve uiConfig for backward compatibility
    uiConfig: plugin.uiConfig
  }
}

