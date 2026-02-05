/**
 * Facebook Platform Editor Schema
 * 
 * Defines the content editor structure for Facebook posts.
 * 
 * @module platforms/facebook/schema/editor
 */

import { EditorSchema } from '@/types/schema'

export const facebookEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'facebook:editor.title',
  description: 'facebook:editor.description',
  mode: 'rich',
  blocks: [
    {
      type: 'paragraph',
      id: 'text',
      label: 'facebook:editor.text.label',
      description: 'facebook:editor.text.description',
      required: true,
      constraints: {
        maxLength: 63206,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'facebook:editor.text.required' }
      ],
      ui: {
        icon: 'text',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'facebook:editor.text.placeholder'
      }
    },
    {
      type: 'image',
      id: 'image',
      label: 'facebook:editor.image.label',
      description: 'facebook:editor.image.description',
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
      label: 'facebook:editor.link.label',
      description: 'facebook:editor.link.description',
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
      label: 'facebook:editor.hashtags.label',
      description: 'facebook:editor.hashtags.description',
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


