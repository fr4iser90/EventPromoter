/**
 * Twitter Platform Preview Schema
 * 
 * Defines how Twitter content should be previewed.
 * 
 * @module platforms/twitter/schema/preview
 */

import { PreviewSchema } from '@/types/schema/index.js'

export const twitterPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'Twitter Preview',
  description: 'Preview how your tweet will look',
  defaultMode: 'mobile',
  modes: [
    {
      id: 'mobile',
      label: 'Mobile',
      description: 'Mobile Twitter view',
      width: 375,
      height: 667
    },
    {
      id: 'desktop',
      label: 'Desktop',
      description: 'Desktop Twitter view',
      width: 600,
      height: 400
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
    }
  ],
  options: {
    showMetadata: true,
    showTimestamp: true,
    interactive: false
  },
  styling: {
    backgroundColor: 'twitter.surface.primary',  // Token - resolved by backend
    textColor: 'twitter.text.primary',           // Token - resolved by backend
    fontFamily: 'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' // Concrete value - not resolved
  },
  contentMapping: [
    {
      field: 'text',
      renderAs: 'paragraph',
      label: 'Tweet Text',
      order: 1
    },
    {
      field: 'image',
      renderAs: 'image',
      label: 'Image',
      order: 2
    },
    {
      field: 'hashtags',
      renderAs: 'text',
      label: 'Hashtags',
      order: 3,
      show: false // Hashtags are embedded in text
    },
    {
      field: 'mentions',
      renderAs: 'text',
      label: 'Mentions',
      order: 4,
      show: false // Mentions are embedded in text
    }
  ]
}

