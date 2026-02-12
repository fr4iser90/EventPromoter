type TemplateVariables = Record<string, unknown>

export function replaceTemplateVariables(content: string, variables: TemplateVariables): string {
  if (!content || typeof content !== 'string') {
    return content
  }

  let result = content
  Object.entries(variables || {}).forEach(([key, value]) => {
    const replacement = Array.isArray(value) ? value.join(', ') : String(value || '')
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, replacement)
  })

  return result
}
