#!/usr/bin/env node

/**
 * i18n Validation Script
 * Validates translation keys and detects missing/unused translations
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.join(__dirname, '..')
const REPO_ROOT = path.join(ROOT_DIR, '..')
const LOCALES_DIR = path.join(ROOT_DIR, 'src', 'i18n', 'locales')
const SRC_DIR = path.join(ROOT_DIR, 'src')
const BACKEND_PLATFORMS_DIR = path.join(REPO_ROOT, 'backend', 'src', 'platforms')

const locales = ['de', 'en', 'es']
const errors = []
const warnings = []
const hardcodedWarnings = []
const ENGLISH_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'your', 'you', 'all', 'are', 'not', 'only',
  'start', 'next', 'publish', 'content', 'upload', 'files', 'select', 'platform', 'platforms',
  'template', 'templates', 'preview', 'settings', 'history', 'event', 'events', 'search',
  'ready', 'review', 'sending', 'loading', 'failed', 'error', 'unknown', 'default', 'custom',
  'description', 'title', 'subject', 'email', 'attachments', 'include', 'standard', 'mode',
  'available', 'selected', 'group', 'groups', 'recipient', 'recipients', 'public', 'internal'
])

// Load locale files
function loadLocaleFiles() {
  const localeData = {}

  for (const locale of locales) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`)
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      localeData[locale] = JSON.parse(content)
    } catch (error) {
      errors.push(`Failed to load ${locale}.json: ${error.message}`)
    }
  }

  return localeData
}

// Flatten nested object to dot notation
function flattenObject(obj, prefix = '') {
  const result = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else {
      result[newKey] = value
    }
  }

  return result
}

function clipText(value, length = 90) {
  if (value.length <= length) return value
  return `${value.slice(0, length)}...`
}

function looksMostlyEnglish(text) {
  const normalized = text
    .toLowerCase()
    .replace(/\{\{[^}]+\}\}/g, ' ')
    .replace(/\$\{[^}]+\}/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return false

  const phraseHit = /(start here|next step|publish content|ready to publish|template management|search events|upload files|select platforms|failed to|unknown error|no files|all files|event history)/.test(normalized)
  if (phraseHit) return true

  const tokens = normalized.split(' ').filter((token) => token.length >= 3)
  if (tokens.length < 2) return false

  let englishHits = 0
  for (const token of tokens) {
    if (ENGLISH_WORDS.has(token)) englishHits++
  }
  return englishHits >= 2 && englishHits / tokens.length >= 0.6
}

function addLanguageQualityWarnings(localeData, sourceName) {
  for (const locale of locales) {
    if (locale === 'en') continue
    const flattened = flattenObject(localeData[locale] || {})
    for (const [key, rawValue] of Object.entries(flattened)) {
      if (typeof rawValue !== 'string') continue
      const value = rawValue.trim()
      if (!value) continue
      // Ignore template-default snippets that intentionally contain placeholders/HTML.
      if (
        key.endsWith('.default') &&
        (/\{[^}]+\}/.test(value) || /<[^>]+>/.test(value))
      ) {
        continue
      }
      if (looksMostlyEnglish(value)) {
        warnings.push(
          `Possible English text in ${sourceName}/${locale}: "${key}" -> "${clipText(value)}"`
        )
      }
    }
  }
}

function loadBackendPlatformLocales() {
  const localeDataByPlatform = {}

  if (!fs.existsSync(BACKEND_PLATFORMS_DIR)) {
    return localeDataByPlatform
  }

  const platforms = fs
    .readdirSync(BACKEND_PLATFORMS_DIR)
    .filter((name) => !name.startsWith('_'))

  for (const platformId of platforms) {
    const localeDir = path.join(BACKEND_PLATFORMS_DIR, platformId, 'locales')
    if (!fs.existsSync(localeDir)) continue

    const data = {}
    for (const locale of locales) {
      const filePath = path.join(localeDir, `${locale}.json`)
      if (!fs.existsSync(filePath)) continue
      try {
        data[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      } catch (error) {
        errors.push(`Failed to load ${platformId}/locales/${locale}.json: ${error.message}`)
      }
    }

    if (Object.keys(data).length > 0) {
      localeDataByPlatform[platformId] = data
    }
  }

  return localeDataByPlatform
}

function isValidTranslationKey(key) {
  if (!key || typeof key !== 'string') return false
  const normalized = key.trim()
  if (normalized.length < 3) return false
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return false
  // Canonical translation key format: namespace.key(.child...)
  return /^[a-z][a-z0-9_-]*(\.[a-z0-9_-]+)+$/i.test(normalized)
}

function isDynamicTranslationKeyTemplate(key) {
  if (!key || typeof key !== 'string') return false
  const normalized = key.trim()
  // Typical pattern: platform.${platformId}.attachments.forRun
  return normalized.includes('${') && normalized.includes('.') && /^[a-z]/i.test(normalized)
}

function isHardcodedUIString(text) {
  if (!text || typeof text !== 'string') return false
  const normalized = text.trim()
  if (normalized.length < 3) return false
  // Filter obvious code fragments and type signatures.
  if (
    normalized.includes('=>') ||
    normalized.includes('===') ||
    normalized.includes('&&') ||
    normalized.includes('||') ||
    normalized.includes('Record<') ||
    normalized.includes('export ') ||
    normalized.includes('import ') ||
    normalized.includes('const ') ||
    normalized.includes('function ')
  ) return false
  if (/\bif\s*\(|\breturn\b|\bstartsWith\s*\(/.test(normalized)) return false
  if (/[:;{}[\]<>]/.test(normalized)) return false
  if (isValidTranslationKey(normalized)) return false
  if (isDynamicTranslationKeyTemplate(normalized)) return false
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return false
  if (/^[0-9]+$/.test(normalized)) return false
  if (!/[A-Za-zÄÖÜäöü]/.test(normalized)) return false
  // Human UI text heuristics: spaces, sentence punctuation, currency, placeholders
  return (
    normalized.includes(' ') ||
    normalized.includes('...') ||
    normalized.includes('?') ||
    normalized.includes('!') ||
    normalized.includes('€') ||
    normalized.includes('$')
  )
}

function addHardcodedWarning(file, content, index, text) {
  const line = content.slice(0, index).split('\n').length
  const signature = `${file}:${line}:${text}`
  if (!hardcodedWarnings.some((entry) => entry.signature === signature)) {
    hardcodedWarnings.push({ signature, file, line, text })
  }
}

function scanSourceFiles(baseDir, onFile) {
  if (!fs.existsSync(baseDir)) return
  const supportedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir)
    for (const file of files) {
      const filePath = path.join(currentDir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          walk(filePath)
        }
        continue
      }

      if (!supportedExtensions.has(path.extname(filePath)) || filePath.endsWith('.d.ts')) {
        continue
      }

      const content = fs.readFileSync(filePath, 'utf8')
      onFile(filePath, content)
    }
  }

  walk(baseDir)
}

function scanExtraHardcodedPatterns(content, relativeFilePath, calls) {
  // Catch `defaultValue: "..."` fallbacks that currently bypass strict key scanning.
  const defaultValuePattern = /defaultValue\s*:\s*['"`]([^'"`]+)['"`]/g
  let match
  while ((match = defaultValuePattern.exec(content)) !== null) {
    const value = match[1]
    if (isHardcodedUIString(value) && !isValidTranslationKey(value)) {
      addHardcodedWarning(relativeFilePath, content, match.index, value)
    }
  }

  // Catch direct JSX text nodes like <Typography>File Upload</Typography>.
  // Restrict to actual closing tags to avoid false positives from TS generic syntax `> ... <`.
  const jsxTextPattern = />\s*([^\n<>{}=;]{3,})\s*(?=<\/[A-Za-z])/g
  while ((match = jsxTextPattern.exec(content)) !== null) {
    const value = match[1].trim()
    if (isHardcodedUIString(value) && !isValidTranslationKey(value)) {
      addHardcodedWarning(relativeFilePath, content, match.index, value)
    }
  }

  // Catch common UI call sites using raw text.
  const uiCallPattern = /\b(?:setError|alert)\(\s*['"`]([^'"`]+)['"`]/g
  while ((match = uiCallPattern.exec(content)) !== null) {
    const value = match[1]
    if (isValidTranslationKey(value)) {
      calls.add(value)
    } else if (isHardcodedUIString(value)) {
      addHardcodedWarning(relativeFilePath, content, match.index, value)
    }
  }
}

// Extract translation key usages and hardcoded text findings from source files
function extractTranslationCalls() {
  const calls = new Set()
  scanSourceFiles(SRC_DIR, (filePath, content) => {
    const relativeFilePath = path.relative(SRC_DIR, filePath)

    // Pattern 1: direct t('key') / translate('key')
    const directPattern = /\b(?:t|translate)\(\s*['"`]([^'"`]+)['"`]/g
    let directMatch
    while ((directMatch = directPattern.exec(content)) !== null) {
      const value = directMatch[1]
      if (isValidTranslationKey(value)) {
        calls.add(value)
      } else if (isDynamicTranslationKeyTemplate(value)) {
        // Dynamic key template; skip hardcoded warning.
      } else if (isHardcodedUIString(value)) {
        addHardcodedWarning(relativeFilePath, content, directMatch.index, value)
      }
    }

    // Pattern 2: fallback t(expr || 'fallback')
    const fallbackPattern = /\b(?:t|translate)\(\s*[^)]*?\|\|\s*['"`]([^'"`]+)['"`]/g
    let fallbackMatch
    while ((fallbackMatch = fallbackPattern.exec(content)) !== null) {
      const value = fallbackMatch[1]
      if (isValidTranslationKey(value)) {
        calls.add(value)
      } else if (isDynamicTranslationKeyTemplate(value)) {
        // Dynamic key template; skip hardcoded warning.
      } else if (isHardcodedUIString(value)) {
        addHardcodedWarning(relativeFilePath, content, fallbackMatch.index, value)
      }
    }

    // Pattern 3: config fields that often carry translation keys
    const configPattern = /(?:label|description|message|placeholder|title|noFilesMessage|helperId|context)\s*[:=]\s*['"`]([^'"`]+)['"`]/g
    let configMatch
    while ((configMatch = configPattern.exec(content)) !== null) {
      const value = configMatch[1]
      if (isValidTranslationKey(value)) {
        calls.add(value)
      } else if (isHardcodedUIString(value)) {
        addHardcodedWarning(relativeFilePath, content, configMatch.index, value)
      }
    }

    scanExtraHardcodedPatterns(content, relativeFilePath, calls)
  })
  return calls
}

function scanBackendHardcodedTexts() {
  scanSourceFiles(BACKEND_PLATFORMS_DIR, (filePath, content) => {
    const normalizedPath = filePath.replace(/\\/g, '/')
    const isRelevant =
      normalizedPath.includes('/schema/') ||
      normalizedPath.includes('/api/controller') ||
      normalizedPath.includes('/api/routes')

    if (!isRelevant) return

    const relativeFilePath = path.relative(REPO_ROOT, filePath)
    const schemaFieldPattern = /(?:label|description|message|placeholder|title)\s*:\s*['"`]([^'"`]+)['"`]/g

    let match
    while ((match = schemaFieldPattern.exec(content)) !== null) {
      const value = match[1]
      if (!isValidTranslationKey(value) && isHardcodedUIString(value)) {
        addHardcodedWarning(relativeFilePath, content, match.index, value)
      }
    }
  })
}

// Validate translations
function validateTranslations(localeData, usedKeys) {
  const allKeys = new Set()

  // Collect all keys from all locales
  for (const [locale, data] of Object.entries(localeData)) {
    const flattened = flattenObject(data)
    for (const key of Object.keys(flattened)) {
      allKeys.add(key)
    }
  }

  // Check for missing translations
  for (const key of usedKeys) {
    for (const locale of locales) {
      const flattened = flattenObject(localeData[locale])
      if (!flattened[key]) {
        errors.push(`Missing translation for key "${key}" in ${locale}.json`)
      }
    }
  }

  // Check for unused translations
  for (const key of allKeys) {
    if (!usedKeys.has(key)) {
      warnings.push(`Unused translation key: "${key}"`)
    }
  }

  // Check for inconsistent translations across locales
  const keyCounts = {}
  for (const key of allKeys) {
    keyCounts[key] = 0
    for (const locale of locales) {
      const flattened = flattenObject(localeData[locale])
      if (flattened[key]) {
        keyCounts[key]++
      }
    }
  }

  for (const [key, count] of Object.entries(keyCounts)) {
    if (count > 0 && count < locales.length) {
      warnings.push(`Incomplete translation: "${key}" is only available in ${count}/${locales.length} locales`)
    }
  }
}

// Main validation function
function main() {
  console.log('🔍 Validating i18n translations...\n')

  const localeData = loadLocaleFiles()
  const usedKeys = extractTranslationCalls()
  scanBackendHardcodedTexts()

  console.log(`📊 Found ${usedKeys.size} translation keys in use`)
  console.log(`🌍 Loaded ${locales.length} locale files\n`)

  validateTranslations(localeData, usedKeys)
  addLanguageQualityWarnings(localeData, 'frontend-locales')

  const backendLocalesByPlatform = loadBackendPlatformLocales()
  for (const [platformId, platformLocaleData] of Object.entries(backendLocalesByPlatform)) {
    addLanguageQualityWarnings(platformLocaleData, `backend/platforms/${platformId}/locales`)
  }

  // Output results
  if (errors.length > 0) {
    console.log('❌ ERRORS:')
    errors.forEach(error => console.log(`  ${error}`))
    console.log()
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:')
    warnings.forEach(warning => console.log(`  ${warning}`))
    console.log()
  }

  if (hardcodedWarnings.length > 0) {
    console.log('🟠 HARDCODED UI TEXT:')
    hardcodedWarnings.forEach(({ file, line, text }) => {
      console.log(`  ${file}:${line} "${text}"`)
    })
    console.log()
  }

  if (errors.length === 0 && warnings.length === 0 && hardcodedWarnings.length === 0) {
    console.log('✅ All translations are valid!')
  } else {
    console.log(`📈 Summary: ${errors.length} errors, ${warnings.length} warnings, ${hardcodedWarnings.length} hardcoded-text findings`)
  }

  // Exit with error code if there are errors
  process.exit(errors.length > 0 ? 1 : 0)
}

main()
