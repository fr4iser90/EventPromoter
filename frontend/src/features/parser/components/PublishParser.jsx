// Publish Parser - Handles manual finalization before submission
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import PublishIcon from '@mui/icons-material/Publish'
import axios from 'axios'
import useStore from '../../../store'
import { getApiUrl } from '../../../shared/utils/api'
import { Results as PublishResults } from '../../publish'
import { usePlatforms } from '../../platform/hooks/usePlatformSchema'
import PublisherProgress from '../../publish/components/PublisherProgress'

function PublishParser() {
  const { t } = useTranslation()
  const {
    selectedPlatforms,
    platformContent,
    submit,
    isProcessing,
    error,
    successMessage
  } = useStore()

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [publishSessionId, setPublishSessionId] = useState(null)
  const { platforms } = usePlatforms()

  // Get platform info from backend - GENERIC
  const getPlatformInfo = (platformId) => {
    if (!platforms || platforms.length === 0) {
      return { name: platformId, icon: '📝', color: '#666' }
    }

    const platform = platforms.find(p => p.id === platformId)
    if (platform) {
      return {
        name: platform.name || platform.metadata?.displayName || platformId,
        icon: platform.icon || platform.metadata?.icon || '📝',
        color: platform.color || platform.metadata?.color || '#666'
      }
    }

    return { name: platformId, icon: '📝', color: '#666' }
  }

  // Validate content before publishing - GENERIC (schema-based)
  const validateForPublish = async () => {
    const errors = []

    for (const platformId of selectedPlatforms) {
      const content = platformContent[platformId] || {}
      const platform = platforms?.find(p => p.id === platformId)
      const schema = platform?.schema

      // Try to load schema if not available
      let editorSchema = schema?.editor
      if (!editorSchema && platformId) {
        try {
          const response = await fetch(getApiUrl(`platforms/${platformId}/schema`))
          if (response.ok) {
            const data = await response.json()
            editorSchema = data.schema?.editor
          }
        } catch (err) {
          console.warn(`Failed to load schema for ${platformId}:`, err)
        }
      }

      // Generic validation based on schema
      if (editorSchema?.blocks) {
        for (const block of editorSchema.blocks) {
          if (block.fields) {
            for (const field of block.fields) {
              const value = content[field.name]
              
              // Check required fields
              if (field.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
                const platformName = getPlatformInfo(platformId).name
                errors.push(`${platformName}: ${field.label || field.name} is required`)
              }

              // Check max length
              if (field.validation) {
                for (const rule of field.validation) {
                  if (rule.type === 'maxLength' && value && value.length > rule.value) {
                    const platformName = getPlatformInfo(platformId).name
                    errors.push(`${platformName}: ${field.label || field.name} exceeds ${rule.value} characters (${value.length})`)
                  }
                }
              }
            }
          }
        }
      } else {
        // Fallback: basic validation if no schema available
        const hasContent = Object.keys(content).some(key => {
          const value = content[key]
          return value && (typeof value === 'string' ? value.trim().length > 0 : Array.isArray(value) ? value.length > 0 : true)
        })
        
        if (!hasContent) {
          const platformName = getPlatformInfo(platformId).name
          errors.push(`${platformName}: Content is required`)
        }
      }
    }

    return errors
  }

  // Handle publish button click
  const handlePublishClick = async () => {
    const errors = await validateForPublish()
    setValidationErrors(errors)

    if (errors.length === 0) {
      setShowConfirmDialog(true)
    }
  }

  // Execute the publish process
  const handleConfirmPublish = async () => {
    setShowConfirmDialog(false)
    const sessionId = await submit()
    if (sessionId) {
      setPublishSessionId(sessionId)
      setShowResults(true)
    }
  }

  // Handle completion of publishing
  const handlePublishComplete = (data) => {
    console.log('Publishing completed:', data)
    // Results will be shown automatically
  }

  // ✅ Retry failed platform
  const handleRetryPlatform = async (platformId) => {
    console.log(`🔄 Retrying publish for platform: ${platformId}`)
    
    try {
      const eventId = useStore.getState().currentEvent?.id
      if (!eventId) {
        throw new Error('No current event found')
      }

      // Create a new session for retry
      const payload = {
        eventId: eventId,
        platforms: { [platformId]: true } // Only retry this platform
      }

      const response = await axios.post(getApiUrl('submit'), payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000 // 5 minutes timeout
      })

      const newSessionId = response.data?.publishSessionId
      if (newSessionId) {
        setPublishSessionId(newSessionId)
        setShowResults(true)
        console.log(`✅ Retry started for ${platformId}, new session: ${newSessionId}`)
      }
    } catch (error) {
      console.error(`Failed to retry platform ${platformId}:`, error)
      setValidationErrors([`Failed to retry ${platformId}: ${error.message}`])
    }
  }

  // Get platform status
  const getPlatformStatus = () => {
    return selectedPlatforms.map(platform => {
      const content = platformContent[platform] || {}
      const hasContent = content.text || content.caption || content.subject
      return {
        platform,
        status: hasContent ? 'ready' : 'draft',
        content
      }
    })
  }

  const platformStatuses = getPlatformStatus()

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🚀 Publish Parser - Manual Finalization
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Review and finalize your content before publishing to selected platforms.
      </Typography>

      {/* Platform Status Overview */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Platform Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {platformStatuses.map(({ platform, status }) => {
            const info = getPlatformInfo(platform)
            return (
              <Chip
                key={platform}
                icon={<span>{info.icon}</span>}
                label={`${info.name}: ${status === 'ready' ? 'Ready' : 'Draft'}`}
                color={status === 'ready' ? 'success' : 'warning'}
                variant="outlined"
              />
            )
          })}
        </Box>
      </Box>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Please fix the following issues before publishing:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Processing Status */}
      {isProcessing && publishSessionId && (
        <PublisherProgress 
          sessionId={publishSessionId} 
          onComplete={handlePublishComplete}
          onRetry={handleRetryPlatform}
        />
      )}
      
      {isProcessing && !publishSessionId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>Publishing to platforms...</Typography>
          </Box>
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Real-time Progress (SSE) */}
      {isProcessing && publishSessionId && (
        <PublisherProgress 
          sessionId={publishSessionId} 
          onComplete={handlePublishComplete}
        />
      )}

      {/* Publish Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PublishIcon />}
          onClick={handlePublishClick}
          disabled={isProcessing || selectedPlatforms.length === 0}
          sx={{
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)'
            }
          }}
        >
          🚀 Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
        </Button>
      </Box>

      {/* Confirm Publish Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Publishing</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            You are about to publish to the following platforms:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {selectedPlatforms.map(platformId => {
              const info = getPlatformInfo(platformId)
              return (
                <Chip
                  key={platformId}
                  icon={<span>{info.icon}</span>}
                  label={info.name}
                  sx={{ borderColor: info.color, color: info.color }}
                  variant="outlined"
                />
              )
            })}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. Make sure all content is ready for publishing.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleConfirmPublish} variant="contained" color="primary">
            Confirm Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish Results Panel */}
      <PublishResults
        open={showResults}
        onClose={() => setShowResults(false)}
        publishSessionId={publishSessionId}
      />
    </Paper>
  )
}

export default PublishParser
