import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  TextField,
  Divider,
  Chip
} from '@mui/material'
import { useTemplates } from '../../hooks/useTemplates'

const SAMPLE_DATA = {
  eventTitle: 'Summer Music Festival 2025',
  date: '2025-07-15',
  time: '20:00',
  venue: 'Central Park',
  city: 'New York',
  description: 'An amazing outdoor music experience featuring local and international artists.',
  lineup: ['DJ Shadow', 'Bonobo', 'Four Tet'],
  genre: 'Electronic',
  price: '$45 - $85',
  organizer: 'City Events LLC',
  website: 'www.summerfest.com',
  ticketInfo: 'Tickets available at the venue or online'
}

function TemplatePreview({ template, platform }) {
  const [previewContent, setPreviewContent] = useState('')
  const [customVariables, setCustomVariables] = useState({})

  // Generate preview content when template or variables change
  useEffect(() => {
    if (!template) {
      setPreviewContent('')
      return
    }

    let content = ''

    // Get template content - use html if available, otherwise text
    const templateContent = template.template || {}
    content = templateContent.html || templateContent.text || ''

    // Replace variables with sample data
    const allVariables = { ...SAMPLE_DATA, ...customVariables }
    Object.entries(allVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g')

      // Handle array variables (like lineup)
      if (Array.isArray(value)) {
        content = content.replace(regex, value.join(', '))
      } else {
        content = content.replace(regex, String(value))
      }
    })

    setPreviewContent(content)
  }, [template, platform, customVariables])

  const handleVariableChange = (variable, value) => {
    setCustomVariables(prev => ({
      ...prev,
      [variable]: value
    }))
  }

  if (!template) {
    return (
      <Paper sx={{ p: 3, height: 'fit-content' }}>
        <Typography variant="h6" gutterBottom>
          👁️ Template Preview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select or create a template to see the preview
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3, height: 'fit-content' }}>
      <Typography variant="h6" gutterBottom>
        👁️ Template Preview: {template.name}
      </Typography>

      {/* Template Info */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={platform.charAt(0).toUpperCase() + platform.slice(1)} color="primary" size="small" />
          <Chip label={template.category} variant="outlined" size="small" />
          {template.isDefault && <Chip label="Default" color="secondary" size="small" />}
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {template.description || 'No description available'}
        </Typography>

        {/* Variables */}
        <Typography variant="subtitle2" gutterBottom>
          📋 Available Variables:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {template.variables.map(variable => (
            <Chip
              key={variable}
              label={`{${variable}}`}
              size="small"
              variant="outlined"
              color="info"
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Custom Variables Input */}
      <Typography variant="subtitle2" gutterBottom>
        🎛️ Customize Preview Variables:
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        {template.variables.map(variable => (
          <TextField
            key={variable}
            label={variable}
            size="small"
            value={customVariables[variable] || SAMPLE_DATA[variable] || ''}
            onChange={(e) => handleVariableChange(variable, e.target.value)}
            placeholder={`Enter ${variable}...`}
          />
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Preview Content */}
      <Typography variant="subtitle2" gutterBottom>
        📄 Preview Result:
      </Typography>

      {/* Render HTML if content contains HTML tags, otherwise render as text */}
      {previewContent.includes('<') && previewContent.includes('>') ? (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            bgcolor: 'background.paper',
            color: 'text.primary',
            maxHeight: 300,
            overflow: 'auto',
            // Ensure HTML content respects dark mode
            '& *': {
              color: 'inherit'
            },
            // Override hardcoded colors in HTML content
            '& p, & div, & span, & h1, & h2, & h3, & h4, & h5, & h6': {
              color: 'text.primary'
            },
            // Ensure backgrounds are transparent or use theme
            '& [style*="background"]': {
              backgroundColor: 'transparent !important'
            },
            '& [style*="color"]': {
              color: 'inherit !important'
            }
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
        </Box>
      ) : (
        <Paper
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: 300,
            overflow: 'auto'
          }}
        >
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
            {previewContent}
          </Typography>
        </Paper>
      )}

      {/* Character Count */}
      {!previewContent.includes('<') && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Characters: {previewContent.length}
        </Typography>
      )}
    </Paper>
  )
}

export default TemplatePreview
