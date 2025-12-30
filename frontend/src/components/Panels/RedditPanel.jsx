import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import RedditIcon from '@mui/icons-material/Reddit'
import useStore from '../../store'

const DEFAULT_SUBREDDITS = [
  'DJs', 'Techno', 'HouseMusic', 'EDM', 'berlin',
  'EventPromoters', 'MusicEvents', 'leipzig', 'dresden', 'hamburg'
]

function RedditPanel() {
  const { selectedPlatforms, platformSettings, setPlatformSettings } = useStore()
  const [customSubreddit, setCustomSubreddit] = useState('')
  const [availableSubreddits, setAvailableSubreddits] = useState(DEFAULT_SUBREDDITS)
  const [selectedSubreddit, setSelectedSubreddit] = useState('')
  const [nsfwAllowed, setNsfwAllowed] = useState(false)
  const [spoilerEnabled, setSpoilerEnabled] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('redditPanelData')
    if (saved) {
      const data = JSON.parse(saved)
      setAvailableSubreddits(data.availableSubreddits || DEFAULT_SUBREDDITS)
      setSelectedSubreddit(data.selectedSubreddit || '')
      setNsfwAllowed(data.nsfwAllowed || false)
      setSpoilerEnabled(data.spoilerEnabled || false)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      availableSubreddits,
      selectedSubreddit,
      nsfwAllowed,
      spoilerEnabled
    }
    localStorage.setItem('redditPanelData', JSON.stringify(data))
  }, [availableSubreddits, selectedSubreddit, nsfwAllowed, spoilerEnabled])

  // Update platform settings when selection changes
  useEffect(() => {
    if (selectedSubreddit) {
      const currentSettings = platformSettings.reddit || {}
      setPlatformSettings({
        ...platformSettings,
        reddit: {
          ...currentSettings,
          subreddit: selectedSubreddit
        }
      })
    }
  }, [selectedSubreddit])

  const handleAddSubreddit = () => {
    if (customSubreddit.trim() && !availableSubreddits.includes(customSubreddit.trim())) {
      const newSubreddit = customSubreddit.trim()
      setAvailableSubreddits(prev => [...prev, newSubreddit])
      setCustomSubreddit('')
      setSelectedSubreddit(newSubreddit) // Auto-select the newly added one
    }
  }

  const handleRemoveSubreddit = (subredditToRemove) => {
    if (DEFAULT_SUBREDDITS.includes(subredditToRemove)) {
      // Don't remove default subreddits, just deselect if selected
      if (selectedSubreddit === subredditToRemove) {
        setSelectedSubreddit('')
      }
      return
    }

    setAvailableSubreddits(prev => prev.filter(s => s !== subredditToRemove))
    if (selectedSubreddit === subredditToRemove) {
      setSelectedSubreddit('')
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddSubreddit()
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
        <RedditIcon sx={{ mr: 1, color: '#FF4500' }} />
        <Typography variant="h6">
          Reddit Settings
        </Typography>
      </Box>

      {/* Subreddit Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Target Subreddit</InputLabel>
        <Select
          value={selectedSubreddit}
          onChange={(e) => setSelectedSubreddit(e.target.value)}
          label="Target Subreddit"
        >
          {availableSubreddits.map(subreddit => (
            <MenuItem key={subreddit} value={subreddit}>
              r/{subreddit}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Add Custom Subreddit */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Add Custom Subreddit
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="z.B. leipzig"
            value={customSubreddit}
            onChange={(e) => setCustomSubreddit(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleAddSubreddit}
            disabled={!customSubreddit.trim()}
          >
            <AddIcon />
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Available Subreddits */}
      <Typography variant="subtitle2" gutterBottom>
        Available Subreddits ({availableSubreddits.length})
      </Typography>
      <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
        {availableSubreddits.map(subreddit => (
          <ListItem key={subreddit} sx={{ px: 0 }}>
            <Chip
              label={`r/${subreddit}`}
              size="small"
              variant={selectedSubreddit === subreddit ? "filled" : "outlined"}
              color={selectedSubreddit === subreddit ? "primary" : "default"}
              onClick={() => setSelectedSubreddit(subreddit)}
              sx={{ cursor: 'pointer', mr: 1 }}
            />
            {!DEFAULT_SUBREDDITS.includes(subreddit) && (
              <IconButton
                size="small"
                onClick={() => handleRemoveSubreddit(subreddit)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Post Options */}
      <Typography variant="subtitle2" gutterBottom>
        Post Options
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={nsfwAllowed}
              onChange={(e) => setNsfwAllowed(e.target.checked)}
              size="small"
            />
          }
          label="NSFW erlauben"
        />
        <FormControlLabel
          control={
            <Switch
              checked={spoilerEnabled}
              onChange={(e) => setSpoilerEnabled(e.target.checked)}
              size="small"
            />
          }
          label="Spoiler markieren"
        />
      </Box>

      {selectedSubreddit && (
        <Alert severity="info" sx={{ mt: 2 }} size="small">
          Posten nach r/{selectedSubreddit}
          {nsfwAllowed && " (NSFW)"}
          {spoilerEnabled && " (Spoiler)"}
        </Alert>
      )}
    </Paper>
  )
}

export default RedditPanel
