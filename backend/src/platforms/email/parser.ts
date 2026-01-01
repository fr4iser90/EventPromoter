import { ParsedEventData, PlatformContent, PlatformParser } from '../../types/index.js'

export class EmailParser implements PlatformParser {
  static parse(eventData: ParsedEventData): PlatformContent {
    const subject = `🎵 ${eventData.title || 'Event Invitation'}`

    // HTML version
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">${eventData.title || 'Event Invitation'}</h1>
    `

    if (eventData.date) {
      const date = new Date(eventData.date)
      const formattedDate = date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      html += `<p><strong>📅 Datum:</strong> ${formattedDate}</p>`

      if (eventData.time) {
        html += `<p><strong>⏰ Uhrzeit:</strong> ${eventData.time} Uhr</p>`
      }
    }

    if (eventData.venue) {
      html += `<p><strong>📍 Ort:</strong> ${eventData.venue}`
      if (eventData.city) {
        html += `, ${eventData.city}`
      }
      html += `</p>`
    }

    if (eventData.description) {
      html += `<p><strong>🎵 Beschreibung:</strong></p>`
      html += `<p>${eventData.description.replace(/\n/g, '<br>')}</p>`
    }

    if (eventData.price) {
      html += `<p><strong>💰 Eintritt:</strong> ${eventData.price}</p>`
    }

    if (eventData.website) {
      html += `<p><a href="${eventData.website}" style="color: #007bff;">🔗 Mehr Informationen</a></p>`
    }

    html += `
        <p style="margin-top: 30px;">
          <strong>Wir freuen uns auf euch! 🎉</strong>
        </p>
      </div>
    `

    // Plain text version
    let text = `${eventData.title || 'Event Invitation'}\n\n`

    if (eventData.date) {
      const date = new Date(eventData.date)
      const formattedDate = date.toLocaleDateString('de-DE')
      text += `Datum: ${formattedDate}\n`

      if (eventData.time) {
        text += `Uhrzeit: ${eventData.time} Uhr\n`
      }
    }

    if (eventData.venue) {
      text += `Ort: ${eventData.venue}`
      if (eventData.city) {
        text += `, ${eventData.city}`
      }
      text += '\n'
    }

    if (eventData.description) {
      text += `\nBeschreibung:\n${eventData.description}\n`
    }

    if (eventData.price) {
      text += `\nEintritt: ${eventData.price}\n`
    }

    if (eventData.website) {
      text += `\nMehr Informationen: ${eventData.website}\n`
    }

    text += `\nWir freuen uns auf euch!\n`

    return {
      text,
      metadata: {
        platform: 'email',
        subject,
        html,
        contentType: 'multipart/alternative'
      }
    }
  }
}
