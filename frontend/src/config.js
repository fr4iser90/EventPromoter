// Configuration for the Multi-Platform Publisher Interface

const config = {
  // n8n Webhook URL - replace with your actual n8n instance URL
  n8nWebhookUrl: 'http://localhost:5678/webhook/multiplatform-publisher',

  // API Base URL for future server-side features
  apiBaseUrl: 'http://localhost:3001',
  
  // API URL for backend services
  apiUrl: 'http://localhost:4000',

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
