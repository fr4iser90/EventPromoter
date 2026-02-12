/**
 * Email Platform Schema
 * 
 * Main schema export that combines all schema parts:
 * - Credentials (SMTP configuration)
 * - Editor (content blocks and features)
 * - Preview (preview modes and content mapping)
 * - Settings (feature panels and recipient management)
 * - Template (template structure and variables)
 * 
 * @module platforms/email/schema
 */

import { PlatformSchema } from '@/types/schema/index.js'
import { emailCredentialsSchema } from './credentials.js'
import { emailEditorSchema } from './editor.js'
import { emailPreviewSchema } from './preview.js'
import { emailTemplateSchema } from './template.js'
import { emailSettingsSchema } from './settings.js'

/**
 * Complete Email Platform Schema
 * 
 * Combines all schema parts into a single PlatformSchema object.
 * This is the main export for the email platform schema.
 */
export const emailSchema: PlatformSchema = {
  version: '1.0.0',
  credentials: emailCredentialsSchema,
  editor: emailEditorSchema,
  preview: emailPreviewSchema,
  settings: emailSettingsSchema,
  template: emailTemplateSchema,
  metadata: {
    lastUpdated: '2026-01-08T10:53:50.000Z',
    author: 'EventPromoter',
    description: 'platform.email.metadata.schemaDescription'
  }
}

