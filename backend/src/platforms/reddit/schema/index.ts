/**
 * Reddit Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Credentials (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * - Settings (feature panels and account management)
 * 
 * @module platforms/reddit/schema
 */

import { PlatformSchema } from '@/types/schema/index.js'
import { redditCredentialsSchema } from './credentials.js'
import { redditEditorSchema } from './editor.js'
import { redditPreviewSchema } from './preview.js'
import { redditSettingsSchema } from './settings.js'

/**
 * Complete Reddit Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the reddit platform schema.
 */
export const redditSchema: PlatformSchema = {
  version: '1.0.0',
  credentials: redditCredentialsSchema,
  editor: redditEditorSchema,
  preview: redditPreviewSchema,
  settings: redditSettingsSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'platform.reddit.metadata.schemaDescription'
  }
}


