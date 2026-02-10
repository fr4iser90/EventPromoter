/**
 * Publisher Event Service
 * 
 * Generic event emitter service for all publishers (API, Playwright, etc.)
 * Provides real-time feedback via Server-Sent Events (SSE)
 * 
 * @module services/publisherEventService
 */

import { EventEmitter } from 'events'

export interface PublisherEvent {
  type: 'step_started' | 'step_progress' | 'step_completed' | 'step_failed' | 'error' | 'info' | 'success'
  platform: string
  method: 'api' | 'playwright' | 'n8n'
  publishRunId?: string // Correlation ID for this publishing run
  step?: string
  message?: string
  progress?: number // 0-100
  duration?: number // milliseconds
  error?: string
  errorCode?: string // Standardized error code
  retryable?: boolean // Whether this error can be retried
  data?: any // Additional data
  timestamp: number
}

export interface PublisherEventEmitter {
  emit(event: PublisherEvent): void
  on(event: string, listener: (data: PublisherEvent) => void): void
  removeListener(event: string, listener: (data: PublisherEvent) => void): void
}

/**
 * Generic event emitter for publishers
 * Can be used by any publisher (API, Playwright, etc.)
 */
export class PublisherEventService extends EventEmitter {
  private static instances: Map<string, PublisherEventService> = new Map()

  /**
   * Get or create event service instance for a session
   */
  static getInstance(sessionId: string): PublisherEventService {
    if (!this.instances.has(sessionId)) {
      this.instances.set(sessionId, new PublisherEventService(sessionId))
    }
    return this.instances.get(sessionId)!
  }

  /**
   * Remove instance when session is complete
   */
  static removeInstance(sessionId: string): void {
    const instance = this.instances.get(sessionId)
    if (instance) {
      instance.removeAllListeners()
      this.instances.delete(sessionId)
    }
  }

  constructor(private sessionId: string) {
    super()
    // Auto-cleanup after 1 hour
    setTimeout(() => {
      PublisherEventService.removeInstance(this.sessionId)
    }, 3600000)
  }

  /**
   * Emit a publisher event
   */
  emitEvent(event: Omit<PublisherEvent, 'timestamp'>): void {
    const fullEvent: PublisherEvent = {
      ...event,
      timestamp: Date.now()
    }
    this.emit('publisher_event', fullEvent)
  }

  /**
   * Helper methods for common event types
   * 
   * Standardized base events (required):
   * - step_started: Beginning of a step
   * - step_completed: Successful completion
   * - step_failed: Failure with error details
   */
  stepStarted(platform: string, method: 'api' | 'playwright' | 'n8n', step: string, message?: string, publishRunId?: string): void {
    this.emitEvent({
      type: 'step_started',
      platform,
      method,
      publishRunId,
      step,
      message,
      progress: 0
    })
  }

  stepProgress(platform: string, method: 'api' | 'playwright' | 'n8n', step: string, message: string, progress: number, publishRunId?: string): void {
    this.emitEvent({
      type: 'step_progress',
      platform,
      method,
      publishRunId,
      step,
      message,
      progress: Math.min(100, Math.max(0, progress))
    })
  }

  stepCompleted(platform: string, method: 'api' | 'playwright' | 'n8n', step: string, duration: number, publishRunId?: string, data?: any): void {
    this.emitEvent({
      type: 'step_completed',
      platform,
      method,
      publishRunId,
      step,
      duration,
      progress: 100,
      data
    })
  }

  stepFailed(platform: string, method: 'api' | 'playwright' | 'n8n', step: string, error: string, errorCode?: string, retryable: boolean = false, publishRunId?: string): void {
    this.emitEvent({
      type: 'step_failed',
      platform,
      method,
      publishRunId,
      step,
      error,
      errorCode,
      retryable
    })
  }

  error(platform: string, method: 'api' | 'playwright' | 'n8n', step: string, error: string, publishRunId?: string): void {
    this.emitEvent({
      type: 'error',
      platform,
      method,
      publishRunId,
      step,
      error
    })
  }

  info(platform: string, method: 'api' | 'playwright' | 'n8n', message: string, data?: any, publishRunId?: string): void {
    this.emitEvent({
      type: 'info',
      platform,
      method,
      publishRunId,
      message,
      data
    })
  }

  success(platform: string, method: 'api' | 'playwright' | 'n8n', message: string, data?: any, publishRunId?: string): void {
    this.emitEvent({
      type: 'success',
      platform,
      method,
      publishRunId,
      message,
      data
    })
  }
}

/**
 * Interface that publishers should implement to support events
 */
export interface EventAwarePublisher {
  setEventEmitter(emitter: PublisherEventService): void
}
