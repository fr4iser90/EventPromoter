/**
 * Schema Validator Unit Tests
 * 
 * Tests for the schema validation system.
 * 
 * @module tests/unit/SchemaValidator
 */

import { describe, it, expect } from 'vitest'
import {
  validatePlatformSchema,
  validateSettingsSchema,
  validateEditorSchema,
  validatePreviewSchema,
  validateFieldDefinition
} from '../../src/utils/schemaValidator.js'

describe('Schema Validator', () => {
  describe('validatePlatformSchema', () => {
    it('should validate a complete platform schema', () => {
      const validSchema = createValidSchema()
      
      expect(() => validatePlatformSchema(validSchema)).not.toThrow()
    })

    it('should reject schema without version', () => {
      const invalidSchema = createValidSchema()
      delete invalidSchema.version

      expect(() => validatePlatformSchema(invalidSchema)).toThrow()
    })

    it('should reject schema without settings', () => {
      const invalidSchema = createValidSchema()
      delete invalidSchema.settings

      expect(() => validatePlatformSchema(invalidSchema)).toThrow()
    })

    it('should reject schema without editor', () => {
      const invalidSchema = createValidSchema()
      delete invalidSchema.editor

      expect(() => validatePlatformSchema(invalidSchema)).toThrow()
    })

    it('should reject schema without preview', () => {
      const invalidSchema = createValidSchema()
      delete invalidSchema.preview

      expect(() => validatePlatformSchema(invalidSchema)).toThrow()
    })
  })

  describe('validateSettingsSchema', () => {
    it('should validate a valid settings schema', () => {
      const validSettings = {
        version: '1.0.0',
        title: 'Test Settings',
        fields: [
          {
            name: 'testField',
            type: 'text',
            label: 'Test Field',
            required: false
          }
        ]
      }

      expect(() => validateSettingsSchema(validSettings)).not.toThrow()
    })

    it('should reject settings without version', () => {
      const invalidSettings = {
        title: 'Test Settings',
        fields: []
      }

      expect(() => validateSettingsSchema(invalidSettings)).toThrow()
    })

    it('should reject settings without title', () => {
      const invalidSettings = {
        version: '1.0.0',
        fields: []
      }

      expect(() => validateSettingsSchema(invalidSettings)).toThrow()
    })

    it('should reject settings without fields array', () => {
      const invalidSettings = {
        version: '1.0.0',
        title: 'Test Settings'
      }

      expect(() => validateSettingsSchema(invalidSettings)).toThrow()
    })
  })

  describe('validateFieldDefinition', () => {
    it('should validate a valid field definition', () => {
      const validField = {
        name: 'testField',
        type: 'text',
        label: 'Test Field'
      }

      expect(() => validateFieldDefinition(validField)).not.toThrow()
    })

    it('should reject field without name', () => {
      const invalidField = {
        type: 'text',
        label: 'Test Field'
      }

      expect(() => validateFieldDefinition(invalidField)).toThrow()
    })

    it('should reject field without type', () => {
      const invalidField = {
        name: 'testField',
        label: 'Test Field'
      }

      expect(() => validateFieldDefinition(invalidField)).toThrow()
    })

    it('should reject field without label', () => {
      const invalidField = {
        name: 'testField',
        type: 'text'
      }

      expect(() => validateFieldDefinition(invalidField)).toThrow()
    })

    it('should reject invalid field type', () => {
      const invalidField = {
        name: 'testField',
        type: 'invalidType',
        label: 'Test Field'
      }

      expect(() => validateFieldDefinition(invalidField)).toThrow()
    })

    it('should validate select field with options', () => {
      const validSelectField = {
        name: 'testSelect',
        type: 'select',
        label: 'Test Select',
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' }
        ]
      }

      expect(() => validateFieldDefinition(validSelectField)).not.toThrow()
    })

    it('should reject select field without options', () => {
      const invalidSelectField = {
        name: 'testSelect',
        type: 'select',
        label: 'Test Select'
      }

      expect(() => validateFieldDefinition(invalidSelectField)).toThrow()
    })
  })

  describe('validateEditorSchema', () => {
    it('should validate a valid editor schema', () => {
      const validEditor = {
        version: '1.0.0',
        title: 'Test Editor',
        blocks: [
          {
            type: 'text',
            id: 'textBlock',
            label: 'Text Block'
          }
        ]
      }

      expect(() => validateEditorSchema(validEditor)).not.toThrow()
    })

    it('should reject editor without version', () => {
      const invalidEditor = {
        title: 'Test Editor',
        blocks: []
      }

      expect(() => validateEditorSchema(invalidEditor)).toThrow()
    })

    it('should reject editor without blocks', () => {
      const invalidEditor = {
        version: '1.0.0',
        title: 'Test Editor'
      }

      expect(() => validateEditorSchema(invalidEditor)).toThrow()
    })
  })

  describe('validatePreviewSchema', () => {
    it('should validate a valid preview schema', () => {
      const validPreview = {
        version: '1.0.0',
        title: 'Test Preview',
        defaultMode: 'desktop',
        modes: [
          {
            id: 'desktop',
            label: 'Desktop'
          }
        ]
      }

      expect(() => validatePreviewSchema(validPreview)).not.toThrow()
    })

    it('should reject preview without defaultMode', () => {
      const invalidPreview = {
        version: '1.0.0',
        title: 'Test Preview',
        modes: []
      }

      expect(() => validatePreviewSchema(invalidPreview)).toThrow()
    })
  })
})

// Helper function
function createValidSchema() {
  return {
    version: '1.0.0',
    settings: {
      version: '1.0.0',
      title: 'Test Settings',
      fields: [
        {
          name: 'testField',
          type: 'text',
          label: 'Test Field'
        }
      ]
    },
    editor: {
      version: '1.0.0',
      title: 'Test Editor',
      blocks: [
        {
          type: 'text',
          id: 'textBlock',
          label: 'Text Block'
        }
      ]
    },
    preview: {
      version: '1.0.0',
      title: 'Test Preview',
      defaultMode: 'desktop',
      modes: [
        {
          id: 'desktop',
          label: 'Desktop'
        }
      ]
    }
  }
}

