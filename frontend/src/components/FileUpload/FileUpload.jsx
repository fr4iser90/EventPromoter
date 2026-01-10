import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Alert,
  Button,
  Collapse
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FolderIcon from '@mui/icons-material/Folder'
import DeleteIcon from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'
import DescriptionIcon from '@mui/icons-material/Description'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import useStore, { WORKFLOW_STATES } from '../../store'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md']
}

function FileUpload() {
  const { t } = useTranslation()
  const { uploadedFileRefs, uploadFiles, removeUploadedFile, error, setError, isProcessing, workflowState, fileUploadExpanded, setFileUploadExpanded } = useStore()
  const folderInputRef = useRef(null)

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError('')

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        const errorMessages = file.errors.map(error => {
          switch (error.code) {
            case 'file-too-large':
              return `File "${file.file.name}" is too large. Maximum size is 10MB.`
            case 'file-invalid-type':
              return `File "${file.file.name}" has an invalid type. Only JPG, PNG, GIF, WebP, PDF, TXT, and MD files are allowed.`
            default:
              return `File "${file.file.name}": ${error.message}`
          }
        })
        return errorMessages.join(' ')
      })
      setError(errors.join(' '))
      return
    }

    try {
      // Upload files to server
      await uploadFiles(acceptedFiles)
      setError(null)

          // Parsing happens automatically in upload now

    } catch (error) {
      setError('Failed to upload files')
    }
  }, [uploadFiles, setError])

  // Auto-expand when in initial state
  useEffect(() => {
    if (workflowState === WORKFLOW_STATES.INITIAL) {
      setFileUploadExpanded(true)
    }
  }, [workflowState])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  })

  const removeFile = async (fileId) => {
    try {
      await removeUploadedFile(fileId)
    } catch (error) {
      setError('Failed to remove file')
    }
  }

  // Handle folder selection
  const handleFolderSelect = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file =>
      file.type in ACCEPTED_TYPES ||
      ACCEPTED_TYPES[file.type]?.some(ext => file.name.toLowerCase().endsWith(ext))
    )

    if (validFiles.length === 0) {
      setError('No supported files found in the selected folder. Supported: JPG, PNG, GIF, WebP, PDF, TXT, MD')
      return
    }

    const oversizedFiles = validFiles.filter(file => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      setError(`Some files are too large. Maximum size is 10MB. Skipped: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    const newFiles = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type,
      size: file.size
    }))

    setUploadedFiles([...uploadedFiles, ...newFiles])
    setError('')

    // Reset input
    if (folderInputRef.current) {
      folderInputRef.current.value = ''
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
    if (type === 'application/pdf') return <PictureAsPdfIcon />
    if (type.startsWith('image/')) return <ImageIcon />
    return <DescriptionIcon />
  }

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          mb: fileUploadExpanded ? 2 : 0
        }}
        onClick={() => setFileUploadExpanded(!fileUploadExpanded)}
      >
        <Typography variant="h6">
          📁 File Upload
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!fileUploadExpanded && uploadedFileRefs.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {uploadedFileRefs.length} file{uploadedFileRefs.length !== 1 ? 's' : ''} uploaded
            </Typography>
          )}
          <IconButton size="small">
            {fileUploadExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={fileUploadExpanded}>
        <Box sx={{ pt: fileUploadExpanded ? 1 : 0 }}>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
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
          {isDragActive ? t('common.dropActive') : t('common.dropInactive')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse files
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Supported: JPG, PNG, GIF, WebP images, PDF documents, TXT, MD text files (max 10MB each)
        </Typography>

        {/* Folder selection button */}
        <Box sx={{ mt: 2 }}>
          <input
            ref={folderInputRef}
            type="file"
            multiple
            webkitdirectory=""
            directory=""
            style={{ display: 'none' }}
            onChange={handleFolderSelect}
          />
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={() => folderInputRef.current?.click()}
            size="small"
          >
            Select Folder
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {uploadedFileRefs.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files ({uploadedFileRefs.length})
          </Typography>
          <List>
            {uploadedFileRefs.map((fileData) => (
              <ListItem key={fileData.id} divider>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {getFileIcon(fileData.type)}
                </Box>
                <ListItemText
                  primary={fileData.name}
                  secondary={formatFileSize(fileData.size)}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={
                      fileData.type === 'application/pdf' ? 'PDF' :
                      fileData.type.startsWith('image/') ? t('status.fileType.image') : t('status.fileType.text')
                    }
                    size="small"
                    color={
                      fileData.type === 'application/pdf' ? 'error' :
                      fileData.type.startsWith('image/') ? 'primary' : 'secondary'
                    }
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
      </Box>
      </Collapse>
    </Paper>
  )
}

export default FileUpload
