/**
 * LinkedIn Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Credentials (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * - Settings (feature panels and account management)
 * 
 * @module platforms/linkedin/schema
 */

import { PlatformSchema } from '@/types/schema'
import { linkedinCredentialsSchema } from './credentials'
import { linkedinEditorSchema } from './editor'
import { linkedinPreviewSchema } from './preview'
import { linkedinSettingsSchema } from './settings'

/**
 * Complete LinkedIn Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the linkedin platform schema.
 */
export const linkedinSchema: PlatformSchema = {
  version: '1.0.0',
  credentials: linkedinCredentialsSchema,
  editor: linkedinEditorSchema,
  preview: linkedinPreviewSchema,
  settings: linkedinSettingsSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'LinkedIn platform schema for self-discovering architecture'
  }
}


