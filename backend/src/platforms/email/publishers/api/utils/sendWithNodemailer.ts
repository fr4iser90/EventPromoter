/**
 * Send with Nodemailer
 * 
 * Sends email using nodemailer SMTP transport
 * 
 * @module platforms/email/publishers/api/utils/sendWithNodemailer
 */

import { PostResult } from '../../../../../types/index.js'
import { ResolvedAttachment } from './resolveAttachments.js'

export async function sendWithNodemailer(
  credentials: any,
  recipients: string[],
  subject: string,
  html: string,
  text: string,
  attachments: ResolvedAttachment[],
  cc?: string,
  bcc?: string
): Promise<PostResult> {
  // Dynamic import to avoid requiring nodemailer if not installed
  // @ts-ignore - nodemailer is optional dependency
  const nodemailer = await import('nodemailer')

  const transporter = nodemailer.createTransport({
    host: credentials.host,
    port: credentials.port,
    secure: credentials.port === 465,
    auth: {
      user: credentials.username,
      pass: credentials.password
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })

  const nodemailerAttachments = attachments.map(file => {
    const attachment: any = {
      filename: file.filename,
      content: file.buffer,
      contentType: file.contentType
    }
    
    // Set Content-ID for embedded images (CID)
    if (file.cid) {
      attachment.cid = file.cid
    }
    
    return attachment
  })

  const mailOptions: any = {
    from: `"${credentials.fromName}" <${credentials.fromEmail}>`,
    to: recipients.join(', '),
    subject: subject,
    text: text,
    html: html,
    attachments: nodemailerAttachments.length > 0 ? nodemailerAttachments : undefined
  }

  // Add CC and BCC if present (same as n8n)
  if (cc) {
    mailOptions.cc = cc
  }
  if (bcc) {
    mailOptions.bcc = bcc
  }

  console.log(`[Email API] Calling transporter.sendMail()...`)
  try {
    const sendMailPromise = transporter.sendMail(mailOptions)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SMTP timeout after 30s')), 30000)
    })
    
    const result = await Promise.race([sendMailPromise, timeoutPromise]) as any
    console.log(`[Email API] sendMail() completed: ${result.messageId}`)

    return {
      success: true,
      postId: result.messageId
    }
  } catch (error: any) {
    console.error(`[Email API] sendMail() failed:`, error.message)
    return {
      success: false,
      error: error.message || 'Failed to send email via SMTP'
    }
  }
}
