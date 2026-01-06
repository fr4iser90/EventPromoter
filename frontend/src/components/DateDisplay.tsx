import React from 'react'
import { Typography, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatDateForDisplay, formatTimeForDisplay } from '../utils/dateUtils'

interface DateDisplayProps {
  parsedData?: {
    date?: string
    time?: string
    originalDate?: string
    originalTime?: string
    detectedLocale?: string
  }
  showTime?: boolean
  variant?: 'body1' | 'body2' | 'caption'
  color?: string
}

/**
 * Intelligent date/time display component that prioritizes original formats
 * and falls back to localized formatting
 */
const DateDisplay: React.FC<DateDisplayProps> = ({
  parsedData,
  showTime = true,
  variant = 'body1',
  color = 'text.primary'
}) => {
  const { i18n } = useTranslation()

  if (!parsedData) {
    return (
      <Typography variant={variant} color={color}>
        -
      </Typography>
    )
  }

  const displayDate = formatDateForDisplay(
    parsedData.date || '',
    parsedData.detectedLocale || i18n.language,
    parsedData.originalDate ? undefined : undefined // Use original if available
  )

  const displayTime = showTime && parsedData.time
    ? formatTimeForDisplay(parsedData.time, '24h') // Default to 24h for events
    : null

  // Prioritize original formats
  const finalDate = parsedData.originalDate || displayDate
  const finalTime = parsedData.originalTime || displayTime

  return (
    <Box>
      <Typography variant={variant} color={color}>
        {finalDate}
        {finalTime && ` ${finalTime}`}
      </Typography>
    </Box>
  )
}

export default DateDisplay
