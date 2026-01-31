import helmet from 'helmet'

/**
 * Helmet configuration middleware
 * 
 * Logik:
 * - crossOriginResourcePolicy: "cross-origin" erlaubt dem Frontend (Port 3000), 
 *   Bilder vom Backend (Port 4000) anzuzeigen.
 * - contentSecurityPolicy: Deaktiviert im Development, um Konflikte mit 
 *   Material-UI Styles und React-Skripten zu vermeiden.
 */
export const helmetConfig = {
  crossOriginResourcePolicy: { policy: "cross-origin" as const },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}

export const helmetMiddleware = helmet(helmetConfig)
