import dotenv from 'dotenv'
import express from 'express'
import { corsMiddleware } from './middleware/cors.js'
import { helmetMiddleware } from './middleware/helmet.js'
import { i18nMiddleware } from './i18n/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'
import { SchemaRegistry } from './services/schemaRegistry.js'

// Load environment variables
dotenv.config({ quiet: true })

const schemaRegistry = SchemaRegistry.getInstance();
// Load all schemas into the registry at application start
schemaRegistry.loadAllSchemas();

const app = express()
const PORT = Number(process.env.PORT) || 4000

console.log(`🚀 Starting EventPromoter Backend...`)
console.log('EventPromoter Backend running', { url: `http://0.0.0.0:${PORT}` })
console.log('Config directory', { configDir: `${process.cwd()}/config` })

// 0. Trust proxy - REQUIRED for X-Forwarded-* headers (Case 3-5)
app.set('trust proxy', true)

// 1. Global middleware (security headers, CORS, i18n)
app.use(helmetMiddleware)
app.use(corsMiddleware)
app.use(i18nMiddleware)

// 2. Debug logging
app.use((req, res, next) => {
  console.log('[Request]', { method: req.method, url: req.url });
  next();
})

// 3. Body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// 4. API routes (Handles everything including /api/files)
app.use('/api', routes)

// 404 handler
app.use(notFoundHandler)

// Error handler (must be last)
app.use(errorHandler)

// Start server on 0.0.0.0 to accept connections from network (Case 2-5)
app.listen(PORT, '0.0.0.0', () => {
  if (process.env.DEBUG_CONFIG_ACCESS === 'true') {
    console.log('🔍 Debug mode: Config access will be logged')
  }
})
