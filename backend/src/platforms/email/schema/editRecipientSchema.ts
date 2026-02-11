import { FormSchema } from '@/types/schema/index.js'

const emailRecipientEditSchema: FormSchema = {
  id: 'editRecipientSchema',
  title: 'Edit Email Recipient',
  description: 'Edit an existing email recipient.',
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
      name: 'targetType',
      type: 'text',
      label: 'Target Type',
      default: 'email',
      readOnly: true,
      ui: {
        hidden: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      ui: {
        width: 12,
        order: 1,
      },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'platform.email.form.labels.firstName',
      ui: {
        width: 6,
        order: 2,
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'platform.email.form.labels.lastName',
      ui: {
        width: 6,
        order: 3,
      },
    },
    {
      name: 'gender',
      type: 'select',
      label: 'platform.email.form.labels.gender',
      options: [
        { label: 'platform.email.form.options.gender.not_specified', value: 'not_specified' },
        { label: 'platform.email.form.options.gender.male', value: 'male' },
        { label: 'platform.email.form.options.gender.female', value: 'female' },
        { label: 'platform.email.form.options.gender.non_binary', value: 'non_binary' }
      ],
      default: 'not_specified',
      ui: {
        width: 6,
        order: 4,
      },
    },
    {
      name: 'salutationTone',
      type: 'select',
      label: 'platform.email.form.labels.salutationTone',
      options: [
        { label: 'platform.email.form.options.salutationTone.informal', value: 'informal' },
        { label: 'platform.email.form.options.salutationTone.formal', value: 'formal' }
      ],
      default: 'informal',
      ui: {
        width: 6,
        order: 5,
      },
    },
    {
      name: 'birthday',
      type: 'date',
      label: 'platform.email.form.labels.birthday',
      ui: {
        width: 6,
        order: 6,
      },
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      ui: {
        width: 6,
        order: 5,
      },
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Phone Number',
      ui: {
        width: 6,
        order: 6,
      },
    },
    {
      name: 'tags',
      type: 'multiselect',
      label: 'Tags',
      options: [], // This could be dynamically loaded if needed
      ui: {
        width: 12,
        order: 7,
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
};

export default emailRecipientEditSchema;