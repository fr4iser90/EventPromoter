import { useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import type { FileRejection } from 'react-dropzone'
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
import HelperIcon from '../../../shared/components/ui/HelperIcon'
import useStore, { WORKFLOW_STATES } from '../../../store'

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
  const { uploadedFileRefs, uploadFiles, removeUploadedFile, error, setError, workflowState, fileUploadExpanded, setFileUploadExpanded } = useStore() as unknown as {
    uploadedFileRefs: Array<{ id: string; name: string; filename?: string; type?: string; size?: number }>
    uploadFiles: (files: File[]) => Promise<unknown>
    removeUploadedFile: (fileId: string) => Promise<unknown>
    error: string | null
    setError: (error: string | null) => void
    workflowState: string
    fileUploadExpanded: boolean
    setFileUploadExpanded: (expanded: boolean) => void
  }
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map((file) => {
        const errorMessages = file.errors.map((error) => {
          switch (error.code) {
            case 'file-too-large':
              return t('upload.errors.fileTooLarge', { name: file.file.name })
            case 'file-invalid-type':
              return t('upload.errors.fileInvalidType', { name: file.file.name })
            default:
              return t('upload.errors.fileGeneric', { name: file.file.name, message: error.message })
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

    } catch {
      setError(t('upload.errors.failedUpload'))
    }
  }, [uploadFiles, setError, t])

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

  const removeFile = async (fileId: string) => {
    try {
      await removeUploadedFile(fileId)
    } catch (error) {
      setError(t('upload.errors.failedRemove'))
    }
  }

  // Handle folder selection
  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter((file) =>
      file.type in ACCEPTED_TYPES ||
      ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES]?.some((ext: string) => file.name.toLowerCase().endsWith(ext))
    )

    if (validFiles.length === 0) {
      setError(t('upload.errors.noSupportedInFolder'))
      return
    }

    const oversizedFiles = validFiles.filter((file) => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      setError(t('upload.errors.oversizedSkipped', { files: oversizedFiles.map((f) => f.name).join(', ') }))
      return
    }

    try {
      await uploadFiles(validFiles)
      setError(null)
    } catch {
      setError(t('upload.errors.failedUpload'))
    }

    // Reset input
    if (folderInputRef.current) {
      folderInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            {t('workflow.uploadFiles')}
          </Typography>
          <HelperIcon 
            helperId="upload"
            context="upload"
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!fileUploadExpanded && uploadedFileRefs.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {uploadedFileRefs.length === 1
                ? t('upload.filesUploadedOne', { count: uploadedFileRefs.length })
                : t('upload.filesUploadedMany', { count: uploadedFileRefs.length })}
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
          {t('upload.browsePrompt')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
          <Typography variant="caption">
            {t('upload.supportedSummary')}
          </Typography>
          <HelperIcon 
            helperId="upload.formats"
            context="upload.formats"
            size="small"
          />
        </Box>

        {/* Folder selection button */}
        <Box sx={{ mt: 2 }}>
          <input
            ref={folderInputRef}
            type="file"
            multiple
            {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
            style={{ display: 'none' }}
            onChange={handleFolderSelect}
          />
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={() => folderInputRef.current?.click()}
            size="small"
          >
            {t('upload.selectFolder')}
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
            {t('upload.uploadedFiles', { count: uploadedFileRefs.length })}
          </Typography>
          <List>
            {uploadedFileRefs.map((fileData) => (
              <ListItem key={fileData.id} divider>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {getFileIcon(fileData.type || 'text/plain')}
                </Box>
                <ListItemText
                  primary={fileData.name}
                  secondary={formatFileSize(fileData.size || 0)}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={
                      fileData.type === 'application/pdf' ? 'PDF' :
                      (fileData.type || '').startsWith('image/') ? t('status.fileType.image') : t('status.fileType.text')
                    }
                    size="small"
                    color={
                      fileData.type === 'application/pdf' ? 'error' :
                      (fileData.type || '').startsWith('image/') ? 'primary' : 'secondary'
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
