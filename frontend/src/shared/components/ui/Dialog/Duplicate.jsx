import React from 'react'
import { useTranslation } from 'react-i18next'
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
import useStore from '../../../../store'
import { formatDateForDisplay } from '../../../utils/dateUtils'

const DuplicateDialog = () => {
  const { t, i18n } = useTranslation()
  const { duplicateFound, resolveDuplicate } = useStore()

  if (!duplicateFound) return null

  const handleUseExisting = () => {
    resolveDuplicate(true)
  }

  const handleUseNew = () => {
    resolveDuplicate(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('common.unknown')
    return formatDateForDisplay(dateString, i18n.language)
  }

  return (
    <Dialog open={!!duplicateFound} maxWidth="md" fullWidth>
      <DialogTitle>
        {t('duplicate.title')} 🎯
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {t('duplicate.description')}
        </Typography>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" color="primary">
            {t('duplicate.existingEvent')}:
          </Typography>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography><strong>{t('event.title')}:</strong> {duplicateFound.existingEvent?.title || t('common.unknown')}</Typography>
            <Typography><strong>{t('event.date')}:</strong> {formatDate(duplicateFound.existingEvent?.date)}</Typography>
            <Typography><strong>{t('event.venue')}:</strong> {duplicateFound.existingEvent?.venue || t('common.unknown')}</Typography>
            <Typography><strong>{t('event.city')}:</strong> {duplicateFound.existingEvent?.city || t('common.unknown')}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" color="secondary">
            {t('duplicate.newParsedEvent')}:
          </Typography>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography><strong>{t('event.title')}:</strong> {duplicateFound.newParsedData?.title || t('common.unknown')}</Typography>
            <Typography><strong>{t('event.date')}:</strong> {formatDate(duplicateFound.newParsedData?.date)}</Typography>
            <Typography><strong>{t('event.venue')}:</strong> {duplicateFound.newParsedData?.venue || t('common.unknown')}</Typography>
            <Typography><strong>{t('event.city')}:</strong> {duplicateFound.newParsedData?.city || t('common.unknown')}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Chip
            label={`${t('duplicate.similarity')}: ${(duplicateFound.similarity * 100).toFixed(0)}%`}
            color={duplicateFound.similarity > 0.8 ? 'error' : duplicateFound.similarity > 0.5 ? 'warning' : 'info'}
            size="small"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleUseExisting} variant="outlined" color="primary">
          {t('duplicate.useExisting')}
        </Button>
        <Button onClick={handleUseNew} variant="contained" color="secondary">
          {t('duplicate.useNew')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DuplicateDialog
