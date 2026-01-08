#!/usr/bin/env node

/**
 * i18n Key Extraction Script
 * Extracts translation keys from source code and suggests missing translations
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

// Load locale files
function loadLocaleFiles() {
  const localeData = {}

  for (const locale of locales) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`)
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      localeData[locale] = JSON.parse(content)
    } catch (error) {
      console.error(`Failed to load ${locale}.json: ${error.message}`)
      process.exit(1)
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

        // Match t('key') and t("key") patterns
        const matches = content.match(/t\(['"]([^'"]+)['"]/g)
        if (matches) {
          matches.forEach(match => {
            const key = match.match(/t\(['"]([^'"]+)['"]/)[1]
            calls.add(key)
          })
        }
      }
    }
  }

  scanDirectory(SRC_DIR)
  return calls
}

// Find missing translations
function findMissingTranslations(localeData, usedKeys) {
  const missing = {}

  for (const key of usedKeys) {
    for (const locale of locales) {
      const flattened = flattenObject(localeData[locale])
      if (!flattened[key]) {
        if (!missing[locale]) missing[locale] = []
        missing[locale].push(key)
      }
    }
  }

  return missing
}

// Generate suggested translations
function generateSuggestions(missing) {
  console.log('💡 Suggested translations to add:\n')

  for (const [locale, keys] of Object.entries(missing)) {
    console.log(`🌍 ${locale.toUpperCase()}:`)
    keys.forEach(key => {
      const parts = key.split('.')
      const suggestedValue = parts[parts.length - 1]
        .replace(/([A-Z])/g, ' $1') // Add spaces before capitals
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim()

      console.log(`  "${key}": "${suggestedValue}",`)
    })
    console.log()
  }
}

// Main function
function main() {
  console.log('🔍 Extracting i18n keys from source code...\n')

  const localeData = loadLocaleFiles()
  const usedKeys = extractTranslationCalls()

  console.log(`📊 Found ${usedKeys.size} translation keys in use\n`)

  const missing = findMissingTranslations(localeData, usedKeys)

  const totalMissing = Object.values(missing).reduce((sum, keys) => sum + keys.length, 0)

  if (totalMissing === 0) {
    console.log('✅ All translation keys are present in all locales!')
  } else {
    console.log(`⚠️  Found ${totalMissing} missing translations:\n`)

    for (const [locale, keys] of Object.entries(missing)) {
      console.log(`  ${locale}: ${keys.length} missing keys`)
    }

    console.log()
    generateSuggestions(missing)
  }
}

main()
