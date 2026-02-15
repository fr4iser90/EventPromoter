import React, { FormEvent, useState } from 'react'
import { Alert, Box, Button, Container, Link, Paper, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getApiUrl } from '../shared/utils/api'

function LoginPage() {
  const { t } = useTranslation()
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
        throw new Error(body.message || t('legal.login.error'))
      }

      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.message || t('legal.login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {t('legal.login.title')}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {t('legal.login.description')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3, maxWidth: 420 }}>
          <TextField
            fullWidth
            label={t('legal.login.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            autoComplete="username"
            required
          />
          <TextField
            fullWidth
            type="password"
            label={t('legal.login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            autoComplete="current-password"
            required
          />

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
            {loading ? t('legal.login.signingIn') : t('legal.login.signIn')}
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t('legal.login.publicPages')}
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
