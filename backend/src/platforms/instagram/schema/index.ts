/**
 * Instagram Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Settings (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * 
 * @module platforms/instagram/schema
 */

import { PlatformSchema } from '../../../types/platformSchema.js'
import { instagramSettingsSchema } from './settings.js'
import { instagramEditorSchema } from './editor.js'
import { instagramPreviewSchema } from './preview.js'
import { instagramPanelSchema } from './panel.js'

/**
 * Complete Instagram Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the instagram platform schema.
 */
export const instagramSchema: PlatformSchema = {
  version: '1.0.0',
  settings: instagramSettingsSchema,
  editor: instagramEditorSchema,
  preview: instagramPreviewSchema,
  panel: instagramPanelSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'Instagram platform schema for self-discovering architecture'
  }
}


