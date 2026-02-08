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
  Chip
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material'
import { getApiUrl } from '../shared/utils/api'
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

  useEffect(() => {
    loadEvent()
    loadTelemetry()
  }, [eventId])

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
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('history.eventDetails', { defaultValue: 'Event Details' })}
          </Typography>
          <Grid container spacing={2}>
            {event.eventData?.description && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {event.eventData.description}
                </Typography>
              </Grid>
            )}
            {event.files && event.files.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('history.files', { defaultValue: 'Files' })} ({event.files.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {event.files.map((file) => (
                    <Chip
                      key={file.id || file.name}
                      label={file.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
        </Box>
      </Box>
    </>
  )
}

export default EventDetailPage
