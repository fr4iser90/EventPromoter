/**
 * LinkedIn Platform Editor Schema
 * 
 * Defines the content editor structure for LinkedIn posts.
 * 
 * @module platforms/linkedin/schema/editor
 */

import { EditorSchema } from '@/types/schema/index.js'

export const linkedinEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'platform.linkedin.editor.title',
  description: 'platform.linkedin.editor.description',
  mode: 'rich',
  blocks: [
    {
      type: 'paragraph',
      id: 'text',
      label: 'platform.linkedin.editor.text.label',
      description: 'platform.linkedin.editor.text.description',
      required: true,
      constraints: {
        maxLength: 3000,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'platform.linkedin.editor.text.required' },
        { type: 'maxLength', value: 3000, message: 'platform.linkedin.editor.text.maxLength' }
      ],
      ui: {
        icon: 'text',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'platform.linkedin.editor.text.placeholder'
      }
    },
    {
      type: 'image',
      id: 'image',
      label: 'platform.linkedin.editor.image.label',
      description: 'platform.linkedin.editor.image.description',
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
      label: 'platform.linkedin.editor.link.label',
      description: 'platform.linkedin.editor.link.description',
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
      label: 'platform.linkedin.editor.hashtags.label',
      description: 'platform.linkedin.editor.hashtags.description',
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


