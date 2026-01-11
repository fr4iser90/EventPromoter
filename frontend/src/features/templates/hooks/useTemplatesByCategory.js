import { useState, useEffect } from 'react'
import axios from 'axios'
import config from '../../../config'

/**
 * Hook to fetch templates for a specific category across platforms
 * 
 * @param {string} category - Category ID to fetch templates for
 * @param {string[]} platforms - Optional: filter by specific platforms
 * @returns {Object} { templates, loading, error }
 */
export function useTemplatesByCategory(category, platforms = null) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!category) {
      setTemplates([])
      return
    }

    const loadTemplates = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = platforms && platforms.length > 0 
          ? { platforms: platforms.join(',') } 
          : {}
        
        const response = await axios.get(
          `${config.apiUrl || 'http://localhost:4000'}/api/templates/by-category/${category}`,
          { params }
        )
        
        if (response.data.success) {
          setTemplates(response.data.templates || [])
        } else {
          setError(response.data.error || 'Failed to load templates')
        }
      } catch (err) {
        setError(err.message || 'Failed to load templates')
      } finally {
        setLoading(false)
      }
    }
    loadTemplates()
  }, [category, platforms?.join(',')])

  return { templates, loading, error }
}

