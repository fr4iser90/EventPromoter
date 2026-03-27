/**
 * Email Target Service
 * 
 * Platform-specific target service for email recipients.
 * Extends BaseTargetService with email-specific validation.
 * 
 * @module platforms/email/services/targetService
 */

import { BaseTargetService } from '../../../services/targetService.js'
import { TargetSchema } from '@/types/schema/index.js'

export class EmailTargetService extends BaseTargetService {
  private static readonly SAFE_LOCAL_PART = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/
  private static readonly SAFE_DOMAIN_LABEL = /^[A-Za-z0-9-]+$/

  private static isValidEmailFormat(input: string): boolean {
    const email = String(input || '').trim()
    if (!email || email.length > 254) return false

    const atIndex = email.indexOf('@')
    if (atIndex <= 0 || atIndex !== email.lastIndexOf('@') || atIndex >= email.length - 1) {
      return false
    }

    const localPart = email.slice(0, atIndex)
    const domain = email.slice(atIndex + 1)

    if (!localPart || !domain || localPart.length > 64) return false
    if (domain.length > 253 || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
      return false
    }
    if (!this.SAFE_LOCAL_PART.test(localPart) || !domain.includes('.')) return false

    const labels = domain.split('.')
    for (const label of labels) {
      if (!label || label.length > 63) return false
      if (!this.SAFE_DOMAIN_LABEL.test(label)) return false
      if (label.startsWith('-') || label.endsWith('-')) return false
    }

    return true
  }

  constructor() {
    const targetSchemas: Record<string, TargetSchema> = {
      email: {
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
          },
          {
            name: 'locale',
            type: 'select',
            label: 'Sprache',
            required: false,
            options: [
              { value: 'en', label: '🇺🇸 English' },
              { value: 'de', label: '🇩🇪 Deutsch' },
              { value: 'es', label: '🇪🇸 Español' }
            ],
            ui: { width: 6, order: 6 },
            description: 'Sprache für E-Mails an diesen Empfänger'
          }
        ],
        supportsGroups: true
      }
    }

    super('email', targetSchemas)
    this.dataFileName = 'targets.json'
  }

  validateBaseField(email: string, type?: string): boolean {
    return EmailTargetService.isValidEmailFormat(email)
  }

  protected normalizeBaseField(value: string): string {
    return value.trim().toLowerCase()
  }
}
