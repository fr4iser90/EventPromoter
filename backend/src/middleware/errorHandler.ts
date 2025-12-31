// Error handling middleware

import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Unhandled error:', error)

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production'

  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(isDevelopment && {
      stack: error.stack,
      details: error
    })
  })
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  })
}
