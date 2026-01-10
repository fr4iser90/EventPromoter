/**
 * Email Platform Preview Schema
 * 
 * Preview configuration for the Email platform (modes, content mapping, styling)
 * 
 * @module platforms/email/schema/preview
 */

import { PreviewSchema } from '../../../types/platformSchema.js'

export const emailPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'Email Preview',
  description: 'Preview how your email will look',
  defaultMode: 'desktop',
  modes: [
    {
      id: 'desktop',
      label: 'Desktop',
      description: 'Desktop email client view',
      width: 600,
      height: 800
    },
    {
      id: 'mobile',
      label: 'Mobile',
      description: 'Mobile email client view',
      width: 320,
      height: 568
    }
  ],
  // ✅ Content mapping for schema-driven preview
  contentMapping: [
    {
      field: 'subject',
      renderAs: 'heading',
      label: 'Subject',
      order: 1
    },
    {
      field: 'body',
      renderAs: 'html',
      label: 'Body',
      order: 2
    },
    {
      field: 'images',
      renderAs: 'image',
      label: 'Images',
      order: 3,
      show: false // Hide in preview, images are embedded in HTML
    },
    {
      field: 'links',
      renderAs: 'link',
      label: 'Links',
      order: 4,
      show: false // Hide in preview, links are embedded in HTML
    }
  ],
  options: {
    showMetadata: true,
    showTimestamp: true,
    interactive: false
  },
  styling: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'Arial, sans-serif'
  }
}

