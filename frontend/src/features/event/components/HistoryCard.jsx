import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import AddIcon from '@mui/icons-material/Add'
import DownloadIcon from '@mui/icons-material/Download'
import useStore from '../../../store'

function EventHistoryCard({ event, onLoadFiles, onLoadEvent }) {
  const { t } = useTranslation()
  const { setError } = useStore()

  const formatDate = (dateString) => {
    if (!dateString) return 'No date'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type === 'application/pdf') return <PictureAsPdfIcon fontSize="small" />
    if (type.startsWith('image/')) return <ImageIcon fontSize="small" />
    if (type === 'text/plain' || type === 'text/markdown') return <TextSnippetIcon fontSize="small" />
    return <DescriptionIcon fontSize="small" />
  }

  const handleLoadFiles = async () => {
    try {
      const fileIds = event.files?.map(file => file.id) || []
      await onLoadFiles(event, fileIds)
    } catch (error) {
      console.error('Failed to load files:', error)
      setError(t('errors.failedToLoadEventFiles'))
    }
  }

  const handleLoadEvent = async () => {
    try {
      await onLoadEvent(event)
    } catch (error) {
      console.error('Failed to load event:', error)
      setError('Failed to load event data')
    }
  }

  const displayedFiles = event.files?.slice(0, 3) || []
  const remainingCount = (event.files?.length || 0) - displayedFiles.length

  return (
    <Card sx={{ mb: 1, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>
          {event.name || event.title || t('event.untitled')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          📅 {formatDate(event.eventData?.date || event.publishedAt)} • {event.files?.length || 0} files
        </Typography>

        {event.platforms && event.platforms.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Platforms:
            </Typography>
            {event.platforms.slice(0, 3).map(platform => (
              <Chip
                key={platform}
                label={platform}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
              />
            ))}
            {event.platforms.length > 3 && (
              <Chip label={`+${event.platforms.length - 3}`} size="small" variant="outlined" />
            )}
          </Box>
        )}

        {displayedFiles.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {displayedFiles.map(file => (
              <Tooltip key={file.id} title={`${file.name} (${formatFileSize(file.size)})`}>
                <Chip
                  icon={getFileIcon(file.type)}
                  label={file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Tooltip>
            ))}
            {remainingCount > 0 && (
              <Chip label={`+${remainingCount} more`} size="small" variant="outlined" />
            )}
          </Box>
        )}

        {event.status && (
          <Chip
            label={event.status}
            size="small"
            color={event.status === 'published' ? 'success' : event.status === 'draft' ? 'warning' : 'default'}
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleLoadFiles}
          disabled={!event.files || event.files.length === 0}
          variant="outlined"
        >
          Load Files Only
        </Button>

        <Button
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleLoadEvent}
          variant="contained"
          color="primary"
        >
          Restore Event
        </Button>
      </CardActions>
    </Card>
  )
}

export default EventHistoryCard
