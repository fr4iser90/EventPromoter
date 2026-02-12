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
const LOCALES_DIR = path.join(ROOT_DIR, 'src', 'i18n', 'locales')
const SRC_DIR = path.join(ROOT_DIR, 'src')

const locales = ['de', 'en', 'es']
const errors = []
const warnings = []
const hardcodedWarnings = []

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

// Extract translation key usages and hardcoded text findings from source files
function extractTranslationCalls() {
  const calls = new Set()
  const supportedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath)
        continue
      }

      if (!supportedExtensions.has(path.extname(file)) || file.endsWith('.d.ts')) {
        continue
      }

      const content = fs.readFileSync(filePath, 'utf8')
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
      // Exclude defaultValue on purpose: defaults are fallback copy and would create noisy duplicate findings.
      const configPattern = /(?:label|description|message|placeholder|title|noFilesMessage|helperId|context)\s*[:=]\s*['"`]([^'"`]+)['"`]/g
      let configMatch
      while ((configMatch = configPattern.exec(content)) !== null) {
        const value = configMatch[1]
        if (isValidTranslationKey(value)) {
          calls.add(value)
        }
      }
    }
  }

  scanDirectory(SRC_DIR)
  return calls
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

  console.log(`📊 Found ${usedKeys.size} translation keys in use`)
  console.log(`🌍 Loaded ${locales.length} locale files\n`)

  validateTranslations(localeData, usedKeys)

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
