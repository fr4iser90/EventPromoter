// Configuration for the Multi-Platform Publisher Interface

const config = {
  // n8n Webhook URL - replace with your actual n8n instance URL
  n8nWebhookUrl: 'http://localhost:5678/webhook/multiplatform-publisher',

  // API Base URL for future server-side features
  apiBaseUrl: 'http://localhost:3001',

  // File upload settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFileTypes: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md']
  },

  // Platform configurations
  platforms: {
    twitter: {
      name: 'Twitter/X',
      icon: '🐦',
      color: '#1DA1F2',
      requiredSettings: ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret']
    },
    instagram: {
      name: 'Instagram',
      icon: '📷',
      color: '#E4405F',
      requiredSettings: ['username', 'password']
    },
    facebook: {
      name: 'Facebook',
      icon: '👤',
      color: '#1877F2',
      requiredSettings: ['pageId', 'pageName', 'accessToken']
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      color: '#0A66C2',
      requiredSettings: ['profileId', 'accessToken']
    },
    reddit: {
      name: 'Reddit',
      icon: '🔴',
      color: '#FF4500',
      requiredSettings: ['subreddit', 'username', 'password']
    },
    email: {
      name: 'Email',
      icon: '📧',
      color: '#EA4335',
      requiredSettings: ['recipients', 'subject']
    }
  }
}

export default config
