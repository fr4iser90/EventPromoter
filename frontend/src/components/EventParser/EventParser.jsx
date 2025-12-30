import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
import { parseFileForEvent, formatEventForDisplay } from '../../utils/pdfParser'
import useStore from '../../store'

function EventParser() {
  const { uploadedFiles } = useStore()
  const [activeTab, setActiveTab] = useState(0)
  const [parsedData, setParsedData] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [editedData, setEditedData] = useState(null)

  // Handle file parsing
  const handleParseFile = async (file) => {
    setIsParsing(true)
    setParseError('')
    setParsedData(null)

    try {
      const result = await parseFileForEvent(file)

      if (result.success) {
        setParsedData(result)
        setEditedData({ ...result.data })
        setActiveTab(1) // Switch to edit tab after successful parsing
      } else {
        setParseError(result.error)
      }
    } catch (error) {
      setParseError('Parsing failed: ' + error.message)
    } finally {
      setIsParsing(false)
    }
  }

  // Handle data editing
  const handleDataChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVenueChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      venue: {
        ...prev.venue,
        [field]: value
      }
    }))
  }

  const handlePerformersChange = (value) => {
    const performers = value.split(',').map(p => p.trim()).filter(p => p)
    setEditedData(prev => ({
      ...prev,
      performers
    }))
  }

  // Reset to parsed data
  const handleResetToParsed = () => {
    if (parsedData) {
      setEditedData({ ...parsedData.data })
    }
  }

  // Auto-parse first PDF/image when files are uploaded
  React.useEffect(() => {
    if (uploadedFiles.length > 0 && !parsedData && !isParsing) {
      const firstFile = uploadedFiles[0]?.file
      if (firstFile && (firstFile.type === 'application/pdf' || firstFile.type.startsWith('image/'))) {
        handleParseFile(firstFile)
      }
    }
  }, [uploadedFiles])

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🎯 Event Data Parser
      </Typography>

      {/* File Selection */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select file to parse:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {uploadedFiles.map((fileData, index) => (
              <Chip
                key={index}
                label={`${fileData.file.name} (${fileData.file.type.split('/')[1].toUpperCase()})`}
                onClick={() => handleParseFile(fileData.file)}
                variant={isParsing ? "outlined" : "filled"}
                color="primary"
                disabled={isParsing}
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Parsing Status */}
      {isParsing && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CircularProgress size={24} />
          <Typography>Parsing document...</Typography>
        </Box>
      )}

      {parseError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {parseError}
        </Alert>
      )}

      {/* Parsed Data Display */}
      {parsedData && (
        <>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="📄 Raw Data" />
            <Tab label="✏️ Edit Event" />
            <Tab label="👁️ Platform Preview" />
          </Tabs>

          {/* Tab 1: Raw Data */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Raw Extracted Data
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Confidence: {parsedData.data.confidence}% | Pages: {parsedData.pages}
                {parsedData.ocrConfidence && ` | OCR: ${parsedData.ocrConfidence}%`}
              </Alert>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace', maxHeight: 400, overflow: 'auto' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                  {parsedData.rawText}
                </pre>
              </Paper>
            </Box>
          )}

          {/* Tab 2: Edit Event Data */}
          {activeTab === 1 && editedData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Edit Event Data
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    value={editedData.title || ''}
                    onChange={(e) => handleDataChange('title', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={editedData.date || ''}
                    onChange={(e) => handleDataChange('date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={editedData.time || ''}
                    onChange={(e) => handleDataChange('time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Venue Name"
                    value={editedData.venue?.name || ''}
                    onChange={(e) => handleVenueChange('name', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={editedData.venue?.address || ''}
                    onChange={(e) => handleVenueChange('address', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ZIP"
                    value={editedData.venue?.zip || ''}
                    onChange={(e) => handleVenueChange('zip', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editedData.venue?.city || ''}
                    onChange={(e) => handleVenueChange('city', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Hall/Room"
                    value={editedData.venue?.hall || ''}
                    onChange={(e) => handleVenueChange('hall', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Performers (comma-separated)"
                    value={editedData.performers?.join(', ') || ''}
                    onChange={(e) => handlePerformersChange(e.target.value)}
                    helperText="z.B. DJ H@jo, A.L.E.X."
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={editedData.website || ''}
                    onChange={(e) => handleDataChange('website', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={editedData.description || ''}
                    onChange={(e) => handleDataChange('description', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" startIcon={<SaveIcon />}>
                  Save Event
                </Button>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleResetToParsed}>
                  Reset to Parsed
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 3: Platform Preview */}
          {activeTab === 2 && editedData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Platform Preview
              </Typography>

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>🐦 Twitter/X Preview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {editedData.title} - {editedData.date} {editedData.time}
                        {editedData.venue?.name && ` @ ${editedData.venue.name}`}
                        {editedData.website && ` ${editedData.website}`}
                        #event #party
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Characters: {(
                          editedData.title.length +
                          editedData.date.length +
                          editedData.time.length +
                          (editedData.venue?.name?.length || 0) +
                          (editedData.website?.length || 0) +
                          20 // spaces and hashtags
                        )}/280
                      </Typography>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>📸 Instagram Preview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <Typography variant="body2">
                        {editedData.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 {editedData.date} {editedData.time}
                        📍 {editedData.venue?.name} {editedData.venue?.address}
                        🎧 {editedData.performers?.join(', ')}
                        🌐 {editedData.website}
                        #event #party #techno
                      </Typography>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>📧 Email Preview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{editedData.title}</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Liebe Freunde der elektronischen Musik,
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {editedData.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        📅 Datum: {editedData.date} um {editedData.time} Uhr
                        📍 Ort: {editedData.venue?.name}, {editedData.venue?.address}, {editedData.venue?.city}
                        🎧 Line-up: {editedData.performers?.join(', ')}
                        🌐 Tickets: {editedData.website}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Wir freuen uns auf euch!
                      </Typography>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </>
      )}

      {/* No data state */}
      {!parsedData && !isParsing && uploadedFiles.length === 0 && (
        <Alert severity="info">
          Upload a PDF or image file to parse event data automatically.
        </Alert>
      )}
    </Paper>
  )
}

export default EventParser
