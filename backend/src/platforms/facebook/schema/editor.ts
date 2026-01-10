/**
 * Facebook Platform Editor Schema
 * 
 * Defines the content editor structure for Facebook posts.
 * 
 * @module platforms/facebook/schema/editor
 */

import { EditorSchema } from '../../../types/platformSchema.js'

export const facebookEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'Facebook Post Editor',
  description: 'Create and edit Facebook posts',
  mode: 'rich',
  blocks: [
    {
      type: 'paragraph',
      id: 'text',
      label: 'Post Content',
      description: 'Your Facebook post content',
      required: true,
      constraints: {
        maxLength: 63206,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Post content is required' }
      ],
      ui: {
        icon: 'text',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'What\'s on your mind?'
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
        maxFileSize: 10485760 // 10MB
      },
      ui: {
        icon: 'image',
        order: 2,
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
        order: 3,
        enabled: true
      }
    },
    {
      type: 'hashtag',
      id: 'hashtags',
      label: 'Hashtags',
      description: 'Add hashtags to your post',
      required: false,
      constraints: {
        maxItems: 30
      },
      ui: {
        icon: 'hashtag',
        order: 4,
        enabled: true
      }
    }
  ],
  features: {
    formatting: true,
    mediaUpload: true,
    linkInsertion: true,
    hashtagSuggestions: true,
    mentionSuggestions: true,
    preview: true,
    wordCount: true,
    characterCount: true
  },
  constraints: {
    maxLength: 63206,
    minLength: 1,
    maxBlocks: 4
  }
}


