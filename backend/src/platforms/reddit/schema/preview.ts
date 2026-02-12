/**
 * Reddit Platform Preview Schema
 * 
 * Defines how Reddit content should be previewed.
 * 
 * @module platforms/reddit/schema/preview
 */

import { PreviewSchema } from '@/types/schema/index.js'

export const redditPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'platform.reddit.preview.title',
  description: 'platform.reddit.preview.description',
  defaultMode: 'desktop',
  modes: [
    {
      id: 'desktop',
      label: 'platform.reddit.preview.modes.desktop.label',
      description: 'platform.reddit.preview.modes.desktop.description',
      width: 700,
      height: 600
    },
    {
      id: 'mobile',
      label: 'platform.reddit.preview.modes.mobile.label',
      description: 'platform.reddit.preview.modes.mobile.description',
      width: 375,
      height: 500
    }
  ],
  slots: [
    {
      slot: 'title',
      field: 'title',
      order: 1
    },
    {
      slot: 'content',
      field: 'text',
      order: 2
    },
    {
      slot: 'media',
      field: 'image',
      order: 3,
      condition: {
        field: 'image',
        operator: 'exists'
      }
    },
    {
      slot: 'link',
      field: 'link',
      order: 4,
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
    backgroundColor: 'reddit.surface.primary',  // Token - resolved by backend
    textColor: 'reddit.text.primary',            // Token - resolved by backend
    fontFamily: 'IBMPlexSans, Arial, sans-serif' // Concrete value - not resolved
  },
  contentMapping: [
    {
      field: 'title',
      renderAs: 'heading',
      label: 'platform.reddit.preview.mapping.title',
      order: 1
    },
    {
      field: 'subreddit',
      renderAs: 'text',
      label: 'platform.reddit.preview.mapping.subreddit',
      order: 2
    },
    {
      field: 'text',
      renderAs: 'markdown',
      label: 'platform.reddit.preview.mapping.postBody',
      order: 3
    },
    {
      field: 'image',
      renderAs: 'image',
      label: 'Image',
      order: 4
    },
    {
      field: 'link',
      renderAs: 'link',
      label: 'Link',
      order: 5
    }
  ]
}

