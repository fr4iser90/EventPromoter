/**
 * Email Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Settings (SMTP configuration)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * - Panel (feature panels and recipient management)
 * - Template (template structure and variables)
 * 
 * @module platforms/email/schema
 */

import { PlatformSchema } from '@/types/schema'
import { emailSettingsSchema } from './settings'
import { emailEditorSchema } from './editor'
import { emailPreviewSchema } from './preview'
import { emailTemplateSchema } from './template'
import { emailPanelSchema } from './panel'

/**
 * Complete Email Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the email platform schema.
 */
export const emailSchema: PlatformSchema = {
  version: '1.0.0',
  settings: emailSettingsSchema,
  editor: emailEditorSchema,
  preview: emailPreviewSchema,
  panel: emailPanelSchema,
  template: emailTemplateSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:53:50.000Z',
    author: 'EventPromoter',
    description: 'Email platform schema for self-discovering architecture'
  }
}

