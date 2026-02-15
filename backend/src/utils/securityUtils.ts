/**
 * Security Utilities (Hardening)
 * 
 * Centralized security hardening functions for path validation, sanitization,
 * and boundary checks to prevent path traversal, injection, and other attacks.
 * 
 * @module utils/securityUtils
 */

import path from 'path'

// ============================================================================
// Path Segment Validation
// ============================================================================

/**
 * Pattern for safe platform IDs (alphanumeric, underscore, hyphen)
 */
const PLATFORM_ID_PATTERN = /^[a-z0-9_-]+$/i

/**
 * Pattern for safe data source names (alphanumeric, underscore, hyphen, dot)
 */
const DATA_SOURCE_PATTERN = /^[a-z0-9._-]+$/i

/**
 * Pattern for safe filename characters (alphanumeric, underscore, hyphen, dot)
 */
const SAFE_FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/

/**
 * Basic path segment validation (prevents traversal and null bytes)
 * Use for: eventId, generic path segments
 */
export function assertSafePathSegment(segment: string, segmentName: string): void {
  if (
    !segment ||
    segment.includes('\0') ||
    segment.includes('/') ||
    segment.includes('\\') ||
    segment === '.' ||
    segment === '..'
  ) {
    throw new Error(`Invalid ${segmentName}`)
  }
}

/**
 * Validate and sanitize platform ID (alphanumeric, underscore, hyphen only)
 * Use for: platform identifiers
 */
export function sanitizePlatformSegment(platform: string): string {
  const normalized = String(platform || '').trim()
  if (!normalized || !PLATFORM_ID_PATTERN.test(normalized)) {
    throw new Error('Invalid platform ID')
  }
  return normalized
}

/**
 * Validate and sanitize data source name (alphanumeric, underscore, hyphen, dot)
 * Use for: platform data source filenames
 */
export function sanitizeDataSourceSegment(dataSource: string): string {
  const normalized = String(dataSource || '').trim()
  if (
    !normalized ||
    normalized.includes('/') ||
    normalized.includes('\\') ||
    normalized.includes('..') ||
    normalized.includes('\0') ||
    !DATA_SOURCE_PATTERN.test(normalized)
  ) {
    throw new Error('Invalid data source name')
  }
  return normalized
}

/**
 * Validate and sanitize filename (alphanumeric, underscore, hyphen, dot only)
 * Use for: uploaded file names, temp file names
 */
export function sanitizeFilename(filename: string, fallback = 'file'): string {
  const normalized = String(filename || fallback).trim()
  if (!normalized || !SAFE_FILENAME_PATTERN.test(normalized)) {
    // If invalid, sanitize by replacing unsafe chars with underscore
    const sanitized = normalized.replace(/[^a-zA-Z0-9._-]/g, '_')
    return sanitized || fallback
  }
  return normalized
}

/**
 * Sanitize temp filename for downloads/uploads (removes unsafe chars)
 * Use for: temporary file names during API uploads
 */
export function sanitizeTempFilename(name: string, fallback = 'file'): string {
  const normalized = String(name || fallback).trim()
  const safe = normalized.replace(/[^a-zA-Z0-9._-]/g, '_')
  return safe || fallback
}

// ============================================================================
// Path Resolution with Boundary Checks
// ============================================================================

/**
 * Resolve a file path within a base directory with boundary enforcement.
 * Throws if the resolved path escapes the base directory.
 * 
 * @param baseDir - Trusted base directory (must be absolute)
 * @param relativePath - Relative path segment(s) to resolve
 * @param segmentName - Name for error messages (e.g., 'filename', 'eventId')
 * @returns Absolute resolved path (guaranteed to be within baseDir)
 */
export function resolveSafePath(
  baseDir: string,
  relativePath: string,
  segmentName: string
): string {
  // Validate base directory is absolute
  const resolvedBase = path.resolve(baseDir)
  if (!path.isAbsolute(resolvedBase)) {
    throw new Error('Base directory must be absolute')
  }

  // Validate path segment
  assertSafePathSegment(relativePath, segmentName)

  // Resolve full path
  const resolvedPath = path.resolve(resolvedBase, relativePath)

  // Enforce boundary: resolved path must be within base directory
  if (resolvedPath !== resolvedBase && !resolvedPath.startsWith(`${resolvedBase}${path.sep}`)) {
    throw new Error(`Path traversal detected: ${segmentName}`)
  }

  return resolvedPath
}

/**
 * Resolve a file path with multiple segments (e.g., eventId + filename)
 * Validates each segment and enforces boundary.
 * 
 * @param baseDir - Trusted base directory (must be absolute)
 * @param segments - Path segments to join (each will be validated)
 * @param segmentNames - Names for error messages (must match segments length)
 * @returns Absolute resolved path (guaranteed to be within baseDir)
 */
export function resolveSafePathWithSegments(
  baseDir: string,
  segments: string[],
  segmentNames: string[]
): string {
  if (segments.length !== segmentNames.length) {
    throw new Error('Segments and segmentNames arrays must have same length')
  }

  // Validate base directory
  const resolvedBase = path.resolve(baseDir)
  if (!path.isAbsolute(resolvedBase)) {
    throw new Error('Base directory must be absolute')
  }

  // Validate each segment
  segments.forEach((segment, index) => {
    assertSafePathSegment(segment, segmentNames[index])
  })

  // Resolve full path
  const resolvedPath = path.resolve(resolvedBase, ...segments)

  // Enforce boundary
  if (resolvedPath !== resolvedBase && !resolvedPath.startsWith(`${resolvedBase}${path.sep}`)) {
    throw new Error('Path traversal detected')
  }

  return resolvedPath
}

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Validate and sanitize download URL (prevents SSRF)
 * Only allows http/https protocols and blocks internal hosts.
 * 
 * @param rawUrl - URL string to validate
 * @returns Sanitized URL string
 * @throws Error if URL is unsafe
 */
export function assertSafeDownloadUrl(rawUrl: string): string {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  // Only allow http/https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Unsupported URL protocol (only http/https allowed)')
  }

  // Block internal/localhost hosts (SSRF protection)
  const host = parsed.hostname.toLowerCase()
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.16.') ||
    host.startsWith('172.17.') ||
    host.startsWith('172.18.') ||
    host.startsWith('172.19.') ||
    host.startsWith('172.20.') ||
    host.startsWith('172.21.') ||
    host.startsWith('172.22.') ||
    host.startsWith('172.23.') ||
    host.startsWith('172.24.') ||
    host.startsWith('172.25.') ||
    host.startsWith('172.26.') ||
    host.startsWith('172.27.') ||
    host.startsWith('172.28.') ||
    host.startsWith('172.29.') ||
    host.startsWith('172.30.') ||
    host.startsWith('172.31.')
  ) {
    throw new Error('Blocked internal/private network URL (SSRF protection)')
  }

  return parsed.toString()
}

// ============================================================================
// Export Patterns (for reuse in other modules if needed)
// ============================================================================

export const SECURITY_PATTERNS = {
  PLATFORM_ID: PLATFORM_ID_PATTERN,
  DATA_SOURCE: DATA_SOURCE_PATTERN,
  FILENAME: SAFE_FILENAME_PATTERN
} as const
