const MAX_REGEX_SOURCE_LENGTH = 256
const SAFE_REGEX_SOURCE_PATTERN = /^[\w\s.^$*+?()[\]{}|\\/-]+$/

/**
 * Create a regex from dynamic schema input with conservative safety guards.
 * Returns null when the source looks unsafe or cannot be compiled.
 */
export function createSafeValidationRegex(source: unknown): RegExp | null {
  if (typeof source !== 'string') return null
  if (!source || source.length > MAX_REGEX_SOURCE_LENGTH) return null
  if (!SAFE_REGEX_SOURCE_PATTERN.test(source)) return null

  // Basic backtracking guard for obviously dangerous constructs.
  if (/(\+\+|\*\*|\+\*|\*\+|\)\+[^)]*\+|\)\*[^)]*\*)/.test(source)) return null

  try {
    return new RegExp(source)
  } catch {
    return null
  }
}
