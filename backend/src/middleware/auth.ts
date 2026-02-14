import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/authService.js'

const OPEN_API_ROUTES: Array<{ method?: string; path: string }> = [
  { path: '/health' },
  { path: '/auth/login', method: 'POST' },
  { path: '/publish/event', method: 'POST' }
]

function getCookieValue(req: Request, cookieName: string): string | null {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map((c) => c.trim())
  const target = cookies.find((c) => c.startsWith(`${cookieName}=`))
  if (!target) return null
  return decodeURIComponent(target.substring(cookieName.length + 1))
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice('Bearer '.length)
}

function isOpenRoute(req: Request): boolean {
  return OPEN_API_ROUTES.some((route) => {
    const methodMatches = !route.method || route.method === req.method
    return methodMatches && req.path === route.path
  })
}

export function authRequiredMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (isOpenRoute(req)) {
    next()
    return
  }

  if (!AuthService.isConfigured()) {
    res.status(503).json({
      success: false,
      error: 'AUTH_NOT_CONFIGURED',
      message: 'Set APP_LOGIN_<ROLE>_USER and APP_LOGIN_<ROLE>_PASSWORD (or APP_LOGIN_USER/APP_LOGIN_PASSWORD) in backend environment'
    })
    return
  }

  const tokenFromCookie = getCookieValue(req, AuthService.getSessionCookieName())
  const tokenFromBearer = getBearerToken(req)
  const token = tokenFromCookie || tokenFromBearer

  if (!token) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Authentication required' })
    return
  }

  const session = AuthService.verifySessionToken(token)
  if (!session) {
    res.status(401).json({ success: false, error: 'INVALID_SESSION', message: 'Invalid or expired session' })
    return
  }

  ;(req as any).authUser = session.user
  ;(req as any).authAllowedPlatforms = session.allowedPlatforms
  next()
}
