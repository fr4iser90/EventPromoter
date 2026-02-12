import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import PageShell from '../shared/components/layout/PageShell'

// TODO: Platform Data Management - email recipients / subreddits etc
// Data comes from backend as always
export default function PlatformSettingsPage() {
  const { t } = useTranslation()
  return (
    <PageShell title={t('platformSettings.title')} headerProps={{ showSettings: false, showPublishingMode: false }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('platformSettings.title')}
        </Typography>
        <Typography color="text.secondary">
          {t('platformSettings.todoDescription')}
        </Typography>
      </Box>
    </PageShell>
  )
}
