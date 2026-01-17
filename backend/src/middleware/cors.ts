// CORS configuration middleware

import cors from 'cors'

// CORS configuration
// 
// Logik:
// - Wenn CORS_DISABLE=true: CORS komplett deaktiviert (für Reverse Proxy Setup)
// - Wenn CORS_ORIGINS gesetzt: Nur diese Origins erlauben
// - Sonst: Development = localhost:3000, Production = FEHLER (muss konfiguriert werden)
//
// WICHTIG: In Production MUSS entweder CORS_DISABLE=true ODER CORS_ORIGINS gesetzt sein!
// Niemals alle Origins akzeptieren (Sicherheitsrisiko!)
const corsDisabled = process.env.CORS_DISABLE === 'true'

const allowedOrigins = corsDisabled
  ? false // CORS deaktiviert
  : process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : process.env.NODE_ENV === 'production'
      ? (() => {
          console.error('❌ FEHLER: In Production muss CORS_DISABLE=true ODER CORS_ORIGINS gesetzt sein!')
          console.error('   Setze CORS_DISABLE=true wenn alles über Reverse Proxy läuft')
          console.error('   Oder setze CORS_ORIGINS=domain1.com,domain2.com für spezifische Domains')
          return false // Keine Origins erlauben = sicherer Default
        })()
      : ['http://localhost:3000'] // Development: localhost:3000

export const corsConfig = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Cross-Origin-Resource-Policy']
}

export const corsMiddleware = cors(corsConfig)
