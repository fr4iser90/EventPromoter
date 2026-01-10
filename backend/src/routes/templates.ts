// Template routes - CRUD operations for template management

import { Router } from 'express'
import { TemplateController } from '../controllers/templateController.js'

const router = Router()

// ⚠️ IMPORTANT: Specific routes must be defined BEFORE parameterized routes
// Otherwise Express will match /categories as /:platform with platform='categories'

// Get available template categories
router.get('/categories', TemplateController.getCategories)
router.get('/by-category/:category', TemplateController.getTemplatesByCategory)

// Get all templates for a platform (default + custom)
router.get('/:platform', TemplateController.getTemplates)

// Get single template
router.get('/:platform/:id', TemplateController.getTemplate)

// Create new template
router.post('/:platform', TemplateController.createTemplate)

// Update existing template
router.put('/:platform/:id', TemplateController.updateTemplate)

// Delete template
router.delete('/:platform/:id', TemplateController.deleteTemplate)

export default router
