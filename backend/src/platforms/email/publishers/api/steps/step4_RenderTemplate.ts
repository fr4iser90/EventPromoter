/**
 * Step 4: Render Template
 * 
 * Loads and renders template with variables for target locale
 * 
 * @module platforms/email/publishers/api/steps/step4_RenderTemplate
 */

export async function step4_RenderTemplate(
  run: any,
  content: any
): Promise<{ html: string; subject: string }> {
  // ✅ DEKLARATIV: Template MUSS vorhanden sein und re-rendert werden (KEINE FALLBACKS)
  if (!run.templateId) {
    throw new Error(`Template ID is required for template run. No fallbacks allowed.`)
  }

  const targetLocale = run.targets?.templateLocale
  if (!targetLocale || !['en', 'de', 'es'].includes(targetLocale)) {
    throw new Error(`Valid target locale (en/de/es) is required for template ${run.templateId}. No fallbacks allowed.`)
  }

  // Re-render template with Target-Locale (MUSS funktionieren, sonst Fehler)
  const { TemplateService } = await import('../../../../../services/templateService.js')
  const templateModule = await import('../../../templates/index.js')
  const { renderTemplate } = templateModule
  const { formatDate } = await import('../../../../../services/parsing/templateVariables.js')
  
  const template = await TemplateService.getTemplate('email', run.templateId)
  if (!template || !template.template || typeof template.template !== 'object') {
    throw new Error(`Template ${run.templateId} not found or invalid. No fallbacks allowed.`)
  }

  // Convert Template to EmailTemplate format
  const emailTemplate = {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    variables: template.variables,
    template: {
      subject: template.template.subject || '',
      html: template.template.html || ''
    },
    translations: (template as any).translations,
    defaultLocale: (template as any).defaultLocale,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt
  }
  
  // Extract variables from content (all _var_* fields)
  const variables: Record<string, string> = {}
  for (const [key, value] of Object.entries(content)) {
    if (key.startsWith('_var_')) {
      const varName = key.replace('_var_', '')
      let varValue = String(value || '')
      
      // ✅ FORMATIERUNG: Datum/Zeit mit Target-Locale formatieren
      if (varName === 'date' || varName === 'eventDate') {
        varValue = formatDate(varValue, targetLocale)
      }
      // time bleibt unverändert (bereits 24h Format)
      
      variables[varName] = varValue
    }
  }
  
  // Render template with Target-Locale
  const rendered = renderTemplate(emailTemplate, variables, targetLocale as 'en' | 'de' | 'es')
  
  // Extract content HTML from template HTML (remove document structure)
  const previewService = await import('../../../services/previewService.js')
  const html = previewService.extractContentFromTemplateHtml(rendered.html)
  const subject = rendered.subject

  if (!html || html.trim().length === 0) {
    throw new Error(`Template ${run.templateId} rendered empty HTML. No fallbacks allowed.`)
  }

  if (!subject || subject.trim().length === 0) {
    throw new Error(`Template ${run.templateId} rendered empty subject. No fallbacks allowed.`)
  }

  return { html, subject }
}
