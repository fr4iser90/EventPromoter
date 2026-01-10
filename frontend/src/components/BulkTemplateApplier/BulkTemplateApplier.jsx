import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { useTemplateCategories } from '../../hooks/useTemplateCategories'
import { useTemplatesByCategory } from '../../hooks/useTemplatesByCategory'
import useStore from '../../store'
import { getTemplateVariables, replaceTemplateVariables } from '../../utils/templateUtils'
import config from '../../config'

/**
 * BulkTemplateApplier Component
 * 
 * Allows applying templates to multiple platforms at once.
 * User selects a category to filter templates, then chooses a specific template for each platform.
 * Implements safety checks: no overwrite by default, shows missing templates.
 */
function BulkTemplateApplier({ 
  open, 
  onClose, 
  selectedPlatforms = [], 
  platformContent = {}, 
  onApply 
}) {
  const { categories = [], loading: categoriesLoading } = useTemplateCategories()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPlatformsForApply, setSelectedPlatformsForApply] = useState(
    new Set(selectedPlatforms)
  )
  const [selectedTemplates, setSelectedTemplates] = useState({}) // { platformId: templateId }
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyResults, setApplyResults] = useState(null)
  
  const { templates, loading: templatesLoading } = useTemplatesByCategory(
    selectedCategory,
    selectedPlatforms
  )

  const { parsedData, uploadedFileRefs } = useStore()

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedCategory('')
      setSelectedPlatformsForApply(new Set(selectedPlatforms))
      setSelectedTemplates({})
      setOverwriteExisting(false)
      setApplyResults(null)
    }
  }, [open, selectedPlatforms])

  // Auto-select first template when templates load
  useEffect(() => {
    if (templates.length > 0) {
      const autoSelected = {}
      templates.forEach(t => {
        if (t.hasTemplate && t.availableTemplates && t.availableTemplates.length > 0) {
          // Use templateId from availableTemplates (API returns id, but we need templateId)
          const firstTemplate = t.availableTemplates[0]
          autoSelected[t.platformId] = firstTemplate.templateId || firstTemplate.id
        } else if (t.hasTemplate && t.templateId) {
          autoSelected[t.platformId] = t.templateId
        }
      })
      // Only update if we have new selections and they're not already set
      if (Object.keys(autoSelected).length > 0) {
        setSelectedTemplates(prev => {
          const merged = { ...prev }
          Object.keys(autoSelected).forEach(platformId => {
            if (!merged[platformId]) {
              merged[platformId] = autoSelected[platformId]
            }
          })
          return merged
        })
      }
    }
  }, [templates, selectedCategory])

  // Update selected platforms when selectedPlatforms prop changes
  useEffect(() => {
    if (open) {
      setSelectedPlatformsForApply(new Set(selectedPlatforms))
    }
  }, [selectedPlatforms, open])

  const handlePlatformToggle = (platformId) => {
    const newSet = new Set(selectedPlatformsForApply)
    if (newSet.has(platformId)) {
      newSet.delete(platformId)
    } else {
      newSet.add(platformId)
    }
    setSelectedPlatformsForApply(newSet)
  }

  const hasExistingContent = (platformId) => {
    const content = platformContent[platformId] || {}
    return Object.keys(content).some(key => {
      const value = content[key]
      return value && typeof value === 'string' && value.trim().length > 0
    })
  }

  const handleApply = async () => {
    if (!selectedCategory) return

    setApplying(true)
    setApplyResults(null)

    const templateVariables = getTemplateVariables(parsedData, uploadedFileRefs)
    const results = {
      applied: [],
      skipped: [],
      errors: []
    }

    try {
      for (const platformId of selectedPlatformsForApply) {
        const templateInfo = templates.find(t => t.platformId === platformId)
        
        if (!templateInfo?.hasTemplate) {
          results.skipped.push({
            platformId,
            reason: 'No template for category'
          })
          continue
        }

        const hasContent = hasExistingContent(platformId)
        if (hasContent && !overwriteExisting) {
          results.skipped.push({
            platformId,
            reason: 'Existing content (overwrite disabled)'
          })
          continue
        }

        try {
          // Get selected template ID for this platform (or use default)
          const templateIdToUse = selectedTemplates[platformId] || 
            (templateInfo.availableTemplates && templateInfo.availableTemplates.length > 0 
              ? (templateInfo.availableTemplates[0].templateId || templateInfo.availableTemplates[0].id)
              : templateInfo.templateId)
          
          if (!templateIdToUse) {
            throw new Error('No template selected')
          }

          // Load full template
          const templateResponse = await fetch(
            `${config.apiUrl || 'http://localhost:4000'}/api/templates/${platformId}/${templateIdToUse}?mode=raw`
          )
          
          if (!templateResponse.ok) {
            throw new Error(`Failed to load template: ${templateResponse.status}`)
          }

          const templateData = await templateResponse.json()
          if (!templateData.success || !templateData.template) {
            throw new Error('Invalid template response')
          }

          // Load platform schema to get editor blocks (for field mapping)
          const schemaResponse = await fetch(
            `${config.apiUrl || 'http://localhost:4000'}/api/platforms/${platformId}/schema`
          )
          
          let editorBlocks = []
          if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json()
            if (schemaData.success && schemaData.schema?.editor?.blocks) {
              editorBlocks = schemaData.schema.editor.blocks
            }
          }

          const template = templateData.template
          const templateContent = template.template || {}
          
          // Handle different template structures:
          // - Email: { subject: '...', html: '...' }
          // - LinkedIn: template: '...' (string)
          // - Reddit: { title: '...', text: '...' }
          
          // Apply template (same logic as GenericPlatformEditor)
          const newContent = { ...(platformContent[platformId] || {}) }
          
          // If template is a string (LinkedIn, Twitter, etc.), use it directly
          if (typeof templateContent === 'string') {
            const firstTextBlock = editorBlocks.find(b => 
              (b.type === 'paragraph' || b.type === 'text') && b.id !== 'subject' && b.id !== 'title'
            )
            if (firstTextBlock) {
              newContent[firstTextBlock.id] = replaceTemplateVariables(templateContent, templateVariables)
            }
          } else {
            // Template is an object - map fields to editor blocks
            editorBlocks.forEach(block => {
              const fieldName = block.id
              let fieldValue = templateContent[fieldName]
              
              // If no exact match, check for common field name mappings
              if (!fieldValue) {
                if (fieldName === 'body' && (templateContent.html || templateContent.text)) {
                  fieldValue = templateContent.html || templateContent.text
                } else if (fieldName === 'subject' && templateContent.subject) {
                  fieldValue = templateContent.subject
                } else if (fieldName === 'text' && (templateContent.text || templateContent.html)) {
                  fieldValue = templateContent.text || templateContent.html
                } else if (fieldName === 'title' && templateContent.title) {
                  fieldValue = templateContent.title
                }
              }
              
              if (fieldValue) {
                // Replace template variables with actual values
                const replacedValue = typeof fieldValue === 'string'
                  ? replaceTemplateVariables(fieldValue, templateVariables)
                  : fieldValue
                newContent[fieldName] = replacedValue
              }
            })
            
            // Fallback: If template has html/text but no body/text block found, apply to first paragraph/text block
            if ((templateContent.html || templateContent.text) && !newContent.body && !newContent.text) {
              const firstTextBlock = editorBlocks.find(b => 
                (b.type === 'paragraph' || b.type === 'text') && b.id !== 'subject' && b.id !== 'title'
              )
              if (firstTextBlock) {
                const templateText = templateContent.html || templateContent.text
                newContent[firstTextBlock.id] = replaceTemplateVariables(templateText, templateVariables)
              }
            }
          }

          // Apply via onApply callback
          if (onApply) {
            onApply(platformId, newContent)
          }

          results.applied.push({
            platformId,
            templateName: templateInfo.templateName
          })
        } catch (error) {
          results.errors.push({
            platformId,
            error: error.message || 'Failed to apply template'
          })
        }
      }

      setApplyResults(results)
      
      // Close modal if apply was successful (at least one platform applied)
      if (results.applied.length > 0 && results.errors.length === 0) {
        // Small delay to show success message
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error) {
      setApplyResults({
        applied: [],
        skipped: [],
        errors: [{
          platformId: 'general',
          error: error.message || 'Failed to apply templates'
        }]
      })
    } finally {
      setApplying(false)
    }
  }

  const handleClose = () => {
    if (!applying) {
      onClose()
    }
  }

  const getPlatformStatus = (platformId) => {
    const templateInfo = templates.find(t => t.platformId === platformId)
    const hasContent = hasExistingContent(platformId)
    
    if (!templateInfo?.hasTemplate) {
      return { type: 'missing', icon: <WarningIcon color="warning" />, text: 'No template' }
    }
    if (hasContent && !overwriteExisting) {
      return { type: 'blocked', icon: <InfoIcon color="info" />, text: 'Has content' }
    }
    if (hasContent && overwriteExisting) {
      return { type: 'overwrite', icon: <WarningIcon color="warning" />, text: 'Will overwrite' }
    }
    return { type: 'ready', icon: <CheckIcon color="success" />, text: 'Ready' }
  }

  const canApply = selectedCategory && 
    selectedPlatformsForApply.size > 0 && 
    templates.some(t => 
      selectedPlatformsForApply.has(t.platformId) && 
      t.hasTemplate &&
      (overwriteExisting || !hasExistingContent(t.platformId))
    )

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        🎯 Apply Templates to All Platforms
      </DialogTitle>
      
      <DialogContent>
        {/* Category Selection */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Filter by Category"
              disabled={categoriesLoading || applying}
            >
              {(categories || []).map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Options */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
                disabled={applying}
              />
            }
            label="Overwrite existing content"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
            If unchecked, templates will only be applied to platforms with no existing content.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Platform List */}
        {selectedCategory && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select Platforms ({selectedPlatformsForApply.size} selected)
            </Typography>
            
            {templatesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List dense>
                {templates.map((templateInfo) => {
                  const isSelected = selectedPlatformsForApply.has(templateInfo.platformId)
                  const status = getPlatformStatus(templateInfo.platformId)
                  
                  return (
                    <ListItem
                      key={templateInfo.platformId}
                      button
                      onClick={() => !applying && handlePlatformToggle(templateInfo.platformId)}
                      disabled={applying || !templateInfo.hasTemplate}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={isSelected}
                          disabled={applying || !templateInfo.hasTemplate}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {templateInfo.platformId}
                            </Typography>
                            {status.icon}
                            <Chip 
                              label={status.text} 
                              size="small"
                              color={
                                status.type === 'ready' ? 'success' :
                                status.type === 'missing' ? 'warning' :
                                status.type === 'blocked' ? 'info' : 'warning'
                              }
                            />
                          </Box>
                        }
                      />
                      {templateInfo.hasTemplate ? (
                        <Box sx={{ mt: 1 }}>
                          {templateInfo.availableTemplates && templateInfo.availableTemplates.length > 0 ? (
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                              <Select
                                value={selectedTemplates[templateInfo.platformId] || templateInfo.availableTemplates[0]?.templateId || templateInfo.availableTemplates[0]?.id || ''}
                                onChange={(e) => setSelectedTemplates({
                                  ...selectedTemplates,
                                  [templateInfo.platformId]: e.target.value
                                })}
                                disabled={applying}
                                displayEmpty
                              >
                                {templateInfo.availableTemplates.map(t => {
                                  const templateId = t.templateId || t.id
                                  const templateName = t.templateName || t.name
                                  return (
                                    <MenuItem key={templateId} value={templateId}>
                                      {templateName}
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No template available
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          No template for this category
                        </Typography>
                      )}
                    </ListItem>
                  )
                })}
              </List>
            )}
          </Box>
        )}

        {/* Apply Results */}
        {applyResults && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Apply Results:</Typography>
              <Typography variant="body2">
                ✅ Applied: {applyResults.applied.length}
              </Typography>
              {applyResults.skipped.length > 0 && (
                <Typography variant="body2">
                  ⏭️ Skipped: {applyResults.skipped.length}
                </Typography>
              )}
              {applyResults.errors.length > 0 && (
                <Typography variant="body2" color="error">
                  ❌ Errors: {applyResults.errors.length}
                </Typography>
              )}
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={applying}>
          {applyResults ? 'Close' : 'Cancel'}
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={!canApply || applying}
        >
          {applying ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Applying...
            </>
          ) : (
            'Apply to Selected Platforms'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BulkTemplateApplier

