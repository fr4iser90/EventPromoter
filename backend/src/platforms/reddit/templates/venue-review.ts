import { RedditTemplate } from './types'

export const venueReviewTemplate: RedditTemplate = {
  id: 'venue-review',
  name: 'Venue Review',
  description: 'A Reddit post template for reviewing venues after events',
  category: 'review',
  template: {
    title: 'Venue Review: {venue} - {rating}/10',
    text: `Just experienced an event at {venue} and wanted to share my thoughts.

**Venue:** {venue}
**Location:** {city}
**Event:** {title}
**Date:** {date}

**Rating:** {rating}/10

**What I liked:**
- {positives}

**What could be improved:**
- {improvements}

**Atmosphere:** {atmosphere}
**Sound quality:** {soundQuality}/10
**Crowd:** {crowdDescription}

Would I go back? {recommendation}

#VenueReview #Nightlife #Club #Event`
  },
  translations: {
    de: {
      name: 'Venue-Review',
      description: 'Reddit-Post-Vorlage fuer Venue-Reviews nach Events',
      template: {
        title: 'Venue-Review: {venue} - {rating}/10',
        text: `War gerade bei einem Event im {venue} und wollte meine Eindruecke teilen.

**Venue:** {venue}
**Ort:** {city}
**Event:** {title}
**Datum:** {date}

**Bewertung:** {rating}/10

**Was ich gut fand:**
- {positives}

**Was besser sein koennte:**
- {improvements}

**Atmosphaere:** {atmosphere}
**Soundqualitaet:** {soundQuality}/10
**Publikum:** {crowdDescription}

Wuerde ich wieder hingehen? {recommendation}

#VenueReview #Nachtleben #Club #Event`
      }
    },
    es: {
      name: 'Resena del Venue',
      description: 'Plantilla de Reddit para resenar venues despues de eventos',
      template: {
        title: 'Resena del venue: {venue} - {rating}/10',
        text: `Acabo de vivir un evento en {venue} y queria compartir mi opinion.

**Venue:** {venue}
**Ubicacion:** {city}
**Evento:** {title}
**Fecha:** {date}

**Valoracion:** {rating}/10

**Lo que me gusto:**
- {positives}

**Lo que podria mejorar:**
- {improvements}

**Ambiente:** {atmosphere}
**Calidad de sonido:** {soundQuality}/10
**Publico:** {crowdDescription}

Volveria? {recommendation}

#ResenaVenue #VidaNocturna #Club #Evento`
      }
    }
  },
  variables: ['venue', 'rating', 'city', 'eventTitle', 'date', 'positives', 'improvements', 'atmosphere', 'soundQuality', 'crowdDescription', 'recommendation'],
  recommendedSubreddits: ['r/nightlife', 'r/clubs', 'r/party'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

