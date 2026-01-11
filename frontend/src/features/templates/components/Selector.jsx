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
  Alert
} from '@mui/material'
import {
  KeyboardArrowDown as ArrowDownIcon,
  Description as TemplateIcon,
  Check as CheckIcon
} from '@mui/icons-material'
import { useTemplates } from '../hooks/useTemplates'
import useStore from '../../../store'
import { getTemplateVariables, replaceTemplateVariables } from '../../../shared/utils/templateUtils'

const TemplateSelector = ({ platform, onSelectTemplate, currentContent = '', sx = {} }) => {
  // Use mode='preview' to get templates without <style> tags (backend removes them)
  const { templates, loading, error } = useTemplates(platform, 'preview')
  const { parsedData, uploadedFileRefs } = useStore()
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    handleClose()

    // Generate preview content using parsedData and uploadedFileRefs
    const templateVariables = getTemplateVariables(parsedData, uploadedFileRefs)
    const templateContent = template.template || {}
    const previewText = templateContent.html || templateContent.text || ''
    const filledContent = replaceTemplateVariables(previewText, templateVariables)
    
    setPreviewContent(filledContent)
    setPreviewOpen(true)
  }

  const handleApplyTemplate = () => {
    if (selectedTemplate && onSelectTemplate) {
      // Pass template and variables to parent - parent will handle replacement
      onSelectTemplate(selectedTemplate, null)
    }
    setPreviewOpen(false)
    setSelectedTemplate(null)
  }

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
              // Generic override: ALL elements inherit colors (no platform-specific classes!)
              '& *': {
                color: 'inherit !important'
              },
              // Generic override: ALL backgrounds transparent (no platform-specific classes!)
              '& *[style*="background"]': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important'
              },
              // Override ALL style tags inside the HTML (generic - no platform knowledge!)
              '& style': {
                display: 'none !important'
              }
            }}
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />

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
