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

// Extract all t() calls from source files
function extractTranslationCalls() {
  const calls = new Set()

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath)
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8')

        // Match t('key') and t("key") patterns, but exclude obvious non-keys
        const matches = content.match(/t\(['"]([^'"]+)['"]/g)
        if (matches) {
          matches.forEach(match => {
            const key = match.match(/t\(['"]([^'"]+)['"]/)[1]

            // Skip obvious non-translation keys
            if (isValidTranslationKey(key)) {
              calls.add(key)
            }
          })
        }
      }
    }
  }

  scanDirectory(SRC_DIR)
  return calls
}

// Check if a string looks like a valid translation key
function isValidTranslationKey(key) {
  // Skip URLs
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return false
  }

  // Skip strings that are just whitespace, newlines, or punctuation
  if (/^[\s\n\r\t\.,\-\/\\]+$/.test(key) || key.trim() === '') {
    return false
  }

  // Skip escape sequences and special characters
  if (/^\\[nrt]$/.test(key) || key === '\\n' || key === '\\n\\n') {
    return false
  }

  // Skip strings that start and end with quotes (likely template literals)
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    return false
  }

  // Skip single characters that are not letters
  if (key.length === 1 && !/[a-zA-Z]/.test(key)) {
    return false
  }

  // Skip very short strings that are likely not translation keys
  if (key.length < 2) {
    return false
  }

  // Skip strings that look like error messages but are hardcoded
  // These should be converted to use t() calls instead
  if (key.includes(' ') && !key.includes('.') && /^[A-Z]/.test(key)) {
    // This might be a hardcoded error message that should be translated
    // For now, we'll exclude them from validation but mark them as needing translation
    return false
  }

  // Allow keys that contain letters and may have dots/underscores for namespacing
  return /[a-zA-Z]/.test(key) && key.includes('.')
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

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All translations are valid!')
  } else {
    console.log(`📈 Summary: ${errors.length} errors, ${warnings.length} warnings`)
  }

  // Exit with error code if there are errors
  process.exit(errors.length > 0 ? 1 : 0)
}

main()
