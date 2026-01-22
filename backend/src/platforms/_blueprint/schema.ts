/**
 * PLATFORM_ID Platform Schema
 * 
 * Schema-driven UI definitions for the PLATFORM_ID platform.
 * 
 * @module platforms/PLATFORM_ID/schema
 */

import { PlatformSchema } from '@/types/schema'

export const platformIdSchema: PlatformSchema = {
  version: '1.0.0',
  settings: {
    version: '1.0.0',
    title: 'PLATFORM_DISPLAY_NAME Settings',
    description: 'Configure PLATFORM_DISPLAY_NAME API credentials',
    fields: [
      {
        name: 'apiKey',
        type: 'text',
        label: 'API Key',
        required: true,
        validation: [
          { type: 'required', message: 'API Key is required' }
        ],
        ui: {
          width: 12,
          order: 1
        }
      },
      {
        name: 'apiSecret',
        type: 'password',
        label: 'API Secret',
        required: true,
        validation: [
          { type: 'required', message: 'API Secret is required' }
        ],
        ui: {
          width: 12,
          order: 2
        }
      }
    ],
    groups: [
      {
        id: 'credentials',
        title: 'API Credentials',
        description: 'Configure your API credentials',
        fields: ['apiKey', 'apiSecret'],
        collapsible: false
      }
    ]
  },
  editor: {
    version: '1.0.0',
    title: 'PLATFORM_DISPLAY_NAME Editor',
    description: 'Create and edit content for PLATFORM_DISPLAY_NAME',
    mode: 'simple',
    blocks: [
      {
        id: 'text-content',
        type: 'text',
        label: 'Content',
        description: 'Your content text',
        required: true,
        constraints: {
          maxLength: 1000,
          minLength: 1
        },
        validation: [
          { type: 'required', message: 'Content is required' },
          { type: 'maxLength', value: 1000, message: 'Content must be at most 1000 characters' }
        ],
        ui: {
          icon: 'text',
          order: 1,
          enabled: true
        },
        rendering: {
          fieldType: 'textarea',
          placeholder: 'Enter your content...'
        }
      },
      {
        id: 'image-content',
        type: 'image',
        label: 'Images',
        description: 'Upload images',
        required: false,
        constraints: {
          maxItems: 5,
          allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
          maxFileSize: 5242880 // 5MB
        },
        ui: {
          icon: 'image',
          order: 2,
          enabled: true
        },
        rendering: {
          fieldType: 'file',
          uploadEndpoint: 'platforms/:platformId/upload'
        }
      }
    ],
    features: {
      formatting: false,
      mediaUpload: true,
      linkInsertion: true,
      preview: true,
      wordCount: true,
      characterCount: true
    },
    constraints: {
      maxLength: 1000,
      minLength: 1,
      maxBlocks: 10
    }
  },
  preview: {
    version: '1.0.0',
    title: 'PLATFORM_DISPLAY_NAME Preview',
    description: 'Preview how your content will look',
    defaultMode: 'desktop',
    modes: [
      {
        id: 'desktop',
        label: 'Desktop',
        description: 'Desktop view',
        width: 600,
        height: 400
      },
      {
        id: 'mobile',
        label: 'Mobile',
        description: 'Mobile view',
        width: 320,
        height: 568
      }
    ],
    slots: [
      {
        slot: 'content',
        field: 'text',
        order: 1
      },
      {
        slot: 'media',
        field: 'images',
        order: 2,
        condition: {
          field: 'images',
          operator: 'exists'
        }
      }
    ],
    contentMapping: [
      {
        field: 'text',
        renderAs: 'text',
        label: 'Content',
        order: 1
      },
      {
        field: 'images',
        renderAs: 'image',
        label: 'Images',
        order: 2,
        show: false // Hide if embedded in content
      }
    ],
    options: {
      showMetadata: true,
      showTimestamp: true,
      interactive: false
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Arial, sans-serif'
    }
  },
  // Optional: Template schema
  template: {
    version: '1.0.0',
    title: 'PLATFORM_DISPLAY_NAME Templates',
    description: 'Manage content templates',
    defaultStructure: {
      text: {
        label: 'Content',
        type: 'text',
        default: '{title} - {description}',
        placeholder: 'Use {variable} for dynamic content',
        required: true,
        description: 'Content template'
      }
    },
    variables: [
      {
        name: 'eventTitle',
        label: 'Event Title',
        description: 'The title of the event',
        type: 'string'
      },
      {
        name: 'description',
        label: 'Event Description',
        description: 'The event description',
        type: 'string'
      }
    ],
    categories: [
      {
        id: 'announcement',
        label: 'Announcement',
        description: 'Event announcements'
      }
    ],
    validation: {
      requiredFields: ['text'],
      variablePattern: '\\{[^}]+\\}'
    }
  },
  metadata: {
    lastUpdated: new Date().toISOString(),
    author: 'EventPromoter',
    description: 'PLATFORM_DISPLAY_NAME platform schema'
  }
}

