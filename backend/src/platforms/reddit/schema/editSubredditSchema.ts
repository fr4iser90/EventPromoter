import { FormSchema } from '@/types/schema/index.js'

const redditSubredditEditSchema: FormSchema = {
  id: 'editSubredditSchema',
  title: 'platform.reddit.editSubreddit.title',
  description: 'platform.reddit.editSubreddit.description',
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
      label: 'platform.reddit.editSubreddit.fields.subreddit.label',
      placeholder: 'platform.reddit.editSubreddit.fields.subreddit.placeholder',
      required: true,
      validation: [
        { type: 'required', message: 'platform.reddit.validation.subredditNameRequired' },
        { 
          type: 'pattern', 
          value: '^[a-z0-9_]{3,21}$', 
          message: 'platform.reddit.validation.subredditNamePattern' 
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
      label: 'platform.reddit.editSubreddit.fields.targetType.label',
      default: 'subreddit',
      readOnly: true,
      ui: {
        hidden: true,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'platform.reddit.editSubreddit.fields.description.label',
      placeholder: 'platform.reddit.editSubreddit.fields.description.placeholder',
      required: false,
      validation: [
        { type: 'maxLength', value: 500, message: 'platform.reddit.validation.descriptionMaxLength' }
      ],
      ui: {
        width: 12,
        order: 2,
      },
    },
    {
      name: 'tags',
      type: 'multiselect',
      label: 'platform.reddit.editSubreddit.fields.tags.label',
      required: false,
      options: [
        { label: 'platform.reddit.options.music', value: 'music' },
        { label: 'platform.reddit.options.events', value: 'events' },
        { label: 'platform.reddit.options.local', value: 'local' }
      ],
      ui: {
        width: 12,
        order: 3,
      },
    },
    {
      name: 'active',
      type: 'boolean',
      label: 'platform.reddit.editSubreddit.fields.active.label',
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
      label: 'platform.reddit.actions.save',
      method: 'PUT',
      ui: {
        variant: 'contained',
        color: 'primary',
      },
    },
    {
      id: 'delete',
      type: 'delete',
      label: 'platform.reddit.actions.delete',
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
      label: 'platform.reddit.actions.cancel',
      ui: {
        variant: 'outlined',
      },
    },
  ],
}

export default redditSubredditEditSchema
