// Utility functions for request handling
import { Request } from 'express'
import os from 'os'

/**
 * Extract first value from comma-separated header values
 * (e.g. "https,http" -> "https")
 */
function firstHeaderValue(value?: string): string | undefined {
  return value?.split(',')[0]?.trim()
}

/**
 * Get network IP address (non-localhost IPv4)
 * Returns the first non-internal IPv4 address found
 */
function getNetworkIP(): string | null {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return null
}

/**
 * Get base URL from request - proxy-safe implementation with auto-detection
 * 
 * Handles all cases:
 * - Direct requests (localhost, LAN IP)
 * - Reverse proxy (X-Forwarded-* headers)
 * - Multiple forwarded values (takes first)
 * - AUTO-DETECTION: If localhost detected, uses network IP for n8n compatibility
 * 
 * @param req Express request object
 * @returns Base URL (e.g. "http://192.168.178.20:4000" or "https://api.example.com")
 * @throws Error if host cannot be determined
 */
export function getBaseUrlFromRequest(req: Request): string {
  const protocol =
    firstHeaderValue(req.get('x-forwarded-proto')) ||
    req.protocol ||
    'http'

  let host =
    firstHeaderValue(req.get('x-forwarded-host')) ||
    req.get('host')

  if (!host) {
    throw new Error('Cannot determine base URL from request: missing host header')
  }

  // AUTO-DETECTION: If host is localhost/127.0.0.1, use network IP instead
  // This allows n8n (on different machine) to reach the backend
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    const networkIP = getNetworkIP()
    if (networkIP) {
      // Replace localhost with network IP, keep port
      const port = host.split(':')[1] || '4000'
      host = `${networkIP}:${port}`
    }
  }

  return `${protocol}://${host}`
}
