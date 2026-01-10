/**
 * Token Resolver
 * 
 * Resolves semantic tokens (e.g., "email.surface.primary") to concrete values
 * based on dark mode state. Tokens are platform-specific and resolved using
 * platform token maps.
 * 
 * @module utils/tokenResolver
 */

/**
 * Token Pattern: <platform>.<category>.<path...>
 * Minimum 3 segments, flexible depth
 */
const TOKEN_PATTERN = /^[a-z0-9_-]+\.[a-z0-9_-]+(\.[a-z0-9_-]+)+$/

/**
 * Token value with Light/Dark variants
 */
export interface TokenValue {
  light: string
  dark: string
}

/**
 * Token map structure (nested object)
 */
export type TokenMap = Record<string, any>

/**
 * Check if a string is a valid token
 */
export function isValidToken(token: string): boolean {
  return TOKEN_PATTERN.test(token)
}

/**
 * Check if a value is a token (not a hex color or concrete value)
 */
export function isToken(value: string): boolean {
  // Hex colors start with #, tokens don't
  if (value.startsWith('#')) {
    return false
  }
  // Check pattern
  return isValidToken(value)
}

/**
 * Resolve a token to a concrete value
 * 
 * @param token - Token string (e.g., "email.surface.primary")
 * @param tokenMap - Platform token map
 * @param darkMode - Dark mode state
 * @returns Resolved value or original token if not found
 */
export function resolveToken(
  token: string,
  tokenMap: TokenMap,
  darkMode: boolean
): string {
  // Validate token pattern
  if (!isValidToken(token)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[TokenResolver] Invalid token pattern: ${token}`)
    }
    return token
  }

  // Parse token: "email.surface.primary" → ["email", "surface", "primary"]
  const parts = token.split('.')
  const platformId = parts[0]  // "email" (not used, but validated)
  const path = parts.slice(1)  // ["surface", "primary"]

  // Navigate through token map
  let current: any = tokenMap
  for (const segment of path) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment]
    } else {
      // Token path not found
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[TokenResolver] Token not found: ${token}`)
      }
      return token  // Return original token unchanged
    }
  }

  // Check if we have a TokenValue (with light/dark)
  if (current && typeof current === 'object' && 'light' in current && 'dark' in current) {
    return darkMode ? current.dark : current.light
  }

  // If it's a string, return it directly (might be a nested token or final value)
  if (typeof current === 'string') {
    return current
  }

  // Fallback: token not found
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[TokenResolver] Token value not resolved: ${token}`)
  }
  return token
}

/**
 * Recursively resolve all tokens in an object
 */
export function resolveTokensInObject(
  obj: any,
  tokenMap: TokenMap,
  darkMode: boolean
): any {
  if (typeof obj === 'string' && isToken(obj)) {
    return resolveToken(obj, tokenMap, darkMode)
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveTokensInObject(item, tokenMap, darkMode))
  }

  if (obj && typeof obj === 'object') {
    const resolved: any = {}
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveTokensInObject(value, tokenMap, darkMode)
    }
    return resolved
  }

  return obj
}

/**
 * Load platform token map
 * 
 * @param platformId - Platform identifier
 * @returns Token map or empty object if not found
 */
export async function loadPlatformTokenMap(platformId: string): Promise<TokenMap> {
  try {
    // Try to import platform tokens
    // Pattern: platforms/email/tokens.ts exports emailTokens
    const tokensModule = await import(`../platforms/${platformId}/tokens.js`)
    
    // Try named export: emailTokens, discordTokens, etc.
    const tokenExportName = `${platformId}Tokens`
    if (tokensModule && tokensModule[tokenExportName]) {
      return tokensModule[tokenExportName]
    }
    
    // Try camelCase: emailTokens -> emailTokens (already tried above)
    // Try default export
    if (tokensModule.default) {
      return tokensModule.default
    }
    
    // Try any export that looks like tokens
    for (const [key, value] of Object.entries(tokensModule)) {
      if (key.toLowerCase().includes('token') && typeof value === 'object') {
        return value as TokenMap
      }
    }
  } catch (error: any) {
    // Platform doesn't have tokens.ts - that's OK
    if (!error.message.includes('Cannot find module')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[TokenResolver] Failed to load tokens for ${platformId}:`, error.message)
      }
    }
  }
  return {}
}

/**
 * Resolve all tokens in a platform schema
 * 
 * @param schema - Platform schema (with tokens)
 * @param platformId - Platform identifier
 * @param darkMode - Dark mode state
 * @returns Resolved schema (with concrete values)
 */
export async function resolveSchema(
  schema: any,
  platformId: string,
  darkMode: boolean
): Promise<any> {
  // Load platform token map
  const tokenMap = await loadPlatformTokenMap(platformId)

  // If no token map, return schema unchanged
  if (!tokenMap || Object.keys(tokenMap).length === 0) {
    return schema
  }

  // Resolve all tokens in schema
  return resolveTokensInObject(schema, tokenMap, darkMode)
}

