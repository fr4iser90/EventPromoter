import { FormSchema } from '@/types/schema/index.js'

const redditGroupEditSchema: FormSchema = {
  id: 'editGroupSchema',
  title: 'Edit Reddit Group',
  description: 'Edit an existing Reddit group (can contain Subreddits and Users).',
  endpoint: 'platforms/:platformId/target-groups/:id',
  fields: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      readOnly: true,
      ui: {
        hidden: true,
      },
    },
    {
      name: 'name',
      label: 'Group Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Music Events, Local Events, etc.',
      ui: {
        width: 12,
        order: 1,
      },
    },
    {
      name: 'targetIds',
      type: 'multiselect',
      label: 'Members (Subreddits and Users)',
      description: 'Select subreddits and/or users for this group',
      required: false,
      optionsSource: {
        endpoint: 'platforms/:platformId/targets',
        method: 'GET',
        responsePath: 'options',
      },
      ui: {
        width: 12,
        order: 2,
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
}

export default redditGroupEditSchema
