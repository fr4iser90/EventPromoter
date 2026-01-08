import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material'

function GenericPlatformEditor({ platform, content, onChange, onCopy, isActive, onSelect }) {
  const { t } = useTranslation()
  const [platformConfig, setPlatformConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load platform configuration dynamically
  useEffect(() => {
    const loadPlatformConfig = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:4000/api/platforms/${platform}`)
        if (!response.ok) {
          throw new Error(`Failed to load platform config: ${response.status}`)
        }
        const data = await response.json()
        setPlatformConfig(data.platform)
        setError(null)
      } catch (err) {
        console.error(`Failed to load config for ${platform}:`, err)
        setError(err.message)
        // Fallback to basic config
        setPlatformConfig(getFallbackConfig(platform))
      } finally {
        setLoading(false)
      }
    }

    if (platform) {
      loadPlatformConfig()
    }
  }, [platform])

  // Fallback configuration for development
  const getFallbackConfig = (platformId) => {
    const configs = {
      twitter: {
        id: 'twitter',
        name: 'Twitter/X',
        limits: { maxLength: 280 },
        fields: [
          {
            type: 'textarea',
            name: 'text',
            label: 'Tweet Text',
            placeholder: 'What\'s happening?',
            required: true,
            maxLength: 280,
            rows: 4
          }
        ]
      },
      instagram: {
        id: 'instagram',
        name: 'Instagram',
        limits: { maxLength: 2200 },
        fields: [
          {
            type: 'textarea',
            name: 'caption',
            label: 'Instagram Caption',
            placeholder: 'Write a caption for your post...',
            required: true,
            maxLength: 2200,
            rows: 6
          }
        ]
      },
      facebook: {
        id: 'facebook',
        name: 'Facebook',
        limits: { maxLength: 63206 },
        fields: [
          {
            type: 'textarea',
            name: 'text',
            label: 'Facebook Post',
            placeholder: 'Share your thoughts...',
            required: true,
            maxLength: 63206,
            rows: 4
          }
        ]
      },
      linkedin: {
        id: 'linkedin',
        name: 'LinkedIn',
        limits: { maxLength: 3000 },
        fields: [
          {
            type: 'textarea',
            name: 'text',
            label: 'LinkedIn Post',
            placeholder: 'Share professional insights...',
            required: true,
            maxLength: 3000,
            rows: 6
          }
        ]
      },
      reddit: {
        id: 'reddit',
        name: 'Reddit',
        limits: { maxLength: 40000 },
        fields: [
          {
            type: 'text',
            name: 'title',
            label: 'Post Title',
            placeholder: 'Enter an engaging title...',
            required: true,
            maxLength: 300
          },
          {
            type: 'textarea',
            name: 'body',
            label: 'Post Body',
            placeholder: 'Write your post content...',
            required: true,
            maxLength: 40000,
            rows: 6
          },
          {
            type: 'text',
            name: 'subreddit',
            label: 'Subreddit',
            placeholder: 'r/subreddit',
            required: true
          }
        ]
      },
      email: {
        id: 'email',
        name: 'Email',
        limits: { maxLength: 50000 },
        fields: [
          {
            type: 'text',
            name: 'subject',
            label: 'Email Subject',
            placeholder: 'Enter email subject...',
            required: true,
            maxLength: 78
          },
          {
            type: 'textarea',
            name: 'html',
            label: 'Email Content',
            placeholder: 'Write your email content...',
            required: true,
            maxLength: 50000,
            rows: 8
          },
          {
            type: 'multiselect',
            name: 'recipients',
            label: 'Email Recipients',
            placeholder: 'Select recipients...',
            required: true
          }
        ]
      }
    }

    return configs[platformId] || {
      id: platformId,
      name: platformId,
      limits: { maxLength: 1000 },
      fields: [
        {
          type: 'textarea',
          name: 'text',
          label: `${platformId} Content`,
          placeholder: `Enter your ${platformId} content...`,
          required: true,
          maxLength: 1000,
          rows: 4
        }
      ]
    }
  }

  // Calculate character count and validation
  const getTextLength = () => {
    if (!platformConfig?.fields) return 0

    for (const field of platformConfig.fields) {
      if (field.type === 'textarea' && content[field.name]) {
        return content[field.name].length
      }
    }
    return 0
  }

  const textLength = getTextLength()
  const isValid = platformConfig?.limits?.maxLength
    ? textLength <= platformConfig.limits.maxLength
    : textLength > 0

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} sx={{ mb: 1 }} />
        <Typography variant="body2">{t('status.loadingPlatformConfig', { platform })}</Typography>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 1 }}>
          Failed to load {platform} configuration: {error}
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        border: `2px solid ${isActive ? '#1976d2' : '#e0e0e0'}`,
        cursor: 'pointer'
      }}
      onClick={onSelect}
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        📝 {platformConfig?.name || platform} Editor
      </Typography>

      {platformConfig?.fields?.map((field) => (
        <GenericField
          key={field.name}
          field={field}
          value={content[field.name] || ''}
          onChange={(value) => onChange(field.name, value)}
          sx={{ mb: 2 }}
        />
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        {platformConfig?.limits?.maxLength && (
          <Typography
            variant="body2"
            color={textLength > platformConfig.limits.maxLength ? "error" : "text.secondary"}
          >
            Characters: {textLength}/{platformConfig.limits.maxLength}
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

// Generic field component for dynamic form generation
function GenericField({ field, value, onChange, sx }) {
  const handleChange = (event) => {
    onChange(event.target.value)
  }

  switch (field.type) {
    case 'textarea':
      return (
        <TextField
          fullWidth
          multiline
          rows={field.rows || 4}
          label={field.label}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          inputProps={{ maxLength: field.maxLength }}
          variant="outlined"
          sx={sx}
        />
      )

    case 'text':
      return (
        <TextField
          fullWidth
          type="text"
          label={field.label}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          inputProps={{ maxLength: field.maxLength }}
          variant="outlined"
          sx={sx}
        />
      )

    case 'multiselect':
      return (
        <FormControl fullWidth variant="outlined" sx={sx}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(event) => onChange(event.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(Array.isArray(selected) ? selected : []).map((item) => (
                  <Chip key={item} label={item} size="small" />
                ))}
              </Box>
            )}
          >
            {/* This would be populated from backend - placeholder for now */}
            <MenuItem value="test@example.com">test@example.com</MenuItem>
            <MenuItem value="user@example.com">user@example.com</MenuItem>
          </Select>
        </FormControl>
      )

    default:
      return (
        <TextField
          fullWidth
          label={field.label || field.name}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          variant="outlined"
          sx={sx}
        />
      )
  }
}

export default GenericPlatformEditor
