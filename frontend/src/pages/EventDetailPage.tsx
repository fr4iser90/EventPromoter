import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material'
import { getApiUrl, getFileUrl } from '../shared/utils/api'
import PageShell from '../shared/components/layout/PageShell'
import { PlatformStatsCard } from '../features/event'

type EventFile = {
  id?: string
  name: string
  filename?: string
  url?: string | null
  type?: string
  isImage?: boolean
}

type EventData = {
  date?: string
  time?: string
  venue?: string
  city?: string
  description?: string
}

type EventDetail = {
  id?: string
  title?: string
  status?: string
  files: EventFile[]
  platforms: string[]
  eventData?: EventData
}

type TelemetryResponse = {
  telemetry?: Record<string, {
    available?: boolean
    error?: string
    url?: string
    lastUpdated?: string
    metrics?: Record<string, number | undefined>
  }>
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message
  return fallback
}

function EventDetailPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [fileContents, setFileContents] = useState<Record<string, string>>({})
  const [loadingContents, setLoadingContents] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadEvent()
    loadTelemetry()
  }, [eventId])

  // Load text content for .txt and .md files
  useEffect(() => {
    if (event?.files) {
      const textFiles = event.files.filter((f: EventFile) => {
        const ext = f.name?.split('.').pop()?.toLowerCase()
        return ext ? ['txt', 'md'].includes(ext) : false
      })

      textFiles.forEach((file: EventFile) => {
        loadFileContent(file)
      })
    }
  }, [event?.files])

  const loadFileContent = async (file: EventFile) => {
    const fileName = file.filename || file.name
    if (fileContents[fileName]) return

    try {
      setLoadingContents(prev => ({ ...prev, [fileName]: true }))
      const response = await fetch(getApiUrl(`files/${eventId}/${fileName}/content`))
      if (response.ok) {
        const data = await response.json()
        setFileContents(prev => ({ ...prev, [fileName]: data.content }))
      }
    } catch (err) {
      console.error(`Failed to load content for ${fileName}:`, err)
    } finally {
      setLoadingContents(prev => ({ ...prev, [fileName]: false }))
    }
  }

  const loadEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(getApiUrl(`history/${eventId}`))
      const data = await response.json()
      
      if (data.success && data.event) {
        setEvent(data.event as EventDetail)
      } else {
        setError(data.error || 'Event not found')
      }
    } catch (err: unknown) {
      console.error('Failed to load event:', err)
      setError(getErrorMessage(err, 'Failed to load event'))
    } finally {
      setLoading(false)
    }
  }

  const loadTelemetry = async () => {
    try {
      const response = await fetch(getApiUrl(`history/${eventId}/telemetry`))
      const data = await response.json()
      
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry as TelemetryResponse)
      }
    } catch (err) {
      console.warn('Failed to load telemetry:', err)
    }
  }

  const handleRefreshTelemetry = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(getApiUrl(`history/${eventId}/telemetry/refresh`), {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry as TelemetryResponse)
      }
    } catch (err) {
      console.error('Failed to refresh telemetry:', err)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !event) {
    return (
      <PageShell title={t('history.untitled')} headerProps={{ showSettings: false }}>
        <Box sx={{
          minHeight: '100%',
          width: '100%'
        }}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Alert severity="error">{error || t('history.eventNotFound')}</Alert>
            <Button sx={{ mt: 2 }} onClick={() => navigate('/history')}>
              {t('history.back')}
            </Button>
          </Box>
        </Box>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={event.title || t('history.untitled')}
      headerProps={{ showSettings: false }}
    >
      {/* Content Container */}
      <Box sx={{
        minHeight: '100%',
        width: '100%'
      }}>
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Back Button */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/history')}
          >
            {t('history.back')}
          </Button>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {event.eventData?.date && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {event.eventData.date}
                  {event.eventData.time && ` • ${event.eventData.time}`}
                </Typography>
              </Box>
            )}
            {event.eventData?.venue && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {event.eventData.venue}
                  {event.eventData.city && `, ${event.eventData.city}`}
                </Typography>
              </Box>
            )}
            <Chip
              label={event.status || 'draft'}
              size="small"
              color={
                event.status === 'published' ? 'success' :
                event.status === 'draft' ? 'default' :
                'secondary'
              }
            />
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRefreshTelemetry}
              disabled={refreshing}
            >
              {t('history.refreshStats')}
            </Button>
          </Box>
        </Box>

        {/* Platform Statistics Tabs */}
        {event.platforms && event.platforms.length > 0 ? (
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue: number) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {event.platforms.map((platform: string, index: number) => (
                <Tab
                  key={platform}
                  label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  id={`platform-tab-${index}`}
                  aria-controls={`platform-panel-${index}`}
                />
              ))}
            </Tabs>
            {event.platforms.map((platform: string, index: number) => (
              <Box
                key={platform}
                role="tabpanel"
                hidden={activeTab !== index}
                id={`platform-panel-${index}`}
                aria-labelledby={`platform-tab-${index}`}
                sx={{ p: 3 }}
              >
                <PlatformStatsCard
                  platform={platform}
                  telemetry={telemetry?.telemetry?.[platform]}
                  event={event}
                />
              </Box>
            ))}
          </Paper>
        ) : (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography color="text.secondary">
              {t('history.noPlatforms')}
            </Typography>
          </Paper>
        )}

        {/* Event Details */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🎯 {t('history.eventDetails')}
          </Typography>
          
          <Grid container spacing={3}>
            {/* Description */}
            {event.eventData?.description && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  📝 {t('event.description')}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {event.eventData.description}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Images Gallery */}
            {event.files?.some((f: EventFile) => f.type?.startsWith('image/') || f.isImage) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <ImageIcon fontSize="small" /> {t('preview.images')}
                </Typography>
                <Grid container spacing={2}>
                  {event.files
                    .filter((f: EventFile) => f.type?.startsWith('image/') || f.isImage)
                    .map((file: EventFile) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={file.id || file.name}>
                        {(() => {
                          const resolvedUrl = getFileUrl(file.url || `/api/files/${eventId}/${file.filename || file.name}`)
                          return (
                        <Card variant="outlined">
                          <CardMedia
                            component="img"
                            height="160"
                            image={resolvedUrl || undefined}
                            alt={file.name}
                            sx={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => {
                              if (resolvedUrl) window.open(resolvedUrl, '_blank')
                            }}
                          />
                          <CardContent sx={{ py: 1, px: 1.5 }}>
                            <Typography variant="caption" noWrap display="block">
                              {file.name}
                            </Typography>
                          </CardContent>
                        </Card>
                          )
                        })()}
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            )}

            {/* Text Contents */}
            {event.files?.some((f: EventFile) => ['txt', 'md'].includes(f.name?.split('.').pop()?.toLowerCase() || '')) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <DescriptionIcon fontSize="small" /> {t('preview.sourceFiles')}
                </Typography>
                <Grid container spacing={2}>
                  {event.files
                    .filter((f: EventFile) => ['txt', 'md'].includes(f.name?.split('.').pop()?.toLowerCase() || ''))
                    .map((file: EventFile) => {
                      const fileName = file.filename || file.name
                      const content = fileContents[fileName]
                      const isLoading = loadingContents[fileName]
                      
                      return (
                        <Grid item xs={12} key={file.id || file.name}>
                          <Accordion defaultExpanded={event.files.filter((f: EventFile) => ['txt', 'md'].includes(f.name?.split('.').pop()?.toLowerCase() || '')).length === 1}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                📄 {file.name}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              {isLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                  <CircularProgress size={24} />
                                </Box>
                              ) : content ? (
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 2, 
                                    bgcolor: 'background.default', 
                                    color: 'text.primary',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    whiteSpace: 'pre-wrap',
                                    maxHeight: '400px',
                                    overflow: 'auto',
                                    border: '1px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  {content}
                                </Paper>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  {t('history.noContentOrFailedToLoad')}
                                </Typography>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        </Grid>
                      )
                    })}
                </Grid>
              </Grid>
            )}

            {/* Other Files (as Chips) */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 1 }}>
                📎 {t('history.allFiles')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {event.files.map((file: EventFile) => (
                  (() => {
                    const resolvedUrl = getFileUrl(file.url || `/api/files/${eventId}/${file.filename || file.name}`)
                    return (
                  <Chip
                    key={file.id || file.name}
                    label={file.name}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (resolvedUrl) window.open(resolvedUrl, '_blank')
                    }}
                    icon={file.type?.startsWith('image/') || file.isImage ? <ImageIcon /> : <DescriptionIcon />}
                  />
                    )
                  })()
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        </Box>
      </Box>
    </PageShell>
  )
}

export default EventDetailPage
