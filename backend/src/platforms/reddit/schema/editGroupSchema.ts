import { FormSchema } from '@/types/schema/index.js'

const redditGroupEditSchema: FormSchema = {
  id: 'editGroupSchema',
  title: 'platform.reddit.editGroup.title',
  description: 'platform.reddit.editGroup.description',
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
      label: 'platform.reddit.editGroup.fields.name.label',
      type: 'text',
      required: true,
      placeholder: 'platform.reddit.editGroup.fields.name.placeholder',
      ui: {
        width: 12,
        order: 1,
      },
    },
    {
      name: 'targetIds',
      type: 'multiselect',
      label: 'platform.reddit.editGroup.fields.targetIds.label',
      description: 'platform.reddit.editGroup.fields.targetIds.description',
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
      endpoint: 'platforms/:platformId/target-groups/:id',
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

export default redditGroupEditSchema
