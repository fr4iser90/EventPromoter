/**
 * Translation Loader Utility
 * 
 * Unified translation loading system for platforms.
 * Discovers and loads translations from platform locales directories.
 * 
 * @module utils/translationLoader
 */

import { readdir, readFile, stat, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Translation cache
 */
const translationCache = new Map<string, Record<string, any>>()

/**
 * Supported languages
 */
const SUPPORTED_LANGUAGES = ['en', 'de', 'es']
const PLATFORM_ID_PATTERN = /^[a-z0-9-]+$/

function normalizeAndValidateLanguage(lang: string): string | null {
  if (!lang || typeof lang !== 'string') return null
  const normalized = lang.split('-')[0].toLowerCase()
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : null
}

function isValidPlatformId(platformId: string): boolean {
  return !!platformId && PLATFORM_ID_PATTERN.test(platformId)
}

/**
 * Load translations for a specific platform and language
 */
export async function getPlatformTranslations(
  platformId: string,
  lang: string
): Promise<Record<string, any>> {
  if (!isValidPlatformId(platformId)) {
    console.warn('[translationLoader] Invalid platformId', { platformId })
    return {}
  }

  const normalizedLang = normalizeAndValidateLanguage(lang)
  if (!normalizedLang) {
    console.warn('[translationLoader] Invalid language', { platformId, lang })
    return {}
  }

  const cacheKey = `${platformId}:${normalizedLang}`
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  try {
    const platformPath = join(__dirname, '../platforms', platformId)
    const localesPath = join(platformPath, 'locales')
    
    console.log('[translationLoader] Loading translations', {
      platformId,
      lang: normalizedLang,
      __dirname,
      platformPath,
      localesPath
    })
    
    // Check if locales directory exists
    try {
      await access(localesPath)
      console.log('[translationLoader] Locales directory exists', { localesPath })
    } catch {
      // No locales directory, return empty object
      console.warn('[translationLoader] No locales directory', {
        platformId,
        lang: normalizedLang,
        localesPath
      })
      translationCache.set(cacheKey, {})
      return {}
    }

    // Load translation file
    const translationFile = join(localesPath, `${normalizedLang}.json`)
    console.log('[translationLoader] Loading file', { translationFile })
    try {
      const content = await readFile(translationFile, 'utf-8')
      const translations = JSON.parse(content)
      console.log('[translationLoader] Loaded translations', {
        platformId,
        lang: normalizedLang,
        keys: Object.keys(translations),
        hasRecipients: !!translations.recipients
      })
      translationCache.set(cacheKey, translations)
      return translations
    } catch (error) {
      // File doesn't exist or is invalid, return empty object
      console.warn('[translationLoader] Failed to load translation file', {
        platformId,
        lang: normalizedLang,
        error
      })
      translationCache.set(cacheKey, {})
      return {}
    }
  } catch (error) {
    console.error('[translationLoader] Error loading translations', {
      platformId,
      lang: normalizedLang,
      error
    })
    return {}
  }
}

/**
 * Backwards-compatible alias used by some publisher modules.
 */
export async function loadTranslations(
  platformId: string,
  lang: string
): Promise<Record<string, any>> {
  return getPlatformTranslations(platformId, lang)
}

/**
 * Get all platform translations for a specific language
 */
export async function getAllPlatformTranslations(
  lang: string,
  platformIds?: string[]
): Promise<Record<string, Record<string, any>>> {
  const translations: Record<string, Record<string, any>> = {}

  // If platform IDs provided, load only those
  if (platformIds && platformIds.length > 0) {
    for (const platformId of platformIds) {
      translations[platformId] = await getPlatformTranslations(platformId, lang)
    }
    return translations
  }

  // Otherwise, discover all platforms
  try {
    const platformsPath = join(__dirname, '../platforms')
    const entries = await readdir(platformsPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const platformId = entry.name
        translations[platformId] = await getPlatformTranslations(platformId, lang)
      }
    }
  } catch (error) {
    console.error(`Error discovering platforms for translations:`, error)
  }

  return translations
}

/**
 * Get translations for multiple languages
 */
export async function getPlatformTranslationsForLanguages(
  platformId: string,
  languages: string[] = SUPPORTED_LANGUAGES
): Promise<Record<string, Record<string, any>>> {
  const translations: Record<string, Record<string, any>> = {}

  for (const lang of languages) {
    translations[lang] = await getPlatformTranslations(platformId, lang)
  }

  return translations
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(platformId?: string, lang?: string): void {
  if (platformId && lang) {
    translationCache.delete(`${platformId}:${lang}`)
  } else if (platformId) {
    // Clear all languages for this platform
    for (const lang of SUPPORTED_LANGUAGES) {
      translationCache.delete(`${platformId}:${lang}`)
    }
  } else {
    // Clear all cache
    translationCache.clear()
  }
}

/**
 * Check if translations exist for a platform and language
 */
export async function hasPlatformTranslations(
  platformId: string,
  lang: string
): Promise<boolean> {
  if (!isValidPlatformId(platformId)) return false
  const normalizedLang = normalizeAndValidateLanguage(lang)
  if (!normalizedLang) return false

  try {
    const platformPath = join(__dirname, '../platforms', platformId)
    const localesPath = join(platformPath, 'locales')
    const translationFile = join(localesPath, `${normalizedLang}.json`)
    
    try {
      await access(translationFile)
      return true
    } catch {
      return false
    }
  } catch {
    return false
  }
}

/**
 * Get available languages for a platform
 */
export async function getAvailableLanguages(platformId: string): Promise<string[]> {
  if (!isValidPlatformId(platformId)) return []

  try {
    const platformPath = join(__dirname, '../platforms', platformId)
    const localesPath = join(platformPath, 'locales')
    
    try {
      await access(localesPath)
    } catch {
      return []
    }

    const entries = await readdir(localesPath)
    const languages: string[] = []

    for (const entry of entries) {
      if (entry.endsWith('.json')) {
        const lang = entry.replace('.json', '')
        if (SUPPORTED_LANGUAGES.includes(lang)) {
          languages.push(lang)
        }
      }
    }

    return languages.sort()
  } catch {
    return []
  }
}

/**
 * Preload translations for a platform (useful for performance)
 */
export async function preloadPlatformTranslations(
  platformId: string,
  languages: string[] = SUPPORTED_LANGUAGES
): Promise<void> {
  for (const lang of languages) {
    await getPlatformTranslations(platformId, lang)
  }
}

/**
 * Preload translations for all platforms
 */
export async function preloadAllTranslations(
  languages: string[] = SUPPORTED_LANGUAGES
): Promise<void> {
  try {
    const platformsPath = join(__dirname, '../platforms')
    const entries = await readdir(platformsPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const platformId = entry.name
        await preloadPlatformTranslations(platformId, languages)
      }
    }
  } catch (error) {
    console.error(`Error preloading translations:`, error)
  }
}

