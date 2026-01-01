// Upload Parser - Handles automatic parsing on file upload
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
import PlatformEditor from '../PlatformEditor/PlatformEditor'
import PlatformPreview from '../PlatformPreview/PlatformPreview'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import useStore from '../../store'

function UploadParser() {
  const {
    uploadedFileRefs,
    currentEvent,
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
  const [availableRecipients, setAvailableRecipients] = useState([])

  // Template state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const { emailRecipients } = useStore()
  const [templateAnchorEl, setTemplateAnchorEl] = useState(null)


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

  // Auto-save platform content to localStorage
  useEffect(() => {
    if (Object.keys(platformContent).length > 0) {
      localStorage.setItem('eventpromoter_platformContent', JSON.stringify(platformContent))
    }
  }, [platformContent])

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

  // Load parsed data when component mounts or files change
  React.useEffect(() => {
    const loadParsedData = async () => {
      console.log('UploadParser useEffect triggered, uploadedFileRefs:', uploadedFileRefs.length)
      if (uploadedFileRefs.length > 0) {
        const currentEventId = useStore.getState().currentEvent?.id
        console.log('Current event ID:', currentEventId)
        if (currentEventId) {
          try {
            console.log('Fetching parsed data from:', `http://localhost:4000/api/parsing/data/${currentEventId}`)
            const response = await fetch(`http://localhost:4000/api/parsing/data/${currentEventId}`)
            console.log('API response status:', response.status, 'ok:', response.ok)
            if (response.ok) {
              const data = await response.json()
              console.log('API response data:', data)
              if (data.success && data.parsedData) {
                console.log('Setting parsed data in UI:', data.parsedData)
                setParsedData(data.parsedData)
                setEditedData({ ...data.parsedData })
                console.log('Parsed data set, activeTab will be set to 1')
                setActiveTab(1) // Switch to edit tab if we have data
              }
            } else {
              console.log('API response not ok:', response.status)
            }
          } catch (error) {
            console.log('Error loading parsed data:', error)
          }
        }
      }
    }

    loadParsedData()
  }, [uploadedFileRefs, currentEvent?.id]) // Load when files or event changes

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
          html: `<h2>${data.title}</h2><p>Datum: ${data.date} ${data.time}</p><p>Ort: ${data.venue?.name || ''}</p><p>Mehr Infos: ${data.website}</p>`,
          recipients: [] // Will be set from emailRecipients state
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
        📁 Upload Parser - Automatic Processing
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
          <Typography>Parsing document...</Typography>
        </Box>
      )}

      {parseError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {parseError}
        </Alert>
      )}

      {/* Debug */}
      {console.log('Rendering UploadParser, parsedData:', parsedData)}

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

                  {/* Active Platform Editor */}
                  {activePlatform && (
                    <PlatformEditor
                      platform={activePlatform}
                      content={platformContent[activePlatform] || {}}
                      onChange={(field, value) => handlePlatformContentChange(activePlatform, field, value)}
                      onCopy={() => copyContent(activePlatform)}
                      isActive={true}
                      onSelect={() => {}}
                    />
                  )}

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
      {!parsedData && !isParsing && uploadedFileRefs.length === 0 && (
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

export default UploadParser
