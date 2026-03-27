/**
 * Vite Plugin for i18n Validation
 * Runs i18n validation during build time
 */

import { execFileSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function i18nCheckPlugin() {
  return {
    name: 'vite-plugin-i18n-check',
    buildStart() {
      console.log('🔍 Running i18n validation...')

      try {
        const scriptPath = path.join(__dirname, 'validate-i18n.js')
        execFileSync('node', [scriptPath], {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        })
        console.log('✅ i18n validation passed')
      } catch (error) {
        console.error('❌ i18n validation failed')
        throw new Error('i18n validation failed. Please fix translation issues before building.')
      }
    }
  }
}
