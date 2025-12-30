import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider
} from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import useStore from '../../store'

function Preview() {
  const { uploadedFiles } = useStore()
  const imageFiles = uploadedFiles.filter(file => file.type.startsWith('image/'))
  const textFiles = uploadedFiles.filter(file => !file.type.startsWith('image/'))

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        👁️ Preview
      </Typography>

      {uploadedFiles.length === 0 ? (
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
                        image={fileData.preview}
                        alt={fileData.file.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2" noWrap>
                          {fileData.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fileData.file.name.split('.').pop().toUpperCase()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Text Preview */}
          {textFiles.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📄 Text Files ({textFiles.length})
              </Typography>
              <Grid container spacing={2}>
                {textFiles.map((fileData) => (
                  <Grid item xs={12} md={6} key={fileData.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1">
                            {fileData.file.name}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <Box
                          sx={{
                            maxHeight: 200,
                            overflow: 'auto',
                            bgcolor: 'grey.50',
                            p: 1,
                            borderRadius: 1,
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {fileData.file.name}
                            <br />
                            Size: {(fileData.size / 1024).toFixed(1)} KB
                            <br />
                            Type: {fileData.type}
                            <br />
                            <br />
                            <em>Content preview will be available after file processing</em>
                          </Typography>
                        </Box>
                      </CardContent>
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
