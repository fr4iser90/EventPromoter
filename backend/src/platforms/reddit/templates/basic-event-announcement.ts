import { RedditTemplate } from './types'

export const basicEventAnnouncementTemplate: RedditTemplate = {
  id: 'basic-event',
  name: 'Basic Event Announcement',
  description: 'A simple Reddit post template for basic event announcements',
  category: 'announcement',
  template: {
    title: '[EVENT] {title} - {date}',
    text: `**Event Details:**

📅 **Date:** {date}
🕐 **Time:** {time}
📍 **Location:** {venue}, {city}
📝 **Description:** {description}

🎫 **Tickets/Info:** {link}

#Event #Nightlife`
  },
  translations: {
    de: {
      name: 'Einfache Event-Ankuendigung',
      description: 'Einfache Reddit-Post-Vorlage fuer Basis-Event-Ankuendigungen',
      template: {
        title: '[EVENT] {title} - {date}',
        text: `**Event-Details:**

📅 **Datum:** {date}
🕐 **Uhrzeit:** {time}
📍 **Ort:** {venue}, {city}
📝 **Beschreibung:** {description}

🎫 **Tickets/Info:** {link}

#Event #Nachtleben`
      }
    },
    es: {
      name: 'Anuncio Basico de Evento',
      description: 'Plantilla sencilla de Reddit para anuncios basicos de eventos',
      template: {
        title: '[EVENTO] {title} - {date}',
        text: `**Detalles del evento:**

📅 **Fecha:** {date}
🕐 **Hora:** {time}
📍 **Lugar:** {venue}, {city}
📝 **Descripcion:** {description}

🎫 **Entradas/Info:** {link}

#Evento #VidaNocturna`
      }
    }
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link'],
  recommendedSubreddits: ['r/events', 'r/party', 'r/music'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

