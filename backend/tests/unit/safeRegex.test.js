import { describe, it, expect } from 'vitest'
import { createSafeValidationRegex } from '../../src/utils/safeRegex.ts'

describe('createSafeValidationRegex', () => {
  it('returns regex for safe source', () => {
    const regex = createSafeValidationRegex('^[a-z0-9_-]+$')
    expect(regex).toBeInstanceOf(RegExp)
    expect(regex?.test('valid_name-1')).toBe(true)
    expect(regex?.test('INVALID!')).toBe(false)
  })

  it('returns null for non-string input', () => {
    expect(createSafeValidationRegex(undefined)).toBeNull()
    expect(createSafeValidationRegex(42)).toBeNull()
    expect(createSafeValidationRegex({})).toBeNull()
  })

  it('returns null for empty or too long source', () => {
    expect(createSafeValidationRegex('')).toBeNull()
    expect(createSafeValidationRegex('a'.repeat(257))).toBeNull()
  })

  it('returns null for disallowed characters', () => {
    expect(createSafeValidationRegex('(?<=a)b')).toBeNull()
  })

  it('returns null for obviously dangerous quantifier patterns', () => {
    expect(createSafeValidationRegex('a++')).toBeNull()
    expect(createSafeValidationRegex('a**')).toBeNull()
    expect(createSafeValidationRegex('(?:a+)+')).toBeNull()
  })

  it('returns null when source cannot be compiled', () => {
    expect(createSafeValidationRegex('[')).toBeNull()
  })
})
