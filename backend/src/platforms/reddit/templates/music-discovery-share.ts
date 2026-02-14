import { RedditTemplate } from './types'

export const musicDiscoveryShareTemplate: RedditTemplate = {
  id: 'music-discovery',
  name: 'Music Discovery Share',
  description: 'A Reddit post template for sharing music discoveries from events',
  category: 'music',
  template: {
    title: 'Just discovered this amazing track - thoughts?',
    text: `Found this track through {title} at {venue} and it's been on repeat!

**Track:** {trackName}
**Artist:** {artist}
**Played at:** {title} - {venue}, {city}

**Why I love it:**
- {reasons}

Have you heard this? What do you think? Any similar recommendations?

**Listen here:** {link}

#Music #Discovery #Electronic #Techno`
  },
  translations: {
    de: {
      name: 'Musik-Discovery Share',
      description: 'Reddit-Post-Vorlage zum Teilen neuer Musik-Entdeckungen von Events',
      template: {
        title: 'Neuen Track entdeckt - was sagt ihr?',
        text: `Habe den Track ueber {title} im {venue} entdeckt und hoere ihn seitdem rauf und runter!

**Track:** {trackName}
**Artist:** {artist}
**Gespielt bei:** {title} - {venue}, {city}

**Warum ich ihn feiere:**
- {reasons}

Kennt ihr den schon? Was denkt ihr? Aehnliche Empfehlungen?

**Hier reinhoeren:** {link}

#Musik #Discovery #Elektronisch #Techno`
      }
    },
    es: {
      name: 'Compartir Descubrimiento Musical',
      description: 'Plantilla de Reddit para compartir descubrimientos musicales desde eventos',
      template: {
        title: 'Acabo de descubrir este track - opiniones?',
        text: `Descubri este track en {title} en {venue} y no he parado de escucharlo.

**Track:** {trackName}
**Artista:** {artist}
**Sonando en:** {title} - {venue}, {city}

**Por que me encanta:**
- {reasons}

Ya lo habian escuchado? Que opinan? Recomendaciones similares?

**Escuchalo aqui:** {link}

#Musica #Discovery #Electronica #Techno`
      }
    }
  },
  variables: ['eventTitle', 'venue', 'trackName', 'artist', 'city', 'reasons', 'link'],
  recommendedSubreddits: ['r/electronicmusic', 'r/Techno', 'r/Music'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

