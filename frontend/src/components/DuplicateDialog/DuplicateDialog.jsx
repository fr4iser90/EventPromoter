import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip
} from '@mui/material'
import useStore from '../../store'

const DuplicateDialog = () => {
  const { duplicateFound, resolveDuplicate } = useStore()

  if (!duplicateFound) return null

  const handleUseExisting = () => {
    resolveDuplicate(true)
  }

  const handleUseNew = () => {
    resolveDuplicate(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unbekannt'
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  return (
    <Dialog open={!!duplicateFound} maxWidth="md" fullWidth>
      <DialogTitle>
        Ähnliches Event gefunden! 🎯
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Wir haben ein ähnliches Event in der Datenbank gefunden. Möchtest du die vorhandenen Daten wiederverwenden oder die neuen geparsten Daten verwenden?
        </Typography>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" color="primary">
            Vorhandenes Event:
          </Typography>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography><strong>Titel:</strong> {duplicateFound.existingEvent?.title || 'Unbekannt'}</Typography>
            <Typography><strong>Datum:</strong> {formatDate(duplicateFound.existingEvent?.date)}</Typography>
            <Typography><strong>Venue:</strong> {duplicateFound.existingEvent?.venue || 'Unbekannt'}</Typography>
            <Typography><strong>Stadt:</strong> {duplicateFound.existingEvent?.city || 'Unbekannt'}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" color="secondary">
            Neu geparstes Event:
          </Typography>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography><strong>Titel:</strong> {duplicateFound.newParsedData?.title || 'Unbekannt'}</Typography>
            <Typography><strong>Datum:</strong> {formatDate(duplicateFound.newParsedData?.date)}</Typography>
            <Typography><strong>Venue:</strong> {duplicateFound.newParsedData?.venue || 'Unbekannt'}</Typography>
            <Typography><strong>Stadt:</strong> {duplicateFound.newParsedData?.city || 'Unbekannt'}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Ähnlichkeit: ${(duplicateFound.similarity * 100).toFixed(0)}%`}
            color={duplicateFound.similarity > 0.8 ? 'error' : duplicateFound.similarity > 0.5 ? 'warning' : 'info'}
            size="small"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleUseExisting} variant="outlined" color="primary">
          Vorhandene Daten verwenden
        </Button>
        <Button onClick={handleUseNew} variant="contained" color="secondary">
          Neue Daten verwenden
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DuplicateDialog
