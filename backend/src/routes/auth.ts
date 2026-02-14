import { Router } from 'express'
import { AuthService } from '../services/authService.js'

const router = Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body || {}

  if (!AuthService.isConfigured()) {
    res.status(503).json({
      success: false,
      error: 'AUTH_NOT_CONFIGURED',
      message: 'Set APP_LOGIN_<ROLE>_USER and APP_LOGIN_<ROLE>_PASSWORD (or APP_LOGIN_USER/APP_LOGIN_PASSWORD) in backend environment'
    })
    return
  }

  const loginResult = AuthService.validateLogin(String(username || ''), String(password || ''))
  if (!loginResult.valid) {
    res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid credentials' })
    return
  }

  const token = AuthService.createSessionToken(String(username), loginResult.allowedPlatforms)
  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie(AuthService.getSessionCookieName(), token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: AuthService.getSessionTtlMs()
  })

  res.json({ success: true, user: username, allowedPlatforms: loginResult.allowedPlatforms })
})

router.get('/me', (req, res) => {
  const authUser = (req as any).authUser
  if (!authUser) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED' })
    return
  }
  const allowedPlatforms = (req as any).authAllowedPlatforms || ['*']
  res.json({ success: true, user: authUser, allowedPlatforms })
})

router.post('/logout', (_req, res) => {
  res.clearCookie(AuthService.getSessionCookieName(), { path: '/' })
  res.json({ success: true })
})

export default router
