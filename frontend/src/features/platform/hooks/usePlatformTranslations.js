import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import config from '../../../config'
import { getApiUrl } from '../../../shared/utils/api'

/**
 * Hook to load and merge platform-specific translations from backend
 * 
 * @param {string} platformId - Platform ID (e.g., 'email', 'twitter')
 * @param {string} lang - Language code (e.g., 'en', 'de', 'es')
 * @returns {Object} - { translations, loading, error }
 */
export function usePlatformTranslations(platformId, lang) {
  const { i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!platformId || !lang) return

    const loadTranslations = async () => {
      // Check if already loaded for this platform+lang combination
      const resourceKey = `platform_${platformId}`
      const currentLang = lang || i18n.language

      // Skip if already loaded
      if (i18n.hasResourceBundle(currentLang, resourceKey)) {
        setLoaded(true)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await axios.get(
          getApiUrl(`translations/${platformId}/${currentLang}`)
        )

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
          i18n.addResourceBundle(
            currentLang,
            'translation',
            mergedTranslations,
            true, // deep merge
            false // don't overwrite existing common translations
          )

          setLoaded(true)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.warn(`Failed to load translations for platform ${platformId}:`, err)
        setError(err.message)
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
export function useMultiplePlatformTranslations(platformIds = [], lang) {
  const { i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [loaded, setLoaded] = useState(new Set())

  useEffect(() => {
    if (!platformIds || platformIds.length === 0) return

    const loadAllTranslations = async () => {
      const currentLang = lang || i18n.language
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
          } catch (err) {
            console.warn(`Failed to load translations for ${platformId}:`, err)
            setErrors(prev => ({
              ...prev,
              [platformId]: err.message
            }))
          }
        })

        await Promise.all(promises)
      } finally {
        setLoading(false)
      }
    }

    loadAllTranslations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformIds?.join(','), lang, i18n.language])

  return { loading, errors, loaded: Array.from(loaded) }
}

