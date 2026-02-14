import { RedditTemplate } from './types'

export const djSetDiscussionTemplate: RedditTemplate = {
  id: 'dj-set-discussion',
  name: 'DJ Set Discussion',
  description: 'A Reddit post template for discussing DJ sets and track highlights',
  category: 'discussion',
  template: {
    title: 'DJ {djName} at {venue} - Set Discussion',
    text: `Just caught DJ {djName} at {venue} last night and wanted to discuss the set!

**Event:** {title}
**Venue:** {venue}, {city}
**Date:** {date}

**What I loved:**
- {highlights}

**Track highlights:**
- {tracks}

Thoughts? What did you think of the set? Any recommendations for similar DJs?

#DJ #Techno #Electronic #Music`
  },
  translations: {
    de: {
      name: 'DJ-Set Diskussion',
      description: 'Reddit-Post-Vorlage fuer Diskussionen ueber DJ-Sets und Track-Highlights',
      template: {
        title: 'DJ {djName} im {venue} - Set-Diskussion',
        text: `War gestern bei DJ {djName} im {venue} und wollte das Set mit euch besprechen!

**Event:** {title}
**Venue:** {venue}, {city}
**Datum:** {date}

**Was ich gefeiert habe:**
- {highlights}

**Track-Highlights:**
- {tracks}

Was meint ihr? Wie fandet ihr das Set? Empfehlungen fuer aehnliche DJs?

#DJ #Techno #Elektronisch #Musik`
      }
    },
    es: {
      name: 'Discusion de Set DJ',
      description: 'Plantilla de Reddit para debatir sets de DJ y tracks destacados',
      template: {
        title: 'DJ {djName} en {venue} - Discusion del set',
        text: `Ayer vi a DJ {djName} en {venue} y queria comentar el set con ustedes.

**Evento:** {title}
**Venue:** {venue}, {city}
**Fecha:** {date}

**Lo que mas me gusto:**
- {highlights}

**Tracks destacados:**
- {tracks}

Que opinan? Que les parecio el set? Recomendaciones de DJs similares?

#DJ #Techno #Electronica #Musica`
      }
    }
  },
  variables: ['djName', 'venue', 'eventTitle', 'city', 'date', 'highlights', 'tracks'],
  recommendedSubreddits: ['r/Techno', 'r/electronicmusic', 'r/DJs'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

