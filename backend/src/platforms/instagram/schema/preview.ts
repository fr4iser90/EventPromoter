/**
 * Instagram Platform Preview Schema
 * 
 * Defines how Instagram content should be previewed.
 * 
 * @module platforms/instagram/schema/preview
 */

import { PreviewSchema } from '../../../types/platformSchema.js'

export const instagramPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'Instagram Preview',
  description: 'Preview how your Instagram post will look',
  defaultMode: 'mobile',
  modes: [
    {
      id: 'mobile',
      label: 'Mobile',
      description: 'Mobile Instagram view',
      width: 375,
      height: 375
    },
    {
      id: 'desktop',
      label: 'Desktop',
      description: 'Desktop Instagram view',
      width: 600,
      height: 600
    }
  ],
  options: {
    showMetadata: true,
    showTimestamp: true,
    interactive: false
  },
  styling: {
    backgroundColor: '#ffffff',
    textColor: '#262626',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  contentMapping: [
    {
      field: 'image',
      renderAs: 'image',
      label: 'Image',
      order: 1
    },
    {
      field: 'caption',
      renderAs: 'paragraph',
      label: 'Caption',
      order: 2
    },
    {
      field: 'hashtags',
      renderAs: 'text',
      label: 'Hashtags',
      order: 3,
      show: false // Hashtags are embedded in caption
    }
  ]
}

