/**
 * usePlatformSchema Hook
 * 
 * React hook for loading and using platform schemas from the API.
 * 
 * @module hooks/usePlatformSchema
 */

import { useState, useEffect } from 'react'

import { getApiUrl } from '../../../shared/utils/api'
import type { PlatformMetadataState, PlatformSchemaState, PlatformsState } from '../types'

/**
 * Hook to load platform schema
 * 
 * @param {string} platformId - Platform identifier
 * @returns {Object} { schema, loading, error }
 */
export function usePlatformSchema<T = unknown>(platformId?: string): PlatformSchemaState<T> {
  const [schema, setSchema] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!platformId) {
      setLoading(false)
      return
    }

    const loadSchema = async () => {
      try {
        setLoading(true)
        setError(null)

        // Authoritative schema contract: always use dedicated schema endpoint.
        const response = await fetch(getApiUrl(`platforms/${platformId}/schema`))
        if (!response.ok) {
          throw new Error(`Failed to load schema: ${response.status}`)
        }

        const data = await response.json()
        if (!data.success || !data.schema) {
          throw new Error('Schema response is invalid')
        }

        setSchema(data.schema)
      } catch (err: unknown) {
        console.error('Failed to load platform schema:', err)
        setError(err instanceof Error ? err.message : 'Failed to load platform schema')
        setSchema(null)
      } finally {
        setLoading(false)
      }
    }

    loadSchema()
  }, [platformId]) // ✅ Kein darkMode mehr in dependencies

  return { schema, loading, error }
}

/**
 * Hook to load platform metadata
 * 
 * @param {string} platformId - Platform identifier
 * @returns {Object} { platform, loading, error }
 */
export function usePlatformMetadata<T = unknown>(platformId?: string): PlatformMetadataState<T> {
  const [platform, setPlatform] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!platformId) {
      setLoading(false)
      return
    }

    const loadPlatform = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(getApiUrl(`platforms/${platformId}`))
        if (!response.ok) {
          throw new Error(`Failed to load platform: ${response.status}`)
        }

        const data = await response.json()
        if (data.success && data.platform) {
          setPlatform(data.platform)
        } else {
          throw new Error('Invalid platform data')
        }
      } catch (err: unknown) {
        console.error('Failed to load platform metadata:', err)
        setError(err instanceof Error ? err.message : 'Failed to load platform metadata')
        setPlatform(null)
      } finally {
        setLoading(false)
      }
    }

    loadPlatform()
  }, [platformId])

  return { platform, loading, error }
}

/**
 * Hook to load all platforms
 * 
 * @returns {Object} { platforms, loading, error }
 */
export function usePlatforms<T = unknown>(): PlatformsState<T> {
  const [platforms, setPlatforms] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(getApiUrl('platforms'))
        if (!response.ok) {
          throw new Error(`Failed to load platforms: ${response.status}`)
        }

        const data = await response.json()
        if (data.success && data.platforms) {
          setPlatforms(data.platforms)
        } else {
          throw new Error('Invalid platforms data')
        }
      } catch (err: unknown) {
        console.error('Failed to load platforms:', err)
        setError(err instanceof Error ? err.message : 'Failed to load platforms')
        setPlatforms([])
      } finally {
        setLoading(false)
      }
    }

    loadPlatforms()
  }, [])

  return { platforms, loading, error }
}

export default usePlatformSchema

