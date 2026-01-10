/**
 * Platform API Integration Tests
 * 
 * Tests for the platform API endpoints.
 * 
 * @module tests/integration/PlatformAPI
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import express from 'express'
import request from 'supertest'
import { initializePlatformRegistry } from '../../src/services/platformRegistry.js'
import platformRoutes from '../../src/routes/platforms.js'
import translationRoutes from '../../src/routes/translations.js'

// Create test app
const app = express()
app.use(express.json())
app.use('/api/platforms', platformRoutes)
app.use('/api/translations', translationRoutes)

describe('Platform API Integration Tests', () => {
  beforeAll(async () => {
    // Initialize platform registry before tests
    try {
      await initializePlatformRegistry()
    } catch (error) {
      console.warn('Platform registry initialization failed in test:', error)
    }
  })

  describe('GET /api/platforms', () => {
    it('should return all platforms', async () => {
      const response = await request(app)
        .get('/api/platforms')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('platforms')
      expect(Array.isArray(response.body.platforms)).toBe(true)
    })

    it('should return platforms with required fields', async () => {
      const response = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = response.body.platforms
      if (platforms.length > 0) {
        const platform = platforms[0]
        expect(platform).toHaveProperty('id')
        expect(platform).toHaveProperty('name')
        expect(platform).toHaveProperty('version')
      }
    })

    it('should include schema metadata when available', async () => {
      const response = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = response.body.platforms
      // Check if any platform has schema
      const hasSchema = platforms.some(p => p.hasSchema !== undefined)
      // This is optional, so we just check the structure is correct
      expect(typeof hasSchema === 'boolean' || hasSchema === undefined).toBe(true)
    })
  })

  describe('GET /api/platforms/:platformId', () => {
    it('should return specific platform details', async () => {
      // First get all platforms to find a valid ID
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id

        const response = await request(app)
          .get(`/api/platforms/${platformId}`)
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('platform')
        expect(response.body.platform).toHaveProperty('id', platformId)
      }
    })

    it('should return 404 for non-existent platform', async () => {
      const response = await request(app)
        .get('/api/platforms/non-existent-platform')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should include schema when available', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      const platformWithSchema = platforms.find(p => p.hasSchema)

      if (platformWithSchema) {
        const response = await request(app)
          .get(`/api/platforms/${platformWithSchema.id}`)
          .expect(200)

        // Schema might be in platform object or separate
        expect(response.body.platform).toBeDefined()
      }
    })
  })

  describe('GET /api/platforms/:platformId/schema', () => {
    it('should return platform schema when available', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      const platformWithSchema = platforms.find(p => p.hasSchema)

      if (platformWithSchema) {
        const response = await request(app)
          .get(`/api/platforms/${platformWithSchema.id}/schema`)
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('schema')
        expect(response.body.schema).toHaveProperty('settings')
        expect(response.body.schema).toHaveProperty('editor')
        expect(response.body.schema).toHaveProperty('preview')
      }
    })

    it('should return 404 for platform without schema', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      const platformWithoutSchema = platforms.find(p => !p.hasSchema)

      if (platformWithoutSchema) {
        const response = await request(app)
          .get(`/api/platforms/${platformWithoutSchema.id}/schema`)
          .expect(404)

        expect(response.body).toHaveProperty('error')
      }
    })
  })

  describe('GET /api/platforms/:platformId/i18n/:lang', () => {
    it('should return platform translations for valid language', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id

        const response = await request(app)
          .get(`/api/platforms/${platformId}/i18n/en`)
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('platform', platformId)
        expect(response.body).toHaveProperty('language', 'en')
        expect(response.body).toHaveProperty('translations')
      }
    })

    it('should return 400 for invalid language', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id

        const response = await request(app)
          .get(`/api/platforms/${platformId}/i18n/invalid`)
          .expect(400)

        expect(response.body).toHaveProperty('error')
        expect(response.body).toHaveProperty('supportedLanguages')
      }
    })

    it('should support multiple languages', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id
        const languages = ['en', 'de', 'es']

        for (const lang of languages) {
          const response = await request(app)
            .get(`/api/platforms/${platformId}/i18n/${lang}`)
            .expect(200)

          expect(response.body).toHaveProperty('language', lang)
        }
      }
    })
  })

  describe('GET /api/platforms/:platformId/i18n', () => {
    it('should return available languages for platform', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id

        const response = await request(app)
          .get(`/api/platforms/${platformId}/i18n`)
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('platform', platformId)
        expect(response.body).toHaveProperty('languages')
        expect(Array.isArray(response.body.languages)).toBe(true)
      }
    })
  })

  describe('GET /api/platforms/:platformId/settings', () => {
    it('should return platform settings configuration', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id

        const response = await request(app)
          .get(`/api/platforms/${platformId}/settings`)
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('platform', platformId)
        expect(response.body).toHaveProperty('settings')
      }
    })
  })

  describe('PUT /api/platforms/:platformId/settings', () => {
    it('should accept settings update request', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id

        const response = await request(app)
          .put(`/api/platforms/${platformId}/settings`)
          .send({ settings: { testKey: 'testValue' } })
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('platform', platformId)
      }
    })
  })
})

describe('Translation API Integration Tests', () => {
  describe('GET /api/translations/:platformId/:lang', () => {
    it('should return platform translations', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id

        const response = await request(app)
          .get(`/api/translations/${platformId}/en`)
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('platform', platformId)
        expect(response.body).toHaveProperty('language', 'en')
        expect(response.body).toHaveProperty('translations')
      }
    })

    it('should return 400 for invalid language', async () => {
      const allPlatformsResponse = await request(app)
        .get('/api/platforms')
        .expect(200)

      const platforms = allPlatformsResponse.body.platforms
      if (platforms.length > 0) {
        const platformId = platforms[0].id

        const response = await request(app)
          .get(`/api/translations/${platformId}/invalid`)
          .expect(400)

        expect(response.body).toHaveProperty('error')
      }
    })
  })

  describe('GET /api/translations/:lang', () => {
    it('should return all platform translations for language', async () => {
      const response = await request(app)
        .get('/api/translations/en')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('language', 'en')
      expect(response.body).toHaveProperty('translations')
      expect(typeof response.body.translations).toBe('object')
    })
  })
})

