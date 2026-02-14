import config from '../../config'

const originalFetch = window.fetch.bind(window)

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

window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (!shouldAttachCredentials(input)) {
    return originalFetch(input, init)
  }

  const mergedInit: RequestInit = {
    ...init,
    credentials: 'include'
  }

  return originalFetch(input, mergedInit)
}
