/**
 * LinkedIn Platform Preview Schema
 * 
 * Defines how LinkedIn content should be previewed.
 * 
 * @module platforms/linkedin/schema/preview
 */

import { PreviewSchema } from '../../../types/platformSchema.js'

export const linkedinPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'LinkedIn Preview',
  description: 'Preview how your LinkedIn post will look',
  defaultMode: 'desktop',
  modes: [
    {
      id: 'desktop',
      label: 'Desktop',
      description: 'Desktop LinkedIn view',
      width: 700,
      height: 600
    },
    {
      id: 'mobile',
      label: 'Mobile',
      description: 'Mobile LinkedIn view',
      width: 375,
      height: 500
    }
  ],
  slots: [
    {
      slot: 'content',
      field: 'text',
      order: 1
    },
    {
      slot: 'media',
      field: 'image',
      order: 2,
      condition: {
        field: 'image',
        operator: 'exists'
      }
    },
    {
      slot: 'link',
      field: 'link',
      order: 3,
      condition: {
        field: 'link',
        operator: 'exists'
      }
    }
  ],
  options: {
    showMetadata: true,
    showTimestamp: true,
    interactive: false
  },
  styling: {
    backgroundColor: 'linkedin.surface.primary',  // Token - resolved by backend
    textColor: 'linkedin.text.primary',          // Token - resolved by backend
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' // Concrete value - not resolved
  },
  contentMapping: [
    {
      field: 'text',
      renderAs: 'paragraph',
      label: 'Post Content',
      order: 1
    },
    {
      field: 'image',
      renderAs: 'image',
      label: 'Image',
      order: 2
    },
    {
      field: 'link',
      renderAs: 'link',
      label: 'Link',
      order: 3
    },
    {
      field: 'hashtags',
      renderAs: 'text',
      label: 'Hashtags',
      order: 4,
      show: false // Hashtags are embedded in text
    }
  ]
}

