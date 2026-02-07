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
      label: 'First Name',
      ui: {
        width: 6,
        order: 2,
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      ui: {
        width: 6,
        order: 3,
      },
    },
    {
      name: 'birthday',
      type: 'date',
      label: 'Birthday',
      ui: {
        width: 6,
        order: 4,
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