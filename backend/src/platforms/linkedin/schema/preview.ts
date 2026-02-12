/**
 * LinkedIn Platform Preview Schema
 * 
 * Defines how LinkedIn content should be previewed.
 * 
 * @module platforms/linkedin/schema/preview
 */

import { PreviewSchema } from '@/types/schema/index.js'

export const linkedinPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'platform.linkedin.preview.title',
  description: 'platform.linkedin.preview.description',
  defaultMode: 'desktop',
  modes: [
    {
      id: 'desktop',
      label: 'platform.linkedin.preview.modes.desktop.label',
      description: 'platform.linkedin.preview.modes.desktop.description',
      width: 700,
      height: 600
    },
    {
      id: 'mobile',
      label: 'platform.linkedin.preview.modes.mobile.label',
      description: 'platform.linkedin.preview.modes.mobile.description',
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
      label: 'platform.linkedin.preview.mapping.postContent',
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

