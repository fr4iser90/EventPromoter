import { FormSchema } from '@/types/schema';

const emailGroupEditSchema: FormSchema = {
  id: 'editGroupSchema',
  title: 'Edit Email Group',
  description: 'Edit an existing email group.',
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
      ui: {
        width: 12,
        order: 1,
      },
    },
    {
      name: 'targetIds',
      type: 'multiselect',
      label: 'Members',
      optionsSource: {
        endpoint: 'platforms/:platformId/targets',
        method: 'GET',
        responsePath: 'targets',
        labelPath: 'email',
        valuePath: 'id',
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
};

export default emailGroupEditSchema;