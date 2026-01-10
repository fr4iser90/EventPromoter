/**
 * Platform Registry Unit Tests
 * 
 * Tests for the PlatformRegistry service.
 * 
 * @module tests/unit/PlatformRegistry
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PlatformRegistry } from '../../src/services/platformRegistry.js'
import { PlatformModule } from '../../src/types/platformModule.js'
import { PlatformSchema } from '../../src/types/platformSchema.js'

describe('PlatformRegistry', () => {
  let registry

  beforeEach(() => {
    registry = new PlatformRegistry({
      platformsPath: './test-platforms',
      validateSchemas: false, // Disable for unit tests
      throwOnError: false
    })
  })

  afterEach(() => {
    registry.clear()
  })

  describe('Platform Registration', () => {
    it('should register a valid platform module', async () => {
      const mockPlatform = createMockPlatform('test-platform')
      
      await registry.register(mockPlatform)
      
      expect(registry.hasPlatform('test-platform')).toBe(true)
      expect(registry.getPlatform('test-platform')).toEqual(mockPlatform)
    })

    it('should reject platform with missing metadata', async () => {
      const invalidPlatform = {
        schema: createMockSchema(),
        capabilities: createMockCapabilities(),
        service: {},
        parser: {},
        validator: {}
      }

      await expect(registry.register(invalidPlatform)).rejects.toThrow()
    })

    it('should reject platform with missing schema', async () => {
      const invalidPlatform = createMockPlatform('test')
      delete invalidPlatform.schema

      await expect(registry.register(invalidPlatform)).rejects.toThrow()
    })

    it('should prevent duplicate platform registration', async () => {
      const platform = createMockPlatform('test-platform')
      
      await registry.register(platform)
      
      // Try to register again
      await expect(registry.register(platform)).rejects.toThrow()
    })
  })

  describe('Platform Retrieval', () => {
    it('should retrieve platform by ID', async () => {
      const platform = createMockPlatform('test-platform')
      await registry.register(platform)
      
      const retrieved = registry.getPlatform('test-platform')
      
      expect(retrieved).toEqual(platform)
    })

    it('should return undefined for non-existent platform', () => {
      const platform = registry.getPlatform('non-existent')
      expect(platform).toBeUndefined()
    })

    it('should get all platforms', async () => {
      const platform1 = createMockPlatform('platform-1')
      const platform2 = createMockPlatform('platform-2')
      
      await registry.register(platform1)
      await registry.register(platform2)
      
      const allPlatforms = registry.getAllPlatforms()
      
      expect(allPlatforms).toHaveLength(2)
      expect(allPlatforms.map(p => p.metadata.id)).toContain('platform-1')
      expect(allPlatforms.map(p => p.metadata.id)).toContain('platform-2')
    })

    it('should filter platforms by category', async () => {
      const socialPlatform = createMockPlatform('twitter', 'social')
      const emailPlatform = createMockPlatform('email', 'communication')
      
      await registry.register(socialPlatform)
      await registry.register(emailPlatform)
      
      const socialPlatforms = registry.getPlatformsByCategory('social')
      
      expect(socialPlatforms).toHaveLength(1)
      expect(socialPlatforms[0].metadata.id).toBe('twitter')
    })
  })

  describe('Platform Metadata', () => {
    it('should get platform metadata', async () => {
      const platform = createMockPlatform('test-platform')
      await registry.register(platform)
      
      const metadata = registry.getPlatformMetadata('test-platform')
      
      expect(metadata).toEqual(platform.metadata)
    })

    it('should get platform schema', async () => {
      const platform = createMockPlatform('test-platform')
      await registry.register(platform)
      
      const schema = registry.getPlatformSchema('test-platform')
      
      expect(schema).toEqual(platform.schema)
    })

    it('should get platform capabilities', async () => {
      const platform = createMockPlatform('test-platform')
      await registry.register(platform)
      
      const capabilities = registry.getPlatformCapabilities('test-platform')
      
      expect(capabilities).toEqual(platform.capabilities)
    })
  })

  describe('Platform Validation', () => {
    it('should validate platform structure', () => {
      const validPlatform = createMockPlatform('test-platform')
      
      expect(() => registry.validatePlatform(validPlatform)).not.toThrow()
    })

    it('should reject platform without metadata', () => {
      const invalidPlatform = {
        schema: createMockSchema(),
        capabilities: createMockCapabilities(),
        service: {},
        parser: {},
        validator: {}
      }

      expect(() => registry.validatePlatform(invalidPlatform)).toThrow()
    })

    it('should reject platform without service', () => {
      const invalidPlatform = createMockPlatform('test')
      delete invalidPlatform.service

      expect(() => registry.validatePlatform(invalidPlatform)).toThrow()
    })
  })

  describe('Registry State', () => {
    it('should track initialization state', async () => {
      expect(registry.isInitialized()).toBe(false)
      
      // Mock discovery
      const platform = createMockPlatform('test')
      await registry.register(platform)
      
      // Manually set initialized for test
      registry.initialized = true
      expect(registry.isInitialized()).toBe(true)
    })

    it('should clear all platforms', async () => {
      const platform = createMockPlatform('test-platform')
      await registry.register(platform)
      
      expect(registry.getPlatformCount()).toBe(1)
      
      registry.clear()
      
      expect(registry.getPlatformCount()).toBe(0)
      expect(registry.isInitialized()).toBe(false)
    })

    it('should get platform count', async () => {
      expect(registry.getPlatformCount()).toBe(0)
      
      await registry.register(createMockPlatform('platform-1'))
      expect(registry.getPlatformCount()).toBe(1)
      
      await registry.register(createMockPlatform('platform-2'))
      expect(registry.getPlatformCount()).toBe(2)
    })

    it('should get platform IDs', async () => {
      await registry.register(createMockPlatform('platform-1'))
      await registry.register(createMockPlatform('platform-2'))
      
      const ids = registry.getPlatformIds()
      
      expect(ids).toHaveLength(2)
      expect(ids).toContain('platform-1')
      expect(ids).toContain('platform-2')
    })
  })
})

// Helper functions
function createMockPlatform(id, category = 'test') {
  return {
    metadata: {
      id,
      displayName: `Test ${id}`,
      version: '1.0.0',
      category
    },
    schema: createMockSchema(),
    capabilities: createMockCapabilities(),
    service: {
      validateContent: vi.fn(),
      transformForAPI: vi.fn()
    },
    parser: {
      parse: vi.fn()
    },
    validator: {
      validate: vi.fn(() => ({ isValid: true, errors: [] })),
      getLimits: vi.fn(() => ({ maxLength: 1000 }))
    }
  }
}

function createMockSchema() {
  return {
    version: '1.0.0',
    settings: {
      version: '1.0.0',
      title: 'Test Settings',
      fields: []
    },
    editor: {
      version: '1.0.0',
      title: 'Test Editor',
      blocks: []
    },
    preview: {
      version: '1.0.0',
      title: 'Test Preview',
      defaultMode: 'desktop',
      modes: []
    }
  }
}

function createMockCapabilities() {
  return {
    supportsText: true,
    supportsImages: false,
    supportsVideo: false,
    supportsLinks: false,
    supportsHashtags: false,
    supportsMentions: false,
    supportsPolls: false,
    supportsScheduling: false,
    requiresAuth: false
  }
}

