import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material'
import TwitterIcon from '@mui/icons-material/Twitter'
import useStore from '../../store'

function TwitterPanel() {
  const { platformSettings, setPlatformSettings } = useStore()
  const [postingMode, setPostingMode] = useState('single')
  const [includeThread, setIncludeThread] = useState(false)
  const [autoTruncate, setAutoTruncate] = useState(true)

  // Panel settings are now managed by backend
  // No localStorage persistence needed

  return (
    <Paper elevation={3} sx={{
      p: 2,
      width: { xs: '100%', sm: 280 },
      maxWidth: { xs: '100%', sm: 280 },
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TwitterIcon sx={{ mr: 1, color: '#1DA1F2' }} />
        <Typography variant="h6">
          Twitter Settings
        </Typography>
      </Box>

      {/* Posting Mode */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Posting Mode</InputLabel>
        <Select
          value={postingMode}
          onChange={(e) => setPostingMode(e.target.value)}
          label="Posting Mode"
        >
          <MenuItem value="single">Single Tweet</MenuItem>
          <MenuItem value="thread">Thread</MenuItem>
          <MenuItem value="auto">Auto (Thread if needed)</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Options */}
      <Typography variant="subtitle2" gutterBottom>
        Options
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={includeThread}
              onChange={(e) => setIncludeThread(e.target.checked)}
              size="small"
            />
          }
          label="Thread-Unterstützung"
        />
        <FormControlLabel
          control={
            <Switch
              checked={autoTruncate}
              onChange={(e) => setAutoTruncate(e.target.checked)}
              size="small"
            />
          }
          label="Automatisch kürzen (280 Zeichen)"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Info */}
      <Alert severity="info" size="small">
        Twitter API ist sehr zuverlässig und schnell. Keine zusätzlichen Credentials nötig.
      </Alert>
    </Paper>
  )
}

export default TwitterPanel
