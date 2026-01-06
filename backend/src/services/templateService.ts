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

  // Load default templates from platform modules
  static async loadDefaultTemplates(platform: string): Promise<Template[]> {
    try {
      // Import platform templates dynamically
      const platformModule = await import(`../platforms/${platform}/templates.js`)
      const defaultTemplates = platformModule[`${platform.toUpperCase()}_TEMPLATES`] || []

      // Convert to Template interface format
      return defaultTemplates.map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.name, // Use name as description for defaults
        platform,
        category: template.category || 'general',
        template: template.template,
        variables: template.variables || [],
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z', // Fixed date for defaults
        updatedAt: '2024-01-01T00:00:00Z'
      }))
    } catch (error) {
      console.warn(`Failed to load default templates for ${platform}:`, error)
      return []
    }
  }

  // Get all templates for a platform (default + custom merged)
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
  static validateTemplate(template: Partial<Template>): TemplateValidationResult {
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

    // Platform-specific validation
    if (template.platform === 'email') {
      if (!template.template?.subject || !template.template?.html) {
        errors.push('Email templates must have subject and html fields')
      }
    } else {
      if (!template.template?.text) {
        errors.push('Social media templates must have text field')
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
