/**
 * usePlatformSchema Hook
 * 
 * React hook for loading and using platform schemas from the API.
 * 
 * @module hooks/usePlatformSchema
 */

import { useState, useEffect } from 'react'
import config from '../config'
import useStore from '../store'

/**
 * Hook to load platform schema
 * 
 * @param {string} platformId - Platform identifier
 * @returns {Object} { schema, loading, error }
 */
export function usePlatformSchema(platformId) {
  const [schema, setSchema] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Get darkMode from store
  const darkMode = useStore((state) => state.darkMode)

  useEffect(() => {
    if (!platformId) {
      setLoading(false)
      return
    }

    const loadSchema = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build URL with darkMode parameter
        const mode = darkMode ? 'dark' : 'light'
        const url = `${config.apiUrl || 'http://localhost:4000'}/api/platforms/${platformId}/schema?mode=${mode}`
        
        // Try to load schema from dedicated endpoint
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.schema) {
            setSchema(data.schema)
            setLoading(false)
            return
          }
        }

        // Fallback: try to load from platform endpoint
        const platformUrl = `${config.apiUrl || 'http://localhost:4000'}/api/platforms/${platformId}?mode=${mode}`
        const platformResponse = await fetch(platformUrl)
        if (platformResponse.ok) {
          const platformData = await platformResponse.json()
          if (platformData.success && platformData.platform?.schema) {
            setSchema(platformData.platform.schema)
            setLoading(false)
            return
          }
        }

        // No schema available
        setError('Schema not available for this platform')
        setSchema(null)
      } catch (err) {
        console.error('Failed to load platform schema:', err)
        setError(err.message)
        setSchema(null)
      } finally {
        setLoading(false)
      }
    }

    loadSchema()
  }, [platformId, darkMode])  // Reload when darkMode changes

  return { schema, loading, error }
}

/**
 * Hook to load platform metadata
 * 
 * @param {string} platformId - Platform identifier
 * @returns {Object} { platform, loading, error }
 */
export function usePlatformMetadata(platformId) {
  const [platform, setPlatform] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!platformId) {
      setLoading(false)
      return
    }

    const loadPlatform = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${config.apiUrl || 'http://localhost:4000'}/api/platforms/${platformId}`)
        if (!response.ok) {
          throw new Error(`Failed to load platform: ${response.status}`)
        }

        const data = await response.json()
        if (data.success && data.platform) {
          setPlatform(data.platform)
        } else {
          throw new Error('Invalid platform data')
        }
      } catch (err) {
        console.error('Failed to load platform metadata:', err)
        setError(err.message)
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
export function usePlatforms() {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${config.apiUrl || 'http://localhost:4000'}/api/platforms`)
        if (!response.ok) {
          throw new Error(`Failed to load platforms: ${response.status}`)
        }

        const data = await response.json()
        if (data.success && data.platforms) {
          setPlatforms(data.platforms)
        } else {
          throw new Error('Invalid platforms data')
        }
      } catch (err) {
        console.error('Failed to load platforms:', err)
        setError(err.message)
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

