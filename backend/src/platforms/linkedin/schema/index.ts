/**
 * LinkedIn Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Settings (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * 
 * @module platforms/linkedin/schema
 */

import { PlatformSchema } from '@/types/schema'
import { linkedinSettingsSchema } from './settings'
import { linkedinEditorSchema } from './editor'
import { linkedinPreviewSchema } from './preview'
import { linkedinPanelSchema } from './panel'

/**
 * Complete LinkedIn Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the linkedin platform schema.
 */
export const linkedinSchema: PlatformSchema = {
  version: '1.0.0',
  settings: linkedinSettingsSchema,
  editor: linkedinEditorSchema,
  preview: linkedinPreviewSchema,
  panel: linkedinPanelSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'LinkedIn platform schema for self-discovering architecture'
  }
}


