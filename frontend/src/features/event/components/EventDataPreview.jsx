import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  CircularProgress,
  Modal,
  IconButton,
  Fade,
  Backdrop,
  TextField,
  Chip,
  Tooltip,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import SaveIcon from '@mui/icons-material/Save'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useTranslation } from 'react-i18next'
import i18n from '../../../i18n'
import { getDefaultCurrency, formatPriceInput, getUserLocale, extractCurrencyFromPrice } from '../../../shared/utils/localeUtils'
import useStore from '../../../store'
import DateDisplay from '../../../shared/components/ui/DateDisplay'
import DateInput from '../../../shared/components/ui/DateInput'
import TimeInput from '../../../shared/components/ui/TimeInput'
import { ParserHashtagBuilder } from '../../parser'
import axios from 'axios'
import config from '../../../config'
import { getApiUrl, getFileUrl } from '../../../shared/utils/api'


function Preview() {
  const { t } = useTranslation()
  const { 
    uploadedFileRefs, 
    parsedData: storeParsedData, 
    currentEvent,
    updateParsedData,
    debouncedSaveParsedData,
    savingParsedData,
    parsedDataSaveError,
    lastParsedDataSave,
    newEvent,
    workflowState
  } = useStore()
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedTextFile, setSelectedTextFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [loadingText, setLoadingText] = useState(false)
  const [editedData, setEditedData] = useState(storeParsedData || {})
  const [hashtags, setHashtags] = useState([])
  const [hashtagDialogOpen, setHashtagDialogOpen] = useState(false)
  const [hashtagPanelExpanded, setHashtagPanelExpanded] = useState(true)
  const descriptionRef = React.useRef(null)

  // Sync with store when it changes externally
  useEffect(() => {
    if (storeParsedData) {
      setEditedData(storeParsedData)
    }
  }, [storeParsedData])

  // Auto-resize description field
  useEffect(() => {
    if (descriptionRef.current) {
      const textarea = descriptionRef.current.querySelector('textarea')
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }
  }, [editedData.description])

  const imageFiles = uploadedFileRefs.filter(file => file.type.startsWith('image/'))
  const textFiles = uploadedFileRefs.filter(file => !file.type.startsWith('image/'))

  const handleImageClick = (fileData) => {
    setSelectedImage(fileData)
  }

  const handleTextFileClick = async (fileData) => {
    const fileExtension = fileData.filename.split('.').pop()?.toLowerCase()
    const textExtensions = ['txt', 'md', 'csv', 'json']

    if (textExtensions.includes(fileExtension)) {
      // Load text content for preview
      setSelectedTextFile(fileData)
      setLoadingText(true)
      setTextContent('')

      try {
        // Use the fileData.url directly as it's already the correct /api/files/... path
        const response = await fetch(getApiUrl(fileData.url + '/content'))
        if (response.ok) {
          const data = await response.json()
          setTextContent(data.content || 'No content available')
        } else {
          setTextContent('Failed to load file content')
        }
      } catch (error) {
        console.error('Error loading text file:', error)
        setTextContent('Error loading file content')
      } finally {
        setLoadingText(false)
      }
    } else {
      // For non-text files (PDF, etc.), open in new tab
      const fileUrl = getFileUrl(fileData.url)
      window.open(fileUrl, '_blank')
    }
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
    setSelectedTextFile(null)
    setTextContent('')
  }

  // Handle field change with autosave
  const handleFieldChange = (field, value) => {
    const updated = { ...editedData, [field]: value }
    setEditedData(updated)
    
    // Autosave with debounce
    debouncedSaveParsedData(updated)
  }

  // Handle extended data field change (for schema-based fields)
  const handleExtendedDataChange = (groupId, fieldId, value, isNested = false, parentFieldId = null) => {
    const updated = { ...editedData }
    if (!updated.extendedData) {
      updated.extendedData = {}
    }
    if (!updated.extendedData[groupId]) {
      updated.extendedData[groupId] = {}
    }

    if (isNested && parentFieldId) {
      // Nested field (e.g., ticketInfo.presale.price)
      if (!updated.extendedData[groupId][parentFieldId]) {
        updated.extendedData[groupId][parentFieldId] = {}
      }
      // Remove field if boolean is false or value is empty
      if (typeof value === 'boolean' && value === false) {
        delete updated.extendedData[groupId][parentFieldId][fieldId]
        // Clean up empty parent object
        if (Object.keys(updated.extendedData[groupId][parentFieldId]).length === 0) {
          delete updated.extendedData[groupId][parentFieldId]
        }
      } else if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        delete updated.extendedData[groupId][parentFieldId][fieldId]
        // Clean up empty parent object
        if (Object.keys(updated.extendedData[groupId][parentFieldId]).length === 0) {
          delete updated.extendedData[groupId][parentFieldId]
        }
      } else {
        updated.extendedData[groupId][parentFieldId][fieldId] = value
      }
    } else {
      // Simple field
      // Remove field if boolean is false or value is empty
      if (typeof value === 'boolean' && value === false) {
        delete updated.extendedData[groupId][fieldId]
      } else if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        delete updated.extendedData[groupId][fieldId]
      } else {
        updated.extendedData[groupId][fieldId] = value
      }
    }

    // Clean up empty group
    if (Object.keys(updated.extendedData[groupId]).length === 0) {
      delete updated.extendedData[groupId]
    }

    setEditedData(updated)
    debouncedSaveParsedData(updated)
  }

  // Get extended data field value
  const getExtendedDataValue = (groupId, fieldId, parentFieldId = null) => {
    const groupData = editedData?.extendedData?.[groupId]
    if (!groupData) return ''

    if (parentFieldId) {
      const parentData = groupData[parentFieldId]
      return parentData?.[fieldId] || ''
    }

    return groupData[fieldId] || ''
  }

  // Check if group has data
  const hasGroupData = (groupId) => {
    const groupData = editedData?.extendedData?.[groupId]
    if (!groupData) return false
    return Object.values(groupData).some(value => {
      if (value === null || value === undefined) return false
      // Boolean: only true counts as "has data"
      if (typeof value === 'boolean') return value === true
      // Objects (nested groups): check nested values
      if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.values(value).some(v => {
          if (v === null || v === undefined) return false
          if (typeof v === 'boolean') return v === true
          return String(v).trim().length > 0
        })
      }
      // Strings/numbers: must have non-empty content
      return String(value).trim().length > 0
    })
  }

  // Manual save button handler
  const handleManualSave = async () => {
    const success = await updateParsedData(editedData)
    return success
  }

  // Handle lineup change (convert string to array)
  const handleLineupChange = (value) => {
    const lineupArray = value.split(',').map(item => item.trim()).filter(item => item)
    handleFieldChange('lineup', lineupArray)
  }

  // Update hashtags in store (for platform content)
  const updateHashtagsInStore = (newHashtags) => {
    // Store hashtags in parsedData so they're available for platform content
    const updated = { ...editedData, hashtags: newHashtags }
    setEditedData(updated)
    debouncedSaveParsedData(updated)
  }

  // Load hashtags from editedData on mount and when editedData changes
  useEffect(() => {
    if (editedData?.hashtags && Array.isArray(editedData.hashtags) && editedData.hashtags.length > 0) {
      setHashtags(editedData.hashtags)
    } else if (editedData && (!editedData.hashtags || (Array.isArray(editedData.hashtags) && editedData.hashtags.length === 0))) {
      // If no hashtags in data, start with empty array
      setHashtags([])
    }
  }, [editedData?.hashtags, editedData])

  // Generate dynamic template placeholders based on available data
  const getAvailablePlaceholders = () => {
    const placeholders = []

    if (editedData.title) placeholders.push('titel')
    if (editedData.date) placeholders.push('datum')
    if (editedData.time) placeholders.push('zeit')
    if (editedData.venue) placeholders.push('venue')
    if (editedData.city) placeholders.push('stadt')
    if (editedData.genre) placeholders.push('genre')
    if (editedData.price) placeholders.push('preis')
    if (editedData.organizer) placeholders.push('organizer')
    if (editedData.website) placeholders.push('website')
    if (editedData.lineup && editedData.lineup.length > 0) placeholders.push('lineup')
    if (editedData.description) placeholders.push('beschreibung')

    // Add image placeholders based on uploaded images
    const imageFiles = uploadedFileRefs.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length > 0) {
      imageFiles.forEach((_, index) => {
        placeholders.push(`img${index + 1}`)
      })
    }

    // Add extended data placeholders
    if (editedData.extendedData) {
      Object.entries(editedData.extendedData).forEach(([groupId, groupData]) => {
        Object.entries(groupData).forEach(([fieldId, value]) => {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Nested fields
            Object.keys(value).forEach(subFieldId => {
              placeholders.push(`${groupId}${capitalize(fieldId)}${capitalize(subFieldId)}`)
            })
          } else if (value) {
            placeholders.push(`${groupId}${capitalize(fieldId)}`)
          }
        })
      })
    }

    return placeholders
  }

  // Helper to capitalize first letter
  const capitalize = (str) => {
    if (!str || str.length === 0) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Render extended data groups (Ticket-Info, Contact-Info, etc.)
  const renderExtendedDataGroups = () => {
    // Schema definition (could be loaded from API in future)
    const schema = {
      groups: [
        {
          id: 'ticketInfo',
          label: 'Ticket-Informationen',
          icon: '🎫',
          collapsible: true,
          defaultExpanded: false,
          showWhenEmpty: true,
          fields: [
            {
              id: 'presale',
              type: 'group',
              label: 'Vorkasse / Presale',
              fields: [
                { id: 'price', type: 'text', label: 'Preis', placeholder: 'z.B. 25€' },
                { id: 'url', type: 'url', label: 'Ticket-URL', placeholder: 'https://...' },
                { id: 'available', type: 'boolean', label: 'Vorkasse verfügbar', default: true },
                { id: 'until', type: 'date', label: 'Verfügbar bis' }
              ]
            },
            {
              id: 'boxOffice',
              type: 'group',
              label: 'Abendkasse / Box Office',
              fields: [
                { id: 'price', type: 'text', label: 'Preis', placeholder: 'z.B. 30€' },
                { id: 'available', type: 'boolean', label: 'Abendkasse verfügbar', default: true },
                { id: 'note', type: 'textarea', label: 'Hinweis', placeholder: 'z.B. Teurer als Vorkasse' }
              ]
            },
            { id: 'info', type: 'textarea', label: 'Allgemeine Ticket-Informationen', placeholder: 'Zusätzliche Infos zu Tickets...' },
            { id: 'url', type: 'url', label: 'Ticket-URL (Allgemein)', placeholder: 'https://tickets.example.com' }
          ]
        },
        {
          id: 'contactInfo',
          label: 'Kontakt-Informationen',
          icon: '📞',
          collapsible: true,
          defaultExpanded: false,
          showWhenEmpty: true,
          fields: [
            { id: 'email', type: 'email', label: 'E-Mail', placeholder: 'info@example.com' },
            { id: 'phone', type: 'tel', label: 'Telefon', placeholder: '+49 341 1234567' },
            { id: 'contactPerson', type: 'text', label: 'Ansprechpartner', placeholder: 'Max Mustermann' }
          ]
        },
        {
          id: 'additionalInfo',
          label: 'Zusätzliche Informationen',
          icon: 'ℹ️',
          collapsible: true,
          defaultExpanded: false,
          showWhenEmpty: true,
          fields: [
            { id: 'ageRestriction', type: 'text', label: 'Altersbeschränkung', placeholder: '18+' },
            { id: 'dressCode', type: 'text', label: 'Dresscode', placeholder: 'Casual' },
            { id: 'parking', type: 'textarea', label: 'Parkmöglichkeiten', placeholder: 'Kostenlose Parkplätze verfügbar' },
            { id: 'accessibility', type: 'textarea', label: 'Barrierefreiheit', placeholder: 'Rollstuhlgerechter Zugang vorhanden' }
          ]
        }
      ]
    }

    return (
      <Box sx={{ mt: 3 }}>
        {schema.groups.map(group => {
          if (!group.showWhenEmpty && !hasGroupData(group.id)) {
            return null
          }

          return (
            <Accordion
              key={group.id}
              defaultExpanded={group.defaultExpanded || hasGroupData(group.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {group.icon} {group.label}
                  </Typography>
                  {hasGroupData(group.id) && (
                    <Chip
                      label="Konfiguriert"
                      size="small"
                      color="primary"
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {group.fields.map(field => {
                    // Handle nested group fields
                    if (field.type === 'group' && field.fields) {
                      return (
                        <Grid item xs={12} md={6} key={field.id}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                              {field.label}
                            </Typography>
                            <Grid container spacing={2}>
                              {field.fields.map(subField => (
                                <Grid item xs={12} key={subField.id}>
                                  {renderField(subField, group.id, field.id)}
                                </Grid>
                              ))}
                            </Grid>
                          </Card>
                        </Grid>
                      )
                    }

                    // Simple fields
                    return (
                      <Grid item xs={12} md={12} key={field.id}>
                        {renderField(field, group.id)}
                      </Grid>
                    )
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Box>
    )
  }

  // Get current locale for currency formatting
  const currentLocale = getUserLocale(i18n)

  // Check if conditional required fields are satisfied
  const checkConditionalRequired = (groupId, parentFieldId) => {
    if (groupId !== 'ticketInfo' || !parentFieldId) return { isValid: true, error: null }
    
    const available = getExtendedDataValue(groupId, 'available', parentFieldId)
    if (!available) return { isValid: true, error: null }
    
    const price = getExtendedDataValue(groupId, 'price', parentFieldId)
    const url = getExtendedDataValue(groupId, 'url', parentFieldId)
    
    // If available, need either price or url
    const hasPrice = price && price.trim().length > 0
    const hasUrl = url && url.trim().length > 0
    
    if (!hasPrice && !hasUrl) {
      return { 
        isValid: false, 
        error: 'Bitte Preis oder Ticket-URL angeben (z.B. "Coming Soon" für Preis)' 
      }
    }
    
    return { isValid: true, error: null }
  }

  // Render a single field
  const renderField = (field, groupId, parentFieldId = null) => {
    const value = getExtendedDataValue(groupId, field.id, parentFieldId)
    const isNested = parentFieldId !== null
    
    // Check conditional required for price/url fields
    const conditionalValidation = (field.id === 'price' || field.id === 'url') && isNested
      ? checkConditionalRequired(groupId, parentFieldId)
      : { isValid: true, error: null }

    switch (field.type) {
      case 'text':
      case 'url':
      case 'email':
      case 'tel':
        // Special handling for price fields
        const isPriceField = field.id === 'price' && isNested
        
        // Extract currency from current value or use default
        const displayedCurrency = isPriceField && value 
          ? (extractCurrencyFromPrice(value) || getDefaultCurrency(currentLocale))
          : (isPriceField ? getDefaultCurrency(currentLocale) : null)
        
        return (
          <TextField
            fullWidth
            size="small"
            label={field.label}
            placeholder={isPriceField ? `z.B. 25${getDefaultCurrency(currentLocale)}` : field.placeholder}
            value={value}
            onChange={(e) => {
              const inputValue = e.target.value
              // For price fields, format with currency on blur or when user finishes typing
              handleExtendedDataChange(groupId, field.id, inputValue, isNested, parentFieldId)
            }}
            onBlur={(e) => {
              // Auto-format price when user leaves the field
              // Only format if user entered just numbers (no currency symbol)
              if (isPriceField && e.target.value && e.target.value.trim().length > 0) {
                const inputValue = e.target.value.trim()
                // Check if user already entered a currency symbol manually
                const hasManualCurrency = /[€$£¥₹₽₩₪₫₨₦₡₵₴₸₷₯₰₱₲₳₶₷₸₹₺₼₽₾₿]/.test(inputValue)
                
                // Only auto-format if no currency was manually entered
                if (!hasManualCurrency) {
                  const formatted = formatPriceInput(inputValue, currentLocale)
                  if (formatted !== inputValue) {
                    handleExtendedDataChange(groupId, field.id, formatted, isNested, parentFieldId)
                  }
                }
              }
            }}
            type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
            helperText={conditionalValidation.error || field.description || (isPriceField ? `Standard: ${getDefaultCurrency(currentLocale)} (manuell änderbar, z.B. "25$")` : '')}
            error={!conditionalValidation.isValid}
            InputProps={isPriceField && displayedCurrency ? {
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {displayedCurrency}
                  </Typography>
                </InputAdornment>
              )
            } : undefined}
          />
        )

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleExtendedDataChange(groupId, field.id, e.target.value, isNested, parentFieldId)}
            helperText={field.description}
          />
        )

      case 'boolean':
        // Ensure value is boolean (handle string "true"/"false" or other types)
        const booleanValue = typeof value === 'boolean' 
          ? value 
          : value === true || value === 'true' || value === 1 || value === '1'
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={booleanValue ?? field.default ?? false}
                onChange={(e) => handleExtendedDataChange(groupId, field.id, e.target.checked, isNested, parentFieldId)}
              />
            }
            label={field.label}
          />
        )

      case 'date':
        return (
          <DateInput
            fullWidth
            size="small"
            label={field.label}
            value={value}
            onChange={(isoDate) => handleExtendedDataChange(groupId, field.id, isoDate, isNested, parentFieldId)}
            helperText={field.description}
          />
        )

      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleExtendedDataChange(groupId, field.id, e.target.value, isNested, parentFieldId)}
            helperText={field.description}
          />
        )
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          👁️ {t('preview.title')}
        </Typography>
        
        {/* Save Status Indicator - More Visible */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {savingParsedData && (
            <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ py: 0.5 }}>
              {t('parser.saving')}
            </Alert>
          )}
          {!savingParsedData && lastParsedDataSave && !parsedDataSaveError && (
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon />}
              sx={{ py: 0.5 }}
            >
              {t('parser.saved')} {new Date(lastParsedDataSave).toLocaleTimeString()}
            </Alert>
          )}
          {parsedDataSaveError && (
            <Alert severity="error" icon={<ErrorIcon />} sx={{ py: 0.5 }}>
              {parsedDataSaveError}
            </Alert>
          )}
        </Box>
      </Box>

      {uploadedFileRefs.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          {t('preview.noFiles')}
        </Typography>
      ) : (
        <Box>
          {/* Image Preview */}
          {imageFiles.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📸 {t('preview.images')} ({imageFiles.length})
              </Typography>
              <Grid container spacing={2}>
                {imageFiles.map((fileData) => (
                  <Grid item xs={12} sm={6} md={4} key={fileData.id}>
                    <Card sx={{ cursor: 'pointer' }} onClick={() => handleImageClick(fileData)}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getFileUrl(fileData.url)}
                        alt={fileData.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2" noWrap>
                          {fileData.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fileData.name.split('.').pop().toUpperCase()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Event Data Input - Always Editable */}
          {editedData && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  🎯 {t('preview.eventData')}
                </Typography>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    if (window.confirm(t('common.resetConfirm') || 'Are you sure you want to reset and start a new event? All current data will be lost.')) {
                      newEvent()
                    }
                  }}
                  variant="outlined"
                  color="secondary"
                >
                  {t('common.newEvent') || 'New Event'}
                </Button>
              </Box>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      📝 Titel
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={editedData.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="Event Titel"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    {editedData.date && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📅 {t('event.date')}
                        </Typography>
                        <DateInput
                          fullWidth
                          size="small"
                          value={editedData.date || ''}
                          onChange={(isoDate) => handleFieldChange('date', isoDate)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {editedData.time && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          🕒 {t('event.time')}
                        </Typography>
                        <TimeInput
                          fullWidth
                          size="small"
                          value={editedData.time || ''}
                          onChange={(time) => handleFieldChange('time', time)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {(editedData.venue || editedData.city) && (
                      <>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            📍 {t('event.venue')}
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={editedData.venue || ''}
                            onChange={(e) => handleFieldChange('venue', e.target.value)}
                            placeholder="Veranstaltungsort"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
                          />
                        </Grid>
                        {editedData.city && (
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              🏙️ Stadt
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              value={editedData.city || ''}
                              onChange={(e) => handleFieldChange('city', e.target.value)}
                              placeholder="Stadt"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': {
                                    borderColor: 'primary.main',
                                  },
                                },
                              }}
                            />
                          </Grid>
                        )}
                      </>
                    )}

                    {editedData.genre && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          🎵 {t('event.genre')}
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={editedData.genre || ''}
                          onChange={(e) => handleFieldChange('genre', e.target.value)}
                          placeholder="Genre"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {editedData.price && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          💰 Preis
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={editedData.price || ''}
                          onChange={(e) => handleFieldChange('price', e.target.value)}
                          placeholder="Preis"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {editedData.organizer && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          👤 Organizer
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={editedData.organizer || ''}
                          onChange={(e) => handleFieldChange('organizer', e.target.value)}
                          placeholder="Organizer"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {editedData.website && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          🌐 Website
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={editedData.website || ''}
                          onChange={(e) => handleFieldChange('website', e.target.value)}
                          placeholder="https://..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {editedData.lineup && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          🎤 {t('event.lineup')}
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={Array.isArray(editedData.lineup) ? editedData.lineup.join(', ') : (editedData.lineup || '')}
                          onChange={(e) => handleLineupChange(e.target.value)}
                          placeholder={t('parser.lineupPlaceholder')}
                          helperText={t('parser.commaSeparated')}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                    )}

                    {editedData.description && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📝 {t('event.description')}
                        </Typography>
                        <Box ref={descriptionRef}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            value={editedData.description || ''}
                            onChange={(e) => {
                              handleFieldChange('description', e.target.value)
                              // Trigger auto-resize
                              setTimeout(() => {
                                const textarea = e.target
                                if (textarea) {
                                  textarea.style.height = 'auto'
                                  textarea.style.height = `${textarea.scrollHeight}px`
                                }
                              }, 0)
                            }}
                            placeholder="Beschreibung"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                              '& .MuiInputBase-input': {
                                overflow: 'hidden !important',
                                resize: 'none',
                              },
                            }}
                            inputProps={{
                              style: {
                                overflow: 'hidden',
                                resize: 'none',
                              }
                            }}
                          />
                        </Box>
                        {/* Save Button below description */}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleManualSave}
                            disabled={savingParsedData}
                            size="medium"
                          >
                            {savingParsedData ? t('parser.saving') : t('parser.save')}
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      💡 {t('template.placeholders')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                      {getAvailablePlaceholders().length > 0
                        ? getAvailablePlaceholders().map(placeholder => `[${placeholder}]`).join(' ')
                        : 'No data available for templating'
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Extended Data Schema Groups */}
              {renderExtendedDataGroups()}

              {/* Hashtags Section - After Extended Data Groups */}
              <Box sx={{ mt: 3 }}>
                <Accordion 
                  expanded={hashtagPanelExpanded} 
                  onChange={() => setHashtagPanelExpanded(!hashtagPanelExpanded)}
                  defaultExpanded={hashtagPanelExpanded || hashtags.length > 0}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        🏷️ {t('hashtags.title')}
                      </Typography>
                      {hashtags.length > 0 && (
                        <Chip
                          label="Konfiguriert"
                          size="small"
                          color="primary"
                          sx={{ ml: 'auto' }}
                        />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {t('parser.parsedHashtagsFromFile')}:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {hashtags.length > 0 ? (
                              hashtags.map((hashtag) => (
                                <Chip
                                  key={hashtag}
                                  label={hashtag}
                                  size="small"
                                  onDelete={() => {
                                    const newHashtags = hashtags.filter(h => h !== hashtag)
                                    setHashtags(newHashtags)
                                    updateHashtagsInStore(newHashtags)
                                  }}
                                  color="primary"
                                  variant="filled"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {t('parser.noHashtagsFound')}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            placeholder={t('parser.additionalHashtags')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target.value.trim()
                                if (input) {
                                  const newTags = input
                                    .split(',')
                                    .map(tag => tag.trim())
                                    .filter(tag => tag.length > 0)
                                    .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
                                  const newHashtags = [...new Set([...hashtags, ...newTags])]
                                  setHashtags(newHashtags)
                                  updateHashtagsInStore(newHashtags)
                                  e.target.value = ''
                                }
                              }
                            }}
                            sx={{ width: 250 }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => setHashtagDialogOpen(true)}
                          >
                            {t('parser.manageHashtags')}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Box>
          )}

          {/* Text Files List */}
          {textFiles.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📄 {t('preview.sourceFiles')} ({textFiles.length})
              </Typography>
              <Grid container spacing={1}>
                {textFiles.map((fileData) => (
                  <Grid item xs={12} sm={6} md={4} key={fileData.id}>
                    <Card
                      variant="outlined"
                      sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => handleTextFileClick(fileData)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DescriptionIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" noWrap title={fileData.name}>
                            {fileData.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(fileData.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* File Modal (Image or Text) */}
      <Modal
        open={!!selectedImage || !!selectedTextFile}
        onClose={handleCloseModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={!!selectedImage || !!selectedTextFile}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 1,
              outline: 'none',
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                },
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Image Display */}
            {selectedImage && (
              <Box>
                <img
                  src={getFileUrl(selectedImage.url)}
                  alt={selectedImage.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '85vh',
                    objectFit: 'contain',
                    borderRadius: '4px',
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    mt: 1,
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontSize: '0.9rem',
                  }}
                >
                  {selectedImage.name}
                </Typography>
              </Box>
            )}

            {/* Text File Display */}
            {selectedTextFile && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: 'text.secondary',
                    fontSize: '0.9rem',
                  }}
                >
                  📄 {selectedTextFile.name}
                </Typography>
                <Box
                  sx={{
                    maxHeight: '75vh',
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {loadingText ? (
                    <Typography color="text.secondary">Loading...</Typography>
                  ) : (
                    <Typography component="pre" sx={{ m: 0 }}>
                      {textContent}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Hashtag Builder Dialog */}
      <Dialog
        open={hashtagDialogOpen}
        onClose={() => setHashtagDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{t('parser.hashtagBuilder')}</DialogTitle>
        <DialogContent>
          <ParserHashtagBuilder
            eventData={editedData}
            onHashtagsChange={(newHashtags) => {
              setHashtags(newHashtags)
              updateHashtagsInStore(newHashtags)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHashtagDialogOpen(false)}>
            {t('common.done')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default Preview
