import React from 'react'
import { Container, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {t('legal.privacy.title')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('legal.lastUpdated')}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('legal.privacy.intro')}
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          {t('legal.privacy.dataWeProcessTitle')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('legal.privacy.dataWeProcessItem1')}
          <br />
          {t('legal.privacy.dataWeProcessItem2')}
          <br />
          {t('legal.privacy.dataWeProcessItem3')}
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          {t('legal.privacy.dataDeletionTitle')}
        </Typography>
        <Typography id="data-deletion" variant="body1" sx={{ mb: 2 }}>
          {t('legal.privacy.dataDeletionBody')}
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          {t('legal.privacy.contactTitle')}
        </Typography>
        <Typography variant="body1">{t('legal.privacy.contactBody')}</Typography>
      </Paper>
    </Container>
  )
}

export default PrivacyPage
