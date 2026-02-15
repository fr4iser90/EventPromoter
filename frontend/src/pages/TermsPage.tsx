import React from 'react'
import { Container, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

function TermsPage() {
  const { t } = useTranslation()

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {t('legal.terms.title')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('legal.lastUpdated')}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('legal.terms.intro')}
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          {t('legal.terms.acceptableUseTitle')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('legal.terms.acceptableUseItem1')}
          <br />
          {t('legal.terms.acceptableUseItem2')}
          <br />
          {t('legal.terms.acceptableUseItem3')}
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          {t('legal.terms.availabilityTitle')}
        </Typography>
        <Typography variant="body1">
          {t('legal.terms.availabilityBody')}
        </Typography>
      </Paper>
    </Container>
  )
}

export default TermsPage
