import { useState, useEffect } from 'react'
import axios from 'axios'
import config from '../../../config'
import { getApiUrl } from '../../../shared/utils/api'

/**
 * Hook to fetch all available template categories across all platforms
 * 
 * @returns {Object} { categories, loading, error }
 */
export function useTemplateCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(getApiUrl('templates/categories'))
        if (response.data.success && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories)
        } else {
          setError(response.data.error || 'Failed to load categories')
          setCategories([]) // Ensure it's always an array
        }
      } catch (err) {
        setError(err.message || 'Failed to load categories')
        setCategories([]) // Ensure it's always an array
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  return { categories: categories || [], loading, error }
}

