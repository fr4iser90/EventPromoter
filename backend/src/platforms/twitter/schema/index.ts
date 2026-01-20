/**
 * Twitter Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Settings (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * 
 * @module platforms/twitter/schema
 */

import { PlatformSchema } from '../../../types/platformSchema.js'
import { twitterSettingsSchema } from './settings.js'
import { twitterEditorSchema } from './editor.js'
import { twitterPreviewSchema } from './preview.js'
import { twitterPanelSchema } from './panel.js'

/**
 * Complete Twitter Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the twitter platform schema.
 */
export const twitterSchema: PlatformSchema = {
  version: '1.0.0',
  settings: twitterSettingsSchema,
  editor: twitterEditorSchema,
  preview: twitterPreviewSchema,
  panel: twitterPanelSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'Twitter platform schema for self-discovering architecture'
  }
}


