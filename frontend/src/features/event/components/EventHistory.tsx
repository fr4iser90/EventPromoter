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

interface EventHistoryItem {
  id: string
  title?: string
  publishedAt: string
  status?: string
  eventData?: {
    date?: string
  }
  files?: Array<{ id: string; name: string; type: string; size: number }>
  platforms?: string[]
}

function EventHistory() {
  const { t } = useTranslation()
  const { workflowState, eventHistoryExpanded, setEventHistoryExpanded } = useStore() as unknown as {
    workflowState: string
    eventHistoryExpanded: boolean
    setEventHistoryExpanded: (expanded: boolean) => void
  }
  const [events, setEvents] = useState<EventHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
          throw new Error(t('history.failedToLoadEvents'))
        }
      } catch (err: unknown) {
        console.error('Failed to load events:', err)
        setError(err instanceof Error ? err.message : t('common.unknown'))
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [t])

  // Auto-expand when in initial state
  useEffect(() => {
    if (workflowState === WORKFLOW_STATES.INITIAL) {
      setEventHistoryExpanded(true)
    }
  }, [workflowState, setEventHistoryExpanded])

  const handleLoadEventFiles = async (event: EventHistoryItem, fileIds: string[]) => {
    try {
      const response = await fetch(getApiUrl(`event/${event.id}/load-files`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds })
      })

      if (response.ok) {
        const data = await response.json()
        alert(t('history.loadedFilesFromEvent', { count: data.files.length, title: event.title || t('history.untitled') }))
      } else {
        throw new Error(t('history.failedToLoadFiles'))
      }
    } catch (error: unknown) {
      console.error('Failed to load event files:', error)
      alert(t('errors.failedToLoadEventFiles'))
    }
  }

  const handleLoadEventData = async (event: EventHistoryItem) => {
    try {
      // Use the complete restore functionality
      await (useStore.getState() as any).restoreEvent(event.id)
      alert(t('history.restoreSuccess', { title: event.title || t('history.untitled') }))
    } catch (error: unknown) {
      console.error('Failed to restore event:', error)
      alert(t('history.restoreFailed', { title: event.title || t('history.untitled'), error: error instanceof Error ? error.message : t('common.unknown') }))
    }
  }

  const handleDeleteEvent = (eventId: string) => {
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
          {t('history.title')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {events.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {events.length === 1
                ? t('history.eventsCountOne', { count: events.length })
                : t('history.eventsCountMany', { count: events.length })}
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
              {t('history.failedToLoadEventHistory', { error })}
            </Alert>
          )}

          {!loading && !error && events.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('history.noEventsUploadHint')}
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
