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
  Switch,
  Slider,
  TextField
} from '@mui/material'
import InstagramIcon from '@mui/icons-material/Instagram'
import useStore from '../../store'

function InstagramPanel() {
  const { platformSettings, setPlatformSettings } = useStore()
  const [accountType, setAccountType] = useState('business')
  const [postingMode, setPostingMode] = useState('post')
  const [hashtagStrategy, setHashtagStrategy] = useState('moderate')
  const [maxHashtags, setMaxHashtags] = useState(30)
  const [requireImage, setRequireImage] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('instagramPanelData')
    if (saved) {
      const data = JSON.parse(saved)
      setAccountType(data.accountType || 'business')
      setPostingMode(data.postingMode || 'post')
      setHashtagStrategy(data.hashtagStrategy || 'moderate')
      setMaxHashtags(data.maxHashtags || 30)
      setRequireImage(data.requireImage !== undefined ? data.requireImage : true)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      accountType,
      postingMode,
      hashtagStrategy,
      maxHashtags,
      requireImage
    }
    localStorage.setItem('instagramPanelData', JSON.stringify(data))

    // Update platform settings
    const currentSettings = platformSettings.instagram || {}
    setPlatformSettings({
      ...platformSettings,
      instagram: {
        ...currentSettings,
        accountType,
        postingMode,
        hashtagStrategy,
        maxHashtags,
        requireImage
      }
    })
  }, [accountType, postingMode, hashtagStrategy, maxHashtags, requireImage])

  const getHashtagStrategyDescription = (strategy) => {
    switch (strategy) {
      case 'minimal': return '5-10 Hashtags (weniger ist mehr)'
      case 'moderate': return '15-25 Hashtags (ausgewogen)'
      case 'maximal': return '25-35 Hashtags (für Reichweite)'
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
          Instagram Settings
        </Typography>
      </Box>

      {/* Account Type */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Account Type</InputLabel>
        <Select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          label="Account Type"
        >
          <MenuItem value="personal">Personal Account</MenuItem>
          <MenuItem value="business">Business Account</MenuItem>
          <MenuItem value="creator">Creator Account</MenuItem>
        </Select>
      </FormControl>

      {/* Posting Mode */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Posting Mode</InputLabel>
        <Select
          value={postingMode}
          onChange={(e) => setPostingMode(e.target.value)}
          label="Posting Mode"
        >
          <MenuItem value="post">Feed Post</MenuItem>
          <MenuItem value="reel">Reel</MenuItem>
          <MenuItem value="story">Story</MenuItem>
          <MenuItem value="carousel">Carousel Post</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Hashtag Strategy */}
      <Typography variant="subtitle2" gutterBottom>
        Hashtag-Strategie
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <Select
          value={hashtagStrategy}
          onChange={(e) => setHashtagStrategy(e.target.value)}
          size="small"
        >
          <MenuItem value="minimal">Minimal</MenuItem>
          <MenuItem value="moderate">Moderat</MenuItem>
          <MenuItem value="maximal">Maximal</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        {getHashtagStrategyDescription(hashtagStrategy)}
      </Typography>

      {/* Max Hashtags Slider */}
      <Typography variant="subtitle2" gutterBottom>
        Maximale Hashtags: {maxHashtags}
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
        Optionen
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={requireImage}
            onChange={(e) => setRequireImage(e.target.checked)}
            size="small"
          />
        }
        label="Bild erforderlich"
      />

      <Divider sx={{ my: 2 }} />

      {/* Warnings/Info */}
      <Alert severity="info" size="small" sx={{ mb: 1 }}>
        Instagram verwendet Playwright für zuverlässiges Posting.
      </Alert>

      {postingMode === 'reel' && (
        <Alert severity="warning" size="small">
          Reels benötigen Video-Inhalte.
        </Alert>
      )}

      {postingMode === 'story' && (
        <Alert severity="info" size="small">
          Stories verschwinden nach 24h.
        </Alert>
      )}
    </Paper>
  )
}

export default InstagramPanel
