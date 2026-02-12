/**
 * Instagram Platform Editor Schema
 * 
 * Defines the content editor structure for Instagram posts.
 * 
 * @module platforms/instagram/schema/editor
 */

import { EditorSchema } from '@/types/schema/index.js'

export const instagramEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'platform.instagram.editor.title',
  description: 'platform.instagram.editor.description',
  mode: 'simple',
  blocks: [
    {
      type: 'image',
      id: 'image',
      label: 'platform.instagram.editor.image.label',
      description: 'platform.instagram.editor.image.description',
      required: true,
      constraints: {
        maxItems: 1,
        allowedFormats: ['jpg', 'jpeg', 'png'],
        maxFileSize: 8388608, // 8MB
        aspectRatio: '1:1'
      },
      validation: [
        { type: 'required', message: 'platform.instagram.editor.image.required' }
      ],
      ui: {
        icon: 'image',
        order: 1,
        enabled: true
      }
    },
    {
      type: 'paragraph',
      id: 'caption',
      label: 'platform.instagram.editor.caption.label',
      description: 'platform.instagram.editor.caption.description',
      required: true,
      constraints: {
        maxLength: 2200,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'platform.instagram.editor.caption.required' },
        { type: 'maxLength', value: 2200, message: 'platform.instagram.editor.caption.maxLength' }
      ],
      ui: {
        icon: 'text',
        order: 2,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'platform.instagram.editor.caption.placeholder'
      }
    },
    {
      type: 'hashtag',
      id: 'hashtags',
      label: 'platform.instagram.editor.hashtags.label',
      description: 'platform.instagram.editor.hashtags.description',
      required: false,
      constraints: {
        maxItems: 30
      },
      ui: {
        icon: 'hashtag',
        order: 3,
        enabled: true
      }
    }
  ],
  features: {
    formatting: false,
    mediaUpload: true,
    linkInsertion: false,
    hashtagSuggestions: true,
    mentionSuggestions: true,
    preview: true,
    wordCount: true,
    characterCount: true
  },
  constraints: {
    maxLength: 2200,
    minLength: 1,
    maxBlocks: 3
  }
}


