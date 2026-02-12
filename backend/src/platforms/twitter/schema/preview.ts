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
  title: 'platform.twitter.preview.title',
  description: 'platform.twitter.preview.description',
  defaultMode: 'mobile',
  modes: [
    {
      id: 'mobile',
      label: 'platform.twitter.preview.modes.mobile.label',
      description: 'platform.twitter.preview.modes.mobile.description',
      width: 375,
      height: 667
    },
    {
      id: 'desktop',
      label: 'platform.twitter.preview.modes.desktop.label',
      description: 'platform.twitter.preview.modes.desktop.description',
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
      label: 'platform.twitter.preview.mapping.tweetText',
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

