// Config service for managing application configurations

import { EmailConfig, AppConfig } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'

export class ConfigService {
  // Email configuration
  static async getEmailConfig(): Promise<EmailConfig | null> {
    return await readConfig('emails.json')
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
}
