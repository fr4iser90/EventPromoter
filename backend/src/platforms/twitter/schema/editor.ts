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
  title: 'Twitter Post Editor',
  description: 'Create and edit Twitter posts',
  mode: 'simple',
  blocks: [
    {
      type: 'text',
      id: 'text',
      label: 'Tweet Text',
      description: 'Your tweet content (max 280 characters)',
      required: true,
      constraints: {
        maxLength: 280,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Tweet text is required' },
        { type: 'maxLength', value: 280, message: 'Tweet must be at most 280 characters' }
      ],
      ui: {
        icon: 'text',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'What\'s happening?'
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
      label: 'Hashtags',
      description: 'Add hashtags to your tweet',
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
      label: 'Mentions',
      description: 'Mention other users',
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


