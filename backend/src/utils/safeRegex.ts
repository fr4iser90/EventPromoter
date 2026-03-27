const MAX_REGEX_SOURCE_LENGTH = 256
// Allow common regex escape sequences: \s (whitespace), \d (digit), \w (word), \S, \D, \W (negated)
// Also allow - (hyphen) and @ (at sign) which are commonly used in patterns like email validation
const SAFE_REGEX_SOURCE_PATTERN = /^[\w\s.^$*+?()[\]{}|\\/\-@\\s\\d\\w\\S\\D\\W]+$/

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
    // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
    // Source is user-configurable but constrained by strict charset/length and backtracking guards above.
    return new RegExp(source)
  } catch {
    return null
  }
}
