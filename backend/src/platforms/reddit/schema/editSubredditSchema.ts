import { FormSchema } from '@/types/schema/index.js'

const redditSubredditEditSchema: FormSchema = {
  id: 'editSubredditSchema',
  title: 'Edit Subreddit',
  description: 'Edit an existing subreddit.',
  endpoint: 'platforms/:platformId/targets/:id',
  fields: [
    {
      name: 'id',
      type: 'text',
      label: 'ID',
      readOnly: true,
      ui: {
        hidden: true,
      },
    },
    {
      name: 'subreddit',
      type: 'text',
      label: 'Subreddit Name',
      placeholder: 'e.g., electronicmusic',
      required: true,
      validation: [
        { type: 'required', message: 'Subreddit name is required' },
        { 
          type: 'pattern', 
          value: '^[a-z0-9_]{3,21}$', 
          message: 'Subreddit name must be 3-21 characters and contain only letters, numbers, and underscores' 
        }
      ],
      ui: {
        width: 12,
        order: 1,
      },
    },
    {
      name: 'targetType',
      type: 'text',
      label: 'Target Type',
      default: 'subreddit',
      readOnly: true,
      ui: {
        hidden: true,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'e.g., Community for electronic music',
      required: false,
      validation: [
        { type: 'maxLength', value: 500, message: 'Description must be at most 500 characters' }
      ],
      ui: {
        width: 12,
        order: 2,
      },
    },
    {
      name: 'tags',
      type: 'multiselect',
      label: 'Tags',
      required: false,
      options: [
        { label: 'Music', value: 'music' },
        { label: 'Events', value: 'events' },
        { label: 'Local', value: 'local' }
      ],
      ui: {
        width: 12,
        order: 3,
      },
    },
    {
      name: 'active',
      type: 'boolean',
      label: 'Active',
      required: false,
      default: true,
      ui: {
        width: 6,
        order: 4,
      },
    },
  ],
  actions: [
    {
      id: 'save',
      type: 'submit',
      label: 'Save',
      method: 'PUT',
      ui: {
        variant: 'contained',
        color: 'primary',
      },
    },
    {
      id: 'delete',
      type: 'delete',
      label: 'Delete',
      method: 'DELETE',
      endpoint: 'platforms/:platformId/targets/:id',
      ui: {
        variant: 'contained',
        color: 'error',
      },
    },
    {
      id: 'cancel',
      type: 'button',
      label: 'Cancel',
      ui: {
        variant: 'outlined',
      },
    },
  ],
}

export default redditSubredditEditSchema
