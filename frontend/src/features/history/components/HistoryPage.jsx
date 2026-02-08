/**
 * History Page
 * 
 * Displays all events as cards with quick stats
 * 
 * @module features/history/components/HistoryPage
 */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getApiUrl } from '../../../shared/utils/api'
import Header from '../../../shared/components/Header'
import EventCard from './EventCard'

function HistoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')

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

    // Platform filter
    if (platformFilter !== 'all' && !event.platforms.includes(platformFilter)) {
      return false
    }

    return true
  })

  // Get unique platforms for filter
  const allPlatforms = [...new Set(events.flatMap(e => e.platforms || []))]

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <>
      {/* Fixed Header */}
      <Header title={t('history.title', { defaultValue: 'Event History' })} showSettings={false} />
      
      <Box sx={{ pt: 8, p: 3 }}>
        {/* Stats Chip */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            label={`${filteredEvents.length} ${t('history.events', { defaultValue: 'events' })}`}
            color="primary"
            variant="outlined"
          />
        </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('history.search', { defaultValue: 'Search events...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('history.status', { defaultValue: 'Status' })}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label={t('history.status', { defaultValue: 'Status' })}
              >
                <MenuItem value="all">{t('history.all', { defaultValue: 'All' })}</MenuItem>
                <MenuItem value="published">{t('history.published', { defaultValue: 'Published' })}</MenuItem>
                <MenuItem value="draft">{t('history.draft', { defaultValue: 'Draft' })}</MenuItem>
                <MenuItem value="archived">{t('history.archived', { defaultValue: 'Archived' })}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('history.platform', { defaultValue: 'Platform' })}</InputLabel>
              <Select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                label={t('history.platform', { defaultValue: 'Platform' })}
              >
                <MenuItem value="all">{t('history.all', { defaultValue: 'All' })}</MenuItem>
                {allPlatforms.map(platform => (
                  <MenuItem key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Chip
                icon={<RefreshIcon />}
                label={t('history.refresh', { defaultValue: 'Refresh' })}
                onClick={loadHistory}
                clickable
                color="primary"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Event Cards */}
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
          )          )}
        </Grid>
      )}
      </Box>
    </>
  )
}

export default HistoryPage
