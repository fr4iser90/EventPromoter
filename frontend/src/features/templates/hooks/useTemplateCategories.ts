import { useState, useEffect } from 'react'

import axios from 'axios'
import type { AxiosError } from 'axios'
import type { TemplateCategoriesResponse } from '@eventpromoter/types'
import { getApiUrl } from '../../../shared/utils/api'

import type { ApiErrorResponse as ErrorResponse } from '../types'

function getAxiosErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ErrorResponse>
  return axiosError.response?.data?.error || axiosError.message || fallback
}

export function useTemplateCategories() {
  const [categories, setCategories] = useState<TemplateCategoriesResponse['categories']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get<TemplateCategoriesResponse>(getApiUrl('templates/categories'))
        if (response.data.success && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories)
        } else {
          setError('Failed to load categories')
          setCategories([])
        }
      } catch (err: unknown) {
        setError(getAxiosErrorMessage(err, 'Failed to load categories'))
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    void loadCategories()
  }, [])

  return { categories, loading, error }
}
