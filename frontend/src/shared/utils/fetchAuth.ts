import config from '../../config'

const originalFetch = window.fetch.bind(window)
let isRedirectingToLogin = false

function shouldAttachCredentials(input: RequestInfo | URL): boolean {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  // Relative URLs are app API calls in this project.
  if (url.startsWith('/')) return true

  // Absolute backend URL in development.
  if (typeof config.apiUrl === 'string' && config.apiUrl.startsWith('http')) {
    return url.startsWith(config.apiUrl)
  }

  return false
}

function getRequestPath(input: RequestInfo | URL): string {
  const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  try {
    const parsed = new URL(rawUrl, window.location.origin)
    return parsed.pathname
  } catch {
    return rawUrl
  }
}

function shouldRedirectToLogin(input: RequestInfo | URL, response: Response): boolean {
  if (response.status !== 401) return false

  const path = getRequestPath(input)
  const isAuthLoginRequest = path.endsWith('/api/auth/login') || path.endsWith('/auth/login')
  const isAlreadyOnLoginPage = window.location.pathname === '/login'

  return !isAuthLoginRequest && !isAlreadyOnLoginPage
}

window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (!shouldAttachCredentials(input)) {
    return originalFetch(input, init)
  }

  const mergedInit: RequestInit = {
    ...init,
    credentials: 'include'
  }

  return originalFetch(input, mergedInit).then((response) => {
    if (shouldRedirectToLogin(input, response) && !isRedirectingToLogin) {
      isRedirectingToLogin = true
      window.location.replace('/login')
    }
    return response
  })
}
