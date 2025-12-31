// Publish Parser - Handles manual finalization before submission
import React, { useState } from 'react'
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
import useStore from '../../store'

function PublishParser() {
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

  // Validate content before publishing
  const validateForPublish = () => {
    const errors = []

    selectedPlatforms.forEach(platform => {
      const content = platformContent[platform] || {}

      switch (platform) {
        case 'twitter':
          if (!content.text || content.text.trim().length === 0) {
            errors.push(`Twitter: Tweet text is required`)
          } else if (content.text.length > 280) {
            errors.push(`Twitter: Tweet exceeds 280 characters (${content.text.length})`)
          }
          break

        case 'instagram':
          if (!content.caption || content.caption.trim().length === 0) {
            errors.push(`Instagram: Caption is required`)
          } else if (content.caption.length > 2200) {
            errors.push(`Instagram: Caption exceeds 2200 characters (${content.caption.length})`)
          }
          break

        case 'facebook':
          if (!content.text || content.text.trim().length === 0) {
            errors.push(`Facebook: Post text is required`)
          }
          break

        case 'linkedin':
          if (!content.text || content.text.trim().length === 0) {
            errors.push(`LinkedIn: Post content is required`)
          }
          break

        case 'reddit':
          if (!content.title || content.title.trim().length === 0) {
            errors.push(`Reddit: Title is required`)
          }
          if (!content.body || content.body.trim().length === 0) {
            errors.push(`Reddit: Body content is required`)
          }
          break

        case 'email':
          if (!content.subject || content.subject.trim().length === 0) {
            errors.push(`Email: Subject is required`)
          }
          if (!content.html || content.html.trim().length === 0) {
            errors.push(`Email: HTML content is required`)
          }
          if (!content.recipients || content.recipients.length === 0) {
            errors.push(`Email: At least one recipient is required`)
          }
          break

        default:
          errors.push(`${platform}: Content validation not implemented`)
      }
    })

    return errors
  }

  // Handle publish button click
  const handlePublishClick = () => {
    const errors = validateForPublish()
    setValidationErrors(errors)

    if (errors.length === 0) {
      setShowConfirmDialog(true)
    }
  }

  // Execute the publish process
  const handleConfirmPublish = async () => {
    setShowConfirmDialog(false)
    await submit()
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
            const configs = {
              twitter: { icon: '🐦', color: 'primary' },
              instagram: { icon: '📸', color: 'secondary' },
              facebook: { icon: '👥', color: 'success' },
              linkedin: { icon: '💼', color: 'info' },
              email: { icon: '📧', color: 'warning' }
            }
            const config = configs[platform] || { icon: '📝', color: 'default' }

            return (
              <Chip
                key={platform}
                icon={<span>{config.icon}</span>}
                label={`${platform}: ${status === 'ready' ? 'Ready' : 'Draft'}`}
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
      {isProcessing && (
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
            {selectedPlatforms.map(platform => {
              const configs = {
                twitter: { icon: '🐦', color: 'primary' },
                instagram: { icon: '📸', color: 'secondary' },
                facebook: { icon: '👥', color: 'success' },
                linkedin: { icon: '💼', color: 'info' },
                email: { icon: '📧', color: 'warning' }
              }
              const config = configs[platform] || { icon: '📝', color: 'default' }

              return (
                <Chip
                  key={platform}
                  icon={<span>{config.icon}</span>}
                  label={platform}
                  color={config.color}
                />
              )
            })}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. Make sure all content is ready for publishing.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmPublish} variant="contained" color="primary">
            Confirm Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default PublishParser
