// Configuration for the Multi-Platform Publisher Interface

const config = {
  // API URL for backend services
  // In Docker: use relative path '/api' (nginx proxies /api to backend:4000/api)
  // In development: use localhost:4000
  // Can be overridden with VITE_API_URL environment variable
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '/api'),

  // File upload settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFileTypes: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md']
  }

  // Platform configurations are now loaded dynamically from backend
  // No hardcoded platform data - everything comes from /api/platforms
}

export default config
