/**
 * Email Platform Editor Schema
 * 
 * Editor configuration for the Email platform (blocks, features, constraints)
 * 
 * @module platforms/email/schema/editor
 */

import { EditorSchema } from '@/types/schema'

export const emailEditorSchema: EditorSchema = {
  version: '1.0.0',
  title: 'Email Content Editor',
  description: 'Create and edit email content with structured fields',
  mode: 'advanced',
  blocks: [
    {
      type: 'targets',
      id: 'recipients', // Email-specific ID, but generic block type
      label: 'Empfänger für diesen Versand',
      description: 'Wähle die Empfänger für diesen Versand',
      required: true,
      constraints: {
        minRecipients: 1
      },
      validation: [
        { type: 'required', message: 'Mindestens ein Empfänger muss ausgewählt sein' }
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
            label: 'Auswahl-Modus',
            description: 'Wähle wie Empfänger ausgewählt werden sollen',
            source: 'modes',
            default: 'all' // ✅ UX: Default to "all" for simplest use case
          },
          groups: {
            fieldType: 'multiselect',
            label: 'Empfänger-Gruppen',
            description: 'Wähle eine oder mehrere Gruppen',
            source: 'recipientGroups',
            required: false,
            visibleWhen: { field: 'mode', value: 'groups' }
          },
          individual: {
            fieldType: 'multiselect',
            label: 'Einzelne Empfänger',
            description: 'Wähle einzelne Empfänger aus',
            source: 'recipients',
            required: false,
            visibleWhen: { field: 'mode', value: 'individual' }
          },
          defaultTemplate: {
            fieldType: 'select',
            label: 'Standard-Template',
            description: 'Template das für alle Empfänger verwendet wird (falls keine Gruppen-Mapping vorhanden)',
            source: 'templates',
            required: false
          },
          templateMapping: {
            fieldType: 'mapping',
            label: 'Template-Zuordnung',
            description: 'Weise jeder Gruppe ein spezifisches Template zu',
            source: 'templates',
            required: false,
            visibleWhen: { field: 'mode', value: 'groups' }
          }
        },
        dataEndpoints: {
          modes: 'platforms/email/recipient-modes',
          recipientGroups: 'platforms/email/target-groups',
          recipients: 'platforms/email/targets',
          templates: 'platforms/email/templates'
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
      label: 'Standard-Anhänge',
      description: 'Diese Dateien werden JEDEM Template als Anhang beigefügt (z.B. Flyer, AGB).',
      required: false,
      settings: {
        enableToggle: {
          label: 'Standard-Anhänge mitschicken',
          default: false
        },
        selectionLimit: {
          max: 10,
          message: 'Sie können maximal 10 Standard-Anhänge hinzufügen.'
        },
        fileFilter: {
          allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/gif", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain"],
          allowedExtensions: ["pdf", "jpg", "jpeg", "png", "gif", "doc", "docx", "xls", "xlsx", "txt"],
          noFilesMessage: 'Keine Dateien für Anhänge gefunden.'
        },
        selectFileLabel: 'Öffentliche Datei auswählen...',
        selectedFilesLabel: 'Ausgewählte Standard-Anhänge:'
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

