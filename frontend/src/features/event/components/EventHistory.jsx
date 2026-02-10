import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Typography,
  Box,
  Button,
  Collapse,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import EventHistoryCard from './EventHistoryCard'
import useStore, { WORKFLOW_STATES } from '../../../store'
import { getApiUrl } from '../../../shared/utils/api'

function EventHistory() {
  const { t } = useTranslation()
  const { workflowState, eventHistoryExpanded, setEventHistoryExpanded } = useStore()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load event history from backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch(getApiUrl('history'))
        if (response.ok) {
          const data = await response.json()
          // Strict flat structure: data.history.Events
          setEvents(data.history?.Events || [])
          setError(null)
        } else {
          throw new Error('Failed to load events')
        }
      } catch (err) {
        console.error('Failed to load events:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Auto-expand when in initial state
  useEffect(() => {
    if (workflowState === WORKFLOW_STATES.INITIAL) {
      setEventHistoryExpanded(true)
    }
  }, [workflowState])

  const handleLoadEventFiles = async (event, fileIds) => {
    try {
      const response = await fetch(getApiUrl(`event/${event.id}/load-files`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Loaded ${data.files.length} files from "${event.title || 'Event'}"`)
      } else {
        throw new Error('Failed to load files')
      }
    } catch (error) {
      console.error('Failed to load event files:', error)
      alert(t('errors.failedToLoadEventFiles'))
    }
  }

  const handleLoadEventData = async (event) => {
    try {
      // Use the complete restore functionality
      await useStore.getState().restoreEvent(event.id)
      alert(`✅ "${event.title || 'Event'}" wurde vollständig wiederhergestellt!\n\nAlle Dateien, Plattformen und Inhalte wurden geladen.`)
    } catch (error) {
      console.error('Failed to restore event:', error)
      alert(`❌ Fehler beim Wiederherstellen von "${event.title || 'Event'}": ${error.message}`)
    }
  }

  const handleDeleteEvent = (eventId) => {
    // Remove from local state
    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId))
  }

  const filteredEvents = events.filter(event =>
    (event.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          mb: eventHistoryExpanded ? 2 : 0
        }}
        onClick={() => setEventHistoryExpanded(!eventHistoryExpanded)}
      >
        <Typography variant="h6">
          📂 Event History
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {events.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </Typography>
          )}
          <Button size="small">
            {eventHistoryExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
        </Box>
      </Box>

      <Collapse in={eventHistoryExpanded}>
        <Box sx={{ pt: eventHistoryExpanded ? 1 : 0 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load event history: {error}
            </Alert>
          )}

          {!loading && !error && events.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No events found. Create your first event by uploading files.
              </Typography>
            </Box>
          )}

          {!loading && !error && events.length > 0 && (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder={t('search.events')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredEvents.map(event => (
                  <EventHistoryCard
                    key={event.id}
                    event={event}
                    onLoadFiles={handleLoadEventFiles}
                    onLoadEvent={handleLoadEventData}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default EventHistory
