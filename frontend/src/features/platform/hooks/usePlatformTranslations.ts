import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import axios from 'axios'
import { getApiUrl } from '../../../shared/utils/api'

import type {
  MultiplePlatformTranslationsState,
  PlatformTranslationErrorMap,
  PlatformTranslationsState
} from '../types'

/**
 * Hook to load and merge platform-specific translations from backend
 * 
 * @param {string} platformId - Platform ID (e.g., 'email', 'twitter')
 * @param {string} lang - Language code (e.g., 'en', 'de', 'es')
 * @returns {Object} - { translations, loading, error }
 */
export function usePlatformTranslations(platformId?: string, lang?: string): PlatformTranslationsState {
  const { i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!platformId || !lang) return

    const loadTranslations = async () => {
      console.log('[usePlatformTranslations] START loading', { platformId, lang })
      // Check if already loaded for this platform+lang combination
      const resourceKey = `platform_${platformId}`
      // Normalize language code: 'en-US' → 'en', 'de-DE' → 'de', etc.
      const rawLang = lang || i18n.language
      const currentLang = rawLang.split('-')[0] // Extract base language code

      // Skip if already loaded
      if (i18n.hasResourceBundle(currentLang, resourceKey)) {
        console.log('[usePlatformTranslations] Already loaded', { platformId, lang, currentLang })
        setLoaded(true)
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log('[usePlatformTranslations] Fetching from', getApiUrl(`translations/${platformId}/${currentLang}`))
        const response = await axios.get(
          getApiUrl(`translations/${platformId}/${currentLang}`)
        )

        console.log('[usePlatformTranslations] Response received', {
          success: response.data.success,
          hasTranslations: !!response.data.translations,
          translationKeys: response.data.translations ? Object.keys(response.data.translations) : [],
          sampleTranslation: response.data.translations?.recipients?.label
        })

        if (response.data.success && response.data.translations) {
          // Add platform translations to i18n with namespace
          // This allows accessing via t('key', { ns: `platform_${platformId}` })
          // or they will be merged into the main translation namespace
          i18n.addResourceBundle(
            currentLang,
            resourceKey,
            response.data.translations,
            true, // deep merge
            true  // overwrite existing
          )

          // Also merge into main translation namespace for easier access
          // Platform translations will be under platform.{platformId}.*
          const mergedTranslations = {
            platform: {
              [platformId]: response.data.translations
            }
          }
          console.log('[usePlatformTranslations] Merging translations', {
            currentLang,
            platformId,
            mergedStructure: Object.keys(mergedTranslations.platform[platformId] || {}),
            testKey: `platform.${platformId}.recipients.label`,
            testValue: mergedTranslations.platform[platformId]?.recipients?.label
          })
          
          i18n.addResourceBundle(
            currentLang,
            'translation',
            mergedTranslations,
            true, // deep merge
            false // don't overwrite existing common translations
          )

          // DEBUG: Check if translation is available after merge
          const testKey = `platform.${platformId}.recipients.label`
          const testTranslation = i18n.t(testKey)
          console.log('[usePlatformTranslations] After merge check', {
            testKey,
            testTranslation,
            isKey: testTranslation === testKey,
            i18nStore: (i18n.store.data as any)?.[currentLang]?.translation?.platform?.[platformId] ? 'EXISTS' : 'MISSING'
          })

          setLoaded(true)
          console.log('[usePlatformTranslations] Loaded and merged', { platformId, lang, loaded: true })
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err: unknown) {
        console.warn(`[usePlatformTranslations] Failed to load translations for platform ${platformId}:`, err)
        setError(err instanceof Error ? err.message : 'platform.failedToLoadPlatformTranslations')
        // Don't fail completely - just log warning
        setLoaded(true)
      } finally {
        setLoading(false)
      }
    }

    loadTranslations()
  }, [platformId, lang, i18n])

  return { loading, error, loaded }
}

/**
 * Hook to load translations for multiple platforms at once
 * 
 * @param {string[]} platformIds - Array of platform IDs
 * @param {string} lang - Language code
 * @returns {Object} - { loading, errors, loaded }
 */
export function useMultiplePlatformTranslations(platformIds: string[] = [], lang?: string): MultiplePlatformTranslationsState {
  const { i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<PlatformTranslationErrorMap>({})
  const [loaded, setLoaded] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!platformIds || platformIds.length === 0) return

    const loadAllTranslations = async () => {
      // Normalize language code: 'en-US' → 'en', 'de-DE' → 'de', etc.
      const rawLang = lang || i18n.language
      const currentLang = rawLang.split('-')[0] // Extract base language code
      const toLoad = platformIds.filter(id => !loaded.has(id))

      if (toLoad.length === 0) return

      try {
        setLoading(true)

        const promises = toLoad.map(async (platformId) => {
          try {
            const response = await axios.get(
              getApiUrl(`translations/${platformId}/${currentLang}`)
            )

            if (response.data.success && response.data.translations) {
              const resourceKey = `platform_${platformId}`
              
              // Add with namespace
              i18n.addResourceBundle(
                currentLang,
                resourceKey,
                response.data.translations,
                true,
                true
              )

              // Merge into main namespace
              const mergedTranslations = {
                platform: {
                  [platformId]: response.data.translations
                }
              }
              i18n.addResourceBundle(
                currentLang,
                'translation',
                mergedTranslations,
                true,
                false
              )

              setLoaded(prev => new Set([...prev, platformId]))
              setErrors(prev => {
                const next = { ...prev }
                delete next[platformId]
                return next
              })
            }
          } catch (err: unknown) {
            console.warn(`Failed to load translations for ${platformId}:`, err)
            setErrors(prev => ({
              ...prev,
              [platformId]: err instanceof Error ? err.message : 'platform.failedToLoadPlatformTranslation'
            }))
          }
        })

        await Promise.all(promises)
      } finally {
        setLoading(false)
      }
    }

    loadAllTranslations()
     
  }, [platformIds?.join(','), lang, i18n.language])

  return { loading, errors, loaded: Array.from(loaded) }
}

