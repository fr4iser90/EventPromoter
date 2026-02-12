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
  title: 'platform.email.editor.title',
  description: 'platform.email.editor.description',
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
      label: 'platform.email.editor.subject',
      description: 'platform.email.editor.subjectDescription',
      required: true,
      constraints: {
        maxLength: 200,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'platform.email.editor.validation.subjectRequired' },
        { type: 'maxLength', value: 200, message: 'platform.email.editor.validation.subjectMaxLength' }
      ],
      ui: {
        icon: 'subject',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'text',
        placeholder: 'platform.email.editor.subjectPlaceholder'
      }
    },
    {
      type: 'image',
      id: 'headerImage',
      label: 'platform.email.editor.headerImage',
      description: 'platform.email.editor.headerImageDescription',
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
      label: 'platform.email.editor.standardAttachments',
      description: 'platform.email.editor.standardAttachmentsDescription',
      required: false,
      settings: {
        enableToggle: {
          label: 'platform.email.editor.includeStandardAttachments',
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
      label: 'platform.email.editor.bodyText',
      description: 'platform.email.editor.bodyTextDescription',
      required: true,
      constraints: {
        maxLength: 10000,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'platform.email.editor.validation.bodyTextRequired' }
      ],
      ui: {
        icon: 'text',
        order: 3,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'platform.email.editor.bodyTextPlaceholder'
      }
    },
    {
      type: 'text',
      id: 'ctaButtonText',
      label: 'platform.email.editor.ctaButtonText',
      description: 'platform.email.editor.ctaButtonTextDescription',
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
        placeholder: 'platform.email.editor.ctaButtonTextPlaceholder'
      }
    },
    {
      type: 'link',
      id: 'ctaButtonLink',
      label: 'platform.email.editor.ctaButtonLink',
      description: 'platform.email.editor.ctaButtonLinkDescription',
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
        placeholder: 'platform.email.editor.ctaButtonLinkPlaceholder'
      }
    },
    {
      type: 'paragraph',
      id: 'footerText',
      label: 'platform.email.editor.footerText',
      description: 'platform.email.editor.footerTextDescription',
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
        placeholder: 'platform.email.editor.footerTextPlaceholder'
      }
    },
    // Legacy fields for backward compatibility
    {
      type: 'paragraph',
      id: 'body',
      label: 'platform.email.editor.legacyBody',
      description: 'platform.email.editor.legacyBodyDescription',
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
        placeholder: 'platform.email.editor.legacyBodyPlaceholder'
      }
    },
    {
      type: 'image',
      id: 'images',
      label: 'platform.email.editor.legacyImages',
      description: 'platform.email.editor.legacyImagesDescription',
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
      label: 'platform.email.editor.legacyLinks',
      description: 'platform.email.editor.legacyLinksDescription',
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
        placeholder: 'platform.email.editor.legacyLinksPlaceholder'
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

