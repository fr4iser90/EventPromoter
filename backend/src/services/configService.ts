// Config service for managing application configurations

import { EmailConfig, AppConfig } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'

export class ConfigService {
  // Email configuration
  static async getEmailConfig(): Promise<EmailConfig | null> {
    const config = await readConfig('emails.json')
    console.log(`📧 Loading emails config:`, config)
    return config
  }

  static async saveEmailConfig(config: EmailConfig): Promise<boolean> {
    return await writeConfig('emails.json', config)
  }
  
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
    const current = await this.getAppConfig()
    if (!current) {
      return false
    }
    return await this.saveAppConfig({ ...current, ...updates })
  }

  static async updateEmailConfig(updates: Partial<EmailConfig>): Promise<boolean> {
    const current = await this.getEmailConfig()
    if (!current) {
      return false
    }
    return await this.saveEmailConfig({ ...current, ...updates })
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

  // Platform settings from environment variables
  static getPlatformSettings(platform: string): Record<string, any> {
    const settings: Record<string, any> = {}
    const prefix = platform.toUpperCase()

    // Common patterns for different platforms
    const patterns = {
      email: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'FROM_EMAIL', 'FROM_NAME'],
      facebook: ['APP_ID', 'APP_SECRET', 'ACCESS_TOKEN'],
      twitter: ['API_KEY', 'API_SECRET', 'ACCESS_TOKEN', 'ACCESS_TOKEN_SECRET'],
      instagram: ['ACCESS_TOKEN', 'CLIENT_ID'],
      linkedin: ['CLIENT_ID', 'CLIENT_SECRET', 'ACCESS_TOKEN'],
      reddit: ['CLIENT_ID', 'CLIENT_SECRET', 'USERNAME', 'PASSWORD']
    }

    const platformPatterns = patterns[platform as keyof typeof patterns] || []
    platformPatterns.forEach(pattern => {
      const envKey = `${prefix}_${pattern}`
      const value = this.getEnvVar(envKey)
      if (value) {
        // Convert pattern to camelCase for settings
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
