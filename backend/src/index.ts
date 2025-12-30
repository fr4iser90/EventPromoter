import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

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
app.use(express.json())

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EventPromoter Backend running on http://localhost:${PORT}`)
  console.log(`📁 Config directory: ${CONFIG_DIR}`)
})
