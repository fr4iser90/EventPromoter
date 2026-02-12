/**
 * Twitter Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Credentials (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * - Settings (feature panels and account management)
 * 
 * @module platforms/twitter/schema
 */

import { PlatformSchema } from '@/types/schema/index.js'
import { twitterCredentialsSchema } from './credentials.js'
import { twitterEditorSchema } from './editor.js'
import { twitterPreviewSchema } from './preview.js'
import { twitterSettingsSchema } from './settings.js'

/**
 * Complete Twitter Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the twitter platform schema.
 */
export const twitterSchema: PlatformSchema = {
  version: '1.0.0',
  credentials: twitterCredentialsSchema,
  editor: twitterEditorSchema,
  preview: twitterPreviewSchema,
  settings: twitterSettingsSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'platform.twitter.metadata.schemaDescription'
  }
}


