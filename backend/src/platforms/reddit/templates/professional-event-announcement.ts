import { RedditTemplate } from './types'

export const professionalEventAnnouncementTemplate: RedditTemplate = {
  id: 'professional-event',
  name: 'Professional Event Announcement',
  description: 'A formal Reddit post template for professional events and networking',
  category: 'announcement',
  template: {
    title: '[EVENT] {title} - {date}',
    text: `**Event Announcement**

We are pleased to announce {title}.

**Event Details:**
- **Date:** {date}
- **Time:** {time}
- **Location:** {venue}, {city}
- **Description:** {description}

**Additional Information:** {link}

This event promises to be an excellent opportunity for networking and professional development.

#Event #Networking #ProfessionalDevelopment`
  },
  translations: {
    de: {
      name: 'Professionelle Event-Ankuendigung',
      description: 'Formelle Reddit-Post-Vorlage fuer professionelle Events und Networking',
      template: {
        title: '[EVENT] {title} - {date}',
        text: `**Event-Ankuendigung**

Wir freuen uns, {title} anzukuendigen.

**Event-Details:**
- **Datum:** {date}
- **Uhrzeit:** {time}
- **Ort:** {venue}, {city}
- **Beschreibung:** {description}

**Weitere Informationen:** {link}

Dieses Event bietet eine hervorragende Gelegenheit fuer Networking und fachlichen Austausch.

#Event #Networking #ProfessionalDevelopment`
      }
    },
    es: {
      name: 'Anuncio Profesional de Evento',
      description: 'Plantilla formal de Reddit para eventos profesionales y networking',
      template: {
        title: '[EVENTO] {title} - {date}',
        text: `**Anuncio de evento**

Nos complace anunciar {title}.

**Detalles del evento:**
- **Fecha:** {date}
- **Hora:** {time}
- **Lugar:** {venue}, {city}
- **Descripcion:** {description}

**Informacion adicional:** {link}

Este evento promete ser una excelente oportunidad para networking y desarrollo profesional.

#Evento #Networking #DesarrolloProfesional`
      }
    }
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link'],
  recommendedSubreddits: ['r/networking', 'r/professional', 'r/events'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

