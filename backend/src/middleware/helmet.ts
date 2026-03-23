import helmet from 'helmet'

/**
 * Helmet configuration middleware
 * 
 * Security Headers für das Backend:
 * - HSTS: Wird NICHT hier gesetzt (sollte im Reverse Proxy gesetzt werden)
 * - CSP: Konfiguriert für Production, deaktiviert im Development
 * - X-Frame-Options: Verhindert Clickjacking
 * - X-Content-Type-Options: Verhindert MIME-Sniffing
 * - Referrer-Policy: Steuert Referrer-Informationen
 * - Permissions-Policy: Steuert Browser-Features
 * 
 * WICHTIG bei Reverse Proxy:
 * - HSTS sollte im Reverse Proxy (nginx/Traefik) gesetzt werden, nicht hier
 * - Andere Headers können hier gesetzt werden und werden durch den Proxy durchgereicht
 */
export const helmetConfig = {
  // Cross-Origin Resource Policy: Erlaubt Frontend, Bilder vom Backend zu laden
  crossOriginResourcePolicy: { policy: "cross-origin" as const },
  
  // Content Security Policy: In Production aktiviert, in Development deaktiviert
  contentSecurityPolicy: process.env.NODE_ENV === 'production' 
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // React benötigt unsafe-inline/eval
          styleSrc: ["'self'", "'unsafe-inline'"], // Material-UI benötigt unsafe-inline
          imgSrc: ["'self'", "data:", "https:"], // Erlaubt Bilder von HTTPS und data URIs
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      }
    : false, // Im Development deaktiviert für einfacheres Debugging
  
  // X-Frame-Options: Verhindert Einbetten in iframes (Clickjacking-Schutz)
  frameguard: { action: 'deny' as const },
  
  // X-Content-Type-Options: Verhindert MIME-Type-Sniffing
  noSniff: true,
  
  // Referrer-Policy: Steuert, welche Referrer-Informationen gesendet werden
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' as const },
  
  // Permissions-Policy: Deaktiviert unnötige Browser-Features
  permittedCrossDomainPolicies: false,
  
  // HSTS: NICHT hier setzen! Sollte im Reverse Proxy gesetzt werden
  // Wenn kein Reverse Proxy vorhanden ist, kann man es hier aktivieren:
  // strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true }
}

export const helmetMiddleware = helmet(helmetConfig)
