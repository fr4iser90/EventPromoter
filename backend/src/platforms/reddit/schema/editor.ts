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
  title: 'Reddit Post Editor',
  description: 'Create and edit Reddit posts',
  mode: 'simple',
  blocks: [
    {
      type: 'targets',
      id: 'subreddits', // Reddit-specific ID, but generic block type
      label: 'platform.reddit.subreddits.label',
      description: 'platform.reddit.subreddits.description',
      required: true,
      constraints: {
        minTargets: 1
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
      label: 'Post Title',
      description: 'Post title (max 300 characters)',
      required: true,
      constraints: {
        maxLength: 300,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Title is required' },
        { type: 'maxLength', value: 300, message: 'Title must be at most 300 characters' }
      ],
      ui: {
        icon: 'title',
        order: 1,
        enabled: true
      },
      rendering: {
        fieldType: 'text',
        placeholder: 'Post title...'
      }
    },
    {
      type: 'paragraph',
      id: 'text',
      label: 'Post Body',
      description: 'Post content (max 40000 characters)',
      required: true,
      constraints: {
        maxLength: 40000,
        minLength: 1
      },
      validation: [
        { type: 'required', message: 'Post body is required' }
      ],
      ui: {
        icon: 'text',
        order: 3,
        enabled: true
      },
      rendering: {
        fieldType: 'textarea',
        placeholder: 'Post content...'
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
      label: 'Link',
      description: 'Optional link to share',
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


