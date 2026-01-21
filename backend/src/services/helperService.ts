/**
 * Helper Service
 * 
 * Unified helper loading system for platforms.
 * Discovers and loads helpers from platform helpers directories.
 * 
 * @module services/helperService
 */

import { readFile, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Helper content interface
 */
export interface HelperContent {
  id: string
  type: 'text' | 'markdown' | 'structured'
  displayMode: 'tooltip' | 'dialog' | 'inline'
  content: string | Record<string, any>
  title?: Record<string, string>
  short?: Record<string, string>
  contexts: string[]
  file?: string  // For markdown helpers
}

/**
 * Helper index interface
 */
export interface HelperIndex {
  version: string
  helpers: Record<string, Omit<HelperContent, 'id' | 'content'> & { content?: string | Record<string, any> }>
}

/**
 * Helper cache
 */
const helperCache = new Map<string, HelperContent>()
const helperIndexCache = new Map<string, HelperIndex>()

/**
 * Supported languages
 */
const SUPPORTED_LANGUAGES = ['en', 'de', 'es']

/**
 * Load helper index for a platform or global
 */
async function loadHelperIndex(platformId: string | 'global'): Promise<HelperIndex | null> {
  const cacheKey = platformId
  
  // Check cache first
  if (helperIndexCache.has(cacheKey)) {
    return helperIndexCache.get(cacheKey)!
  }

  try {
    const helperPath = platformId === 'global'
      ? join(__dirname, '../helpers/index.json')
      : join(__dirname, `../platforms/${platformId}/helpers/index.json`)
    
    try {
      await access(helperPath)
    } catch {
      // No helpers directory, return null
      helperIndexCache.set(cacheKey, { version: '1.0.0', helpers: {} })
      return null
    }

    const content = await readFile(helperPath, 'utf-8')
    const index = JSON.parse(content) as HelperIndex
    helperIndexCache.set(cacheKey, index)
    return index
  } catch (error) {
    console.warn(`Failed to load helper index for ${platformId}:`, error)
    helperIndexCache.set(cacheKey, { version: '1.0.0', helpers: {} })
    return null
  }
}

/**
 * Load markdown content from file
 */
async function loadMarkdownContent(
  platformId: string | 'global',
  filename: string
): Promise<string | null> {
  try {
    const mdPath = platformId === 'global'
      ? join(__dirname, `../helpers/${filename}`)
      : join(__dirname, `../platforms/${platformId}/helpers/${filename}`)
    
    try {
      await access(mdPath)
    } catch {
      return null
    }

    return await readFile(mdPath, 'utf-8')
  } catch (error) {
    console.warn(`Failed to load markdown file ${filename} for ${platformId}:`, error)
    return null
  }
}

/**
 * Load a specific helper content
 */
async function loadHelper(
  platformId: string | 'global',
  helperId: string,
  lang: string = 'en'
): Promise<HelperContent | null> {
  const cacheKey = `${platformId}:${helperId}:${lang}`
  
  // Check cache first
  if (helperCache.has(cacheKey)) {
    return helperCache.get(cacheKey)!
  }

  try {
    const index = await loadHelperIndex(platformId)
    if (!index || !index.helpers[helperId]) {
      return null
    }

    const helperDef = index.helpers[helperId]
    
    // Load content based on type
    let content: string | Record<string, any>
    
    if (helperDef.type === 'markdown' && helperDef.file) {
      // Load markdown file
      const mdContent = await loadMarkdownContent(platformId, helperDef.file)
      if (mdContent) {
        content = mdContent
      } else {
        return null
      }
    } else if (helperDef.type === 'text' || helperDef.type === 'structured') {
      // Content is in the index
      content = helperDef.content || ''
    } else {
      return null
    }

    const helper: HelperContent = {
      id: helperId,
      type: helperDef.type,
      displayMode: helperDef.displayMode || 'tooltip',
      content,
      title: helperDef.title,
      short: helperDef.short,
      contexts: helperDef.contexts || [],
      file: helperDef.file
    }

    helperCache.set(cacheKey, helper)
    return helper
  } catch (error) {
    console.error(`Error loading helper ${helperId} for ${platformId}:`, error)
    return null
  }
}

/**
 * Get helper content for a specific helper ID
 * Tries platform-specific first, then falls back to global
 */
export async function getHelperContent(
  helperId: string,
  platformId?: string,
  lang: string = 'en'
): Promise<HelperContent | null> {
  // Normalize language code
  const normalizedLang = lang.split('-')[0]
  
  // Try platform-specific helper first
  if (platformId) {
    const platformHelper = await loadHelper(platformId, helperId, normalizedLang)
    if (platformHelper) {
      return platformHelper
    }
  }
  
  // Fallback to global helper
  const globalHelper = await loadHelper('global', helperId, normalizedLang)
  return globalHelper
}

/**
 * Get all helpers for a platform (merged with global)
 */
export async function getPlatformHelpers(
  platformId: string,
  lang: string = 'en'
): Promise<Record<string, HelperContent>> {
  const normalizedLang = lang.split('-')[0]
  const helpers: Record<string, HelperContent> = {}
  
  // Load global helpers first
  const globalIndex = await loadHelperIndex('global')
  if (globalIndex) {
    for (const helperId of Object.keys(globalIndex.helpers)) {
      const helper = await loadHelper('global', helperId, normalizedLang)
      if (helper) {
        helpers[helperId] = helper
      }
    }
  }
  
  // Load platform-specific helpers (will override global)
  if (platformId && platformId !== 'global') {
    const platformIndex = await loadHelperIndex(platformId)
    if (platformIndex) {
      for (const helperId of Object.keys(platformIndex.helpers)) {
        const helper = await loadHelper(platformId, helperId, normalizedLang)
        if (helper) {
          helpers[helperId] = helper
        }
      }
    }
  }
  
  return helpers
}

/**
 * Clear helper cache
 */
export function clearHelperCache(platformId?: string, helperId?: string, lang?: string): void {
  if (platformId && helperId && lang) {
    helperCache.delete(`${platformId}:${helperId}:${lang}`)
  } else if (platformId) {
    // Clear all helpers for this platform
    for (const key of helperCache.keys()) {
      if (key.startsWith(`${platformId}:`)) {
        helperCache.delete(key)
      }
    }
    helperIndexCache.delete(platformId)
  } else {
    // Clear all cache
    helperCache.clear()
    helperIndexCache.clear()
  }
}

/**
 * Check if helper exists
 */
export async function hasHelper(
  helperId: string,
  platformId?: string
): Promise<boolean> {
  if (platformId) {
    const index = await loadHelperIndex(platformId)
    if (index && index.helpers[helperId]) {
      return true
    }
  }
  
  const globalIndex = await loadHelperIndex('global')
  return !!(globalIndex && globalIndex.helpers[helperId])
}
