// Utility functions for request handling
import { Request } from 'express'

/**
 * Extract first value from comma-separated header values
 * (e.g. "https,http" -> "https")
 */
function firstHeaderValue(value?: string): string | undefined {
  return value?.split(',')[0]?.trim()
}

/**
 * Get base URL from request - proxy-safe implementation
 * 
 * Handles all cases:
 * - Direct requests (localhost, LAN IP)
 * - Reverse proxy (X-Forwarded-* headers)
 * - Multiple forwarded values (takes first)
 * 
 * @param req Express request object
 * @returns Base URL (e.g. "http://localhost:4000" or "https://api.example.com")
 * @throws Error if host cannot be determined
 */
export function getBaseUrlFromRequest(req: Request): string {
  const protocol =
    firstHeaderValue(req.get('x-forwarded-proto')) ||
    req.protocol ||
    'http'

  const host =
    firstHeaderValue(req.get('x-forwarded-host')) ||
    req.get('host')

  if (!host) {
    throw new Error('Cannot determine base URL from request: missing host header')
  }

  return `${protocol}://${host}`
}
