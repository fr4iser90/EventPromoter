/**
 * Instagram Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Credentials (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * - Settings (feature panels and account management)
 * 
 * @module platforms/instagram/schema
 */

import { PlatformSchema } from '@/types/schema/index.js'
import { instagramCredentialsSchema } from './credentials.js'
import { instagramEditorSchema } from './editor.js'
import { instagramPreviewSchema } from './preview.js'
import { instagramSettingsSchema } from './settings.js'

/**
 * Complete Instagram Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the instagram platform schema.
 */
export const instagramSchema: PlatformSchema = {
  version: '1.0.0',
  credentials: instagramCredentialsSchema,
  editor: instagramEditorSchema,
  preview: instagramPreviewSchema,
  settings: instagramSettingsSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'Instagram platform schema for self-discovering architecture'
  }
}


