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
  Switch,
  Slider,
  TextField
} from '@mui/material'
import InstagramIcon from '@mui/icons-material/Instagram'
import useStore from '../../store'

function InstagramPanel() {
  const { t } = useTranslation()
  const { platformSettings, setPlatformSettings } = useStore()
  const [accountType, setAccountType] = useState('business')
  const [postingMode, setPostingMode] = useState('post')
  const [hashtagStrategy, setHashtagStrategy] = useState('moderate')
  const [maxHashtags, setMaxHashtags] = useState(30)
  const [requireImage, setRequireImage] = useState(true)

  // Panel settings are now managed by backend
  // No localStorage persistence needed

  const getHashtagStrategyDescription = (strategy) => {
    switch (strategy) {
      case 'minimal': return t('panels.instagram.hashtagStrategy.minimal.description')
      case 'moderate': return t('panels.instagram.hashtagStrategy.moderate.description')
      case 'maximal': return t('panels.instagram.hashtagStrategy.maximal.description')
      default: return ''
    }
  }

  return (
    <Paper elevation={3} sx={{
      p: 2,
      width: { xs: '100%', sm: 280 },
      maxWidth: { xs: '100%', sm: 280 },
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <InstagramIcon sx={{ mr: 1, color: '#E4405F' }} />
        <Typography variant="h6">
          {t('panels.instagram.title')}
        </Typography>
      </Box>

      {/* Account Type */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('panels.instagram.accountType.label')}</InputLabel>
        <Select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          label={t('panels.instagram.accountType.label')}
        >
          <MenuItem value="personal">{t('panels.instagram.accountType.personal')}</MenuItem>
          <MenuItem value="business">{t('panels.instagram.accountType.business')}</MenuItem>
          <MenuItem value="creator">{t('panels.instagram.accountType.creator')}</MenuItem>
        </Select>
      </FormControl>

      {/* Posting Mode */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('panels.instagram.postingMode.label')}</InputLabel>
        <Select
          value={postingMode}
          onChange={(e) => setPostingMode(e.target.value)}
          label={t('panels.instagram.postingMode.label')}
        >
          <MenuItem value="post">{t('panels.instagram.postingMode.post')}</MenuItem>
          <MenuItem value="reel">{t('panels.instagram.postingMode.reel')}</MenuItem>
          <MenuItem value="story">{t('panels.instagram.postingMode.story')}</MenuItem>
          <MenuItem value="carousel">{t('panels.instagram.postingMode.carousel')}</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Hashtag Strategy */}
      <Typography variant="subtitle2" gutterBottom>
        {t('panels.instagram.hashtagStrategy.title')}
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <Select
          value={hashtagStrategy}
          onChange={(e) => setHashtagStrategy(e.target.value)}
          size="small"
        >
          <MenuItem value="minimal">{t('panels.instagram.hashtagStrategy.minimal.label')}</MenuItem>
          <MenuItem value="moderate">{t('panels.instagram.hashtagStrategy.moderate.label')}</MenuItem>
          <MenuItem value="maximal">{t('panels.instagram.hashtagStrategy.maximal.label')}</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        {getHashtagStrategyDescription(hashtagStrategy)}
      </Typography>

      {/* Max Hashtags Slider */}
      <Typography variant="subtitle2" gutterBottom>
        {t('panels.instagram.maxHashtags')}: {maxHashtags}
      </Typography>
      <Slider
        value={maxHashtags}
        onChange={(e, newValue) => setMaxHashtags(newValue)}
        min={5}
        max={35}
        step={5}
        marks
        valueLabelDisplay="auto"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 2 }} />

      {/* Options */}
      <Typography variant="subtitle2" gutterBottom>
        {t('panels.instagram.options.title')}
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={requireImage}
            onChange={(e) => setRequireImage(e.target.checked)}
            size="small"
          />
        }
        label={t('panels.instagram.options.requireImage')}
      />

      <Divider sx={{ my: 2 }} />

      {/* Warnings/Info */}
      <Alert severity="info" size="small" sx={{ mb: 1 }}>
        {t('panels.instagram.info.playwright')}
      </Alert>

      {postingMode === 'reel' && (
        <Alert severity="warning" size="small">
          {t('panels.instagram.warnings.reel')}
        </Alert>
      )}

      {postingMode === 'story' && (
        <Alert severity="info" size="small">
          {t('panels.instagram.warnings.story')}
        </Alert>
      )}
    </Paper>
  )
}

export default InstagramPanel
