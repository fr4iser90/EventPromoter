#!/usr/bin/env node

/**
 * Global i18n Extraction & Validation Script
 * Scans Frontend, Backend, and Platforms for translation keys.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')

const locales = ['de', 'en', 'es']

// Paths to scan
const SCAN_PATHS = [
  { name: 'Frontend', path: path.join(PROJECT_ROOT, 'frontend', 'src'), extensions: ['.js', '.jsx', '.ts', '.tsx'] },
  { name: 'Backend', path: path.join(PROJECT_ROOT, 'backend', 'src'), extensions: ['.ts'] },
]

// Locale file locations
const LOCALE_FILES = [
  { name: 'Frontend Core', path: path.join(PROJECT_ROOT, 'frontend', 'src', 'i18n', 'locales') },
  { name: 'Backend Core', path: path.join(PROJECT_ROOT, 'backend', 'src', 'i18n', 'locales') },
]

// Load all locale files into a unified structure
function loadAllLocales() {
  const data = {
    frontend: {},
    backend: {},
    platforms: {}
  }

  // Load Frontend Core
  for (const locale of locales) {
    const filePath = path.join(PROJECT_ROOT, 'frontend', 'src', 'i18n', 'locales', `${locale}.json`)
    if (fs.existsSync(filePath)) {
      data.frontend[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
  }

  // Load Backend Core
  for (const locale of locales) {
    const filePath = path.join(PROJECT_ROOT, 'backend', 'src', 'i18n', 'locales', `${locale}.json`)
    if (fs.existsSync(filePath)) {
      data.backend[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
  }

  // Load Platforms
  const platformsPath = path.join(PROJECT_ROOT, 'backend', 'src', 'platforms')
  if (fs.existsSync(platformsPath)) {
    const platforms = fs.readdirSync(platformsPath).filter(f => fs.statSync(path.join(platformsPath, f)).isDirectory())
    for (const platform of platforms) {
      data.platforms[platform] = {}
      for (const locale of locales) {
        const filePath = path.join(platformsPath, platform, 'locales', `${locale}.json`)
        if (fs.existsSync(filePath)) {
          data.platforms[platform][locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        }
      }
    }
  }

  return data
}

// Flatten nested object to dot notation
function flattenObject(obj, prefix = '') {
  const result = {}
  if (!obj) return result

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

// Extract keys from a file
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const keys = new Set()
  
  // Match t('key'), t("key"), i18n.t('key'), etc.
  const regex = /(?:t|i18n\.t)\(['"]([^'"]+)['"]/g
  let match
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1])
  }
  return keys
}

// Scan directories for keys
function scanForKeys() {
  const allKeys = new Set()
  
  function walk(dir, extensions) {
    if (!fs.existsSync(dir)) return
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const fullPath = path.join(dir, file)
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && !file.startsWith('.')) {
          walk(fullPath, extensions)
        }
      } else if (extensions.includes(path.extname(file))) {
        const keys = extractKeysFromFile(fullPath)
        keys.forEach(k => allKeys.add(k))
      }
    }
  }

  for (const scan of SCAN_PATHS) {
    walk(scan.path, scan.extensions)
  }

  return allKeys
}

function main() {
  console.log('🔍 Starting Global i18n Analysis...\n')
  
  const localeData = loadAllLocales()
  const usedKeys = scanForKeys()
  
  console.log(`📊 Found ${usedKeys.size} unique translation keys in use project-wide.\n`)

  const missing = {}
  locales.forEach(l => missing[l] = [])

  // Check each used key
  for (const key of usedKeys) {
    for (const locale of locales) {
      let found = false
      
      // 1. Check Frontend Core (flattened)
      if (flattenObject(localeData.frontend[locale])[key]) found = true
      
      // 2. Check Backend Core (flattened, with namespace)
      if (!found && key.includes(':')) {
        const [ns, realKey] = key.split(':')
        if (ns === 'errors' || ns === 'validation' || ns === 'common') {
          if (flattenObject(localeData.backend[locale][ns])[realKey]) found = true
        }
      } else if (!found) {
        if (flattenObject(localeData.backend[locale])[key]) found = true
      }

      // 3. Check Platforms
      if (!found) {
        for (const platform of Object.keys(localeData.platforms)) {
          if (flattenObject(localeData.platforms[platform][locale])[key]) {
            found = true
            break
          }
        }
      }

      if (!found) {
        missing[locale].push(key)
      }
    }
  }

  // Report
  let hasMissing = false
  for (const locale of locales) {
    if (missing[locale].length > 0) {
      hasMissing = true
      console.log(`❌ ${locale.toUpperCase()}: ${missing[locale].length} missing keys`)
      // Show first 5 missing keys
      missing[locale].slice(0, 5).forEach(k => console.log(`   - ${k}`))
      if (missing[locale].length > 5) console.log(`   ... and ${missing[locale].length - 5} more`)
    } else {
      console.log(`✅ ${locale.toUpperCase()}: All keys present`)
    }
  }

  // Platform Coverage Report
  console.log('\n🏗️  Platform Coverage:')
  for (const platform of Object.keys(localeData.platforms)) {
    const counts = locales.map(l => Object.keys(flattenObject(localeData.platforms[platform][l])).length)
    const max = Math.max(...counts)
    console.log(`   ${platform.padEnd(15)}: ` + locales.map((l, i) => {
      const count = counts[i]
      const percent = max === 0 ? 100 : Math.round((count / max) * 100)
      return `${l.toUpperCase()}: ${percent}% (${count})`
    }).join(' | '))
  }

  if (!hasMissing) {
    console.log('\n✨ Excellent! No missing translations found.')
  } else {
    console.log('\n⚠️  Some translations are missing. Use the report above to fix them.')
  }
}

main()
