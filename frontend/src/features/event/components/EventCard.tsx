/**
 * Event Card
 * 
 * Compact card display for an event in history
 * 
 * @module features/history/components/EventCard
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material'

import { getFileUrl } from '../../../shared/utils/api'

type EventFile = {
  url?: string
  filename?: string
  name?: string
  type?: string
  isImage?: boolean
}

type EventCardData = {
  id: string
  title?: string
  files?: EventFile[]
  eventData?: {
    date?: string
    time?: string
    venue?: string
    city?: string
  }
  platforms?: string[]
  status?: string
  stats?: {
    telemetry?: Record<string, unknown> | null
  }
}

type EventCardProps = {
  event: EventCardData
  onClick?: () => void
}

function EventCard({ event, onClick }: EventCardProps) {
  const { t } = useTranslation()

  // Get first image from files
  const firstImage = event.files?.find((f: EventFile) => f.type?.startsWith('image/') || f.isImage)
  
  // Use the central getFileUrl helper like all other components
  const imageUrl = firstImage
    ? getFileUrl(firstImage.url || `/api/files/${event.id}/${firstImage.filename || firstImage.name || ''}`)
    : null

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  // Get platform icons/colors
  const getPlatformChip = (platform: string) => {
    const platformIcons = {
      twitter: '🐦',
      reddit: '🔴',
      facebook: '📘',
      instagram: '📷',
      linkedin: '💼',
      email: '📧'
    }
    const key = platform.toLowerCase() as keyof typeof platformIcons
    return platformIcons[key] || '📱'
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={onClick}
    >
      {/* Image */}
      {imageUrl && (
        <CardMedia
          component="img"
          height="140"
          image={imageUrl}
          alt={event.title}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }} noWrap>
          {event.title || t('history.untitled')}
        </Typography>

        {/* Date & Venue */}
        <Box sx={{ mb: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {event.eventData?.date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(event.eventData.date)}
                {event.eventData.time && ` • ${event.eventData.time}`}
              </Typography>
            </Box>
          )}
          {event.eventData?.venue && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {event.eventData.venue}
                {event.eventData.city && `, ${event.eventData.city}`}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Platforms */}
        {event.platforms && event.platforms.length > 0 && (
          <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {event.platforms.map((platform) => (
              <Chip
                key={platform}
                label={getPlatformChip(platform)}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}

        {/* Status & Stats */}
        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={event.status || 'draft'}
            size="small"
            color={
              event.status === 'published' ? 'success' :
              event.status === 'draft' ? 'default' :
              'secondary'
            }
            variant="outlined"
          />
          {!!event.stats?.telemetry && (
            <Tooltip title={t('history.viewStats')}>
              <IconButton size="small">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default EventCard
