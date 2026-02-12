/**
 * Hashtag Builder Component
 * 
 * Two-column layout for managing hashtags:
 * - Left: Available hashtags (grouped)
 * - Right: Selected hashtags
 * 
 * @module flows/parser/HashtagBuilder
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Paper,
  Typography,
  Chip,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material'
import axios from 'axios'
import config from '../../../config'
import { getApiUrl } from '../../../shared/utils/api'

type EventData = {
  hashtags?: string[]
  [key: string]: unknown
}

function ParserHashtagBuilder({
  eventData,
  onHashtagsChange
}: {
  eventData: EventData
  onHashtagsChange?: (hashtags: string[]) => void
}) {
  const { t } = useTranslation()
  const [available, setAvailable] = useState<string[]>([])
  const [groups, setGroups] = useState<Record<string, string[]>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  // Load hashtags on mount
  useEffect(() => {
    loadHashtags()
  }, [])

  // Load hashtags from eventData if available (parsed from file)
  useEffect(() => {
    if (eventData?.hashtags && Array.isArray(eventData.hashtags) && eventData.hashtags.length > 0) {
      // Set parsed hashtags as selected
      setSelected(eventData.hashtags)
      // Also save them
      if (onHashtagsChange) {
        onHashtagsChange(eventData.hashtags)
      }
    }
  }, [eventData?.hashtags])

  // Load suggested hashtags when eventData changes
  useEffect(() => {
    if (eventData) {
      loadSuggestions()
    }
  }, [eventData])

  const loadHashtags = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(getApiUrl('hashtags'))
      if (response.data.success) {
        setAvailable(response.data.available || [])
        setGroups(response.data.groups || {})
        setSelected(response.data.selected || [])
        // Expand all groups by default
        const expanded: Record<string, boolean> = {}
        Object.keys(response.data.groups || {}).forEach((group) => {
          expanded[group] = true
        })
        setExpandedGroups(expanded)
      }
    } catch (err: unknown) {
      console.error('Failed to load hashtags:', err)
      setError(err instanceof Error ? err.message : t('parser.failedToLoadHashtags'))
    } finally {
      setLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      const response = await axios.post(getApiUrl('hashtags/suggest'), {
        eventData
      })
      if (response.data.success) {
        setSuggestions(response.data.suggestions || [])
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err)
    }
  }

  const handleAddHashtag = (hashtag: string) => {
    if (!selected.includes(hashtag)) {
      const newSelected = [...selected, hashtag]
      setSelected(newSelected)
      saveSelected(newSelected)
    }
  }

  const handleRemoveHashtag = (hashtag: string) => {
    const newSelected = selected.filter((h) => h !== hashtag)
    setSelected(newSelected)
    saveSelected(newSelected)
  }

  const handleAddSuggestion = (hashtag: string) => {
    handleAddHashtag(hashtag)
  }

  const handleAddAllSuggestions = () => {
    const newSelected = [...new Set([...selected, ...suggestions])]
    setSelected(newSelected)
    saveSelected(newSelected)
  }

  const handleClearSelected = () => {
    setSelected([])
    saveSelected([])
  }

  const saveSelected = async (hashtags: string[]) => {
    try {
      await axios.put(getApiUrl('hashtags/selected'), {
        selected: hashtags
      })
      if (onHashtagsChange) {
        onHashtagsChange(hashtags)
      }
    } catch (err) {
      console.error('Failed to save selected hashtags:', err)
    }
  }

  const handleGroupToggle = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const filteredAvailable = available.filter((hashtag) => {
    if (!searchQuery) return true
    return hashtag.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredGroups = Object.keys(groups).reduce<Record<string, string[]>>((acc, groupName) => {
    const groupHashtags = (groups[groupName] || []).filter((hashtag) => {
      if (!searchQuery) return true
      return hashtag.toLowerCase().includes(searchQuery.toLowerCase())
    })
    if (groupHashtags.length > 0) {
      acc[groupName] = groupHashtags
    }
    return acc
  }, {})

  const getPlatformLimit = () => {
    // TODO: Get from platform capabilities
    return 30 // Default Instagram limit
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        {t('parser.failedToLoadHashtags')}: {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('parser.hashtagBuilder')}
      </Typography>

      {/* Suggestions Alert */}
      {suggestions.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={handleAddAllSuggestions}
            >
              {t('parser.addAll')}
            </Button>
          }
        >
          <Typography variant="body2" gutterBottom>
            <strong>{t('parser.suggestedHashtags')}</strong> {t('parser.basedOnEventData')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            {suggestions.slice(0, 10).map((hashtag) => (
              <Chip
                key={hashtag}
                label={hashtag}
                size="small"
                onClick={() => handleAddSuggestion(hashtag)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
            {suggestions.length > 10 && (
              <Chip
                label={`+${suggestions.length - 10} more`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Alert>
      )}

      {/* Two-Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column: Available Hashtags */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', maxHeight: 600, overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('parser.availableHashtags')}
            </Typography>

            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder={t('parser.searchHashtags')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                )
              }}
              sx={{ mb: 2 }}
            />

            {/* Grouped Hashtags */}
            {Object.keys(filteredGroups).length > 0 ? (
              Object.keys(filteredGroups).map((groupName) => (
                <Accordion
                  key={groupName}
                  expanded={expandedGroups[groupName] !== false}
                  onChange={() => handleGroupToggle(groupName)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {groupName} ({filteredGroups[groupName].length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {filteredGroups[groupName].map((hashtag) => (
                        <Chip
                          key={hashtag}
                          label={hashtag}
                          size="small"
                          onClick={() => handleAddHashtag(hashtag)}
                          disabled={selected.includes(hashtag)}
                          sx={{
                            cursor: 'pointer',
                            opacity: selected.includes(hashtag) ? 0.5 : 1
                          }}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('parser.noHashtagsFound')}
              </Typography>
            )}

            {/* Ungrouped Hashtags */}
            {filteredAvailable.filter((h) => {
              // Filter out hashtags that are in groups
              return !Object.values(groups).flat().includes(h)
            }).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {t('common.other')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {filteredAvailable.filter((h) => !Object.values(groups).flat().includes(h)).map((hashtag) => (
                    <Chip
                      key={hashtag}
                      label={hashtag}
                      size="small"
                      onClick={() => handleAddHashtag(hashtag)}
                      disabled={selected.includes(hashtag)}
                      sx={{
                        cursor: 'pointer',
                        opacity: selected.includes(hashtag) ? 0.5 : 1
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Selected Hashtags */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', maxHeight: 600, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {t('parser.selectedHashtags')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {selected.length}/{getPlatformLimit()}
                </Typography>
                {selected.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={handleClearSelected}
                    color="error"
                  >
                    {t('common.clear')}
                  </Button>
                )}
              </Box>
            </Box>

            {selected.length === 0 ? (
              <Alert severity="info">
                {t('parser.noHashtagsSelectedHint')}
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selected.map((hashtag) => (
                  <Chip
                    key={hashtag}
                    label={hashtag}
                    onDelete={() => handleRemoveHashtag(hashtag)}
                    color="primary"
                    variant="filled"
                  />
                ))}
              </Box>
            )}

            {selected.length >= getPlatformLimit() && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {t('parser.reachedPlatformLimit', { limit: getPlatformLimit() })}
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ParserHashtagBuilder
