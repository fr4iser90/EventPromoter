/**
 * Reddit Platform Editor Schema
 * 
 * Defines the content editor structure for Reddit posts.
 * 
 * @module platforms/reddit/schema/editor
 */

import { EditorSchema } from '../../../types/platformSchema.js'

export const redditEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'Reddit Post Editor',
  description: 'Create and edit Reddit posts',
  mode: 'simple',
  blocks: [
    {
      type: 'heading',
      id: 'title',
      label: 'Post Title',
      description: 'Post title (max 300 characters)',
      required: true,
      constraints: {
        maxLength: 300,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Title is required' },
        { type: 'maxLength', value: 300, message: 'Title must be at most 300 characters' }
      ],
      ui: {
        icon: 'title',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'text',
        placeholder: 'Post title...'
      }
    },
    {
      type: 'text',
      id: 'subreddit',
      label: 'Subreddit',
      description: 'Target subreddit (e.g., r/technology)',
      required: true,
      constraints: {
        maxLength: 50,
        minLength: 3
      },
      validation: [
        { type: 'required', message: 'Subreddit is required' },
        { type: 'pattern', value: '^r/[a-zA-Z0-9_]+$', message: 'Invalid subreddit format (use r/subreddit)' }
      ],
      ui: {
        icon: 'subreddit',
        order: 2,
        enabled: true
      },
      rendering: {
        fieldType: 'text',
        placeholder: 'r/subreddit'
      }
    },
    {
      type: 'paragraph',
      id: 'text',
      label: 'Post Body',
      description: 'Post content (max 40000 characters)',
      required: true,
      constraints: {
        maxLength: 40000,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Post body is required' }
      ],
      ui: {
        icon: 'text',
        order: 3,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'Post content...'
      }
    },
    {
      type: 'image',
      id: 'image',
      label: 'Image',
      description: 'Optional image attachment',
      required: false,
      constraints: {
        maxItems: 1,
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 20971520 // 20MB
      },
      ui: {
        icon: 'image',
        order: 4,
        enabled: true
      }
    },
    {
      type: 'link',
      id: 'link',
      label: 'Link',
      description: 'Optional link to share',
      required: false,
      constraints: {
        maxItems: 1
      },
      ui: {
        icon: 'link',
        order: 5,
        enabled: true
      }
    }
  ],
  features: {
    formatting: true,
    mediaUpload: true,
    linkInsertion: true,
    hashtagSuggestions: false,
    mentionSuggestions: false,
    preview: true,
    wordCount: true,
    characterCount: true
  },
  constraints: {
    maxLength: 40000,
    minLength: 1,
    maxBlocks: 5
  }
}


