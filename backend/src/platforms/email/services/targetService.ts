/**
 * Email Target Service
 * 
 * Platform-specific target service for email recipients.
 * Extends BaseTargetService with email-specific validation.
 * 
 * @module platforms/email/services/targetService
 */

import { BaseTargetService } from '../../../services/targetService.js'
import { TargetSchema } from '../../../types/platformSchema.js'

export class EmailTargetService extends BaseTargetService {
  constructor() {
    const targetSchema: TargetSchema = {
      baseField: 'email',
      baseFieldLabel: 'Email-Adresse',
      baseFieldValidation: [
        { type: 'required', message: 'Email is required' },
        { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email format' }
      ],
      customFields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: false,
          ui: { width: 12, order: 1 }
        },
        {
          name: 'birthday',
          type: 'date',
          label: 'Geburtstag',
          required: false,
          ui: { width: 6, order: 2 }
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false,
          options: [],
          ui: { width: 12, order: 3 }
        },
        {
          name: 'company',
          type: 'text',
          label: 'Firma',
          required: false,
          ui: { width: 12, order: 4 }
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Telefon',
          required: false,
          validation: [
            { type: 'pattern', value: '^[\\d\\s\\+\\-\\(\\)]+$', message: 'Invalid phone number format' }
          ],
          ui: { width: 12, order: 5 }
        }
      ],
      supportsGroups: true
    }

    super('email', targetSchema)
    this.dataFileName = 'targets.json'
  }

  getBaseField(): string {
    return 'email'
  }

  validateBaseField(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  protected normalizeBaseField(value: string): string {
    return value.trim().toLowerCase()
  }
}
