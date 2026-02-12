import { FormSchema } from '@/types/schema/index.js'

const redditUserEditSchema: FormSchema = {
  id: 'editUserSchema',
  title: 'platform.reddit.editUser.title',
  description: 'platform.reddit.editUser.description',
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
      label: 'platform.reddit.editUser.fields.username.label',
      placeholder: 'platform.reddit.editUser.fields.username.placeholder',
      required: true,
      validation: [
        { type: 'required', message: 'platform.reddit.validation.usernameRequired' },
        { 
          type: 'pattern', 
          value: '^[a-zA-Z0-9_-]{3,20}$', 
          message: 'platform.reddit.validation.usernamePattern' 
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
      label: 'platform.reddit.editUser.fields.targetType.label',
      default: 'user',
      readOnly: true,
      ui: {
        hidden: true,
      },
    },
    {
      name: 'displayName',
      type: 'text',
      label: 'platform.reddit.editUser.fields.displayName.label',
      placeholder: 'platform.reddit.editUser.fields.displayName.placeholder',
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
      label: 'platform.reddit.editUser.fields.notes.label',
      placeholder: 'platform.reddit.editUser.fields.notes.placeholder',
      required: false,
      validation: [
        { type: 'maxLength', value: 500, message: 'platform.reddit.validation.notesMaxLength' }
      ],
      ui: {
        width: 12,
        order: 3,
      },
    },
    {
      name: 'active',
      type: 'boolean',
      label: 'platform.reddit.editUser.fields.active.label',
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
