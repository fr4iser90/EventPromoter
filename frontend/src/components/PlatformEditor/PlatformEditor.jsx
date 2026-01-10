import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material'
import { usePlatformMetadata } from '../../hooks/usePlatformSchema'
import SchemaRenderer from '../SchemaRenderer/SchemaRenderer'
import config from '../../config'

function PlatformEditor({ platform, content, onChange, onCopy, isActive, onSelect }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { platform: platformData, loading, error } = usePlatformMetadata(platform)
  const [availableRecipients, setAvailableRecipients] = useState([])

  // Load platform-specific settings from backend (generic approach)
  useEffect(() => {
    const loadPlatformSettings = async () => {
      try {
        // Generic approach: try to load from config endpoint
        // This should be defined in platform schema settings
        const response = await fetch(`${config.apiUrl || 'http://localhost:4000'}/api/config/${platform}`)
        if (response.ok) {
          const configData = await response.json()
          // Platform-specific config structure is defined by platform schema
          setAvailableRecipients(configData.recipients || configData.availableSubreddits || [])
        }
        // Other platforms should load their settings from schema
      } catch (error) {
        console.error(`Failed to load ${platform} settings:`, error)
        setAvailableRecipients([])
      }
    }

    loadPlatformSettings()
  }, [platform])

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} sx={{ mb: 1 }} />
        <Typography variant="body2">Loading {platform}...</Typography>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to load {platform}: {error}
        </Alert>
      </Paper>
    )
  }

  // Use platform metadata from backend
  const platformColor = platformData?.color || platformData?.metadata?.color || '#666'
  const platformName = platformData?.name || platformData?.metadata?.displayName || platform
  const platformIcon = platformData?.icon || platformData?.metadata?.icon || '📝'
  const maxLength = platformData?.limits?.maxLength || platformData?.schema?.editor?.constraints?.maxLength

  // Get editor schema if available
  const editorSchema = platformData?.schema?.editor
  const editorBlocks = editorSchema?.blocks || []

  // Calculate text length
  const textLength = content?.text?.length || content?.caption?.length || 0
  const isValid = maxLength ? textLength <= maxLength : textLength > 0

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        border: `2px solid ${isActive ? platformColor : theme.palette.divider}`,
        cursor: 'pointer'
      }}
      onClick={onSelect}
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: platformColor }}>
        {platformIcon} {platformName} Editor
      </Typography>

      {/* Use schema-driven editor if available */}
      {editorSchema && editorBlocks.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          {editorBlocks
            .filter(block => block.ui?.enabled !== false)
            .sort((a, b) => (a.ui?.order || 999) - (b.ui?.order || 999))
            .map((block) => {
              const field = {
                name: block.id,
                type: block.type === 'paragraph' ? 'textarea' : 
                      block.type === 'heading' ? 'text' : 
                      block.type,
                label: block.label,
                description: block.description,
                required: block.required,
                placeholder: block.description,
                validation: block.validation,
                ui: block.ui,
                constraints: block.constraints
              }

              if (block.type === 'image' || block.type === 'video') {
                return (
                  <Box key={block.id} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {block.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Media upload component
                    </Typography>
                  </Box>
                )
              }

              return (
                <Box key={block.id} sx={{ mb: 2 }}>
                  <SchemaRenderer
                    fields={[field]}
                    values={content || {}}
                    onChange={(fieldName, value) => onChange(fieldName, value)}
                    errors={{}}
                  />
                </Box>
              )
            })}
        </Box>
      ) : (
        // Fallback: simple text editor if no schema
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Content"
          value={content?.text || content?.caption || ''}
          onChange={(e) => onChange('text', e.target.value)}
          placeholder={`Enter ${platformName} content...`}
          inputProps={{ maxLength }}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        {maxLength && (
          <Typography
            variant="body2"
            color={textLength > maxLength ? "error" : "text.secondary"}
          >
            Characters: {textLength}/{maxLength}
          </Typography>
        )}
        <Chip
          size="small"
          color={isValid ? "success" : "warning"}
          label={isValid ? t('status.ready') : t('status.draft')}
        />
      </Box>
    </Paper>
  )
}

export default PlatformEditor
