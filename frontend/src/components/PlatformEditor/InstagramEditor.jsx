import React from 'react'
import {
  Box,
  TextField,
  Typography,
  Alert
} from '@mui/material'
import HashtagSelector from '../HashtagSelector/HashtagSelector'

function InstagramEditor({ content, onChange }) {
  const textLength = (content?.caption || '').length
  const maxLength = 2200

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#E4405F', fontWeight: 'bold' }}>
        📸 Instagram Post
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={6}
        label="Caption"
        value={content?.caption || ''}
        onChange={(e) => onChange({ ...content, caption: e.target.value })}
        placeholder="Write a caption for your post..."
        inputProps={{ maxLength }}
        helperText={`${textLength}/${maxLength} characters`}
        error={textLength > maxLength}
      />

      <HashtagSelector
        value={content?.hashtags || []}
        onChange={(hashtags) => onChange({ ...content, hashtags })}
        maxHashtags={30}
      />

      <Alert severity="info">
        <strong>Best practices:</strong><br />
        • Use 1-3 relevant hashtags<br />
        • Ask questions to boost engagement<br />
        • Use emojis strategically
      </Alert>

      <Typography variant="body2" color="text.secondary">
        Note: Image upload will be handled separately in the publishing step.
      </Typography>
    </Box>
  )
}

export default InstagramEditor
