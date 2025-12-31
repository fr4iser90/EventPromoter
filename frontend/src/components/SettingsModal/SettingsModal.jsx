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
  Divider
} from '@mui/material'
import useStore from '../../store'

function SettingsModal({ open, onClose }) {
  const { n8nWebhookUrl, setN8nWebhookUrl, loadAppConfig } = useStore()
  const [tempN8nUrl, setTempN8nUrl] = useState('')

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
    onClose()
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

          <TextField
            fullWidth
            label="N8N Webhook URL"
            value={tempN8nUrl}
            onChange={(e) => setTempN8nUrl(e.target.value)}
            placeholder="http://localhost:5678/webhook/multiplatform-publisher"
            helperText="Example: http://your-server.com/webhook/multiplatform-publisher"
            variant="outlined"
          />
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
