import { Box, Typography } from '@mui/material'
import PageShell from '../shared/components/layout/PageShell'

// TODO: Platform Data Management - email recipients / subreddits etc
// Data comes from backend as always
export default function PlatformSettingsPage() {
  return (
    <PageShell title="Platform Data Management" headerProps={{ showSettings: false, showPublishingMode: false }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Platform Data Management
        </Typography>
        <Typography color="text.secondary">
          TODO: Implement platform data management (email recipients, subreddits, etc.)
        </Typography>
      </Box>
    </PageShell>
  )
}
