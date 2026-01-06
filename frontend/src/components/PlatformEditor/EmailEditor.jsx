import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material'
import TemplateSelector from '../TemplateEditor/TemplateSelector'

function EmailEditor({ content, onChange }) {
  const [recipients, setRecipients] = useState([])
  const [availableRecipients, setAvailableRecipients] = useState([])

  // Load email recipients from backend
  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/config/emails')
        const config = await response.json()
        setAvailableRecipients(config.recipients || [])
      } catch (error) {
        console.error('Failed to load email recipients:', error)
        setAvailableRecipients([])
      }
    }
    loadRecipients()
  }, [])

  // Update content when recipients change
  useEffect(() => {
    onChange({
      ...content,
      recipients,
      subject: content?.subject || '',
      html: content?.html || ''
    })
  }, [recipients])

  const subjectLength = (content?.subject || '').length
  const htmlLength = (content?.html || '').length
  const maxSubjectLength = 78
  const maxHtmlLength = 50000

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#EA4335', fontWeight: 'bold' }}>
        📧 Email Content
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TemplateSelector
          platform="email"
          onSelectTemplate={(template, filledContent) => {
            // For email, we need to handle both subject and html
            const emailContent = filledContent.match(/^(.+)\n\n([\s\S]*)$/)
            if (emailContent) {
              onChange({
                ...content,
                subject: emailContent[1],
                html: emailContent[2]
              })
            } else {
              onChange({ ...content, html: filledContent })
            }
          }}
          currentContent={`${content?.subject || ''}\n\n${content?.html || ''}`}
        />
      </Box>

      {/* Recipients Selection */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Recipients
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Select Recipients</InputLabel>
          <Select
            multiple
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((email) => (
                  <Chip key={email} label={email} size="small" />
                ))}
              </Box>
            )}
          >
            {availableRecipients.map((email) => (
              <MenuItem key={email} value={email}>
                {email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        label="Subject Line"
        value={content?.subject || ''}
        onChange={(e) => onChange({ ...content, subject: e.target.value })}
        placeholder="Enter email subject..."
        inputProps={{ maxLength: maxSubjectLength }}
        helperText={`${subjectLength}/${maxSubjectLength} characters`}
        error={subjectLength > maxSubjectLength}
      />

      <TextField
        fullWidth
        multiline
        rows={8}
        label="Email Content (HTML)"
        value={content?.html || ''}
        onChange={(e) => onChange({ ...content, html: e.target.value })}
        placeholder="Write your email content..."
        inputProps={{ maxLength: maxHtmlLength }}
        helperText={`${htmlLength}/${maxHtmlLength} characters`}
        error={htmlLength > maxHtmlLength}
      />

      <Alert severity="info">
        <strong>Email tips:</strong><br />
        • Keep subject lines under 50 characters for mobile<br />
        • Use HTML formatting for better presentation<br />
        • Personalize when possible<br />
        • Include clear call-to-action
      </Alert>

      <Typography variant="body2" color="text.secondary">
        Your email will be sent to all selected recipients.
      </Typography>
    </Box>
  )
}

export default EmailEditor
