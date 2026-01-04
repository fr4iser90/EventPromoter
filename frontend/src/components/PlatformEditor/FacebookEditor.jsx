import React from 'react'
import {
  Box,
  TextField,
  Typography,
  Alert
} from '@mui/material'
import HashtagSelector from '../HashtagSelector/HashtagSelector'

function FacebookEditor({ content, onChange }) {
  const textLength = (content?.text || '').length
  const maxLength = 63206

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#1877F2', fontWeight: 'bold' }}>
        👥 Facebook Post
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Post Content"
        value={content?.text || ''}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Share your thoughts..."
        inputProps={{ maxLength }}
        helperText={`${textLength}/${maxLength} characters`}
        error={textLength > maxLength}
      />

      <HashtagSelector
        value={content?.hashtags || []}
        onChange={(hashtags) => onChange({ ...content, hashtags })}
        maxHashtags={10}
      />

      <Alert severity="info">
        <strong>Facebook tips:</strong><br />
        • Posts with questions get 100% more engagement<br />
        • Use 1-2 relevant hashtags<br />
        • Keep it conversational and authentic
      </Alert>

      <Typography variant="body2" color="text.secondary">
        Your post will be published to your Facebook page or personal profile.
      </Typography>
    </Box>
  )
}

export default FacebookEditor
