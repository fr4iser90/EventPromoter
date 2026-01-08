import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
            {content.text || t('preview.noContent')}
          </Typography>
        )}

        {platform === 'instagram' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📸 Event Image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {content.caption || t('preview.noCaption')}
            </Typography>
          </>
        )}

        {platform === 'facebook' && (
          <Typography variant="body2">
            {content.text || t('preview.noContent')}
          </Typography>
        )}

        {platform === 'linkedin' && (
          <Typography variant="body2">
            {content.text || t('preview.noLinkedInContent')}
          </Typography>
        )}

        {platform === 'reddit' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Title: {content.title || t('preview.noTitle')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 1 }}>
              {content.body || t('preview.noBodyContent')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              Subreddit: {content.subreddit || 'r/events'}
            </Typography>
          </>
        )}

        {platform === 'email' && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Subject: {content.subject || t('preview.noSubject')}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {content.html ? t('preview.htmlEmailContent') : t('preview.noContent')}
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
          label={t('form.labels.tweetText')}
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
          label={t('form.labels.instagramCaption')}
          value={content.caption || ''}
          onChange={(e) => onChange('caption', e.target.value)}
          helperText={t('help.instagramCaption')}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'facebook' && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('form.labels.facebookPost')}
          value={content.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          helperText={t('help.facebookPost')}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'linkedin' && (
        <TextField
          fullWidth
          multiline
          rows={6}
          label={t('form.labels.linkedinPost')}
          value={content.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          helperText={t('help.linkedinPost')}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}

      {platform === 'reddit' && (
        <>
          <TextField
            fullWidth
            label={t('form.labels.redditTitle')}
            value={content.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            helperText={t('help.redditTitle')}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('form.labels.redditBody')}
            value={content.body || ''}
            onChange={(e) => onChange('body', e.target.value)}
            helperText={t('help.redditBody')}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t('form.labels.subreddit')}
            value={content.subreddit || ''}
            onChange={(e) => onChange('subreddit', e.target.value)}
            placeholder={t('form.labels.subredditExample')}
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
              <InputLabel>{t('form.labels.selectRecipients')}</InputLabel>
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
            label={t('form.labels.emailSubject')}
            value={content.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label={t('form.labels.emailHtmlContent')}
            value={content.html || ''}
            onChange={(e) => onChange('html', e.target.value)}
            helperText={t('help.emailContent')}
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
          label={isValid ? t('status.ready') : t('status.draft')}
        />
      </Box>
    </Paper>
  )
}

function EventParser() {
  const { t } = useTranslation()
  const {
    uploadedFileRefs,
    selectedPlatforms,
    platformContent,
    setPlatformContent,
    resetPlatformContent
  } = useStore()

  const [activeTab, setActiveTab] = useState(0)
  const [parsedData, setParsedData] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [editedData, setEditedData] = useState(null)
  const [activePlatform, setActivePlatform] = useState('twitter')

  const { emailRecipients } = useStore()


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
      setEditedData({ ...parsedData })
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

  // Platform content is now managed by backend only
  // No localStorage persistence needed

  // Load parsed data when component mounts or files change
  React.useEffect(() => {
    const loadParsedData = async () => {
      if (uploadedFileRefs.length > 0) {
        const currentEventId = useStore.getState().currentEvent?.id
        if (currentEventId) {
          try {
            const response = await fetch(`http://localhost:4000/api/parsing/data/${currentEventId}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.parsedData) {
                console.log('Loaded existing parsed data from backend')
                setParsedData(data.parsedData)
                setEditedData({ ...data.parsedData })
                setActiveTab(1) // Switch to edit tab if we have data
              }
            }
          } catch (error) {
            console.log('No existing parsed data found')
          }
        }
      }
    }

    loadParsedData()
  }, [uploadedFileRefs]) // Load when files change

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


  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🎯 Event Data Parser
      </Typography>

      {/* File Selection */}
      {uploadedFileRefs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select file to parse:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {uploadedFileRefs.map((fileData, index) => (
              <Chip
                key={fileData.id}
                label={`${fileData.name} (${fileData.type.split('/')[1].toUpperCase()})`}
                onClick={async () => {
                  try {
                    setIsParsing(true)
                    // Download file from server
                    const response = await fetch(fileData.url)
                    const blob = await response.blob()
                    const file = new File([blob], fileData.name, { type: fileData.type })
                    await handleParseFile(file)
                  } catch (error) {
                    console.error('Failed to download file:', error)
                  } finally {
                    setIsParsing(false)
                  }
                }}
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
          <Typography>{t('status.parsingDocument')}</Typography>
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
            <Tab label={t('tabs.rawData')} />
            <Tab label={t('tabs.contentCreation')} />
            <Tab label={t('tabs.platformPreview')} />
          </Tabs>

          {/* Tab 1: Raw Data */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Raw Extracted Data
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Confidence: {parsedData.confidence}% | Parsed: {new Date(parsedData.parsedAt).toLocaleString()}
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
                  <Typography>{t('preview.twitter')}</Typography>
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
                  <Typography>{t('preview.instagram')}</Typography>
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
                  <Typography>{t('preview.emailPreview')}</Typography>
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
      {!parsedData && !isParsing && uploadedFileRefs.length === 0 && (
        <Alert severity="info">
          Upload a PDF or image file to parse event data automatically.
        </Alert>
      )}

    </Paper>
  )
}

export default EventParser
