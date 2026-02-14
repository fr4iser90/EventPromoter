import { RedditTemplate } from './types'

export const eventAnnouncementTemplate: RedditTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  description: 'A Reddit post template for announcing events with markdown formatting',
  category: 'announcement',
  template: {
    title: '[EVENT] {title} - {date}',
    text: `**Event Details:**

📅 **Date:** {date}
🕐 **Time:** {time}
📍 **Location:** {venue}, {city}
📝 **Description:** {description}

🎫 **Tickets/Info:** {link}

---

We're excited to announce {title}! This promises to be an amazing event with great music, atmosphere, and people.

**What to expect:**
- {highlights}

Feel free to ask questions in the comments! 🎉

#Event #Music #Nightlife`
  },
  translations: {
    de: {
      name: 'Event-Ankuendigung',
      description: 'Reddit-Post-Vorlage zur Ankuendigung von Events mit Markdown-Formatierung',
      template: {
        title: '[EVENT] {title} - {date}',
        text: `**Event-Details:**

📅 **Datum:** {date}
🕐 **Uhrzeit:** {time}
📍 **Ort:** {venue}, {city}
📝 **Beschreibung:** {description}

🎫 **Tickets/Info:** {link}

---

Wir freuen uns, {title} anzukuendigen! Es wird ein grossartiges Event mit starker Musik, guter Stimmung und coolen Leuten.

**Was dich erwartet:**
- {highlights}

Fragen gerne in die Kommentare! 🎉

#Event #Musik #Nachtleben`
      }
    },
    es: {
      name: 'Anuncio de Evento',
      description: 'Plantilla de Reddit para anunciar eventos con formato Markdown',
      template: {
        title: '[EVENTO] {title} - {date}',
        text: `**Detalles del evento:**

📅 **Fecha:** {date}
🕐 **Hora:** {time}
📍 **Lugar:** {venue}, {city}
📝 **Descripcion:** {description}

🎫 **Entradas/Info:** {link}

---

Nos alegra anunciar {title}. Sera un evento increible con gran musica, ambiente y gente.

**Que puedes esperar:**
- {highlights}

Si tienes preguntas, dejalas en los comentarios. 🎉

#Evento #Musica #VidaNocturna`
      }
    }
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link', 'highlights'],
  recommendedSubreddits: ['r/events', 'r/party', 'r/music'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

