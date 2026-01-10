/**
 * Email Platform Editor Schema
 * 
 * Editor configuration for the Email platform (blocks, features, constraints)
 * 
 * @module platforms/email/schema/editor
 */

import { EditorSchema } from '../../../types/platformSchema.js'

export const emailEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'Email Content Editor',
  description: 'Create and edit email content',
  mode: 'rich',
  blocks: [
    {
      type: 'text',
      id: 'subject',
      label: 'Subject',
      description: 'Email subject line',
      required: true,
      constraints: {
        maxLength: 200,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Subject is required' },
        { type: 'maxLength', value: 200, message: 'Subject must be at most 200 characters' }
      ],
      ui: {
        icon: 'subject',
        order: 1,
        enabled: true
      },
      // ✅ Rendering config for schema-driven editor
      rendering: {
        fieldType: 'text',
        placeholder: 'Enter email subject...'
      }
    },
    {
      type: 'paragraph',
      id: 'body',
      label: 'Email Body',
      description: 'Main email content (HTML supported)',
      required: true,
      constraints: {
        maxLength: 50000,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Email body is required' }
      ],
      ui: {
        icon: 'text',
        order: 2,
        enabled: true
      },
      // ✅ Rendering config
      rendering: {
        fieldType: 'textarea',
        placeholder: 'Enter email body content...'
      }
    },
    {
      type: 'image',
      id: 'images',
      label: 'Images',
      description: 'Email images',
      required: false,
      constraints: {
        maxItems: 10,
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
        maxFileSize: 5242880 // 5MB
      },
      ui: {
        icon: 'image',
        order: 3,
        enabled: true
      },
      // ✅ Rendering config for file upload
      rendering: {
        fieldType: 'file',
        uploadEndpoint: '/api/platforms/:platformId/upload'
      }
    },
    {
      type: 'link',
      id: 'links',
      label: 'Links',
      description: 'Email links',
      required: false,
      constraints: {
        maxItems: 10
      },
      ui: {
        icon: 'link',
        order: 4,
        enabled: true
      },
      // ✅ Rendering config
      rendering: {
        fieldType: 'url',
        placeholder: 'https://example.com'
      }
    }
  ],
  features: {
    formatting: true,
    mediaUpload: true,
    linkInsertion: true,
    preview: true,
    wordCount: true,
    characterCount: true
  },
  constraints: {
    maxLength: 50000,
    minLength: 1,
    maxBlocks: 20
  }
}

