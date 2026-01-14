/**
 * Reddit Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Settings (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * 
 * @module platforms/reddit/schema
 */

import { PlatformSchema } from '../../../types/platformSchema.js'
import { redditSettingsSchema } from './settings.js'
import { redditEditorSchema } from './editor.js'
import { redditPreviewSchema } from './preview.js'
import { redditPanelSchema } from './panel.js'

/**
 * Complete Reddit Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the reddit platform schema.
 */
export const redditSchema: PlatformSchema = {
  version: '1.0.0',
  settings: redditSettingsSchema,
  editor: redditEditorSchema,
  preview: redditPreviewSchema,
  panel: redditPanelSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'Reddit platform schema for self-discovering architecture'
  }
}


