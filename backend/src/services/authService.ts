import crypto from 'crypto'

type SessionPayload = {
  user: string
  allowedPlatforms: string[]
  exp: number
}

type LoginResult = {
  valid: boolean
  allowedPlatforms: string[]
}

type AccountDef = {
  userEnv: string
  passEnv: string
  platformsEnv?: string
}

const SESSION_COOKIE_NAME = 'ep_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12 // 12h

const ACCOUNT_DEFS: AccountDef[] = [
  {
    userEnv: 'APP_LOGIN_REVIEW_REDDIT_USER',
    passEnv: 'APP_LOGIN_REVIEW_REDDIT_PASSWORD',
    platformsEnv: 'APP_LOGIN_REVIEW_REDDIT_PLATFORMS'
  },
  {
    userEnv: 'APP_LOGIN_REVIEW_META_USER',
    passEnv: 'APP_LOGIN_REVIEW_META_PASSWORD',
    platformsEnv: 'APP_LOGIN_REVIEW_META_PLATFORMS'
  },
  {
    userEnv: 'APP_LOGIN_REVIEW_LINKEDIN_USER',
    passEnv: 'APP_LOGIN_REVIEW_LINKEDIN_PASSWORD',
    platformsEnv: 'APP_LOGIN_REVIEW_LINKEDIN_PLATFORMS'
  },
  {
    userEnv: 'APP_LOGIN_REVIEW_X_USER',
    passEnv: 'APP_LOGIN_REVIEW_X_PASSWORD',
    platformsEnv: 'APP_LOGIN_REVIEW_X_PLATFORMS'
  }
]

function getSessionSecret(): string {
  return process.env.AUTH_SESSION_SECRET || process.env.SECRETS_ENCRYPTION_KEY || 'eventpromoter-dev-secret'
}

function normalizeAllowedPlatforms(platforms?: string): string[] {
  if (!platforms || !platforms.trim()) return ['*']
  const parsed = platforms
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
  return parsed.length > 0 ? parsed : ['*']
}

function getConfiguredAccounts(): Array<{ username: string; password: string; allowedPlatforms: string[] }> {
  const accounts: Array<{ username: string; password: string; allowedPlatforms: string[] }> = []

  for (const def of ACCOUNT_DEFS) {
    const username = process.env[def.userEnv]?.trim()
    const password = process.env[def.passEnv]?.trim()
    if (!username || !password) continue
    accounts.push({
      username,
      password,
      allowedPlatforms: normalizeAllowedPlatforms(def.platformsEnv ? process.env[def.platformsEnv] : '*')
    })
  }

  // Primary app login account.
  const fallbackUser = process.env.APP_LOGIN_USER?.trim()
  const fallbackPass = process.env.APP_LOGIN_PASSWORD?.trim()
  if (fallbackUser && fallbackPass) {
    accounts.push({ username: fallbackUser, password: fallbackPass, allowedPlatforms: ['*'] })
  }

  return accounts
}

function b64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function b64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(unsignedToken: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(unsignedToken).digest('base64url')
}

export class AuthService {
  static getSessionCookieName(): string {
    return SESSION_COOKIE_NAME
  }

  static getSessionTtlMs(): number {
    return SESSION_TTL_MS
  }

  static isConfigured(): boolean {
    return getConfiguredAccounts().length > 0
  }

  static validateLogin(username: string, password: string): LoginResult {
    const account = getConfiguredAccounts().find(
      (acc) => acc.username === username && acc.password === password
    )
    if (!account) return { valid: false, allowedPlatforms: [] }
    return { valid: true, allowedPlatforms: account.allowedPlatforms }
  }

  static createSessionToken(username: string, allowedPlatforms: string[]): string {
    const payload: SessionPayload = {
      user: username,
      allowedPlatforms,
      exp: Date.now() + SESSION_TTL_MS
    }
    const encodedPayload = b64UrlEncode(JSON.stringify(payload))
    const signature = sign(encodedPayload)
    return `${encodedPayload}.${signature}`
  }

  static verifySessionToken(token: string): SessionPayload | null {
    const [encodedPayload, providedSignature] = token.split('.')
    if (!encodedPayload || !providedSignature) return null

    const expectedSignature = sign(encodedPayload)
    if (!crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
      return null
    }

    try {
      const payload = JSON.parse(b64UrlDecode(encodedPayload)) as SessionPayload
      if (!payload?.user || !payload?.exp || payload.exp < Date.now()) return null
      payload.allowedPlatforms = Array.isArray(payload.allowedPlatforms) && payload.allowedPlatforms.length > 0
        ? payload.allowedPlatforms.map((p) => String(p).toLowerCase())
        : ['*']
      return payload
    } catch {
      return null
    }
  }

  static isPlatformAllowed(allowedPlatforms: string[], platformId: string): boolean {
    const normalized = String(platformId || '').toLowerCase()
    return allowedPlatforms.includes('*') || allowedPlatforms.includes(normalized)
  }
}
