/**
 * Facebook Platform Preview Schema
 * 
 * Defines how Facebook content should be previewed.
 * 
 * @module platforms/facebook/schema/preview
 */

import { PreviewSchema } from '@/types/schema/index.js'

export const facebookPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'Facebook Preview',
  description: 'Preview how your Facebook post will look',
  defaultMode: 'desktop',
  modes: [
    {
      id: 'desktop',
      label: 'Desktop',
      description: 'Desktop Facebook view',
      width: 500,
      height: 600
    },
    {
      id: 'mobile',
      label: 'Mobile',
      description: 'Mobile Facebook view',
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
    backgroundColor: 'facebook.surface.primary',  // Token - resolved by backend
    textColor: 'facebook.text.primary',            // Token - resolved by backend
    fontFamily: 'Helvetica, Arial, sans-serif'     // Concrete value - not resolved
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

