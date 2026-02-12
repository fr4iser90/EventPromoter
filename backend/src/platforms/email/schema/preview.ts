/**
 * Email Platform Preview Schema
 * 
 * Preview configuration for the Email platform (modes, content mapping, styling)
 * 
 * @module platforms/email/schema/preview
 */

import { PreviewSchema } from '@/types/schema/index.js'

export const emailPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'platform.email.preview.title',
  description: 'platform.email.preview.description',
  defaultMode: 'desktop',
  modes: [
    {
      id: 'desktop',
      label: 'platform.email.preview.modes.desktop.label',
      description: 'platform.email.preview.modes.desktop.description',
      width: 600,
      height: 800
    },
    {
      id: 'mobile',
      label: 'platform.email.preview.modes.mobile.label',
      description: 'platform.email.preview.modes.mobile.description',
      width: 320,
      height: 568
    }
  ],
  // ✅ LAYOUT SLOTS: Defines WHERE content goes, not HOW it's rendered
  // Renderer (EmailService.renderPreview) handles actual HTML generation
  slots: [
    {
      slot: 'header',
      field: 'subject',
      order: 1
    },
    {
      slot: 'hero',
      field: 'headerImage',
      order: 2,
      condition: {
        field: 'headerImage',
        operator: 'exists'
      }
    },
    {
      slot: 'body',
      field: 'body',
      order: 3,
      fallback: ['bodyText'] // Try body first, fallback to bodyText (structured fields)
    },
    {
      slot: 'footer',
      field: 'footerText',
      order: 4,
      condition: {
        field: 'footerText',
        operator: 'notEmpty'
      }
    }
  ],
  options: {
    showMetadata: true,
    showTimestamp: true,
    interactive: false
  },
  styling: {
    backgroundColor: 'email.surface.primary',  // Token - resolved by backend
    textColor: 'email.text.primary',            // Token - resolved by backend
    fontFamily: 'Arial, sans-serif'             // Concrete value - not resolved
  }
}

