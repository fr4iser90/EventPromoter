import React from 'react'
import { Container, Paper, Typography, Link } from '@mui/material'

function ContactPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Contact
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          For support, reviewer access, and privacy/data deletion requests, contact the instance
          operator:
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          Email: TODO
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Website: <Link href="https://eventpromoter.fr4iser.com">eventpromoter.fr4iser.com</Link>
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Reviewer access requests
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Include "Review Access Request" in your subject and mention the platform under review.
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Data deletion requests
        </Typography>
        <Typography variant="body1">
          Include account identifier and platform connection details to process deletion quickly.
        </Typography>
      </Paper>
    </Container>
  )
}

export default ContactPage
