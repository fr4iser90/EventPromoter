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

  // ✅ Platform settings come only from stored app configuration.
  // No environment-variable fallback to keep runtime behavior deterministic.
  static async getPlatformSettings(platform: string): Promise<Record<string, any>> {
    // ✅ SECURITY: Load from stored config file (user-saved settings)
    try {
      const configName = `platform-${platform}-settings`
      const storedConfig = await this.getConfig(configName)
      if (storedConfig && typeof storedConfig === 'object') {
        // ✅ SECURITY: Decrypt encrypted secrets before returning
        const { decryptSecrets } = await import('../utils/secretsManager.js')
        return decryptSecrets(storedConfig)
      }
    } catch {
      // Config file missing/invalid -> treat as not configured
    }

    return {}
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
