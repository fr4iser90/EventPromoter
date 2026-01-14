import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  CircularProgress
} from '@mui/material'
import useStore from '../../../../store'

function SettingsModal({ open, onClose }) {
  const { n8nWebhookUrl, setN8nWebhookUrl, loadAppConfig } = useStore()
  const [tempN8nUrl, setTempN8nUrl] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState(null) // null, true, false

  // Load config and update temp value when modal opens
  useEffect(() => {
    if (open) {
      // Ensure config is loaded
      loadAppConfig().then(() => {
        // Use current n8nWebhookUrl after config is loaded
        setTempN8nUrl(n8nWebhookUrl || 'http://localhost:5678/webhook/multiplatform-publisher')
      })
    }
  }, [open, n8nWebhookUrl, loadAppConfig])

  const handleSave = () => {
    setN8nWebhookUrl(tempN8nUrl)
    onClose()
  }

  const handleCancel = () => {
    setTempN8nUrl(n8nWebhookUrl) // Reset to current value
    setValidationStatus(null) // Reset validation status
    onClose()
  }

  const handleValidate = async () => {
    if (!tempN8nUrl || !tempN8nUrl.trim()) {
      setValidationStatus(false)
      return
    }

    setIsValidating(true)
    setValidationStatus(null)

    try {
      // Try to reach the n8n webhook with a minimal test request
      // Use OPTIONS first (CORS preflight), if that fails, try a minimal POST
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      try {
        // Try OPTIONS first (less intrusive)
        const optionsResponse = await fetch(tempN8nUrl, {
          method: 'OPTIONS',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        clearTimeout(timeoutId)
        
        // If OPTIONS works, consider it valid
        if (optionsResponse.ok || optionsResponse.status < 500) {
          setValidationStatus(true)
          return
        }
      } catch (optionsError) {
        // OPTIONS might not be supported, try POST with minimal payload
        clearTimeout(timeoutId)
      }

      // Try POST with minimal test payload
      const postController = new AbortController()
      const postTimeoutId = setTimeout(() => postController.abort(), 5000)

      const response = await fetch(tempN8nUrl, {
        method: 'POST',
        signal: postController.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      })

      clearTimeout(postTimeoutId)

      // Consider it valid if we get any response (even error responses mean server is reachable)
      if (response.status < 500) {
        setValidationStatus(true)
      } else {
        setValidationStatus(false)
      }
    } catch (error) {
      // Connection error, server not reachable
      setValidationStatus(false)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        ⚙️ Application Settings
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            N8N Integration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure the webhook URL for your N8N automation server.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="N8N Webhook URL"
              value={tempN8nUrl}
              onChange={(e) => {
                setTempN8nUrl(e.target.value)
                setValidationStatus(null) // Reset validation when URL changes
              }}
              placeholder="http://localhost:5678/webhook/multiplatform-publisher"
              helperText="Example: http://your-server.com/webhook/multiplatform-publisher"
              variant="outlined"
              error={validationStatus === false}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleValidate}
              disabled={isValidating || !tempN8nUrl?.trim()}
              sx={{ mt: 0.5, minWidth: 100 }}
            >
              {isValidating ? <CircularProgress size={20} /> : 'Validate'}
            </Button>
          </Box>
          
          {validationStatus !== null && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: validationStatus ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}
              >
                {validationStatus ? '✓ Ja' : '✗ Nein'}
              </Typography>
              {validationStatus && (
                <Typography variant="body2" color="text.secondary">
                  N8N ist erreichbar
                </Typography>
              )}
              {!validationStatus && (
                <Typography variant="body2" color="text.secondary">
                  N8N ist nicht erreichbar
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="body2" color="text.secondary">
            💡 Tip: Your N8N webhook should be configured to receive POST requests with JSON payload containing files, hashtags, and platform settings.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsModal
