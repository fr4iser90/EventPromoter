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
  Alert
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import useStore from '../../store'
import DateDisplay from '../DateDisplay'
import axios from 'axios'


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
    lastParsedDataSave
  } = useStore()
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedTextFile, setSelectedTextFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [loadingText, setLoadingText] = useState(false)
  const [editedData, setEditedData] = useState(storeParsedData || {})
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
        const response = await fetch(`http://localhost:4000/api/files/content/${currentEvent?.id}/${fileData.filename}`)
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
      const fileUrl = `http://localhost:4000/api/files/${currentEvent?.id}/${fileData.filename}`
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

    return placeholders
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
              Speichere...
            </Alert>
          )}
          {!savingParsedData && lastParsedDataSave && !parsedDataSaveError && (
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon />}
              sx={{ py: 0.5 }}
            >
              Gespeichert {new Date(lastParsedDataSave).toLocaleTimeString()}
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
                        image={`http://localhost:4000${fileData.url}`}
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

          {/* Parsed Event Data Preview - Always Editable */}
          {editedData && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                🎯 {t('preview.parsedData')}
              </Typography>
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
                        <TextField
                          fullWidth
                          size="small"
                          value={editedData.date || ''}
                          onChange={(e) => handleFieldChange('date', e.target.value)}
                          placeholder="DD.MM.YYYY"
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
                        <TextField
                          fullWidth
                          size="small"
                          value={editedData.time || ''}
                          onChange={(e) => handleFieldChange('time', e.target.value)}
                          placeholder="HH:MM"
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
                          placeholder="Künstler 1, Künstler 2, ..."
                          helperText="Komma-getrennt eingeben"
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
                            {savingParsedData ? 'Speichere...' : 'Speichern'}
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
                  src={`http://localhost:4000${selectedImage.url}`}
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
    </Paper>
  )
}

export default Preview
