import { FormSchema } from '@/types/schema/index.js'

const redditUserEditSchema: FormSchema = {
  id: 'editUserSchema',
  title: 'Edit Reddit User',
  description: 'Edit an existing Reddit user.',
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
      name: 'username',
      type: 'text',
      label: 'Reddit Username',
      placeholder: 'e.g., username123',
      required: true,
      validation: [
        { type: 'required', message: 'Username is required' },
        { 
          type: 'pattern', 
          value: '^[a-zA-Z0-9_-]{3,20}$', 
          message: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens' 
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
      default: 'user',
      readOnly: true,
      ui: {
        hidden: true,
      },
    },
    {
      name: 'displayName',
      type: 'text',
      label: 'Display Name',
      placeholder: 'e.g., John Doe',
      required: false,
      ui: {
        width: 12,
        order: 2,
      },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'platform.reddit.form.labels.firstName',
      ui: {
        width: 6,
        order: 3,
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'platform.reddit.form.labels.lastName',
      ui: {
        width: 6,
        order: 4,
      },
    },
    {
      name: 'gender',
      type: 'select',
      label: 'platform.reddit.form.labels.gender',
      options: [
        { label: 'platform.reddit.form.options.gender.not_specified', value: 'not_specified' },
        { label: 'platform.reddit.form.options.gender.male', value: 'male' },
        { label: 'platform.reddit.form.options.gender.female', value: 'female' },
        { label: 'platform.reddit.form.options.gender.non_binary', value: 'non_binary' }
      ],
      default: 'not_specified',
      ui: {
        width: 6,
        order: 5,
      },
    },
    {
      name: 'salutationTone',
      type: 'select',
      label: 'platform.reddit.form.labels.salutationTone',
      options: [
        { label: 'platform.reddit.form.options.salutationTone.informal', value: 'informal' },
        { label: 'platform.reddit.form.options.salutationTone.formal', value: 'formal' }
      ],
      default: 'informal',
      ui: {
        width: 6,
        order: 6,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      placeholder: 'e.g., Important contact for events',
      required: false,
      validation: [
        { type: 'maxLength', value: 500, message: 'Notes must be at most 500 characters' }
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

export default redditUserEditSchema
