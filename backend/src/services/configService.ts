// ✅ GENERIC: Config service for managing application configurations
// No hardcoded platform types - all configs are generic

import { AppConfig } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'

export class ConfigService {
 
  // App configuration
  static async getAppConfig(): Promise<AppConfig | null> {
    return await readConfig('app.json')
  }

  static async saveAppConfig(config: AppConfig): Promise<boolean> {
    const updatedConfig = {
      ...config,
      lastUpdated: new Date().toISOString()
    }
    return await writeConfig('app.json', updatedConfig)
  }

  // Generic config methods
  static async getConfig(name: string): Promise<any> {
    return await readConfig(`${name}.json`)
  }

  static async saveConfig(name: string, config: any): Promise<boolean> {
    return await writeConfig(`${name}.json`, config)
  }

  static async updateAppConfig(updates: Partial<AppConfig>): Promise<boolean> {
    const current = await this.getAppConfig() || {}
    // Merge updates with current config (updates take precedence) - NO FALLBACKS, only real data
    const merged: AppConfig = {
      ...current,
      ...updates
    }
    return await this.saveAppConfig(merged)
  }

  // Environment variable access
  static getEnvVar(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue
  }

  static getRequiredEnvVar(key: string): string {
    const value = process.env[key]
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    return value
  }

  // ✅ GENERIC: Platform settings from stored config or environment variables
  // Settings come from platform schema, not hardcoded patterns
  static async getPlatformSettings(platform: string): Promise<Record<string, any>> {
    // ✅ SECURITY: First try to load from stored config file (user-saved settings)
    try {
      const configName = `platform-${platform}-settings`
      const storedConfig = await this.getConfig(configName)
      if (storedConfig && typeof storedConfig === 'object') {
        // ✅ SECURITY: Decrypt encrypted secrets before returning
        const { decryptSecrets } = await import('../utils/secretsManager.js')
        return decryptSecrets(storedConfig)
      }
    } catch (error) {
      // Config file doesn't exist yet, continue to env vars
    }

    // Fallback: Load from environment variables
    const settings: Record<string, any> = {}
    const prefix = platform.toUpperCase()

    // ✅ GENERIC: Load settings from PlatformRegistry to get required env vars
    try {
      const { getPlatformRegistry, initializePlatformRegistry } = require('./platformRegistry.js')
      const registry = getPlatformRegistry()
      if (!registry.isInitialized()) {
        // Don't await - just try to get schema if available
        initializePlatformRegistry().catch(() => {})
      }

      const platformModule = registry.getPlatform(platform)
      if (platformModule?.schema?.settings) {
        // Extract env var names from schema fields
        const schemaFields = platformModule.schema.settings.fields || []
        schemaFields.forEach((field: any) => {
          // Try common env var patterns
          const envVarName = `${prefix}_${field.name.toUpperCase()}`
          const value = this.getEnvVar(envVarName)
          if (value) {
            settings[field.name] = value
          }
        })
      }
    } catch (error) {
      // If registry not available, fall back to generic pattern matching
      console.warn(`Could not load platform schema for ${platform}, using generic env var detection`)
    }

    // Generic fallback: try common env var patterns
    const commonPatterns = ['API_KEY', 'API_SECRET', 'ACCESS_TOKEN', 'CLIENT_ID', 'CLIENT_SECRET', 'USERNAME', 'PASSWORD']
    commonPatterns.forEach(pattern => {
      const envKey = `${prefix}_${pattern}`
      const value = this.getEnvVar(envKey)
      if (value && !settings[pattern.toLowerCase()]) {
        const settingKey = pattern.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        settings[settingKey] = value
      }
    })

    return settings
  }

  // User preferences
  static async getUserPreferences(): Promise<any> {
    return await this.getConfig('user-preferences')
  }

  static async saveUserPreferences(preferences: any): Promise<boolean> {
    const updatedPreferences = {
      ...preferences,
      lastUpdated: new Date().toISOString()
    }
    return await this.saveConfig('user-preferences', updatedPreferences)
  }

  static async updateUserPreferences(updates: Partial<any>): Promise<boolean> {
    const current = await this.getUserPreferences() || {}
    return await this.saveUserPreferences({ ...current, ...updates })
  }
}
