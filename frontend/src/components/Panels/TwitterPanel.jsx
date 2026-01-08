import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
          {t('panels.twitter.title')}
        </Typography>
      </Box>

      {/* Posting Mode */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('panels.twitter.postingMode.label')}</InputLabel>
        <Select
          value={postingMode}
          onChange={(e) => setPostingMode(e.target.value)}
          label={t('panels.twitter.postingMode.label')}
        >
          <MenuItem value="single">{t('panels.twitter.postingMode.single')}</MenuItem>
          <MenuItem value="thread">{t('panels.twitter.postingMode.thread')}</MenuItem>
          <MenuItem value="auto">{t('panels.twitter.postingMode.auto')}</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Options */}
      <Typography variant="subtitle2" gutterBottom>
        {t('panels.twitter.options.title')}
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
          label={t('panels.twitter.options.threadSupport')}
        />
        <FormControlLabel
          control={
            <Switch
              checked={autoTruncate}
              onChange={(e) => setAutoTruncate(e.target.checked)}
              size="small"
            />
          }
          label={t('panels.twitter.options.autoTruncate')}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Info */}
      <Alert severity="info" size="small">
        {t('panels.twitter.info.api')}
      </Alert>
    </Paper>
  )
}

export default TwitterPanel
