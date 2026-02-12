/**
 * Twitter Platform Editor Schema
 * 
 * Defines the content editor structure for Twitter posts.
 * 
 * @module platforms/twitter/schema/editor
 */

import { EditorSchema } from '@/types/schema/index.js'

export const twitterEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'platform.twitter.editor.title',
  description: 'platform.twitter.editor.description',
  mode: 'simple',
  blocks: [
    {
      type: 'text',
      id: 'text',
      label: 'platform.twitter.editor.text.label',
      description: 'platform.twitter.editor.text.description',
      required: true,
      constraints: {
        maxLength: 280,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'platform.twitter.editor.text.required' },
        { type: 'maxLength', value: 280, message: 'platform.twitter.editor.text.maxLength' }
      ],
      ui: {
        icon: 'text',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'platform.twitter.editor.text.placeholder'
      }
    },
    {
      type: 'image',
      id: 'image',
      label: 'platform.twitter.editor.image.label',
      description: 'platform.twitter.editor.image.description',
      required: false,
      constraints: {
        maxItems: 1,
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5242880 // 5MB
      },
      ui: {
        icon: 'image',
        order: 2,
        enabled: true
      }
    },
    {
      type: 'hashtag',
      id: 'hashtags',
      label: 'platform.twitter.editor.hashtags.label',
      description: 'platform.twitter.editor.hashtags.description',
      required: false,
      constraints: {
        maxItems: 10
      },
      ui: {
        icon: 'hashtag',
        order: 3,
        enabled: true
      }
    },
    {
      type: 'mention',
      id: 'mentions',
      label: 'platform.twitter.editor.mentions.label',
      description: 'platform.twitter.editor.mentions.description',
      required: false,
      constraints: {
        maxItems: 10
      },
      ui: {
        icon: 'mention',
        order: 4,
        enabled: true
      }
    }
  ],
  features: {
    formatting: false,
    mediaUpload: true,
    linkInsertion: true,
    hashtagSuggestions: true,
    mentionSuggestions: true,
    preview: true,
    wordCount: true,
    characterCount: true
  },
  constraints: {
    maxLength: 280,
    minLength: 1,
    maxBlocks: 4
  }
}


