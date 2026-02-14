import React from 'react'
import { Container, Paper, Typography } from '@mui/material'

function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Privacy Policy
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: TODO
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          EventPromoter processes only data required to create and publish user-approved event
          content to connected platforms.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Data we process
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          - Account linkage metadata for connected platform integrations
          <br />
          - Event content created by the user
          <br />
          - Operational logs (publish status, errors, timestamps)
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Data deletion
        </Typography>
        <Typography id="data-deletion" variant="body1" sx={{ mb: 2 }}>
          You can request deletion of account-linked data via the contact page. Requests are handled
          within TODO days after identity verification.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Contact
        </Typography>
        <Typography variant="body1">Please use /contact for privacy and deletion requests.</Typography>
      </Paper>
    </Container>
  )
}

export default PrivacyPage
