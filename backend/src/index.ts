import express from 'express'
import helmet from 'helmet'
import { corsMiddleware } from './middleware/cors.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()
const PORT = process.env.PORT || 4000

// Global middleware
app.use(helmet())
app.use(corsMiddleware)

// Increase payload limit for file uploads (50MB)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// API routes
app.use('/api', routes)

// 404 handler
app.use(notFoundHandler)

// Error handler (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EventPromoter Backend running on http://localhost:${PORT}`)
  console.log(`📁 Config directory: ${process.cwd()}/config`)
})
