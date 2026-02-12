// Upload Parser - Handles automatic parsing on file upload
import { useState, useEffect } from 'react'
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
  useTheme,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import { usePlatforms } from '../../platform/hooks/usePlatformSchema'
import { PlatformEditor as GenericPlatformEditor, PlatformPreview } from '../../platform'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import useStore from '../../../store'
import { getApiUrl } from '../../../shared/utils/api'
import { formatDateForDisplay } from '../../../shared/utils/dateUtils'

type UploadedFileRef = {
  id?: string
  name: string
  filename?: string
  type?: string
  isImage?: boolean
}

type VenueData = {
  name?: string
  address?: string
  city?: string
}

type ParsedData = {
  confidence?: number
  parsedAt?: string
  ocrConfidence?: number
  rawText?: string
  title?: string
  date?: string
  time?: string
  venue?: VenueData | string
  website?: string
  description?: string
  performers?: string[]
  city?: string
  [key: string]: unknown
}

type PlatformInfo = {
  id: string
  name?: string
  icon?: string
  color?: string
  metadata?: {
    displayName?: string
    icon?: string
    color?: string
  }
}

function UploadParser() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const {
    uploadedFileRefs,
    currentEvent,
    parsingStatus,
    selectedPlatforms,
    platformContent,
    setPlatformContent,
    resetPlatformContent
  } = useStore() as unknown as {
    uploadedFileRefs: UploadedFileRef[]
    currentEvent: { id?: string } | null
    parsingStatus: string
    selectedPlatforms: string[]
    platformContent: Record<string, Record<string, unknown>>
    setPlatformContent: (platform: string, content: Record<string, unknown>) => void
    resetPlatformContent: () => void
  }

  const [activeTab, setActiveTab] = useState(0)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [editedData, setEditedData] = useState<ParsedData | null>(null)
  const [activePlatform, setActivePlatform] = useState<string | null>(null)
  const [availableRecipients, setAvailableRecipients] = useState<string[]>([])
  const { platforms, loading: platformsLoading } = usePlatforms() as { platforms: PlatformInfo[]; loading: boolean }
  const editedVenue = typeof editedData?.venue === 'object' && editedData?.venue !== null
    ? (editedData.venue as VenueData)
    : undefined

  // Set first platform as active when platforms are loaded
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !activePlatform) {
      setActivePlatform(selectedPlatforms[0])
    }
  }, [selectedPlatforms, activePlatform, platforms])

  // Get platform info from backend - GENERIC
  const getPlatformInfo = (platformId: string) => {
    if (!platforms || platforms.length === 0) {
      return { name: platformId, icon: '📝', color: '#666' }
    }

    const platform = platforms.find((p) => p.id === platformId)
    if (platform) {
      return {
        name: platform.name || platform.metadata?.displayName || platformId,
        icon: platform.icon || platform.metadata?.icon || '📝',
        color: platform.color || platform.metadata?.color || '#666'
      }
    }

    return { name: platformId, icon: '📝', color: '#666' }
  }


  // Handle data editing
  const handleDataChange = (field: string, value: unknown) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVenueChange = (field: string, value: unknown) => {
    setEditedData(prev => ({
      ...(prev || {}),
      venue: {
        ...(typeof prev?.venue === 'object' && prev?.venue !== null ? prev.venue as Record<string, unknown> : {}),
        [field]: value
      }
    }))
  }

  const handlePerformersChange = (value: string) => {
    const performers = value.split(',').map((p) => p.trim()).filter((p) => p)
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
      selectedPlatforms.forEach((platform) => {
        if (!platformContent[platform]) {
          const content = generatePlatformContent(platform, editedData)
          setPlatformContent(platform, content)
        }
      })
    }
  }, [editedData, selectedPlatforms, platformContent, setPlatformContent])

  // Platform content is now managed by backend only
  // No localStorage persistence needed

  // Load parsed data when component mounts, files change, or parsing completes
  useEffect(() => {
    const loadParsedData = async () => {
      const currentEventId = currentEvent?.id
      if (currentEventId) {
        try {
          const response = await fetch(getApiUrl(`parsing/data/${currentEventId}`))
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.parsedData) {
              setParsedData(data.parsedData)
              setEditedData({ ...data.parsedData })
              setActiveTab(0) // Switch to raw data tab to show parsed results
            }
          }
        } catch (error) {
          console.log('No existing parsed data found')
        }
      }
    }

    // Load data when files exist or parsing just completed
    if (uploadedFileRefs.length > 0 || parsingStatus === 'completed') {
      loadParsedData()
    }
  }, [uploadedFileRefs, parsingStatus, currentEvent?.id]) // React to file changes, parsing status, and event changes

  // Generate platform-specific content - GENERIC (no hardcoded platform logic)
  // NOTE: This function is deprecated. Content generation should come from backend platform services.
  // Keeping as fallback for now, but should be removed in favor of backend-generated content.
  const generatePlatformContent = (platform: string, data: ParsedData) => {
    // Generic content generation - uses common fields
    const venueData = typeof data.venue === 'object' && data.venue !== null ? data.venue as VenueData : null
    const venueText = venueData?.name || (typeof data.venue === 'string' ? data.venue : '')
    const locationText = [venueText, venueData?.address, data.city].filter(Boolean).join(', ')
    const dateTimeText = [data.date, data.time].filter(Boolean).join(' ')

    // Generate generic content structure
    const genericText = [
      data.title || 'Event',
      dateTimeText ? `📅 ${dateTimeText}` : '',
      locationText ? `📍 ${locationText}` : '',
      data.description || ''
    ].filter(Boolean).join('\n\n').trim()

    // Return generic structure - platform-specific formatting should be handled by backend
    return {
      text: genericText,
      caption: genericText,
      body: genericText,
      title: data.title || 'Event',
      subject: data.title || 'Event Invitation',
      html: `<h2>${data.title || 'Event'}</h2><p>${genericText.replace(/\n/g, '</p><p>')}</p>`,
      media: [],
      recipients: []
    }
  }

  // Handle platform content changes with auto-save
  const handlePlatformContentChange = (platform: string, field: string, value: unknown) => {
    const currentContent = platformContent[platform] || {}
    const updatedContent = { ...currentContent, [field]: value }

    // Character counting is handled by GenericPlatformEditor based on schema constraints
    // No hardcoded platform checks needed

    setPlatformContent(platform, updatedContent)
  }

  // Copy content from one platform to another
  const copyContent = (fromPlatform: string, toPlatform?: string) => {
    if (!toPlatform) return
    if (platformContent[fromPlatform]) {
      setPlatformContent(toPlatform, { ...platformContent[fromPlatform] })
    }
  }

  // Reset all platform content
  const resetContent = () => {
    resetPlatformContent()
    if (editedData && selectedPlatforms.length > 0) {
      selectedPlatforms.forEach((platform) => {
        const content = generatePlatformContent(platform, editedData)
        setPlatformContent(platform, content)
      })
    }
  }

  // Template handlers


  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📁 Upload Parser - Automatic Processing
      </Typography>

      {/* File Selection */}
      {uploadedFileRefs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Files (Backend parsing in progress...):
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {uploadedFileRefs.map((fileData) => (
              <Chip
                key={fileData.id}
                label={`${fileData.name} (${(fileData.type || '').split('/')[1]?.toUpperCase() || 'FILE'})`}
                variant="outlined"
                color="info"
                size="small"
              />
            ))}
          </Box>

          {!parsedData && parsingStatus === 'parsing' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Backend is processing your files. Parsed data will appear here automatically...
            </Alert>
          )}

          {!parsedData && parsingStatus === 'idle' && uploadedFileRefs.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Click "Parse Files" to start processing your uploaded files.
            </Alert>
          )}
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
            onChange={(_, newValue: number) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label={t('tabs.rawData')} />
            <Tab label={t('tabs.contentCreation')} />
            <Tab label={t('tabs.platformPreview')} />
          </Tabs>

          {/* Tab 0: Raw Data */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Raw Extracted Data
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Confidence: {parsedData.confidence}% | Parsed: {parsedData.parsedAt ? new Date(parsedData.parsedAt).toLocaleString() : 'unknown'}
                {parsedData.ocrConfidence && ` | OCR: ${parsedData.ocrConfidence}%`}
              </Alert>
              <Paper sx={{ p: 2, bgcolor: 'background.default', fontFamily: 'monospace', maxHeight: 400, overflow: 'auto' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                  {(parsedData.rawText as string) || ''}
                </pre>
              </Paper>
            </Box>
          )}

          {/* Tab 1: Content Creation - Side-by-Side Layout */}
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
                      {selectedPlatforms.map((platformId) => {
                        const info = getPlatformInfo(platformId)
                        return (
                          <Chip
                            key={platformId}
                            label={`${info.icon} ${info.name}`}
                            variant={platformId === activePlatform ? "filled" : "outlined"}
                            onClick={() => setActivePlatform(platformId)}
                            sx={{ 
                              cursor: 'pointer',
                              borderColor: info.color,
                              color: platformId === activePlatform ? 'white' : info.color,
                              bgcolor: platformId === activePlatform ? info.color : 'transparent',
                              '&:hover': {
                                bgcolor: platformId === activePlatform ? info.color : `${info.color}20`
                              }
                            }}
                          />
                        )
                      })}
                    </Box>
                  </Box>

                  {/* Active Platform Editor */}
                  {activePlatform && (
                    <GenericPlatformEditor
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
                  </Box>


                </Box>

                {/* PREVIEW PANEL - Right Side */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    👁️ Preview Panel
                  </Typography>

                  {/* Platform Previews */}
                  {selectedPlatforms.map((platform) => (
                    <PlatformPreview
                      key={platform}
                      platform={platform}
                      content={platformContent[platform] || {}}
                      isActive={platform === activePlatform}
                    />
                  ))}

                  {/* Status Summary */}
                  <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      📊 Status Summary
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedPlatforms.map((platform) => {
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
                  <Typography>{t('preview.title')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {editedData.title} - {editedData.date ? formatDateForDisplay(editedData.date, i18n.language) : ''} {editedData.time || ''}
                        {editedVenue?.name && ` @ ${editedVenue.name}`}
                        {editedData.website && ` ${editedData.website}`}
                        #event #party
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Characters: {(
                          (editedData.title?.length || 0) +
                          (editedData.date ? formatDateForDisplay(editedData.date, i18n.language).length : 0) +
                          (editedData.time?.length || 0) +
                          (editedVenue?.name?.length || 0) +
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
                  <Typography>{t('preview.title')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <Typography variant="body2">
                        {editedData.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 {editedData.date ? formatDateForDisplay(editedData.date, i18n.language) : ''} {editedData.time || ''}
                        📍 {editedVenue?.name} {editedVenue?.address}
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
                  <Typography>{t('preview.preview')}</Typography>
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
                        📅 Datum: {editedData.date ? formatDateForDisplay(editedData.date, i18n.language) : ''} um {editedData.time || ''} Uhr
                        📍 Ort: {editedVenue?.name}, {editedVenue?.address}, {editedVenue?.city}
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

export default UploadParser
