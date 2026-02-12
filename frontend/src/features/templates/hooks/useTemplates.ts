import { useState, useEffect, useCallback } from 'react'

import axios from 'axios'
import type { AxiosError } from 'axios'
import {
  type Template,
  type TemplateCreateRequest,
  type TemplateListResponse,
  type TemplateResponse,
  type TemplateUpdateRequest,
  type TemplateCategoriesResponse,
  type TemplateMutationResponse
} from '@eventpromoter/types'
import { getApiUrl } from '../../../shared/utils/api'

import type {
  ApiErrorResponse as ErrorResponse,
  DeleteTemplateResult,
  TemplateMode,
  TemplateMutationResult
} from '../types'

function getAxiosErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ErrorResponse>
  return axiosError.response?.data?.error || axiosError.message || fallback
}

export const useTemplates = (platform?: string, mode: TemplateMode = 'raw') => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<TemplateCategoriesResponse['categories']>([])

  // mode: 'preview' | 'export' | 'raw' (default: 'raw')
  const loadTemplates = useCallback(async () => {
    if (!platform) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const url = `${getApiUrl(`templates/${platform}`)}?mode=${mode}`
      const response = await axios.get<TemplateListResponse>(url)

      if (response.data.success) {
        setTemplates(response.data.templates)
        return
      }

      setError('Failed to load templates')
    } catch (err: unknown) {
      console.error('Error loading templates:', err)
      setError(getAxiosErrorMessage(err, 'Failed to load templates'))
    } finally {
      setLoading(false)
    }
  }, [platform, mode])

  const loadCategories = useCallback(async () => {
    try {
      const response = await axios.get<TemplateCategoriesResponse>(getApiUrl('templates/categories'))
      if (response.data.success) {
        setCategories(response.data.categories)
      }
    } catch (err: unknown) {
      console.error('Error loading categories:', err)
    }
  }, [])

  const createTemplate = useCallback(async (templateData: TemplateCreateRequest): Promise<TemplateMutationResult> => {
    if (!platform) {
      const message = 'Platform is required'
      setError(message)
      return { success: false, error: message }
    }

    try {
      setError(null)
      const response = await axios.post<TemplateMutationResponse>(getApiUrl(`templates/${platform}`), templateData)

      if (response.data.success) {
        await loadTemplates()
        return { success: true, template: response.data.template }
      }

      const message = response.data.error || 'Failed to create template'
      setError(message)
      return { success: false, error: message }
    } catch (err: unknown) {
      const message = getAxiosErrorMessage(err, 'Failed to create template')
      setError(message)
      return { success: false, error: message }
    }
  }, [platform, loadTemplates])

  const updateTemplate = useCallback(async (
    templateId: string,
    updates: TemplateUpdateRequest
  ): Promise<TemplateMutationResult> => {
    if (!platform) {
      const message = 'Platform is required'
      setError(message)
      return { success: false, error: message }
    }

    try {
      setError(null)
      const response = await axios.put<TemplateMutationResponse>(
        getApiUrl(`templates/${platform}/${templateId}`),
        updates
      )

      if (response.data.success) {
        await loadTemplates()
        return { success: true, template: response.data.template }
      }

      const message = response.data.error || 'Failed to update template'
      setError(message)
      return { success: false, error: message }
    } catch (err: unknown) {
      const message = getAxiosErrorMessage(err, 'Failed to update template')
      setError(message)
      return { success: false, error: message }
    }
  }, [platform, loadTemplates])

  const deleteTemplate = useCallback(async (templateId: string): Promise<DeleteTemplateResult> => {
    if (!platform) {
      const message = 'Platform is required'
      setError(message)
      return { success: false, error: message }
    }

    try {
      setError(null)
      const response = await axios.delete<TemplateMutationResponse>(getApiUrl(`templates/${platform}/${templateId}`))

      if (response.data.success) {
        await loadTemplates()
        return { success: true }
      }

      const message = response.data.error || 'Failed to delete template'
      setError(message)
      return { success: false, error: message }
    } catch (err: unknown) {
      const message = getAxiosErrorMessage(err, 'Failed to delete template')
      setError(message)
      return { success: false, error: message }
    }
  }, [platform, loadTemplates])

  const getTemplate = useCallback(async (templateId: string): Promise<Template | null> => {
    if (!platform) {
      return null
    }

    try {
      const response = await axios.get<TemplateResponse>(getApiUrl(`templates/${platform}/${templateId}`))
      return response.data.success ? response.data.template : null
    } catch (err: unknown) {
      console.error('Error getting template:', err)
      return null
    }
  }, [platform])

  useEffect(() => {
    if (platform) {
      void loadTemplates()
    }
  }, [platform, loadTemplates])

  useEffect(() => {
    void loadCategories()
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
