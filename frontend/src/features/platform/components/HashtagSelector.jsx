import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Chip,
  Button
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

function HashtagSelector({ value = [], onChange, maxHashtags = 10 }) {
  const [customHashtag, setCustomHashtag] = useState('')

  // Predefined hashtag suggestions
  const suggestedHashtags = [
    '#event', '#music', '#party', '#festival', '#concert', '#dj', '#club',
    '#nightlife', '#live', '#dance', '#techno', '#house', '#electronic',
    '#booking', '#tickets', '#venue', '#promo', '#social', '#fun'
  ]

  const handleAddHashtag = (hashtag) => {
    if (!hashtag || value.includes(hashtag) || value.length >= maxHashtags) return

    const cleanHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`
    onChange([...value, cleanHashtag])
  }

  const handleRemoveHashtag = (hashtagToRemove) => {
    onChange(value.filter(tag => tag !== hashtagToRemove))
  }

  const handleCustomAdd = () => {
    if (customHashtag.trim()) {
      handleAddHashtag(customHashtag.trim())
      setCustomHashtag('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomAdd()
    }
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Hashtags ({value.length}/{maxHashtags})
      </Typography>

      {/* Selected Hashtags */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {value.map((hashtag) => (
          <Chip
            key={hashtag}
            label={hashtag}
            onDelete={() => handleRemoveHashtag(hashtag)}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>

      {/* Add Custom Hashtag */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add custom hashtag..."
          value={customHashtag}
          onChange={(e) => setCustomHashtag(e.target.value)}
          onKeyPress={handleKeyPress}
          inputProps={{ maxLength: 50 }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={handleCustomAdd}
          disabled={!customHashtag.trim() || value.length >= maxHashtags}
        >
          <AddIcon />
        </Button>
      </Box>

      {/* Suggested Hashtags */}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Suggested hashtags:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {suggestedHashtags
          .filter(tag => !value.includes(tag))
          .slice(0, 12)
          .map((hashtag) => (
            <Chip
              key={hashtag}
              label={hashtag}
              onClick={() => handleAddHashtag(hashtag)}
              size="small"
              variant="outlined"
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            />
          ))}
      </Box>

      {value.length >= maxHashtags && (
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          Maximum {maxHashtags} hashtags reached
        </Typography>
      )}
    </Box>
  )
}

export default HashtagSelector