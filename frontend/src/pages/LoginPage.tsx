import React, { FormEvent, useState } from 'react'
import { Alert, Box, Button, Container, Link, Paper, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getApiUrl } from '../shared/utils/api'

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(getApiUrl('auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || 'Login failed')
      }

      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          EventPromoter Login
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          This instance uses app-level credentials for access. Enter your username and password to
          continue.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, maxWidth: 420 }}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            autoComplete="username"
            required
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            autoComplete="current-password"
            required
          />

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Public legal pages
          </Typography>
          <Typography variant="body2">
            Privacy: <Link href="/privacy">/privacy</Link>
          </Typography>
          <Typography variant="body2">
            Terms: <Link href="/terms">/terms</Link>
          </Typography>
          <Typography variant="body2">
            Contact: <Link href="/contact">/contact</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default LoginPage
