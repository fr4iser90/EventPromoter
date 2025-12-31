import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000
const CONFIG_DIR = path.join(__dirname, '../../config')

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))

// Increase payload limit for file uploads (50MB)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Helper function to read config files
async function readConfig(filename: string) {
  try {
    const filePath = path.join(CONFIG_DIR, filename)
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return null
  }
}

// Helper function to write config files
async function writeConfig(filename: string, data: any) {
  try {
    const filePath = path.join(CONFIG_DIR, filename)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    return false
  }
}

// Generic config endpoint
const createConfigEndpoints = (name: string) => {
  app.get(`/api/config/${name}`, async (req, res) => {
    const config = await readConfig(`${name}.json`)
    if (config) {
      res.json(config)
    } else {
      res.status(500).json({ error: `Failed to load ${name} configuration` })
    }
  })

  app.post(`/api/config/${name}`, async (req, res) => {
    const success = await writeConfig(`${name}.json`, req.body)
    if (success) {
      res.json({ success: true })
    } else {
      res.status(500).json({ error: `Failed to save ${name} configuration` })
    }
  })
}

// Create endpoints for all configs
const configs = ['emails', 'reddit', 'app', 'twitter', 'instagram', 'facebook', 'linkedin']
configs.forEach(config => createConfigEndpoints(config))

// Session state management (temporary UI state)
const SESSION_FILE = 'session.json'

// Session endpoints
app.get('/api/session/state', async (req, res) => {
  try {
    const sessionData = await readConfig(SESSION_FILE)
    if (!sessionData) {
      // Return default empty session if file doesn't exist
      res.json({
        uploadedFiles: [],
        selectedHashtags: [],
        selectedPlatforms: [],
        platformContent: {},
        contentTemplates: []
      })
    } else {
      res.json(sessionData)
    }
  } catch (error) {
    console.error('Error reading session:', error)
    // Return default session on error too
    res.json({
      uploadedFiles: [],
      selectedHashtags: [],
      selectedPlatforms: [],
      platformContent: {},
      contentTemplates: []
    })
  }
})

app.post('/api/session/state', async (req, res) => {
  try {
    const success = await writeConfig(SESSION_FILE, req.body)
    if (success) {
      res.json({ success: true })
    } else {
      res.status(500).json({ error: 'Failed to save session' })
    }
  } catch (error) {
    console.error('Error saving session:', error)
    res.status(500).json({ error: 'Failed to save session' })
  }
})

// Validation utilities
const PLATFORM_RULES: Record<string, { required: string[], maxLength: number | null, supports: string[] }> = {
  twitter: {
    required: ['eventTitle'],
    maxLength: 280,
    supports: ['text']
  },
  instagram: {
    required: ['eventTitle', 'imageUrl'],
    maxLength: 2200,
    supports: ['image', 'text']
  },
  facebook: {
    required: ['eventTitle'],
    maxLength: null,
    supports: ['text', 'image']
  },
  linkedin: {
    required: ['eventTitle'],
    maxLength: 3000,
    supports: ['text', 'image']
  },
  reddit: {
    required: ['eventTitle', 'redditSubreddit'],
    maxLength: null,
    supports: ['text', 'image']
  },
  email: {
    required: ['eventTitle', 'emailRecipients'],
    maxLength: null,
    supports: ['text', 'image', 'html']
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateEventData(eventData: any) {
  const errors = [];

  const requiredFields = ['eventTitle', 'eventDate', 'venue', 'city'];
  for (const field of requiredFields) {
    if (!eventData[field] || eventData[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (eventData.eventDate) {
    const date = new Date(eventData.eventDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  if (eventData.eventTime) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(eventData.eventTime)) {
      errors.push('Invalid time format (use HH:MM)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validatePlatforms(platformContent: any, selectedPlatforms: any): { isValid: boolean, results: any[] } {
  const validationResults = [];
  let hasErrors = false;

  for (const [platform, enabled] of Object.entries(selectedPlatforms || {})) {
    if (!enabled) continue;

    const rules = PLATFORM_RULES[platform];
    if (!rules) {
      validationResults.push({
        platform,
        valid: false,
        error: `Unknown platform: ${platform}`
      });
      hasErrors = true;
      continue;
    }

    const content = platformContent[platform];
    const errors = [];

    for (const field of rules.required) {
      if (field === 'eventTitle') {
        if (!platformContent.eventTitle) {
          errors.push('Event title is required');
        }
      } else if (field === 'imageUrl') {
        if (!platformContent.imageUrl) {
          errors.push('Image is required for this platform');
        }
      } else if (field === 'emailRecipients') {
        if (!content || !content.recipients || content.recipients.length === 0) {
          errors.push('Email recipients are required');
        }
      } else if (field === 'redditSubreddit') {
        if (!content || !content.subreddit) {
          errors.push('Reddit subreddit is required');
        }
      }
    }

    if (rules.maxLength && content && content.text && content.text.length > rules.maxLength) {
      errors.push(`Content too long: ${content.text.length} > ${rules.maxLength} characters`);
    }

    if (platform === 'email' && content && content.recipients) {
      const invalidEmails = content.recipients.filter((email: string) => !validateEmail(email));
      if (invalidEmails.length > 0) {
        errors.push(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      validationResults.push({
        platform,
        valid: false,
        errors
      });
      hasErrors = true;
    } else {
      validationResults.push({
        platform,
        valid: true,
        supports: rules.supports
      });
    }
  }

  return {
    isValid: !hasErrors,
    results: validationResults
  };
}

// Submit endpoint with validation and N8N forwarding
app.post('/api/submit', async (req, res) => {
  try {
    const {
      files,
      platforms,
      content,
      hashtags,
      n8nUrl,
      eventData
    } = req.body;

    console.log('Received submit request:', { files: files?.length, platforms, n8nUrl });

    // Validate event data
    if (eventData) {
      const eventValidation = validateEventData(eventData);
      if (!eventValidation.isValid) {
        return res.status(400).json({
          error: 'Event data validation failed',
          details: eventValidation.errors
        });
      }
    }

    // Validate platforms
    if (platforms && content) {
      const platformValidation = validatePlatforms(content, platforms);
      if (!platformValidation.isValid) {
        return res.status(400).json({
          error: 'Platform validation failed',
          details: platformValidation.results
        });
      }
    }

    // Prepare payload for N8N
    const n8nPayload: any = {
      files: files || [],
      hashtags: hashtags || [],
      publishTo: platforms || {},
      platformSettings: {},
      platformContent: content || {},
      metadata: {
        submittedAt: new Date().toISOString(),
        validationPassed: true
      }
    };

    // Transform platformContent for N8N (flatten structure)
    if (n8nPayload.platformContent) {
      // Move email recipients to root level if present
      if (n8nPayload.platformContent.email && n8nPayload.platformContent.email.recipients) {
        n8nPayload.email = {
          ...n8nPayload.platformContent.email,
          recipients: n8nPayload.platformContent.email.recipients
        };
      }

      // Move reddit content to root level if present
      if (n8nPayload.platformContent.reddit) {
        n8nPayload.reddit = {
          ...n8nPayload.platformContent.reddit,
          text: n8nPayload.platformContent.reddit.body || n8nPayload.platformContent.reddit.text
        };
      }
    }

    console.log('Sending to N8N:', n8nUrl);

    // Forward to N8N
    const n8nResponse = await axios.post(n8nUrl, n8nPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('N8N response status:', n8nResponse.status);

    res.json({
      success: true,
      n8nResponse: n8nResponse.data,
      message: 'Successfully submitted to N8N'
    });

  } catch (error: any) {
    console.error('Submit error:', error);

    if (error.response) {
      // N8N returned an error
      return res.status(error.response.status).json({
        error: 'N8N error',
        details: error.response.data,
        message: error.message
      });
    } else if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'N8N not reachable',
        message: 'Cannot connect to N8N webhook'
      });
    } else {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EventPromoter Backend running on http://localhost:${PORT}`)
  console.log(`📁 Config directory: ${CONFIG_DIR}`)
})
