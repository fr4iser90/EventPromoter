import React, { useState, useEffect } from 'react'
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
import EventHistoryCard from '../EventHistoryCard/EventHistoryCard'
import useStore from '../../store'

function EventHistory() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load event history from backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:4000/api/history')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.Events || [])
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

  const handleLoadEventFiles = async (event, fileIds) => {
    try {
      const response = await fetch(`http://localhost:4000/api/event/${event.id}/load-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Loaded ${data.files.length} files from "${event.name}"`)
      } else {
        throw new Error('Failed to load files')
      }
    } catch (error) {
      console.error('Failed to load event files:', error)
      alert('Failed to load event files')
    }
  }

  const handleLoadEventData = async (event) => {
    try {
      const response = await fetch(`http://localhost:4000/api/event/${event.id}/load-data`)

      if (response.ok) {
        const eventData = await response.json()
        alert(`Loaded event data for "${event.name}"`)
        console.log('Event data loaded:', eventData)
      } else {
        throw new Error('Failed to load event data')
      }
    } catch (error) {
      console.error('Failed to load event data:', error)
      alert('Failed to load event data')
    }
  }

  const filteredEvents = events.filter(event =>
    (event.name || event.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          mb: isExpanded ? 2 : 0
        }}
        onClick={() => setIsExpanded(!isExpanded)}
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
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ pt: isExpanded ? 1 : 0 }}>
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
                placeholder="Search events..."
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
