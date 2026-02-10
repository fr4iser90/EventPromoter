/**
 * Step 6: Send Email
 * 
 * Sends email via SMTP using nodemailer
 * 
 * @module platforms/email/publishers/api/steps/step6_SendEmail
 */

import { PostResult } from '../../../../../types/index.js'
import { ResolvedAttachment } from '../utils/resolveAttachments.js'
import { sendWithNodemailer } from '../utils/sendWithNodemailer.js'
import { htmlToText } from '../utils/htmlToText.js'

export async function step6_SendEmail(
  credentials: any,
  recipients: string[],
  subject: string,
  html: string,
  processedAttachments: ResolvedAttachment[],
  content: any
): Promise<PostResult> {
  const text = htmlToText(html)

  // Extract CC and BCC from content (same as n8n)
  const cc = content.cc && Array.isArray(content.cc) && content.cc.length > 0 
    ? content.cc.join(', ') 
    : undefined
  const bcc = content.bcc && Array.isArray(content.bcc) && content.bcc.length > 0 
    ? content.bcc.join(', ') 
    : undefined

  return await sendWithNodemailer(credentials, recipients, subject, html, text, processedAttachments, cc, bcc)
}
