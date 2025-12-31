import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import EmailPanel from '../Panels/EmailPanel'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { parseFileForEvent, formatEventForDisplay } from '../../utils/pdfParser'
import useStore from '../../store'

// Platform Preview Component
function PlatformPreview({ platform, content, isActive }) {
  const getPlatformConfig = (platform) => {
    const configs = {
      twitter: { icon: '🐦', color: '#1DA1F2', name: 'Twitter' },
      instagram: { icon: '📸', color: '#E4405F', name: 'Instagram' },
      facebook: { icon: '👥', color: '#1877F2', name: 'Facebook' },
      linkedin: { icon: '💼', color: '#0A66C2', name: 'LinkedIn' },
      email: { icon: '📧', color: '#EA4335', name: 'Email' }
    }
    return configs[platform] || { icon: '📝', color: '#666', name: platform }
  }

  const config = getPlatformConfig(platform)

  return (
    <Paper sx={{
      p: 2,
      mb: 2,
      bgcolor: '#f8f9fa',
      border: `2px solid ${isActive ? config.color : '#e0e0e0'}`
    }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: config.color }}>
        {config.icon} {config.name} Preview
      </Typography>

      <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        {platform === 'twitter' && (
          <Typography variant="body2">
            {content.text || 'No content yet...'}
          </Typography>
        )}

        {platform === 'instagram' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📸 Event Image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {content.caption || 'No caption yet...'}
            </Typography>
          </>
        )}

        {platform === 'facebook' && (
          <Typography variant="body2">
            {content.text || 'No content yet...'}
          </Typography>
        )}

        {platform === 'linkedin' && (
          <Typography variant="body2">
            {content.text || 'No LinkedIn content yet...'}
          </Typography>
        )}

        {platform === 'reddit' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Title: {content.title || 'No title...'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1 }}>
              {content.body || 'No body content...'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              Subreddit: {content.subreddit || 'r/events'}
            </Typography>
          </>
        )}

        {platform === 'email' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Subject: {content.subject || 'No subject...'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {content.html ? 'HTML Email Content...' : 'No content yet...'}
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  )
}

// Platform Editor Component
function PlatformEditor({ platform, content, onChange, onCopy, isActive, onSelect, emailRecipients = [] }) {
  const getPlatformConfig = (platform) => {
    const configs = {
      twitter: { icon: '🐦', color: '#1DA1F2', name: 'Twitter', limit: 280 },
      instagram: { icon: '📸', color: '#E4405F', name: 'Instagram', limit: 2200 },
      facebook: { icon: '👥', color: '#1877F2', name: 'Facebook', limit: 63206 },
      linkedin: { icon: '💼', color: '#0A66C2', name: 'LinkedIn', limit: 3000 },
      email: { icon: '📧', color: '#EA4335', name: 'Email', limit: null }
    }
    return configs[platform] || { icon: '📝', color: '#666', name: platform, limit: null }
  }

  const config = getPlatformConfig(platform)
  const textLength = content.text?.length || content.caption?.length || 0
  const isValid = config.limit ? textLength <= config.limit : textLength > 0

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        border: `2px solid ${isActive ? config.color : '#e0e0e0'}`,
        cursor: 'pointer'
      }}
      onClick={onSelect}
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: config.color }}>
        {config.icon} {config.name} Editor
      </Typography>

      {platform === 'twitter' && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Tweet Text"
          value={content.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          helperText={`Tweet text for Twitter`}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'instagram' && (
        <TextField
          fullWidth
          multiline
          rows={6}
          label="Instagram Caption"
          value={content.caption || ''}
          onChange={(e) => onChange('caption', e.target.value)}
          helperText="Caption for Instagram post"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'facebook' && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Facebook Post"
          value={content.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          helperText="Post text for Facebook"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'linkedin' && (
        <TextField
          fullWidth
          multiline
          rows={6}
          label="LinkedIn Post"
          value={content.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          helperText="Professional post content for LinkedIn"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'reddit' && (
        <>
          <TextField
            fullWidth
            label="Reddit Title"
            value={content.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            helperText="Post title for Reddit"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reddit Body"
            value={content.body || ''}
            onChange={(e) => onChange('body', e.target.value)}
            helperText="Post body content for Reddit"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Subreddit"
            value={content.subreddit || ''}
            onChange={(e) => onChange('subreddit', e.target.value)}
            placeholder="e.g., r/berlin"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </>
      )}

      {platform === 'email' && (
        <>
          {/* Email Recipients Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              📧 Email Recipients
            </Typography>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Select Recipients</InputLabel>
              <Select
                multiple
                value={content.recipients || []}
                onChange={(e) => {
                  console.log('Email recipients changed:', e.target.value);
                  onChange('recipients', e.target.value);
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((email) => (
                      <Chip key={email} label={email} size="small" />
                    ))}
                  </Box>
                )}
              >
                {emailRecipients.map((email) => (
                  <MenuItem key={email} value={email}>
                    {email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Email Subject"
            value={content.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Email HTML Content"
            value={content.html || ''}
            onChange={(e) => onChange('html', e.target.value)}
            helperText="HTML content for email"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {config.limit && (
          <Typography variant="body2" color={textLength > config.limit ? "error" : "text.secondary"}>
            Characters: {textLength}/{config.limit}
          </Typography>
        )}
        <Chip
          size="small"
          color={isValid ? "success" : "warning"}
          label={isValid ? "Ready" : "Draft"}
        />
      </Box>
    </Paper>
  )
}

function EventParser() {
  const {
    uploadedFiles,
    selectedPlatforms,
    platformContent,
    setPlatformContent,
    resetPlatformContent,
    contentTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate
  } = useStore()

  const [activeTab, setActiveTab] = useState(0)
  const [parsedData, setParsedData] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [editedData, setEditedData] = useState(null)
  const [activePlatform, setActivePlatform] = useState('twitter')

  // Template state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const { emailRecipients } = useStore()
  const [templateAnchorEl, setTemplateAnchorEl] = useState(null)

  // Handle file parsing
  const handleParseFile = async (file) => {
    setIsParsing(true)
    setParseError('')
    setParsedData(null)

    try {
      const result = await parseFileForEvent(file)

      if (result.success) {
        setParsedData(result)
        setEditedData({ ...result.data })
        setActiveTab(1) // Switch to edit tab after successful parsing
      } else {
        setParseError(result.error)
      }
    } catch (error) {
      setParseError('Parsing failed: ' + error.message)
    } finally {
      setIsParsing(false)
    }
  }

  // Handle data editing
  const handleDataChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVenueChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      venue: {
        ...prev.venue,
        [field]: value
      }
    }))
  }

  const handlePerformersChange = (value) => {
    const performers = value.split(',').map(p => p.trim()).filter(p => p)
    setEditedData(prev => ({
      ...prev,
      performers
    }))
  }

  // Reset to parsed data
  const handleResetToParsed = () => {
    if (parsedData) {
      setEditedData({ ...parsedData.data })
    }
  }

  // Auto-generate platform content when data is parsed OR platforms change
  useEffect(() => {
    if (editedData && selectedPlatforms.length > 0) {
      selectedPlatforms.forEach(platform => {
        if (!platformContent[platform]) {
          const content = generatePlatformContent(platform, editedData)



          setPlatformContent(platform, content)
        }
      })
    }
  }, [editedData, selectedPlatforms, platformContent, setPlatformContent])

  // Update email recipients when email platform is selected and recipients change
  useEffect(() => {
  }, [selectedPlatforms, emailRecipients, platformContent.email, setPlatformContent])

  // Auto-save platform content to localStorage
  useEffect(() => {
    if (Object.keys(platformContent).length > 0) {
      localStorage.setItem('eventpromoter_platformContent', JSON.stringify(platformContent))
    }
  }, [platformContent])

  // Email recipients now come from store (session)
  // No need to load from API anymore

  // Load auto-saved content on component mount
  useEffect(() => {
    const saved = localStorage.getItem('eventpromoter_platformContent')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.entries(parsed).forEach(([platform, content]) => {
          setPlatformContent(platform, content)
        })
      } catch (error) {
        console.warn('Failed to load auto-saved content:', error)
      }
    }
  }, [setPlatformContent])

  // Auto-parse first PDF/image when files are uploaded
  React.useEffect(() => {
    if (uploadedFiles.length > 0 && !parsedData && !isParsing) {
      const firstFile = uploadedFiles[0]?.file
      if (firstFile && (firstFile.type === 'application/pdf' || firstFile.type.startsWith('image/'))) {
        handleParseFile(firstFile)
      }
    }
  }, [uploadedFiles])

  // Generate platform-specific content
  const generatePlatformContent = (platform, data) => {
    const baseText = `${data.title} - ${data.date} ${data.time}`
    const venue = data.venue?.name ? ` @ ${data.venue.name}` : ''
    const website = data.website ? ` ${data.website}` : ''

    switch (platform) {
      case 'twitter':
        return {
          text: baseText + venue + website + ' #event #party',
          media: [],
          charCount: (baseText + venue + website + ' #event #party').length
        }
      case 'instagram':
        return {
          caption: `📸 ${data.title}\n📅 ${data.date} ${data.time}\n📍 ${data.venue?.name || ''} ${data.venue?.address || ''}\n🎧 ${data.performers?.join(', ') || ''}\n🌐 ${data.website}\n#event #techno #party`,
          image: null
        }
      case 'facebook':
        return {
          text: `${data.title} - ${data.date} um ${data.time} Uhr\n\nVeranstaltungsort: ${data.venue?.name || ''}, ${data.venue?.address || ''}\n\n${data.description || ''}\n\nTickets: ${data.website}`,
          media: []
        }
      case 'linkedin':
        return {
          text: `${data.title} - ${data.date} ${data.time}\n\nVeranstaltung: ${data.venue?.name || ''}\nOrt: ${data.venue?.address || ''}, ${data.venue?.city || ''}\n\n${data.description || ''}\n\nWeitere Informationen: ${data.website}`
        }
      case 'reddit':
        return {
          title: `${data.title} - ${data.date}`,
          body: `Event: ${data.title}\nDate: ${data.date} ${data.time}\nLocation: ${data.venue?.name || ''}, ${data.venue?.address || ''}\n\n${data.description || ''}\n\nMore info: ${data.website}`,
          subreddit: 'r/events' // Default subreddit
        }
      case 'email':
        return {
          subject: `${data.title} - ${data.date}`,
          html: `<h2>${data.title}</h2><p>Datum: ${data.date} ${data.time}</p><p>Ort: ${data.venue?.name || ''}</p><p>Mehr Infos: ${data.website}</p>`
        }
      default:
        return { text: baseText + venue + website }
    }
  }

  // Handle platform content changes with auto-save
  const handlePlatformContentChange = (platform, field, value) => {
    const currentContent = platformContent[platform] || {}
    const updatedContent = { ...currentContent, [field]: value }

    // Update character count for text fields
    if (field === 'text' && platform === 'twitter') {
      updatedContent.charCount = value.length
    }

    setPlatformContent(platform, updatedContent)
  }

  // Copy content from one platform to another
  const copyContent = (fromPlatform, toPlatform) => {
    if (platformContent[fromPlatform]) {
      setPlatformContent(toPlatform, { ...platformContent[fromPlatform] })
    }
  }

  // Reset all platform content
  const resetContent = () => {
    resetPlatformContent()
    if (editedData && selectedPlatforms.length > 0) {
      selectedPlatforms.forEach(platform => {
        const content = generatePlatformContent(platform, editedData)
        setPlatformContent(platform, content)
      })
    }
  }

  // Template handlers
  const handleSaveTemplate = () => {
    if (templateName.trim() && Object.keys(platformContent).length > 0) {
      saveTemplate(templateName.trim(), platformContent)
      setTemplateName('')
      setTemplateDialogOpen(false)
    }
  }

  const handleLoadTemplate = (templateId) => {
    loadTemplate(templateId)
    setTemplateAnchorEl(null)
  }

  const handleDeleteTemplate = (templateId) => {
    deleteTemplate(templateId)
    setTemplateAnchorEl(null)
  }

  const handleTemplateMenuClick = (event) => {
    setTemplateAnchorEl(event.currentTarget)
  }

  const handleTemplateMenuClose = () => {
    setTemplateAnchorEl(null)
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🎯 Event Data Parser
      </Typography>

      {/* File Selection */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select file to parse:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {uploadedFiles.map((fileData, index) => (
              <Chip
                key={index}
                label={`${fileData.file.name} (${fileData.file.type.split('/')[1].toUpperCase()})`}
                onClick={() => handleParseFile(fileData.file)}
                variant={isParsing ? "outlined" : "filled"}
                color="primary"
                disabled={isParsing}
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Parsing Status */}
      {isParsing && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CircularProgress size={24} />
          <Typography>Parsing document...</Typography>
        </Box>
      )}

      {parseError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {parseError}
        </Alert>
      )}

      {/* Parsed Data Display */}
      {parsedData && (
        <>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="📄 Raw Data" />
            <Tab label="🎨 Content Creation" />
            <Tab label="👁️ Platform Preview" />
          </Tabs>

          {/* Tab 1: Raw Data */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Raw Extracted Data
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Confidence: {parsedData.data.confidence}% | Pages: {parsedData.pages}
                {parsedData.ocrConfidence && ` | OCR: ${parsedData.ocrConfidence}%`}
              </Alert>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace', maxHeight: 400, overflow: 'auto' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                  {parsedData.rawText}
                </pre>
              </Paper>
            </Box>
          )}

          {/* Tab 2: Content Creation - Side-by-Side Layout */}
          {activeTab === 1 && editedData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                🎨 Content Creation Studio
              </Typography>

              {/* Side-by-Side Layout */}
              <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                {/* EDITOR PANEL - Left Side */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    ✏️ Editor Panel
                  </Typography>

                  {/* Platform Selector */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Active Platforms:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedPlatforms.map(platform => {
                        const configs = {
                          twitter: { icon: '🐦', color: 'primary' },
                          instagram: { icon: '📸', color: 'secondary' },
                          facebook: { icon: '👥', color: 'success' },
                          linkedin: { icon: '💼', color: 'info' },
                          email: { icon: '📧', color: 'warning' }
                        }
                        const config = configs[platform] || { icon: '📝', color: 'default' }

                        return (
                          <Chip
                            key={platform}
                            label={`${config.icon} ${platform}`}
                            color={config.color}
                            variant={platform === activePlatform ? "filled" : "outlined"}
                            onClick={() => setActivePlatform(platform)}
                            sx={{ cursor: 'pointer' }}
                          />
                        )
                      })}
                    </Box>
                  </Box>

                  {/* Platform Editors */}
                  {selectedPlatforms.map(platform => (
                    <PlatformEditor
                      key={platform}
                      platform={platform}
                      content={platformContent[platform] || {}}
                      onChange={(field, value) => handlePlatformContentChange(platform, field, value)}
                      onCopy={() => copyContent(platform, activePlatform)}
                      isActive={platform === activePlatform}
                      onSelect={() => setActivePlatform(platform)}
                      emailRecipients={emailRecipients}
                    />
                  ))}

                  {/* Content Controls */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={resetContent}>
                      Reset All
                    </Button>
                    <Button variant="outlined" startIcon={<ContentCopyIcon />}>
                      Copy Between Platforms
                    </Button>
                    <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => setTemplateDialogOpen(true)}>
                      Save Template
                    </Button>
                    <Button variant="outlined" onClick={handleTemplateMenuClick}>
                      Load Template ▼
                    </Button>
                  </Box>

                  {/* Template Menu */}
                  <Menu
                    anchorEl={templateAnchorEl}
                    open={Boolean(templateAnchorEl)}
                    onClose={handleTemplateMenuClose}
                  >
                    {contentTemplates.length === 0 ? (
                      <MenuItem disabled>No templates saved</MenuItem>
                    ) : (
                      contentTemplates.map(template => (
                        <MenuItem key={template.id} onClick={() => handleLoadTemplate(template.id)}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Typography variant="body2">{template.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(template.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Menu>

                  {/* Template Controls */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" size="small">
                      Save Template
                    </Button>
                    <Button variant="outlined" size="small">
                      Load Template
                    </Button>
                  </Box>
                </Box>

                {/* PREVIEW PANEL - Right Side */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    👁️ Preview Panel
                  </Typography>

                  {/* Platform Previews */}
                  {selectedPlatforms.map(platform => (
                    <PlatformPreview
                      key={platform}
                      platform={platform}
                      content={platformContent[platform] || {}}
                      isActive={platform === activePlatform}
                    />
                  ))}

                  {/* Status Summary */}
                  <Paper sx={{ p: 2, mt: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      📊 Status Summary
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedPlatforms.map(platform => {
                        const content = platformContent[platform] || {}
                        const isReady = content.text || content.caption || content.subject
                        return (
                          <Chip
                            key={platform}
                            size="small"
                            color={isReady ? "success" : "warning"}
                            label={`${platform}: ${isReady ? 'Ready' : 'Draft'}`}
                          />
                        )
                      })}
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}

          {/* Tab 3: Platform Preview */}
          {activeTab === 2 && editedData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Platform Preview
              </Typography>

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>🐦 Twitter/X Preview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {editedData.title} - {editedData.date} {editedData.time}
                        {editedData.venue?.name && ` @ ${editedData.venue.name}`}
                        {editedData.website && ` ${editedData.website}`}
                        #event #party
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Characters: {(
                          editedData.title.length +
                          editedData.date.length +
                          editedData.time.length +
                          (editedData.venue?.name?.length || 0) +
                          (editedData.website?.length || 0) +
                          20 // spaces and hashtags
                        )}/280
                      </Typography>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>📸 Instagram Preview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <Typography variant="body2">
                        {editedData.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 {editedData.date} {editedData.time}
                        📍 {editedData.venue?.name} {editedData.venue?.address}
                        🎧 {editedData.performers?.join(', ')}
                        🌐 {editedData.website}
                        #event #party #techno
                      </Typography>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>📧 Email Preview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{editedData.title}</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Liebe Freunde der elektronischen Musik,
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {editedData.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        📅 Datum: {editedData.date} um {editedData.time} Uhr
                        📍 Ort: {editedData.venue?.name}, {editedData.venue?.address}, {editedData.venue?.city}
                        🎧 Line-up: {editedData.performers?.join(', ')}
                        🌐 Tickets: {editedData.website}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Wir freuen uns auf euch!
                      </Typography>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </>
      )}

      {/* No data state */}
      {!parsedData && !isParsing && uploadedFiles.length === 0 && (
        <Alert severity="info">
          Upload a PDF or image file to parse event data automatically.
        </Alert>
      )}

      {/* Template Save Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Content Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            variant="outlined"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., Club Techno Event"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default EventParser
