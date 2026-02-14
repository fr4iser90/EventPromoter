import React from 'react'
import { Container, Paper, Typography } from '@mui/material'

function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Terms of Service
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: TODO
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          EventPromoter is provided for controlled publishing workflows and requires users to comply
          with platform terms, applicable laws, and local regulations.
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Acceptable use
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          - Publish only content you are authorized to distribute
          <br />
          - Do not use this service for spam, abuse, or policy violations
          <br />
          - Respect each platform's API and developer policies
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Availability and liability
        </Typography>
        <Typography variant="body1">
          Service availability is provided on a best-effort basis. The operator may update,
          restrict, or discontinue access at any time.
        </Typography>
      </Paper>
    </Container>
  )
}

export default TermsPage
