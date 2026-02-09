// Template Controller - CRUD operations for template management

import { Request, Response } from 'express'
import { TemplateService } from '../services/templateService.js'
import { TemplateMappingService, TemplateMappingRequest } from '../services/templateMappingService.js'
import { resolveTemplates, TemplateMode } from '../utils/templateResolver.js'
import {
  TemplateCreateRequest,
  TemplateUpdateRequest,
  TemplateListResponse,
  TemplateResponse,
  TemplateCategoriesResponse
} from '../types/templateTypes.js'

export class TemplateController {

  // GET /api/templates/:platform - Get all templates for a platform
  // Query parameter: ?mode=preview|export|raw (default: raw)
  // - preview: Removes <style> tags and style attributes (for preview rendering)
  // - export: Keeps all styles (full fidelity)
  // - raw: Returns templates unchanged
  static async getTemplates(req: Request, res: Response) {
    try {
      const { platform } = req.params
      const mode = (req.query.mode as TemplateMode) || 'raw'
      
      // Get request language (from i18next middleware or default to 'en')
      const lang = (req as any).language || (req as any).i18n?.language || 'en'
      const normalizedLang = lang.split('-')[0] // Normalize 'de-DE' -> 'de'
      const validLang = ['en', 'de', 'es'].includes(normalizedLang) ? normalizedLang : 'en'
      
      // Service stays "dumb" - just loads templates
      const rawTemplates = await TemplateService.getAllTemplates(platform)
      
      // Resolver handles context-specific processing
      const resolvedTemplates = resolveTemplates(rawTemplates, mode)
      
      // Apply translations to template names and descriptions from template.translations
      const templates = resolvedTemplates.map(template => {
        let translatedName = template.name
        let translatedDescription = template.description
        
        // Load from template.translations if available
        if ((template as any).translations) {
          const translations = (template as any).translations
          if (validLang !== 'en' && translations[validLang]) {
            translatedName = translations[validLang].name || translatedName
            translatedDescription = translations[validLang].description || translatedDescription
          } else if (translations.en) {
            // Fallback to English if available
            translatedName = translations.en.name || translatedName
            translatedDescription = translations.en.description || translatedDescription
          }
        }
        
        return {
          ...template,
          name: translatedName,
          description: translatedDescription
        }
      })
      
      const stats = await TemplateService.getTemplateStats(platform)

      const response: TemplateListResponse = {
        success: true,
        templates,
        defaultCount: stats.defaultCount,
        customCount: stats.customCount
      }

      res.json(response)
    } catch (error: any) {
      console.error('Get templates error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get templates',
        details: error.message
      })
    }
  }

  // GET /api/templates/:platform/:id - Get single template
  static async getTemplate(req: Request, res: Response) {
    try {
      const { platform, id } = req.params
      
      // Get request language (from i18next middleware or default to 'en')
      const lang = (req as any).language || (req as any).i18n?.language || 'en'
      const normalizedLang = lang.split('-')[0] // Normalize 'de-DE' -> 'de'
      const validLang = ['en', 'de', 'es'].includes(normalizedLang) ? normalizedLang : 'en'
      
      const template = await TemplateService.getTemplate(platform, id)

      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        })
        return
      }

      // Apply translations from template.translations
      let translatedName = template.name
      let translatedDescription = template.description
      
      if ((template as any).translations) {
        const translations = (template as any).translations
        if (validLang !== 'en' && translations[validLang]) {
          translatedName = translations[validLang].name || translatedName
          translatedDescription = translations[validLang].description || translatedDescription
        } else if (translations.en) {
          // Fallback to English if available
          translatedName = translations.en.name || translatedName
          translatedDescription = translations.en.description || translatedDescription
        }
      }

      const response: TemplateResponse = {
        success: true,
        template: {
          ...template,
          name: translatedName,
          description: translatedDescription
        }
      }

      res.json(response)
    } catch (error: any) {
      console.error('Get template error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get template',
        details: error.message
      })
    }
  }

  // POST /api/templates/:platform - Create new template
  static async createTemplate(req: Request, res: Response) {
    try {
      const { platform } = req.params
      const templateData: TemplateCreateRequest = req.body

      // Validate request
      if (!templateData.name?.trim()) {
        res.status(400).json({
          success: false,
          error: 'Template name is required'
        })
        return
      }

      if (!templateData.category?.trim()) {
        res.status(400).json({
          success: false,
          error: 'Template category is required'
        })
        return
      }

      // Validate template structure
      const validation = await TemplateService.validateTemplate({
        ...templateData,
        platform,
        isDefault: false
      })

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid template data',
          details: validation.errors
        })
        return
      }

      const newTemplate = await TemplateService.createTemplate(platform, templateData)

      res.status(201).json({
        success: true,
        template: newTemplate,
        message: 'Template created successfully'
      })
    } catch (error: any) {
      console.error('Create template error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create template',
        details: error.message
      })
    }
  }

  // PUT /api/templates/:platform/:id - Update existing template
  static async updateTemplate(req: Request, res: Response) {
    try {
      const { platform, id } = req.params
      const updates: TemplateUpdateRequest = req.body

      // Check if template exists and is editable
      const existingTemplate = await TemplateService.getTemplate(platform, id)
      if (!existingTemplate) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        })
        return
      }

      if (existingTemplate.isDefault) {
        res.status(403).json({
          success: false,
          error: 'Default templates cannot be modified'
        })
        return
      }

      // Validate updates
      const validation = await TemplateService.validateTemplate({
        ...existingTemplate,
        ...updates
      })

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid template data',
          details: validation.errors
        })
        return
      }

      const updatedTemplate = await TemplateService.updateTemplate(platform, id, updates)
      if (!updatedTemplate) {
        res.status(500).json({
          success: false,
          error: 'Failed to update template'
        })
        return
      }

      res.json({
        success: true,
        template: updatedTemplate,
        message: 'Template updated successfully'
      })
    } catch (error: any) {
      console.error('Update template error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update template',
        details: error.message
      })
    }
  }

  // DELETE /api/templates/:platform/:id - Delete template
  static async deleteTemplate(req: Request, res: Response) {
    try {
      const { platform, id } = req.params

      // Check if template exists and is editable
      const existingTemplate = await TemplateService.getTemplate(platform, id)
      if (!existingTemplate) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        })
        return
      }

      if (existingTemplate.isDefault) {
        res.status(403).json({
          success: false,
          error: 'Default templates cannot be deleted'
        })
        return
      }

      const deleted = await TemplateService.deleteTemplate(platform, id)
      if (!deleted) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete template'
        })
        return
      }

      res.json({
        success: true,
        message: 'Template deleted successfully'
      })
    } catch (error: any) {
      console.error('Delete template error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete template',
        details: error.message
      })
    }
  }

  // GET /api/templates/categories - Get available template categories (dynamically from all platforms)
  static async getCategories(req: Request, res: Response) {
    try {
      // Get request language (from i18next middleware or default to 'en')
      const lang = (req as any).language || (req as any).i18n?.language || 'en'
      const normalizedLang = lang.split('-')[0] // Normalize 'de-DE' -> 'de'
      const validLang = ['en', 'de', 'es'].includes(normalizedLang) ? normalizedLang : 'en'

      // ✅ GENERIC: Load all platforms from registry
      const { getPlatformRegistry, initializePlatformRegistry } = await import('../services/platformRegistry.js')
      const registry = getPlatformRegistry()
      if (!registry.isInitialized()) {
        await initializePlatformRegistry()
      }

      const allPlatforms = registry.getAllPlatforms()
      const categorySet = new Set<string>()

      // Collect category IDs from all platforms
      for (const platform of allPlatforms) {
        try {
          const platformId = platform.metadata?.id
          if (!platformId) {
            console.warn(`Platform has no ID:`, platform)
            continue
          }
          const templates = await TemplateService.getAllTemplates(platformId)
          templates.forEach(t => {
            if (t.category) {
              categorySet.add(t.category)
            }
          })
        } catch (error) {
          // Skip platforms that fail to load templates
          const platformId = platform.metadata?.id || 'unknown'
          console.warn(`Failed to load templates for ${platformId}:`, error)
        }
      }

      // Load translations from platform locale files
      // Categories are shared across platforms, so we load translations from email platform
      // (which has the most complete translations)
      const { getPlatformTranslations } = await import('../utils/translationLoader.js')
      const categoryTranslations = new Map<string, { en: string; de?: string; es?: string }>()

      // Load all language translations from email platform (categories are shared)
      const emailTranslations = {
        en: await getPlatformTranslations('email', 'en'),
        de: await getPlatformTranslations('email', 'de'),
        es: await getPlatformTranslations('email', 'es')
      }

      // Build translation map for each category
      for (const categoryId of categorySet) {
        const translationMap: { en: string; de?: string; es?: string } = {
          en: emailTranslations.en?.templates?.categories?.[categoryId] || 
              categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace(/-/g, ' '),
          de: emailTranslations.de?.templates?.categories?.[categoryId],
          es: emailTranslations.es?.templates?.categories?.[categoryId]
        }
        categoryTranslations.set(categoryId, translationMap)
      }

      // Convert to response format with translated names
      const categories: TemplateCategoriesResponse['categories'] = Array.from(categorySet)
        .sort()
        .map(id => {
          const translations = categoryTranslations.get(id) || { en: id }
          // Get translated name based on request language
          let translatedName: string
          if (validLang === 'de' && translations.de) {
            translatedName = translations.de
          } else if (validLang === 'es' && translations.es) {
            translatedName = translations.es
          } else {
            // Fallback to English (always available)
            translatedName = translations.en
          }

          return {
            id,
            name: translatedName,
            description: `Templates in category: ${id}`,
            platform: 'all'
          }
        })

      const response: TemplateCategoriesResponse = {
        success: true,
        categories
      }

      res.json(response)
    } catch (error: any) {
      console.error('Get categories error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get categories',
        details: error.message
      })
    }
  }

  // GET /api/templates/by-category/:category - Get templates for a category across all platforms
  static async getTemplatesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params
      const platformsParam = req.query.platforms as string | undefined

      // Get request language (from i18next middleware or default to 'en')
      const lang = (req as any).language || (req as any).i18n?.language || 'en'
      const normalizedLang = lang.split('-')[0] // Normalize 'de-DE' -> 'de'
      const validLang = ['en', 'de', 'es'].includes(normalizedLang) ? normalizedLang : 'en'

      // ✅ GENERIC: Load all platforms from registry
      const { getPlatformRegistry, initializePlatformRegistry } = await import('../services/platformRegistry.js')
      const registry = getPlatformRegistry()
      if (!registry.isInitialized()) {
        await initializePlatformRegistry()
      }

      // Filter platforms if specified
      const allPlatforms = platformsParam
        ? platformsParam.split(',').map(p => p.trim())
        : registry.getAllPlatforms().map(p => p.metadata.id)

      const result: Array<{
        platformId: string
        templateId: string | null
        templateName: string | null
        hasTemplate: boolean
        availableTemplates: Array<{ id: string; name: string }>
      }> = []

      for (const platformId of allPlatforms) {
        try {
          const templates = await TemplateService.getAllTemplates(platformId)
          const categoryTemplates = templates.filter(t => t.category === category)
          
          // If multiple templates exist, return all of them
          if (categoryTemplates.length > 0) {
            // Apply translations to template names
            const translatedTemplates = categoryTemplates.map(t => {
              let translatedName = t.name
              if ((t as any).translations) {
                const translations = (t as any).translations
                if (validLang !== 'en' && translations[validLang]?.name) {
                  translatedName = translations[validLang].name
                } else if (translations.en?.name) {
                  translatedName = translations.en.name
                }
              }
              return {
                id: t.id,
                name: translatedName
              }
            })
            
            // Get translated name for first template
            const firstTemplate = categoryTemplates[0]
            let translatedFirstName = firstTemplate.name
            if ((firstTemplate as any).translations) {
              const translations = (firstTemplate as any).translations
              if (validLang !== 'en' && translations[validLang]?.name) {
                translatedFirstName = translations[validLang].name
              } else if (translations.en?.name) {
                translatedFirstName = translations.en.name
              }
            }
            
            // Return first template as default, but include all available templates
            result.push({
              platformId,
              templateId: firstTemplate.id || null,
              templateName: translatedFirstName || null,
              hasTemplate: true,
              availableTemplates: translatedTemplates
            })
          } else {
            result.push({
              platformId,
              templateId: null,
              templateName: null,
              hasTemplate: false,
              availableTemplates: []
            })
          }
        } catch (error) {
          // Skip platforms that fail to load
          console.warn(`Failed to load templates for ${platformId}:`, error)
          result.push({
            platformId,
            templateId: null,
            templateName: null,
            hasTemplate: false,
            availableTemplates: []
          })
        }
      }

      res.json({
        success: true,
        category,
        templates: result
      })
    } catch (error: any) {
      console.error('Get templates by category error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get templates by category',
        details: error.message
      })
    }
  }

  // POST /api/templates/:platform/:id/apply - Apply template to editor content
  static async applyTemplate(req: Request, res: Response) {
    try {
      const { platform, id } = req.params
      const mappingRequest: TemplateMappingRequest = req.body

      // Get request language (from i18next middleware or default to 'en')
      const lang = (req as any).language || (req as any).i18n?.language || 'en'
      const normalizedLang = lang.split('-')[0] // Normalize 'de-DE' -> 'de'
      const validLang = ['en', 'de', 'es'].includes(normalizedLang) ? normalizedLang : 'en'
      
      // Add locale to mapping request for date/time formatting
      mappingRequest.locale = validLang

      // Get template
      const template = await TemplateService.getTemplate(platform, id)
      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        })
        return
      }

      // ✅ Validate template requirements against targets (if targets provided)
      if (mappingRequest.targets) {
        const { TargetController } = await import('./targetController.js')
        const service = await TargetController.getTargetService(platform)
        
        if (service) {
          // Check if template requires specific target fields
          const requiredFields = (template as any).requiredTargetFields || []
          
          if (requiredFields.length > 0) {
            // Get all targets
            const allTargets = await service.getTargets()
            
            // Check individual targets
            if (mappingRequest.targets.mode === 'individual' && 
                mappingRequest.targets.individual) {
              const individualTargetIds = mappingRequest.targets.individual
              const selectedTargets = allTargets.filter(t => 
                individualTargetIds.includes(t.id)
              )
              
              const missing = selectedTargets.filter(target => {
                return requiredFields.some((field: string) => {
                  // Check if field exists and has value
                  if (field === 'name') {
                    // name can be firstName+lastName or name field
                    return !target.name && !(target.firstName && target.lastName)
                  }
                  return !target[field as keyof typeof target] || String(target[field as keyof typeof target]).trim() === ''
                })
              })
              
              if (missing.length > 0) {
                // targetType is REQUIRED - no fallbacks
                const missingDisplay = missing.map(t => {
                  if (!t.targetType) {
                    console.error(`Target ${t.id} missing targetType - this should not happen`)
                    return t.id
                  }
                  const baseField = service.getBaseField(t.targetType)
                  return t[baseField] || t.id
                }).join(', ')
                return res.status(400).json({
                  success: false,
                  error: `Template requires target fields: ${requiredFields.join(', ')}`,
                  details: `${missing.length} target(s) missing required fields: ${missingDisplay}`,
                  missingTargets: missing.map(t => {
                    if (!t.targetType) {
                      console.error(`Target ${t.id} missing targetType - this should not happen`)
                      return { id: t.id }
                    }
                    const baseField = service.getBaseField(t.targetType)
                    return { id: t.id, [baseField]: t[baseField] }
                  })
                })
              }
            }
            
            // Check group targets
            if (mappingRequest.targets.mode === 'groups' && 
                mappingRequest.targets.groups) {
              const groups = await service.getGroups()
              const allTargets = await service.getTargets()
              const groupIds = mappingRequest.targets.groups
              
              for (const groupId of groupIds) {
                const group = (groups as Record<string, any>)[groupId] || Object.values(groups).find((g: any) => 
                  g.id === groupId || g.name === groupId
                )
                
                if (!group) continue
                
                const groupTargets = allTargets.filter(t => 
                  group.targetIds.includes(t.id)
                )
                
                const missing = groupTargets.filter(target => {
                  return requiredFields.some((field: string) => {
                    if (field === 'name') {
                      return !target.name && !(target.firstName && target.lastName)
                    }
                    return !target[field as keyof typeof target] || String(target[field as keyof typeof target]).trim() === ''
                  })
                })
                
                if (missing.length > 0) {
                  // targetType is REQUIRED - no fallbacks
                  const missingDisplay = missing.map(t => {
                    if (!t.targetType) {
                      console.error(`Target ${t.id} missing targetType - this should not happen`)
                      return t.id
                    }
                    const baseField = service.getBaseField(t.targetType)
                    return t[baseField] || t.id
                  }).join(', ')
                  return res.status(400).json({
                    success: false,
                    error: `Template requires target fields: ${requiredFields.join(', ')}`,
                    details: `Group "${group.name}" has ${missing.length} target(s) missing required fields: ${missingDisplay}`,
                    missingTargets: missing.map(t => {
                      if (!t.targetType) {
                        console.error(`Target ${t.id} missing targetType - this should not happen`)
                        return { id: t.id }
                      }
                      const baseField = service.getBaseField(t.targetType)
                      return { id: t.id, [baseField]: t[baseField] }
                    })
                  })
                }
              }
            }
          }
        }
      }

      // Map template to editor content
      const result = await TemplateMappingService.mapTemplateToEditorContent(
        platform,
        template,
        mappingRequest
      )

      res.json({
        success: true,
        content: result.content,
        templateId: result.templateId,
        variables: result.variables
      })
    } catch (error: any) {
      console.error('Apply template error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to apply template',
        details: error.message
      })
    }
  }
}