/**
 * Instagram Platform Editor Schema
 * 
 * Defines the content editor structure for Instagram posts.
 * 
 * @module platforms/instagram/schema/editor
 */

import { EditorSchema } from '@/types/schema'

export const instagramEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'Instagram Post Editor',
  description: 'Create and edit Instagram posts',
  mode: 'simple',
  blocks: [
    {
      type: 'image',
      id: 'image',
      label: 'Image',
      description: 'Post image (required)',
      required: true,
      constraints: {
        maxItems: 1,
        allowedFormats: ['jpg', 'jpeg', 'png'],
        maxFileSize: 8388608, // 8MB
        aspectRatio: '1:1'
      },
      validation: [
        { type: 'required', message: 'Image is required' }
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
      label: 'Caption',
      description: 'Post caption (max 2200 characters)',
      required: true,
      constraints: {
        maxLength: 2200,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Caption is required' },
        { type: 'maxLength', value: 2200, message: 'Caption must be at most 2200 characters' }
      ],
      ui: {
        icon: 'text',
        order: 2,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'Write a caption...'
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


