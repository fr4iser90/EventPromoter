/**
 * Email Recipient Service
 * 
 * Handles all recipient management logic for the email platform.
 * This is platform-specific business logic that belongs in the backend.
 * 
 * @module platforms/email/recipientService
 */

import { ConfigService } from '../../services/configService.js'
import { EmailValidator } from './validator.js'

export class EmailRecipientService {
  /**
   * Get all recipients and groups
   */
  static async getRecipients() {
    // ✅ GENERIC: Use generic config method instead of hardcoded getEmailConfig()
    const config = await ConfigService.getConfig('emails')
    return {
      available: config?.available || [],
      groups: config?.groups || {},
      selected: config?.selected || []
    }
  }

  /**
   * Add a new recipient
   */
  static async addRecipient(email: string) {
    const emailLower = email.trim().toLowerCase()
    
    // Validate email
    if (!EmailValidator.validateEmail(emailLower)) {
      return { success: false, error: 'Invalid email format' }
    }

    // ✅ GENERIC: Use generic config method instead of hardcoded getEmailConfig()
    const config = await ConfigService.getConfig('emails')
    const available = config?.available || []

    if (available.includes(emailLower)) {
      return { success: false, error: 'Email already exists' }
    }

    const updated = {
      ...config,
      available: [...available, emailLower]
    }

    // ✅ GENERIC: Use generic config method instead of hardcoded saveEmailConfig()
    await ConfigService.saveConfig('emails', updated)
    return { success: true, email: emailLower }
  }

  /**
   * Remove a recipient
   */
  static async removeRecipient(email: string) {
    // ✅ GENERIC: Use generic config method
    const config = await ConfigService.getConfig('emails')
    const available = (config?.available || []).filter((e: string) => e !== email)
    const groups = { ...(config?.groups || {}) }

    // Remove from all groups
    Object.keys(groups).forEach(groupName => {
      groups[groupName] = groups[groupName].filter((e: string) => e !== email)
    })

    const updated = {
      ...config,
      available,
      groups
    }

    // ✅ GENERIC: Use generic config method
    await ConfigService.saveConfig('emails', updated)
    return { success: true }
  }

  /**
   * Create a recipient group
   */
  static async createGroup(groupName: string, emails: string[]) {
    const normalizedEmails = emails
      .map(e => e.trim().toLowerCase())
      .filter(e => EmailValidator.validateEmail(e))

    if (normalizedEmails.length === 0) {
      return { success: false, error: 'No valid emails provided' }
    }

    // ✅ GENERIC: Use generic config method
    const config = await ConfigService.getConfig('emails')
    const groups = config?.groups || {}

    if (groups[groupName]) {
      return { success: false, error: 'Group already exists' }
    }

    // Add emails to available list if not already there
    const available = [...(config?.available || [])]
    normalizedEmails.forEach(email => {
      if (!available.includes(email)) {
        available.push(email)
      }
    })

    const updated = {
      ...config,
      available,
      groups: {
        ...groups,
        [groupName]: normalizedEmails
      }
    }

    // ✅ GENERIC: Use generic config method
    await ConfigService.saveConfig('emails', updated)
    return { success: true, group: { name: groupName, emails: normalizedEmails } }
  }

  /**
   * Update a recipient group
   */
  static async updateGroup(groupName: string, emails: string[]) {
    const normalizedEmails = emails
      .map((e: string) => e.trim().toLowerCase())
      .filter((e: string) => EmailValidator.validateEmail(e))

    if (normalizedEmails.length === 0) {
      return { success: false, error: 'No valid emails provided' }
    }

    // ✅ GENERIC: Use generic config method
    const config = await ConfigService.getConfig('emails')
    const groups = config?.groups || {}

    if (!groups[groupName]) {
      return { success: false, error: 'Group does not exist' }
    }

    // Add emails to available list if not already there
    const available = [...(config?.available || [])]
    normalizedEmails.forEach(email => {
      if (!available.includes(email)) {
        available.push(email)
      }
    })

    const updated = {
      ...config,
      available,
      groups: {
        ...groups,
        [groupName]: normalizedEmails
      }
    }

    // ✅ GENERIC: Use generic config method
    await ConfigService.saveConfig('emails', updated)
    return { success: true, group: { name: groupName, emails: normalizedEmails } }
  }

  /**
   * Delete a recipient group
   */
  static async deleteGroup(groupName: string) {
    // ✅ GENERIC: Use generic config method
    const config = await ConfigService.getConfig('emails')
    const groups = { ...(config?.groups || {}) }
    delete groups[groupName]

    const updated = {
      ...config,
      groups
    }

    // ✅ GENERIC: Use generic config method
    await ConfigService.saveConfig('emails', updated)
    return { success: true }
  }

  /**
   * Import groups from JSON
   */
  static async importGroups(groupsData: Record<string, string[]>) {
    // ✅ GENERIC: Use generic config method
    const config = await ConfigService.getConfig('emails')
    const groups = { ...(config?.groups || {}) }
    const available = [...(config?.available || [])]

    // Validate and normalize all emails
    Object.entries(groupsData).forEach(([groupName, emails]) => {
      const normalizedEmails = emails
        .map(e => e.trim().toLowerCase())
        .filter(e => EmailValidator.validateEmail(e))

      groups[groupName] = normalizedEmails

      // Add to available list
      normalizedEmails.forEach(email => {
        if (!available.includes(email)) {
          available.push(email)
        }
      })
    })

    const updated = {
      ...config,
      available,
      groups
    }

    // ✅ GENERIC: Use generic config method
    await ConfigService.saveConfig('emails', updated)
    return { success: true, groups }
  }

  /**
   * Export groups as JSON
   */
  static async exportGroups() {
    // ✅ GENERIC: Use generic config method
    const config = await ConfigService.getConfig('emails')
    return {
      success: true,
      groups: config?.groups || {}
    }
  }
}

