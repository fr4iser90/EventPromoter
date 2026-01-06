// Template Controller - CRUD operations for template management

import { Request, Response } from 'express'
import { TemplateService } from '../services/templateService.js'
import {
  TemplateCreateRequest,
  TemplateUpdateRequest,
  TemplateListResponse,
  TemplateResponse,
  TemplateCategoriesResponse
} from '../types/templateTypes.js'

export class TemplateController {

  // GET /api/templates/:platform - Get all templates for a platform
  static async getTemplates(req: Request, res: Response) {
    try {
      const { platform } = req.params
      const templates = await TemplateService.getAllTemplates(platform)
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
      const template = await TemplateService.getTemplate(platform, id)

      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        })
        return
      }

      const response: TemplateResponse = {
        success: true,
        template
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
      const validation = TemplateService.validateTemplate({
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
      const validation = TemplateService.validateTemplate({
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

  // GET /api/templates/categories - Get available template categories
  static async getCategories(req: Request, res: Response) {
    try {
      // Static categories - could be made dynamic later
      const categories: TemplateCategoriesResponse['categories'] = [
        { id: 'announcement', name: 'Event Announcement', description: 'Announce upcoming events', platform: 'all' },
        { id: 'promotion', name: 'Ticket Promotion', description: 'Promote ticket sales', platform: 'all' },
        { id: 'reminder', name: 'Event Reminder', description: 'Remind about upcoming events', platform: 'all' },
        { id: 'urgent', name: 'Urgent Update', description: 'Last-minute changes or urgent info', platform: 'all' },
        { id: 'welcome', name: 'Welcome Message', description: 'Welcome new attendees', platform: 'email' },
        { id: 'thank-you', name: 'Thank You', description: 'Post-event thank you messages', platform: 'all' },
        { id: 'music', name: 'Music Focus', description: 'DJ/Artist focused content', platform: 'all' },
        { id: 'general', name: 'General', description: 'General purpose templates', platform: 'all' }
      ]

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
}