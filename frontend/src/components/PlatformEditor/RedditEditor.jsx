import React from 'react'
import {
  Box,
  TextField,
  Typography,
  Alert
} from '@mui/material'
import TemplateSelector from '../TemplateEditor/TemplateSelector'
import HashtagSelector from '../HashtagSelector/HashtagSelector'

function RedditEditor({ content, onChange }) {
  const titleLength = (content?.title || '').length
  const bodyLength = (content?.body || '').length
  const maxTitleLength = 300
  const maxBodyLength = 40000

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#FF4500', fontWeight: 'bold' }}>
        🟠 Reddit Post
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TemplateSelector
          platform="reddit"
          onSelectTemplate={(template, filledContent) => {
            // For Reddit, handle title and body separately
            const parts = filledContent.split('\n\n')
            onChange({
              ...content,
              title: parts[0] || '',
              body: parts.slice(1).join('\n\n') || ''
            })
          }}
          currentContent={`${content?.title || ''}\n\n${content?.body || ''}`}
        />
      </Box>

      <TextField
        fullWidth
        label="Post Title"
        value={content?.title || ''}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="Enter an engaging title..."
        inputProps={{ maxLength: maxTitleLength }}
        helperText={`${titleLength}/${maxTitleLength} characters`}
        error={titleLength > maxTitleLength}
      />

      <TextField
        fullWidth
        label="Subreddit"
        value={content?.subreddit || ''}
        onChange={(e) => onChange({ ...content, subreddit: e.target.value })}
        placeholder="r/subreddit"
        helperText="Don't include 'r/' prefix"
      />

      <TextField
        fullWidth
        multiline
        rows={6}
        label="Post Content"
        value={content?.body || ''}
        onChange={(e) => onChange({ ...content, body: e.target.value })}
        placeholder="Write your post content..."
        inputProps={{ maxLength: maxBodyLength }}
        helperText={`${bodyLength}/${maxBodyLength} characters`}
        error={bodyLength > maxBodyLength}
      />

      <HashtagSelector
        value={content?.hashtags || []}
        onChange={(hashtags) => onChange({ ...content, hashtags })}
        maxHashtags={3}
      />

      <Alert severity="info">
        <strong>Reddit tips:</strong><br />
        • Choose the right subreddit for your content<br />
        • Make your title engaging and descriptive<br />
        • Follow subreddit rules and guidelines<br />
        • Be respectful and contribute value
      </Alert>

      <Typography variant="body2" color="text.secondary">
        Your post will be submitted to the specified subreddit.
      </Typography>
    </Box>
  )
}

export default RedditEditor
