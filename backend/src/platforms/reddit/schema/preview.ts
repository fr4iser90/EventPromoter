/**
 * Reddit Platform Preview Schema
 * 
 * Defines how Reddit content should be previewed.
 * 
 * @module platforms/reddit/schema/preview
 */

import { PreviewSchema } from '../../../types/platformSchema.js'

export const redditPreviewSchema: PreviewSchema = {
  version: '1.0.0',
  title: 'Reddit Preview',
  description: 'Preview how your Reddit post will look',
  defaultMode: 'desktop',
  modes: [
    {
      id: 'desktop',
      label: 'Desktop',
      description: 'Desktop Reddit view',
      width: 700,
      height: 600
    },
    {
      id: 'mobile',
      label: 'Mobile',
      description: 'Mobile Reddit view',
      width: 375,
      height: 500
    }
  ],
  options: {
    showMetadata: true,
    showTimestamp: true,
    interactive: false
  },
  styling: {
    backgroundColor: '#ffffff',
    textColor: '#1a1a1b',
    fontFamily: 'IBMPlexSans, Arial, sans-serif'
  },
  contentMapping: [
    {
      field: 'title',
      renderAs: 'heading',
      label: 'Title',
      order: 1
    },
    {
      field: 'subreddit',
      renderAs: 'text',
      label: 'Subreddit',
      order: 2
    },
    {
      field: 'text',
      renderAs: 'paragraph',
      label: 'Post Body',
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

