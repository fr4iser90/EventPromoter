import axios from 'axios'
import type { AxiosError } from 'axios'
import type {
  Template,
  TemplateCategoriesResponse,
  TemplateCreateRequest,
  TemplateListResponse,
  TemplateMutationResponse,
  TemplateUpdateRequest
} from '@eventpromoter/types'
import { getApiUrl } from '../../../shared/utils/api'
import type { ApiErrorResponse as ErrorResponse, TemplateMode } from '../types'

function getAxiosErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ErrorResponse>
  return axiosError.response?.data?.error || axiosError.message || fallback
}

export async function fetchTemplates(platform: string, mode: TemplateMode = 'raw'): Promise<Template[]> {
  const response = await axios.get<TemplateListResponse>(`${getApiUrl(`templates/${platform}`)}?mode=${mode}`)
  return response.data.success ? response.data.templates : []
}

export async function fetchTemplateCategories(): Promise<TemplateCategoriesResponse['categories']> {
  const response = await axios.get<TemplateCategoriesResponse>(getApiUrl('templates/categories'))
  return response.data.success ? response.data.categories : []
}

export async function createTemplate(
  platform: string,
  templateData: TemplateCreateRequest
): Promise<{ success: true; template?: Template } | { success: false; error: string }> {
  try {
    const response = await axios.post<TemplateMutationResponse>(getApiUrl(`templates/${platform}`), templateData)
    if (response.data.success) {
      return { success: true, template: response.data.template }
    }

    return { success: false, error: response.data.error || 'Failed to create template' }
  } catch (error: unknown) {
    return { success: false, error: getAxiosErrorMessage(error, 'Failed to create template') }
  }
}

export async function updateTemplate(
  platform: string,
  templateId: string,
  updates: TemplateUpdateRequest
): Promise<{ success: true; template?: Template } | { success: false; error: string }> {
  try {
    const response = await axios.put<TemplateMutationResponse>(getApiUrl(`templates/${platform}/${templateId}`), updates)
    if (response.data.success) {
      return { success: true, template: response.data.template }
    }

    return { success: false, error: response.data.error || 'Failed to update template' }
  } catch (error: unknown) {
    return { success: false, error: getAxiosErrorMessage(error, 'Failed to update template') }
  }
}

export async function deleteTemplate(
  platform: string,
  templateId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await axios.delete<TemplateMutationResponse>(getApiUrl(`templates/${platform}/${templateId}`))
    if (response.data.success) {
      return { success: true }
    }

    return { success: false, error: response.data.error || 'Failed to delete template' }
  } catch (error: unknown) {
    return { success: false, error: getAxiosErrorMessage(error, 'Failed to delete template') }
  }
}
