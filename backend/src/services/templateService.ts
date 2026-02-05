// Template Service - Manages custom templates stored in JSON files

import fs from 'fs'
import path from 'path'
import { Template, TemplateValidationResult, TemplateCreateRequest } from '../types/templateTypes.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'

export class TemplateService {
  private static readonly TEMPLATES_DIR = path.join(process.cwd(), 'events', 'templates')

  // Ensure templates directory exists
  private static ensureTemplatesDir(): void {
    if (!fs.existsSync(this.TEMPLATES_DIR)) {
      fs.mkdirSync(this.TEMPLATES_DIR, { recursive: true })
    }
  }

  // Get file path for platform templates
  private static getPlatformFilePath(platform: string): string {
    return path.join(this.TEMPLATES_DIR, `${platform}.json`)
  }

  // Load custom templates for a platform from JSON file
  static async loadCustomTemplates(platform: string): Promise<Template[]> {
    try {
      const filePath = this.getPlatformFilePath(platform)
      if (!fs.existsSync(filePath)) {
        return []
      }

      const data = fs.readFileSync(filePath, 'utf8')
      const jsonData = JSON.parse(data)
      return jsonData.templates || []
    } catch (error) {
      console.warn(`Failed to load custom templates for ${platform}:`, error)
      return []
    }
  }

  // Save custom templates for a platform to JSON file
  static async saveCustomTemplates(platform: string, templates: Template[]): Promise<boolean> {
    try {
      this.ensureTemplatesDir()
      const filePath = this.getPlatformFilePath(platform)

      const data = {
        platform,
        lastUpdated: new Date().toISOString(),
        templates
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
      return true
    } catch (error) {
      console.error(`Failed to save custom templates for ${platform}:`, error)
      return false
    }
  }

  // ✅ GENERIC: Load default templates from platform modules
  static async loadDefaultTemplates(platform: string): Promise<Template[]> {
    try {
      // ✅ GENERIC: Check if platform exists in registry instead of hardcoded list
      const { getPlatformRegistry, initializePlatformRegistry } = await import('./platformRegistry.js')
      const registry = getPlatformRegistry()
      if (!registry.isInitialized()) {
        await initializePlatformRegistry()
      }

      const platformModule = registry.getPlatform(platform.toLowerCase())
      if (!platformModule) {
        console.warn(`Platform '${platform}' not found in registry`)
        return []
      }

      // Try to load templates from platform module
      try {
        const templatesModule = await import(`../platforms/${platform}/templates/index.js`)
        const templateKey = `${platform.toUpperCase()}_TEMPLATES`
        const defaultTemplates = templatesModule[templateKey] || platformModule.templates || []

        // Convert to Template interface format - use ONLY what's in the template files
        return defaultTemplates.map((template: any) => {
          // Normalize template content: if it's a string, convert to object with 'text' field
          let normalizedTemplate = template.template
          if (typeof normalizedTemplate === 'string') {
            // String template (LinkedIn, Twitter, Facebook, Instagram) -> convert to { text: '...' }
            normalizedTemplate = { text: normalizedTemplate }
          } else if (!normalizedTemplate || typeof normalizedTemplate !== 'object') {
            // Skip invalid templates
            return null
          }
          
          return {
            id: template.id,
            name: template.name,
            description: template.description,
            platform,
            category: template.category,
            template: normalizedTemplate,
            variables: template.variables,
            isDefault: true,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
            // Keep translations for later use in controller
            translations: template.translations
          }
        }).filter((t: any): t is NonNullable<typeof t> => t !== null)
      } catch (importError) {
        // If templates file doesn't exist, check if platform has templates in module
        if (platformModule.templates) {
          const templates = Object.values(platformModule.templates)
          return templates.map((template: any) => {
            // Normalize template content: if it's a string, convert to object with 'text' field
            let normalizedTemplate = template.template
            if (typeof normalizedTemplate === 'string') {
              normalizedTemplate = { text: normalizedTemplate }
            } else if (!normalizedTemplate || typeof normalizedTemplate !== 'object') {
              return null
            }
            
            return {
              id: template.id,
              name: template.name,
              description: template.description,
              platform,
              category: template.category,
              template: normalizedTemplate,
              variables: template.variables,
              isDefault: true,
              createdAt: template.createdAt,
              updatedAt: template.updatedAt,
              // Keep translations for later use in controller
              translations: template.translations
            }
          }).filter((t: any): t is NonNullable<typeof t> => t !== null)
        }
        return []
      }
    } catch (error) {
      console.warn(`Failed to load default templates for ${platform}:`, error)
      return []
    }
  }

  // Get all templates for a platform (default + custom merged)
  // Service stays "dumb" - no processing logic here
  static async getAllTemplates(platform: string): Promise<Template[]> {
    const [defaultTemplates, customTemplates] = await Promise.all([
      this.loadDefaultTemplates(platform),
      this.loadCustomTemplates(platform)
    ])

    // Merge and return all templates (custom templates override defaults if same ID)
    const allTemplates = [...defaultTemplates]
    const defaultIds = new Set(defaultTemplates.map(t => t.id))

    // Add custom templates (they override defaults if same ID)
    for (const customTemplate of customTemplates) {
      const existingIndex = allTemplates.findIndex(t => t.id === customTemplate.id)
      if (existingIndex >= 0) {
        allTemplates[existingIndex] = customTemplate
      } else {
        allTemplates.push(customTemplate)
      }
    }

    return allTemplates.sort((a, b) => {
      // Sort: custom first, then defaults; then by name
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? 1 : -1
      }
      return a.name.localeCompare(b.name)
    })
  }

  // Get single template by ID
  static async getTemplate(platform: string, templateId: string): Promise<Template | null> {
    const templates = await this.getAllTemplates(platform)
    return templates.find(t => t.id === templateId) || null
  }

  // Create new custom template
  static async createTemplate(platform: string, templateData: TemplateCreateRequest): Promise<Template> {
    const customTemplates = await this.loadCustomTemplates(platform)

    // Generate unique ID
    const timestamp = Date.now()
    const id = `custom-${platform}-${timestamp}`

    const newTemplate: Template = {
      id,
      name: templateData.name,
      description: templateData.description,
      platform,
      category: templateData.category,
      template: templateData.template,
      variables: templateData.variables,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to custom templates and save
    customTemplates.push(newTemplate)
    await this.saveCustomTemplates(platform, customTemplates)

    return newTemplate
  }

  // Update existing template (only custom templates can be updated)
  static async updateTemplate(platform: string, templateId: string, updates: Partial<Template>): Promise<Template | null> {
    const customTemplates = await this.loadCustomTemplates(platform)
    const templateIndex = customTemplates.findIndex(t => t.id === templateId)

    if (templateIndex === -1) {
      return null // Template not found or is default (can't update defaults)
    }

    // Update template
    customTemplates[templateIndex] = {
      ...customTemplates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.saveCustomTemplates(platform, customTemplates)
    return customTemplates[templateIndex]
  }

  // Delete custom template
  static async deleteTemplate(platform: string, templateId: string): Promise<boolean> {
    const customTemplates = await this.loadCustomTemplates(platform)
    const filteredTemplates = customTemplates.filter(t => t.id !== templateId)

    if (filteredTemplates.length === customTemplates.length) {
      return false // Template not found
    }

    return await this.saveCustomTemplates(platform, filteredTemplates)
  }

  // Validate template structure
  static async validateTemplate(template: Partial<Template>): Promise<TemplateValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!template.name?.trim()) {
      errors.push('Template name is required')
    }

    if (!template.category?.trim()) {
      errors.push('Template category is required')
    }

    if (!template.template || typeof template.template !== 'object') {
      errors.push('Template content is required')
    }

    if (!Array.isArray(template.variables)) {
      errors.push('Variables must be an array')
    }

    // ✅ GENERIC: Platform-specific validation from schema
    try {
      const { getPlatformRegistry, initializePlatformRegistry } = await import('./platformRegistry.js')
      const registry = getPlatformRegistry()
      if (!registry.isInitialized()) {
        await initializePlatformRegistry()
      }

      if (!template.platform) {
        errors.push('Platform is required')
        return { isValid: false, errors, warnings }
      }

      const platformModule = registry.getPlatform(template.platform.toLowerCase())
      if (platformModule?.schema?.template) {
        // Validate against platform template schema
        const templateSchema = platformModule.schema.template
        const requiredFields = templateSchema.validation?.requiredFields || []
        
        requiredFields.forEach((field: string) => {
          if (!template.template?.[field]) {
            errors.push(`Template must have '${field}' field (required by ${template.platform} schema)`)
          }
        })
      } else {
        // Generic fallback: check for common fields
        if (!template.template?.text && !template.template?.subject) {
          errors.push('Template must have at least text or subject field')
        }
      }
    } catch (error) {
      // If registry not available, use generic validation
      if (!template.template?.text && !template.template?.subject) {
        errors.push('Template must have at least text or subject field')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Get template statistics
  static async getTemplateStats(platform: string): Promise<{ defaultCount: number, customCount: number }> {
    const [defaultTemplates, customTemplates] = await Promise.all([
      this.loadDefaultTemplates(platform),
      this.loadCustomTemplates(platform)
    ])

    return {
      defaultCount: defaultTemplates.length,
      customCount: customTemplates.length
    }
  }
}
