import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert
} from '@mui/material'
import HashtagSelector from '../HashtagSelector/HashtagSelector'

function TwitterEditor({ content, onChange, platformSettings }) {
  const [postingMode, setPostingMode] = useState(content?.postingMode || 'single')
  const [includeThread, setIncludeThread] = useState(content?.includeThread || false)

  // Update content when local state changes
  useEffect(() => {
    onChange({
      ...content,
      postingMode,
      includeThread,
      text: content?.text || '',
      hashtags: content?.hashtags || []
    })
  }, [postingMode, includeThread])

  const textLength = (content?.text || '').length
  const maxLength = 280

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#1DA1F2', fontWeight: 'bold' }}>
        🐦 Twitter Post
      </Typography>

      <FormControl fullWidth>
        <InputLabel>Posting Mode</InputLabel>
        <Select
          value={postingMode}
          onChange={(e) => setPostingMode(e.target.value)}
          label="Posting Mode"
        >
          <MenuItem value="single">Single Tweet</MenuItem>
          <MenuItem value="thread">Tweet Thread</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Tweet Text"
        value={content?.text || ''}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="What's happening?"
        inputProps={{ maxLength }}
        helperText={`${textLength}/${maxLength} characters`}
        error={textLength > maxLength}
      />

      {postingMode === 'thread' && (
        <Alert severity="info">
          Thread mode: Your content will be split into multiple connected tweets.
        </Alert>
      )}

      <HashtagSelector
        value={content?.hashtags || []}
        onChange={(hashtags) => onChange({ ...content, hashtags })}
        maxHashtags={5}
      />

      <Typography variant="body2" color="text.secondary">
        Tip: Use #hashtags and @mentions to increase engagement!
      </Typography>
    </Box>
  )
}

export default TwitterEditor
