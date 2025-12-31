// CORS configuration middleware

import cors from 'cors'

export const corsConfig = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.178.20:3000' // Add your local network IP if needed
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

export const corsMiddleware = cors(corsConfig)
