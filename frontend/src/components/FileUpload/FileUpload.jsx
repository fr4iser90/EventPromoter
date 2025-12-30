import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import useStore from '../../store'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md']
}

function FileUpload() {
  const { uploadedFiles, setUploadedFiles, error, setError } = useStore()

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('')

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        const errorMessages = file.errors.map(error => {
          switch (error.code) {
            case 'file-too-large':
              return `File "${file.file.name}" is too large. Maximum size is 10MB.`
            case 'file-invalid-type':
              return `File "${file.file.name}" has an invalid type. Only JPG, PNG, GIF, WebP, TXT, and MD files are allowed.`
            default:
              return `File "${file.file.name}": ${error.message}`
          }
        })
        return errorMessages.join(' ')
      })
      setError(errors.join(' '))
      return
    }

    // Add accepted files
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type,
      size: file.size
    }))

    setUploadedFiles([...uploadedFiles, ...newFiles])
  }, [uploadedFiles, setUploadedFiles, setError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  })

  const removeFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId))
    // Clean up object URLs
    const fileToRemove = uploadedFiles.find(f => f.id === fileId)
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
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
    return type.startsWith('image/') ? <ImageIcon /> : <DescriptionIcon />
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        📁 File Upload
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse files
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Supported: JPG, PNG, GIF, WebP images and TXT, MD text files (max 10MB each)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files ({uploadedFiles.length})
          </Typography>
          <List>
            {uploadedFiles.map((fileData) => (
              <ListItem key={fileData.id} divider>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {getFileIcon(fileData.type)}
                </Box>
                <ListItemText
                  primary={fileData.file.name}
                  secondary={formatFileSize(fileData.size)}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={fileData.type.startsWith('image/') ? 'Image' : 'Text'}
                    size="small"
                    color={fileData.type.startsWith('image/') ? 'primary' : 'secondary'}
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => removeFile(fileData.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  )
}

export default FileUpload
