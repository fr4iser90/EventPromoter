import React from 'react'
import {
  Box,
  TextField,
  Typography,
  Alert
} from '@mui/material'
import TemplateSelector from '../TemplateEditor/TemplateSelector'
import HashtagSelector from '../HashtagSelector/HashtagSelector'

function LinkedInEditor({ content, onChange }) {
  const textLength = (content?.text || '').length
  const maxLength = 3000

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#0A66C2', fontWeight: 'bold' }}>
        💼 LinkedIn Post
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TemplateSelector
          platform="linkedin"
          onSelectTemplate={(template, filledContent) => {
            onChange({ ...content, text: filledContent })
          }}
          currentContent={content?.text || ''}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={6}
        label="Professional Content"
        value={content?.text || ''}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Share professional insights..."
        inputProps={{ maxLength }}
        helperText={`${textLength}/${maxLength} characters`}
        error={textLength > maxLength}
      />

      <HashtagSelector
        value={content?.hashtags || []}
        onChange={(hashtags) => onChange({ ...content, hashtags })}
        maxHashtags={5}
      />

      <Alert severity="info">
        <strong>LinkedIn best practices:</strong><br />
        • Focus on value and insights<br />
        • Use professional language<br />
        • Include relevant hashtags<br />
        • Ask thought-provoking questions
      </Alert>

      <Typography variant="body2" color="text.secondary">
        Your post will be published to your LinkedIn profile or company page.
      </Typography>
    </Box>
  )
}

export default LinkedInEditor
