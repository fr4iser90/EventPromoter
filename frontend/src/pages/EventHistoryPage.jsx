import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PageShell from '../shared/components/layout/PageShell'
import PageToolbar from '../shared/components/layout/PageToolbar'
import { EventCard } from '../features/event'
import { getApiUrl } from '../shared/utils/api'

function EventHistoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(getApiUrl('history'))
      const data = await response.json()
      
      if (data.success && data.history) {
        setEvents(data.history.Events || [])
      } else {
        setError(data.error || 'Failed to load history')
      }
    } catch (err) {
      console.error('Failed to load history:', err)
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = event.title?.toLowerCase().includes(query)
      const matchesDate = event.eventData?.date?.toLowerCase().includes(query)
      const matchesVenue = event.eventData?.venue?.toLowerCase().includes(query)
      if (!matchesTitle && !matchesDate && !matchesVenue) {
        return false
      }
    }

    // Status filter
    if (statusFilter !== 'all' && event.status !== statusFilter) {
      return false
    }

    return true
  })

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <PageShell title={t('history.title', { defaultValue: 'Event History' })} headerProps={{ showSettings: false }}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </PageShell>
    )
  }

  return (
    <PageShell title={t('history.title', { defaultValue: 'Event History' })} headerProps={{ showSettings: false }}>
      {/* Content Container */}
      <Box sx={{
        display: 'flex',
        minHeight: '100%',
        width: '100%'
      }}>
        {/* Left Panel - Event List */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Toolbar */}
          <PageToolbar>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder={t('history.search', { defaultValue: 'Search events...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Status Tabs */}
            <Paper>
              <Tabs
                value={statusFilter}
                onChange={(e, newValue) => setStatusFilter(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                <Tab value="all" label={t('history.all', { defaultValue: 'All' })} />
                <Tab value="draft" label={t('history.draft', { defaultValue: 'Draft' })} />
                <Tab value="published" label={t('history.published', { defaultValue: 'Published' })} />
                <Tab value="archived" label={t('history.archived', { defaultValue: 'Archived' })} />
              </Tabs>
            </Paper>
          </PageToolbar>

          {/* Event List */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {filteredEvents.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {t('history.noEvents', { defaultValue: 'No events found' })}
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredEvents.map((event) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                    <EventCard
                      event={event}
                      onClick={() => navigate(`/history/${event.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </PageShell>
  )
}

export default EventHistoryPage
