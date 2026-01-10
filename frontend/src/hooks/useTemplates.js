// Template management hook for CRUD operations

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export const useTemplates = (platform, mode = 'raw') => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Load templates for platform
  // mode: 'preview' | 'export' | 'raw' (default: 'raw')
  const loadTemplates = useCallback(async () => {
    if (!platform) return

    try {
      setLoading(true)
      setError(null)

      // Send ?mode=preview|export|raw (backend resolves templates accordingly)
      const url = `http://localhost:4000/api/templates/${platform}?mode=${mode}`
      
      const response = await axios.get(url)
      if (response.data.success) {
        setTemplates(response.data.templates)
      } else {
        setError(response.data.error || 'Failed to load templates')
      }
    } catch (err) {
      console.error('Error loading templates:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [platform, mode])

  // Load template categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/templates/categories')
      if (response.data.success) {
        setCategories(response.data.categories)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }, [])

  // Create new template
  const createTemplate = useCallback(async (templateData) => {
    try {
      setError(null)
      const response = await axios.post(`http://localhost:4000/api/templates/${platform}`, templateData)

      if (response.data.success) {
        // Reload templates to get updated list
        await loadTemplates()
        return { success: true, template: response.data.template }
      } else {
        setError(response.data.error || 'Failed to create template')
        return { success: false, error: response.data.error }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create template'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [platform, loadTemplates])

  // Update existing template
  const updateTemplate = useCallback(async (templateId, updates) => {
    try {
      setError(null)
      const response = await axios.put(`http://localhost:4000/api/templates/${platform}/${templateId}`, updates)

      if (response.data.success) {
        // Reload templates to get updated list
        await loadTemplates()
        return { success: true, template: response.data.template }
      } else {
        setError(response.data.error || 'Failed to update template')
        return { success: false, error: response.data.error }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to update template'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [platform, loadTemplates])

  // Delete template
  const deleteTemplate = useCallback(async (templateId) => {
    try {
      setError(null)
      const response = await axios.delete(`http://localhost:4000/api/templates/${platform}/${templateId}`)

      if (response.data.success) {
        // Reload templates to get updated list
        await loadTemplates()
        return { success: true }
      } else {
        setError(response.data.error || 'Failed to delete template')
        return { success: false, error: response.data.error }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to delete template'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [platform, loadTemplates])

  // Get single template
  const getTemplate = useCallback(async (templateId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/templates/${platform}/${templateId}`)
      if (response.data.success) {
        return response.data.template
      }
      return null
    } catch (err) {
      console.error('Error getting template:', err)
      return null
    }
  }, [platform])

  // Load data on mount and when platform changes
  useEffect(() => {
    if (platform) {
      loadTemplates()
    }
  }, [platform, loadTemplates])

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    templates,
    categories,
    loading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate
  }
}
