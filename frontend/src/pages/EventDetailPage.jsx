import React, { useState, useEffect } from 'react'
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
  Divider,
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
import Header from '../shared/components/Header'
import { PlatformStatsCard } from '../features/event'

function EventDetailPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [event, setEvent] = useState(null)
  const [telemetry, setTelemetry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [fileContents, setFileContents] = useState({})
  const [loadingContents, setLoadingContents] = useState({})

  useEffect(() => {
    loadEvent()
    loadTelemetry()
  }, [eventId])

  // Load text content for .txt and .md files
  useEffect(() => {
    if (event?.files) {
      const textFiles = event.files.filter(f => {
        const ext = f.name?.split('.').pop()?.toLowerCase()
        return ['txt', 'md'].includes(ext)
      })

      textFiles.forEach(file => {
        loadFileContent(file)
      })
    }
  }, [event?.files])

  const loadFileContent = async (file) => {
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
        setEvent(data.event)
      } else {
        setError(data.error || 'Event not found')
      }
    } catch (err) {
      console.error('Failed to load event:', err)
      setError(err.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const loadTelemetry = async () => {
    try {
      const response = await fetch(getApiUrl(`history/${eventId}/telemetry`))
      const data = await response.json()
      
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry)
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
        setTelemetry(data.telemetry)
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
      <>
        <Header 
          title={t('history.untitled', { defaultValue: 'Untitled Event' })}
          showSettings={false}
        />
        <Box sx={{
          pt: 8, // Account for fixed header
          minHeight: '100vh',
          width: '100%'
        }}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Alert severity="error">{error || 'Event not found'}</Alert>
            <Button sx={{ mt: 2 }} onClick={() => navigate('/history')}>
              {t('history.back', { defaultValue: 'Back to History' })}
            </Button>
          </Box>
        </Box>
      </>
    )
  }

  return (
    <>
      {/* Fixed Header */}
      <Header 
        title={event.title || t('history.untitled', { defaultValue: 'Untitled Event' })}
        showSettings={false}
      />
      
      {/* Content Container */}
      <Box sx={{
        pt: 8, // Account for fixed header
        minHeight: '100vh',
        width: '100%'
      }}>
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Back Button */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/history')}
          >
            {t('history.back', { defaultValue: 'Back to History' })}
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
              {t('history.refreshStats', { defaultValue: 'Refresh Stats' })}
            </Button>
          </Box>
        </Box>

        {/* Platform Statistics Tabs */}
        {event.platforms && event.platforms.length > 0 ? (
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {event.platforms.map((platform, index) => (
                <Tab
                  key={platform}
                  label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  id={`platform-tab-${index}`}
                  aria-controls={`platform-panel-${index}`}
                />
              ))}
            </Tabs>
            {event.platforms.map((platform, index) => (
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
              {t('history.noPlatforms', { defaultValue: 'No platforms published for this event' })}
            </Typography>
          </Paper>
        )}

        {/* Event Details */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🎯 {t('history.eventDetails', { defaultValue: 'Event Details' })}
          </Typography>
          
          <Grid container spacing={3}>
            {/* Description */}
            {event.eventData?.description && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  📝 {t('event.description', { defaultValue: 'Description' })}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {event.eventData.description}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Images Gallery */}
            {event.files?.some(f => f.type?.startsWith('image/') || f.isImage) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <ImageIcon fontSize="small" /> {t('preview.images', { defaultValue: 'Images' })}
                </Typography>
                <Grid container spacing={2}>
                  {event.files
                    .filter(f => f.type?.startsWith('image/') || f.isImage)
                    .map((file) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={file.id || file.name}>
                        <Card variant="outlined">
                          <CardMedia
                            component="img"
                            height="160"
                            image={getFileUrl(file.url || `/api/files/${eventId}/${file.filename || file.name}`)}
                            alt={file.name}
                            sx={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => window.open(getFileUrl(file.url || `/api/files/${eventId}/${file.filename || file.name}`), '_blank')}
                          />
                          <CardContent sx={{ py: 1, px: 1.5 }}>
                            <Typography variant="caption" noWrap display="block">
                              {file.name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            )}

            {/* Text Contents */}
            {event.files?.some(f => ['txt', 'md'].includes(f.name?.split('.').pop()?.toLowerCase())) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <DescriptionIcon fontSize="small" /> {t('preview.sourceFiles', { defaultValue: 'Source Files' })}
                </Typography>
                <Grid container spacing={2}>
                  {event.files
                    .filter(f => ['txt', 'md'].includes(f.name?.split('.').pop()?.toLowerCase()))
                    .map((file) => {
                      const fileName = file.filename || file.name
                      const content = fileContents[fileName]
                      const isLoading = loadingContents[fileName]
                      
                      return (
                        <Grid item xs={12} key={file.id || file.name}>
                          <Accordion defaultExpanded={event.files.filter(f => ['txt', 'md'].includes(f.name?.split('.').pop()?.toLowerCase())).length === 1}>
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
                                  No content available or failed to load.
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
                📎 {t('history.allFiles', { defaultValue: 'All Files' })}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {event.files.map((file) => (
                  <Chip
                    key={file.id || file.name}
                    label={file.name}
                    size="small"
                    variant="outlined"
                    onClick={() => window.open(getFileUrl(file.url || `/api/files/${eventId}/${file.filename || file.name}`), '_blank')}
                    icon={file.type?.startsWith('image/') || file.isImage ? <ImageIcon /> : <DescriptionIcon />}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        </Box>
      </Box>
    </>
  )
}

export default EventDetailPage
