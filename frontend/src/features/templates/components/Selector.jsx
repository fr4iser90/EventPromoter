import React, { useState } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Tooltip
} from '@mui/material'
import {
  KeyboardArrowDown as ArrowDownIcon,
  Description as TemplateIcon,
  Check as CheckIcon,
  AttachFile as AttachFileIcon,
  Lock as LockIcon,
  Public as PublicIcon
} from '@mui/icons-material'
import { useTemplates } from '../hooks/useTemplates'
import { usePlatformSchema } from '../../platform/hooks/usePlatformSchema'
import CompositeRenderer from '../../schema/components/CompositeRenderer'
import FileSelectionBlock from '../../platform/components/blocks/FileSelectionBlock'
import useStore from '../../../store'
import { getTemplateVariables, replaceTemplateVariables } from '../../../shared/utils/templateUtils'
import { getApiUrl } from '../../../shared/utils/api'

const TemplateSelector = ({ platform, onSelectTemplate, currentContent = '', globalFiles = [], sx = {} }) => {
  // Use mode='preview' to get templates without <style> tags (backend removes them)
  const { templates, loading, error } = useTemplates(platform, 'preview')
  const { schema } = usePlatformSchema(platform) // Load schema to check for targets block
  const { parsedData, uploadedFileRefs } = useStore()
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [targetsValue, setTargetsValue] = useState(null) // Store targets selection
  const [specificFiles, setSpecificFiles] = useState([]) // NEW: Specific files for this run

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template)
    handleClose()

    // Generate preview content using parsedData and uploadedFileRefs
    const templateVariables = getTemplateVariables(parsedData, uploadedFileRefs)
    const templateContent = template.template || {}
    const previewText = templateContent.html || templateContent.text || ''
    const filledContent = replaceTemplateVariables(previewText, templateVariables)
    
    // ✅ Use Backend Preview API for consistent rendering (same as Platform Preview)
    // This ensures Markdown is rendered the same way everywhere
    try {
      // Create temporary content object for preview
      const previewContentObj = templateContent.html 
        ? { bodyText: filledContent } // HTML template
        : { text: filledContent }      // Markdown/text template
      
      const response = await fetch(getApiUrl(`platforms/${platform}/preview?mode=desktop&darkMode=false`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: previewContentObj })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to render preview: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (!data.success || !data.html) {
        throw new Error(data.error || 'Failed to render preview')
      }
      
      // Use backend-rendered HTML
      setPreviewContent(data.html)
      setPreviewOpen(true)
    } catch (error) {
      console.error('Failed to render template preview:', error)
      // Show error - no fallback
      setPreviewContent(`<div style="padding: 20px; color: red;">
        <strong>Error rendering preview:</strong><br/>
        ${error.message || 'Failed to load preview from backend'}
      </div>`)
      setPreviewOpen(true)
    }
  }

  // Check if platform has targets block in editor schema
  const editorSchema = schema?.editor
  const targetsBlock = editorSchema?.blocks?.find(block => block.type === 'targets')

  const handleApplyTemplate = () => {
    if (selectedTemplate && onSelectTemplate) {
      // Pass template, variables, targets, and specific files to parent
      onSelectTemplate(selectedTemplate, null, targetsValue, specificFiles.map(f => f.id))
    }
    setPreviewOpen(false)
    setSelectedTemplate(null)
    setTargetsValue(null)
    setSpecificFiles([])
  }

  // Handle specific file toggle
  const handleToggleSpecificFile = (file) => {
    const isSelected = specificFiles.some(f => f.id === file.id);
    if (isSelected) {
      setSpecificFiles(specificFiles.filter(f => f.id !== file.id));
    } else {
      if (specificFiles.length >= 10) return;
      setSpecificFiles([...specificFiles, { id: file.id, filename: file.filename }]);
    }
  };

  // Helper: Is file standard (global)?
  const isGlobalFile = (fileId) => {
    // globalFiles is an array of IDs or objects depending on how it's stored
    return globalFiles.some(gf => (typeof gf === 'string' ? gf === fileId : gf.id === fileId));
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push(template)
    return acc
  }, {})

  const open = Boolean(anchorEl)

  return (
    <>
      <Box sx={sx}>
        <Button
          variant="outlined"
          onClick={handleClick}
          endIcon={<ArrowDownIcon />}
          disabled={loading || templates.length === 0}
          sx={{
            minWidth: 200,
            justifyContent: 'space-between',
            textTransform: 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TemplateIcon fontSize="small" />
            <span>
              {templates.length === 0 ? 'No templates' :
               templates.length === 1 ? '1 template' :
               `${templates.length} templates`}
            </span>
          </Box>
        </Button>

        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            Error loading templates
          </Typography>
        )}

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: { minWidth: 300, maxWidth: 400 }
          }}
        >
          {Object.keys(groupedTemplates).length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No templates available
              </Typography>
            </MenuItem>
          ) : (
            Object.entries(groupedTemplates).map(([category, categoryTemplates]) => [
              <Box key={`header-${category}`} sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                  {category.replace('-', ' ')}
                </Typography>
              </Box>,
              ...categoryTemplates.map((template) => (
                <MenuItem
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {template.name}
                    </Typography>
                    {template.isDefault && (
                      <Chip label="Default" size="small" color="primary" variant="outlined" sx={{ ml: 1, fontSize: '0.7rem' }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                    Variables: {template.variables.join(', ')}
                  </Typography>
                </MenuItem>
              )),
              Object.keys(groupedTemplates).length > 1 && <Divider key={`divider-${category}`} />
            ])
          )}
        </Menu>
      </Box>

      {/* Template Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply Template: {selectedTemplate?.name}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This template will replace your current content. Variables have been filled with data extracted from your current content.
          </Alert>

          <Typography variant="subtitle1" gutterBottom>
            Preview:
          </Typography>

          {/* Use iframe for backend-rendered HTML (consistent with Platform Preview) */}
          {previewContent.includes('<!DOCTYPE html>') || previewContent.includes('<html>') ? (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                maxHeight: 400,
                height: 400
              }}
            >
              <iframe
                srcDoc={previewContent}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title="Template Preview"
              />
            </Box>
          ) : (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                bgcolor: 'background.paper',
                color: 'text.primary',
                maxHeight: 400,
                overflow: 'auto',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  marginBottom: 1
                },
                '& a': {
                  color: 'primary.main'
                },
                '& *': {
                  color: 'inherit !important'
                },
                '& *[style*="background"]': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important'
                },
                '& style': {
                  display: 'none !important'
                }
              }}
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          )}

          {selectedTemplate && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Variables used:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedTemplate.variables.map(variable => (
                  <Chip
                    key={variable}
                    label={`{${variable}}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* ✅ GENERIC: Show targets selection if schema defines targets block */}
          {targetsBlock && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {targetsBlock.label || 'Targets'}
              </Typography>
              {targetsBlock.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {targetsBlock.description}
                </Typography>
              )}
              <CompositeRenderer
                block={targetsBlock}
                value={targetsValue}
                onChange={setTargetsValue}
                platform={platform}
              />
            </Box>
          )}

          {/* ✅ NEW: Specific Files Selection (Modell C) */}
          {platform === 'email' && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachFileIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Anhänge für diesen Run
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Wählen Sie zusätzliche Anhänge für diese Gruppe aus. Standard-Anhänge sind bereits voreingestellt.
              </Typography>

              <List dense sx={{ bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                {uploadedFileRefs.map((file) => {
                  const isStandard = isGlobalFile(file.id);
                  const isSelected = specificFiles.some(f => f.id === file.id);
                  const isDisabled = isStandard;

                  return (
                    <MenuItem 
                      key={file.id} 
                      onClick={() => !isDisabled && handleToggleSpecificFile(file)}
                      disabled={isDisabled}
                      sx={{ opacity: isDisabled ? 0.7 : 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Checkbox
                          edge="start"
                          checked={isStandard || isSelected}
                          disabled={isDisabled}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.filename}
                        secondary={isStandard ? 'Standard (Global)' : file.type}
                        primaryTypographyProps={{ 
                          variant: 'body2', 
                          fontWeight: (isStandard || isSelected) ? 'bold' : 'normal' 
                        }}
                      />
                      {file.visibility === 'public' ? (
                        <Tooltip title="Öffentlich (Public)">
                          <PublicIcon fontSize="small" color="success" sx={{ opacity: 0.6 }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Intern (Internal)">
                          <LockIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                        </Tooltip>
                      )}
                    </MenuItem>
                  );
                })}
              </List>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Gesamt für diese Gruppe: {specificFiles.length + globalFiles.length} Anhänge
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyTemplate}
            variant="contained"
            startIcon={<CheckIcon />}
          >
            Apply Template
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TemplateSelector
