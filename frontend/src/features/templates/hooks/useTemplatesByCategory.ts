import { useState, useEffect } from 'react'

import axios from 'axios'
import type { AxiosError } from 'axios'
import type { TemplateByCategoryEntry, TemplatesByCategoryResponse } from '@eventpromoter/types'
import { getApiUrl } from '../../../shared/utils/api'

import type { ApiErrorResponse as ErrorResponse } from '../types'

function getAxiosErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ErrorResponse>
  return axiosError.response?.data?.error || axiosError.message || fallback
}

export function useTemplatesByCategory(category: string | null, platforms: string[] | null = null) {
  const [templates, setTemplates] = useState<TemplateByCategoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const platformsKey = platforms?.join(',')

  useEffect(() => {
    if (!category) {
      setTemplates([])
      return
    }

    const loadTemplates = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = platforms && platforms.length > 0 ? { platforms: platforms.join(',') } : {}

        const response = await axios.get<TemplatesByCategoryResponse>(
          getApiUrl(`templates/by-category/${category}`),
          { params }
        )

        if (response.data.success) {
          setTemplates(response.data.templates || [])
        } else {
          setError('Failed to load templates')
        }
      } catch (err: unknown) {
        setError(getAxiosErrorMessage(err, 'Failed to load templates'))
      } finally {
        setLoading(false)
      }
    }

    void loadTemplates()
  }, [category, platforms, platformsKey])

  return { templates, loading, error }
}
