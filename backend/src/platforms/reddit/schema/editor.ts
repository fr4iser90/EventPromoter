/**
 * Reddit Platform Editor Schema
 * 
 * Defines the content editor structure for Reddit posts.
 * 
 * @module platforms/reddit/schema/editor
 */

import { EditorSchema } from '@/types/schema/index.js'

export const redditEditorSchema: EditorSchema = {
  version: '2.0.0',
  title: 'platform.reddit.editor.title',
  description: 'platform.reddit.editor.description',
  mode: 'simple',
  blocks: [
    {
      type: 'targets',
      id: 'subreddits', // Reddit-specific ID, but generic block type
      label: 'platform.reddit.subreddits.label',
      description: 'platform.reddit.subreddits.description',
      required: true,
      constraints: {
        minItems: 1
      },
      validation: [
        { type: 'required', message: 'platform.reddit.subreddits.validation.required' }
      ],
      ui: {
        icon: 'subreddit',
        order: 0, // Ganz oben, vor allen anderen Feldern
        enabled: true
      },
      rendering: {
        strategy: 'composite',
        schema: {
          mode: {
            fieldType: 'select',
            label: 'platform.reddit.subreddits.mode.label',
            description: 'platform.reddit.subreddits.mode.description',
            source: 'modes',
            default: 'all' // ✅ UX: Default to "all" for simplest use case
          },
          groups: {
            fieldType: 'multiselect',
            label: 'platform.reddit.subreddits.groups.label',
            description: 'platform.reddit.subreddits.groups.description',
            source: 'subredditGroups',
            required: false,
            visibleWhen: { field: 'mode', value: 'groups' }
          },
          individual: {
            fieldType: 'multiselect',
            label: 'platform.reddit.subreddits.individual.label',
            description: 'platform.reddit.subreddits.individual.description',
            source: 'subreddits',
            required: false,
            visibleWhen: { field: 'mode', value: 'individual' }
          },
          templateLocale: {
            fieldType: 'select',
            label: 'platform.reddit.subreddits.templateLocale.label',
            description: 'platform.reddit.subreddits.templateLocale.description',
            source: 'locales',
            required: false,
            default: 'de'
          },
          defaultTemplate: {
            fieldType: 'select',
            label: 'platform.reddit.subreddits.defaultTemplate.label',
            description: 'platform.reddit.subreddits.defaultTemplate.description',
            source: 'templates',
            required: false
          },
          templateMapping: {
            fieldType: 'mapping',
            label: 'platform.reddit.subreddits.templateMapping.label',
            description: 'platform.reddit.subreddits.templateMapping.description',
            source: 'templates',
            required: false,
            visibleWhen: { field: 'mode', value: 'groups' }
          }
        },
        dataEndpoints: {
          modes: 'platforms/reddit/subreddit-modes',
          subredditGroups: 'platforms/reddit/target-groups?type=subreddit',
          subreddits: 'platforms/reddit/targets?type=subreddit',
          templates: 'platforms/reddit/templates',
          locales: 'platforms/reddit/locales'
        }
      }
    },
    {
      type: 'heading',
      id: 'title',
      label: 'platform.reddit.editor.postTitle.label',
      description: 'platform.reddit.editor.postTitle.description',
      required: true,
      constraints: {
        maxLength: 300,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'platform.reddit.editor.postTitle.required' },
        { type: 'maxLength', value: 300, message: 'platform.reddit.editor.postTitle.maxLength' }
      ],
      ui: {
        icon: 'title',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'text',
        placeholder: 'platform.reddit.editor.postTitle.placeholder'
      }
    },
    {
      type: 'paragraph',
      id: 'text',
      label: 'platform.reddit.editor.postBody.label',
      description: 'platform.reddit.editor.postBody.description',
      required: true,
      constraints: {
        maxLength: 40000,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'platform.reddit.editor.postBody.required' }
      ],
      ui: {
        icon: 'text',
        order: 3,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'platform.reddit.editor.postBody.placeholder',
        variables: [
          { name: 'salutation', label: 'platform.reddit.form.variables.salutation', description: 'platform.reddit.editor.postBody.variables.salutationDescription' },
          { name: 'target.firstName', label: 'platform.reddit.form.variables.target.firstName', description: 'platform.reddit.editor.postBody.variables.targetFirstNameDescription' },
          { name: 'target.lastName', label: 'platform.reddit.form.variables.target.lastName', description: 'platform.reddit.editor.postBody.variables.targetLastNameDescription' }
        ]
      }
    },
    {
      type: 'image',
      id: 'image',
      label: 'platform.reddit.editor.image.label',
      description: 'platform.reddit.editor.image.description',
      required: false,
      constraints: {
        maxItems: 1,
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 20971520 // 20MB
      },
      ui: {
        icon: 'image',
        order: 4,
        enabled: true
      }
    },
    {
      type: 'link',
      id: 'link',
      label: 'platform.reddit.editor.link.label',
      description: 'platform.reddit.editor.link.description',
      required: false,
      constraints: {
        maxItems: 1
      },
      ui: {
        icon: 'link',
        order: 5,
        enabled: true
      }
    }
  ],
  features: {
    formatting: true,
    mediaUpload: true,
    linkInsertion: true,
    hashtagSuggestions: false,
    mentionSuggestions: false,
    preview: true,
    wordCount: true,
    characterCount: true
  },
  constraints: {
    maxLength: 40000,
    minLength: 1,
    maxBlocks: 5
  }
}


