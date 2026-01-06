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
  Backdrop
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import CloseIcon from '@mui/icons-material/Close'
import useStore from '../../store'
import axios from 'axios'

function Preview() {
  const { uploadedFileRefs, parsedData, currentEvent } = useStore()
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedTextFile, setSelectedTextFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [loadingText, setLoadingText] = useState(false)

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
          const content = await response.text()
          setTextContent(content)
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

  // Generate dynamic template placeholders based on available data
  const getAvailablePlaceholders = () => {
    const placeholders = []

    if (parsedData.title) placeholders.push('titel')
    if (parsedData.date) placeholders.push('datum')
    if (parsedData.time) placeholders.push('zeit')
    if (parsedData.venue) placeholders.push('venue')
    if (parsedData.city) placeholders.push('stadt')
    if (parsedData.genre) placeholders.push('genre')
    if (parsedData.price) placeholders.push('preis')
    if (parsedData.organizer) placeholders.push('organizer')
    if (parsedData.website) placeholders.push('website')
    if (parsedData.lineup && parsedData.lineup.length > 0) placeholders.push('lineup')
    if (parsedData.description) placeholders.push('beschreibung')

    return placeholders
  }


  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        👁️ Preview
      </Typography>

      {uploadedFileRefs.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No files uploaded yet. Upload some files to see the preview.
        </Typography>
      ) : (
        <Box>
          {/* Image Preview */}
          {imageFiles.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📸 Images ({imageFiles.length})
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

          {/* Parsed Event Data Preview */}
          {parsedData && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                🎯 Parsed Event Data
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {parsedData.title || 'Event Title'}
                  </Typography>

                  <Grid container spacing={2}>
                    {parsedData.date && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          📅 Date
                        </Typography>
                        <Typography variant="body1">
                          {parsedData.date}
                        </Typography>
                      </Grid>
                    )}

                    {parsedData.time && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          🕒 Time
                        </Typography>
                        <Typography variant="body1">
                          {parsedData.time}
                        </Typography>
                      </Grid>
                    )}

                    {(parsedData.venue || parsedData.city) && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          📍 Venue
                        </Typography>
                        <Typography variant="body1">
                          {parsedData.venue || 'TBA'}
                          {parsedData.city && `, ${parsedData.city}`}
                        </Typography>
                      </Grid>
                    )}

                    {parsedData.genre && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          🎵 Genre
                        </Typography>
                        <Typography variant="body1">
                          {parsedData.genre}
                        </Typography>
                      </Grid>
                    )}

                    {parsedData.price && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          💰 Price
                        </Typography>
                        <Typography variant="body1">
                          {parsedData.price}
                        </Typography>
                      </Grid>
                    )}

                    {parsedData.organizer && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          👤 Organizer
                        </Typography>
                        <Typography variant="body1">
                          {parsedData.organizer}
                        </Typography>
                      </Grid>
                    )}

                    {parsedData.website && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          🌐 Website
                        </Typography>
                        <Typography variant="body1">
                          {parsedData.website}
                        </Typography>
                      </Grid>
                    )}

                    {parsedData.lineup && parsedData.lineup.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          🎤 Lineup
                        </Typography>
                        <Typography variant="body1">
                          {Array.isArray(parsedData.lineup) ? parsedData.lineup.join(', ') : parsedData.lineup}
                        </Typography>
                      </Grid>
                    )}

                    {parsedData.description && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          📝 Description
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {parsedData.description}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      💡 Template Placeholders Available:
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
                📄 Source Files ({textFiles.length})
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
                    bgcolor: 'grey.50',
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
