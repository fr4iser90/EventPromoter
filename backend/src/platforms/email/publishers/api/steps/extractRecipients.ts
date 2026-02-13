/**
 * Extract Recipients
 * 
 * Extracts email addresses from template targets
 * 
 * @module platforms/email/publishers/api/steps/extractRecipients
 */

import { extractRecipients } from '../utils/extractRecipients.js'
import { EmailRecipient } from '../../../types.js'

export async function extractRecipientsForRun(run: any): Promise<EmailRecipient[]> {
  const recipients = await extractRecipients(run.targets, true) as EmailRecipient[]
  if (recipients.length === 0) {
    throw new Error('No recipients found for template run')
  }
  return recipients
}
