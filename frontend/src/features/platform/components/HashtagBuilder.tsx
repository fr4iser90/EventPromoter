import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  TextField,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ClearIcon from '@mui/icons-material/Clear'
import useStore from '../../../store'

const PREDEFINED_HASHTAGS = {
  event: ['#event', '#party', '#festival', '#nightlife', '#club', '#djset'],
  music: ['#dj', '#music', '#electronic', '#techno', '#housemusic', '#deephouse'],
  location: ['#berlin', '#munich', '#hamburg', '#cologne', '#frankfurt'],
  general: ['#germany', '#europe', '#weekend', '#fun', '#dance']
}

function HashtagBuilder({ disabled = false }) {
  const { t } = useTranslation()
  const { selectedHashtags, setSelectedHashtags } = useStore() as unknown as {
    selectedHashtags: string[]
    setSelectedHashtags: (hashtags: string[]) => void
  }
  const [customHashtags, setCustomHashtags] = useState('')

  const handleCustomHashtagAdd = () => {
    if (!customHashtags.trim()) return

    const hashtags = customHashtags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .map(tag => tag.toLowerCase().replace(/\s+/g, ''))

    const uniqueHashtags = [...new Set([...selectedHashtags, ...hashtags])]
    setSelectedHashtags(uniqueHashtags)
    setCustomHashtags('')
  }

  const handlePredefinedHashtagClick = (hashtag: string) => {
    if (!selectedHashtags.includes(hashtag)) {
      setSelectedHashtags([...selectedHashtags, hashtag])
    }
  }

  const handleRemoveHashtag = (hashtagToRemove: string) => {
    setSelectedHashtags(selectedHashtags.filter(tag => tag !== hashtagToRemove))
  }

  const clearAllHashtags = () => {
    setSelectedHashtags([])
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleCustomHashtagAdd()
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('hashtags.hashtagBuilder')}
      </Typography>

      {/* Custom Hashtags Input */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('hashtags.editor')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('common.hashtagsPlaceholder')}
            value={customHashtags}
            onChange={(e) => setCustomHashtags(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            variant="contained"
            onClick={handleCustomHashtagAdd}
            startIcon={<AddIcon />}
          >
            {t('common.add')}
          </Button>
        </Box>
      </Box>

      {/* Predefined Hashtags */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('hashtags.predefinedHashtags')}
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(PREDEFINED_HASHTAGS).map(([category, hashtags]) => (
            <Grid item xs={12} sm={6} md={3} key={category}>
              <Card>
                <CardContent sx={{ pb: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'capitalize' }}>
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {hashtags.map((hashtag) => (
                      <Chip
                        key={hashtag}
                        label={hashtag}
                        size="small"
                        variant={selectedHashtags.includes(hashtag) ? "filled" : "outlined"}
                        onClick={() => handlePredefinedHashtagClick(hashtag)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Selected Hashtags */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('hashtags.selectedHashtags')} ({selectedHashtags.length})
          </Typography>
          {selectedHashtags.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearAllHashtags}
              startIcon={<ClearIcon />}
            >
              {t('common.clearAll')}
            </Button>
          )}
        </Box>

        {selectedHashtags.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('hashtags.noHashtagsSelectedHint')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedHashtags.map((hashtag) => (
              <Chip
                key={hashtag}
                label={hashtag}
                onDelete={() => handleRemoveHashtag(hashtag)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default HashtagBuilder
