import { FormSchema } from '@/types/schema/index.js';

const emailGroupEditSchema: FormSchema = {
  id: 'editGroupSchema',
  title: 'platform.email.groups.edit.title',
  description: 'platform.email.groups.edit.description',
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
      label: 'platform.email.groups.form.groupName',
      type: 'text',
      required: true,
      ui: {
        width: 12,
        order: 1,
      },
    },
    {
      name: 'targetIds',
      type: 'multiselect',
      label: 'platform.email.groups.form.members',
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
      label: 'platform.email.actions.save',
      method: 'PUT',
      ui: {
        variant: 'contained',
        color: 'primary',
      },
    },
    {
      id: 'delete',
      type: 'delete',
      label: 'platform.email.actions.delete',
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
      label: 'platform.email.actions.cancel',
      ui: {
        variant: 'outlined',
      },
    },
  ],
};

export default emailGroupEditSchema;