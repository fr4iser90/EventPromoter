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
  CircularProgress
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import useStore from '../../store'
import axios from 'axios'

function Preview() {
  const { uploadedFileRefs, parsedData } = useStore()

  const imageFiles = uploadedFileRefs.filter(file => file.type.startsWith('image/'))
  const textFiles = uploadedFileRefs.filter(file => !file.type.startsWith('image/'))

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
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={fileData.url}
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
                    <Card variant="outlined" sx={{ p: 1 }}>
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
    </Paper>
  )
}

export default Preview
