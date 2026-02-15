import React from 'react'
import { Container, Paper, Typography, Link } from '@mui/material'
import { useTranslation } from 'react-i18next'

function ContactPage() {
  const { t } = useTranslation()

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {t('legal.contact.title')}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('legal.contact.supportIntro')}
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          {t('legal.contact.email')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {t('legal.contact.websiteLabel')}{' '}
          <Link href="https://eventpromoter.fr4iser.com">eventpromoter.fr4iser.com</Link>
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          {t('legal.contact.reviewerAccessTitle')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('legal.contact.reviewerAccessBody')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          {t('legal.contact.deletionTitle')}
        </Typography>
        <Typography variant="body1">
          {t('legal.contact.deletionBody')}
        </Typography>
      </Paper>
    </Container>
  )
}

export default ContactPage
