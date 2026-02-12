import { getApiUrl } from './api'

type GenericRecord = Record<string, unknown>

export async function resolveTemplateVariablesFromBackend(
  parsedData: GenericRecord | null,
  uploadedFileRefs: GenericRecord[] = [],
  language?: string
): Promise<Record<string, string>> {
  const response = await fetch(getApiUrl('templates/variables/resolve'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(language ? { 'Accept-Language': language } : {})
    },
    body: JSON.stringify({
      parsedData: parsedData || null,
      uploadedFileRefs: uploadedFileRefs || []
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to resolve template variables: ${response.status}`)
  }

  const result = await response.json()
  if (!result.success || !result.variables || typeof result.variables !== 'object') {
    throw new Error(result.error || 'Invalid template variable response')
  }

  return result.variables as Record<string, string>
}
