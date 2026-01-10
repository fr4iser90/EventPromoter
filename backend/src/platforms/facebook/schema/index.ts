/**
 * Facebook Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Settings (API credentials)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * 
 * @module platforms/facebook/schema
 */

import { PlatformSchema } from '../../../types/platformSchema.js'
import { facebookSettingsSchema } from './settings.js'
import { facebookEditorSchema } from './editor.js'
import { facebookPreviewSchema } from './preview.js'

/**
 * Complete Facebook Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the facebook platform schema.
 */
export const facebookSchema: PlatformSchema = {
  version: '1.0.0',
  settings: facebookSettingsSchema,
  editor: facebookEditorSchema,
  preview: facebookPreviewSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:55:43.000Z',
    author: 'EventPromoter',
    description: 'Facebook platform schema for self-discovering architecture'
  }
}


