/**
 * LinkedIn Platform Editor Schema
 * 
 * Defines the content editor structure for LinkedIn posts.
 * 
 * @module platforms/linkedin/schema/editor
 */

import { EditorSchema } from '../../../types/platformSchema.js'

export const linkedinEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'LinkedIn Post Editor',
  description: 'Create and edit LinkedIn posts',
  mode: 'rich',
  blocks: [
    {
      type: 'paragraph',
      id: 'text',
      label: 'Post Content',
      description: 'Your LinkedIn post content (max 3000 characters)',
      required: true,
      constraints: {
        maxLength: 3000,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Post content is required' },
        { type: 'maxLength', value: 3000, message: 'Post must be at most 3000 characters' }
      ],
      ui: {
        icon: 'text',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'Share professional insights...'
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
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
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
        maxItems: 5
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
    mentionSuggestions: false,
    preview: true,
    wordCount: true,
    characterCount: true
  },
  constraints: {
    maxLength: 3000,
    minLength: 1,
    maxBlocks: 4
  }
}


