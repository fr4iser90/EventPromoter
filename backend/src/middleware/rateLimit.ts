import { NextFunction, Request, Response } from 'express'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim()
  }
  return req.ip || 'unknown'
}

export function createRateLimit(options: { windowMs: number; maxRequests: number; keyPrefix: string }) {
  const { windowMs, maxRequests, keyPrefix } = options

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now()
    const key = `${keyPrefix}:${getClientIp(req)}`
    const current = buckets.get(key)

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
      res.setHeader('Retry-After', String(retryAfterSeconds))
      res.status(429).json({
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.'
      })
      return
    }

    current.count += 1
    next()
  }
}

export const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'auth:login'
})
