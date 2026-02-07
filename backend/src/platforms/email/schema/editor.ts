/**
 * Email Platform Editor Schema
 * 
 * Editor configuration for the Email platform (blocks, features, constraints)
 * 
 * @module platforms/email/schema/editor
 */

import { EditorSchema } from '@/types/schema/index.js'

export const emailEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'Email Content Editor',
  description: 'Create and edit email content with structured fields',
  mode: 'advanced',
  blocks: [
    {
      type: 'targets',
      id: 'recipients', // Email-specific ID, but generic block type
      label: 'platform.email.recipients.label',
      description: 'platform.email.recipients.description',
      required: true,
      constraints: {
        minRecipients: 1
      },
      validation: [
        { type: 'required', message: 'platform.email.recipients.validation.required' }
      ],
      ui: {
        icon: 'email',
        order: 0, // Ganz oben, vor allen anderen Feldern
        enabled: true
      },
      rendering: {
        strategy: 'composite',
        schema: {
          mode: {
            fieldType: 'select',
            label: 'platform.email.recipients.mode.label',
            description: 'platform.email.recipients.mode.description',
            source: 'modes',
            default: 'all' // ✅ UX: Default to "all" for simplest use case
          },
          groups: {
            fieldType: 'multiselect',
            label: 'platform.email.recipients.groups.label',
            description: 'platform.email.recipients.groups.description',
            source: 'recipientGroups',
            required: false,
            visibleWhen: { field: 'mode', value: 'groups' }
          },
          individual: {
            fieldType: 'multiselect',
            label: 'platform.email.recipients.individual.label',
            description: 'platform.email.recipients.individual.description',
            source: 'recipients',
            required: false,
            visibleWhen: { field: 'mode', value: 'individual' }
          },
          templateLocale: {
            fieldType: 'select',
            label: 'platform.email.recipients.templateLocale.label',
            description: 'platform.email.recipients.templateLocale.description',
            source: 'locales',
            required: false,
            default: 'de'
          },
          defaultTemplate: {
            fieldType: 'select',
            label: 'platform.email.recipients.defaultTemplate.label',
            description: 'platform.email.recipients.defaultTemplate.description',
            source: 'templates',
            required: false
          },
          templateMapping: {
            fieldType: 'mapping',
            label: 'platform.email.recipients.templateMapping.label',
            description: 'platform.email.recipients.templateMapping.description',
            source: 'templates',
            required: false,
            visibleWhen: { field: 'mode', value: 'groups' }
          }
        },
        dataEndpoints: {
          modes: 'platforms/email/recipient-modes',
          recipientGroups: 'platforms/email/target-groups',
          recipients: 'platforms/email/targets',
          templates: 'platforms/email/templates',
          locales: 'platforms/email/locales'
        }
      }
    },
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
      rendering: {
        fieldType: 'text',
        placeholder: 'Enter email subject...'
      }
    },
    {
      type: 'image',
      id: 'headerImage',
      label: 'Header Image',
      description: 'Main image displayed at the top of the email (embedded in HTML)',
      required: false,
      constraints: {
        maxItems: 1,
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
    },
    {
      type: 'file_selection_input',
      id: 'globalFiles',
      label: 'editor.standardAttachments',
      description: 'editor.standardAttachmentsDescription',
      required: false,
      settings: {
        enableToggle: {
          label: 'editor.includeStandardAttachments',
          default: false
        },
        selectionLimit: {
          max: 10,
          message: 'editor.maxStandardAttachments'
        },
        fileFilter: {
          allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/gif", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain"],
          allowedExtensions: ["pdf", "jpg", "jpeg", "png", "gif", "doc", "docx", "xls", "xlsx", "txt"],
          noFilesMessage: 'editor.noAttachmentFilesFound'
        },
        selectFileLabel: 'editor.selectPublicFile',
        selectedFilesLabel: 'editor.selectedStandardAttachments'
      },
      ui: {
        icon: 'attach_file',
        order: 2.5,
        enabled: true
      },
    },
    {
      type: 'paragraph',
      id: 'bodyText',
      label: 'Body Text',
      description: 'Main email content (plain text, will be formatted automatically)',
      required: true,
      constraints: {
        maxLength: 10000,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Body text is required' }
      ],
      ui: {
        icon: 'text',
        order: 3,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'Enter your email content here...'
      }
    },
    {
      type: 'text',
      id: 'ctaButtonText',
      label: 'CTA Button Text',
      description: 'Text for the call-to-action button',
      required: false,
      constraints: {
        maxLength: 50,
        minLength: 1
      },
      ui: {
        icon: 'button',
        order: 4,
        enabled: true
      },
      rendering: {
        fieldType: 'text',
        placeholder: 'e.g., Get Tickets Now'
      }
    },
    {
      type: 'link',
      id: 'ctaButtonLink',
      label: 'CTA Button Link',
      description: 'URL for the call-to-action button',
      required: false,
      constraints: {
        maxLength: 500
      },
      ui: {
        icon: 'link',
        order: 5,
        enabled: true
      },
      rendering: {
        fieldType: 'url',
        placeholder: 'https://example.com/tickets'
      }
    },
    {
      type: 'paragraph',
      id: 'footerText',
      label: 'Footer Text',
      description: 'Optional footer text (e.g., unsubscribe link, contact info)',
      required: false,
      constraints: {
        maxLength: 500
      },
      ui: {
        icon: 'footer',
        order: 6,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'Optional footer text...'
      }
    },
    // Legacy fields for backward compatibility
    {
      type: 'paragraph',
      id: 'body',
      label: 'Email Body (HTML)',
      description: 'Legacy: Full HTML body (use structured fields above instead)',
      required: false,
      constraints: {
        maxLength: 50000
      },
      ui: {
        icon: 'code',
        order: 99,
        enabled: false // Hidden by default, only for backward compatibility
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'HTML content...'
      }
    },
    {
      type: 'image',
      id: 'images',
      label: 'Images (Legacy)',
      description: 'Legacy: Additional images',
      required: false,
      constraints: {
        maxItems: 10,
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
        maxFileSize: 5242880
      },
      ui: {
        icon: 'image',
        order: 98,
        enabled: false // Hidden by default
      },
      rendering: {
        fieldType: 'file',
        uploadEndpoint: 'platforms/:platformId/upload'
      }
    },
    {
      type: 'link',
      id: 'links',
      label: 'Links (Legacy)',
      description: 'Legacy: Additional links',
      required: false,
      constraints: {
        maxItems: 10
      },
      ui: {
        icon: 'link',
        order: 97,
        enabled: false // Hidden by default
      },
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

