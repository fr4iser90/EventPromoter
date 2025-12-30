/**
 * Platform Configuration Loader
 * Loads and validates all platform-specific configurations
 */

const fs = require('fs');
const path = require('path');

class PlatformConfigLoader {
  constructor() {
    this.configs = {};
    this.platformsDir = path.join(__dirname);
    this.loadAllConfigs();
  }

  loadAllConfigs() {
    const configFiles = fs.readdirSync(this.platformsDir)
      .filter(file => file.endsWith('.json') && file !== 'index.js');

    console.log('📁 Loading platform configurations...');

    for (const file of configFiles) {
      const platformName = file.replace('.json', '');
      const configPath = path.join(this.platformsDir, file);

      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.validateConfig(platformName, config);
        this.configs[platformName] = config;
        console.log(`✅ Loaded config for ${platformName}`);
      } catch (error) {
        console.error(`❌ Failed to load ${platformName} config:`, error.message);
      }
    }

    console.log(`📊 Loaded ${Object.keys(this.configs).length} platform configurations`);
  }

  validateConfig(platformName, config) {
    // Basic validation
    if (!config.platform) {
      throw new Error(`Missing 'platform' field in ${platformName}.json`);
    }

    if (typeof config.enabled !== 'boolean') {
      throw new Error(`Missing or invalid 'enabled' field in ${platformName}.json`);
    }

    // Platform-specific validations
    switch (platformName) {
      case 'reddit':
        if (config.posting?.requireSubreddit && !config.posting?.defaultSubreddit) {
          console.warn(`⚠️  Reddit requires default subreddit but none specified`);
        }
        break;

      case 'facebook':
        if (config.posting?.targetPage && !config.credentials?.FACEBOOK_PAGE_ID) {
          console.warn(`⚠️  Facebook page posting enabled but no PAGE_ID specified`);
        }
        break;

      case 'email':
        if (!config.recipients?.defaultLists?.fans) {
          console.warn(`⚠️  Email platform enabled but no default recipients configured`);
        }
        break;
    }
  }

  getConfig(platformName) {
    return this.configs[platformName];
  }

  getAllConfigs() {
    return this.configs;
  }

  getEnabledPlatforms() {
    return Object.entries(this.configs)
      .filter(([_, config]) => config.enabled)
      .map(([name, _]) => name);
  }

  getPlatformConfig(platformName, key) {
    const config = this.configs[platformName];
    if (!config) return null;

    return key ? config[key] : config;
  }

  updateConfig(platformName, newConfig) {
    if (!this.configs[platformName]) {
      throw new Error(`Platform ${platformName} not found`);
    }

    // Merge new config with existing
    this.configs[platformName] = {
      ...this.configs[platformName],
      ...newConfig
    };

    // Save to file
    const configPath = path.join(this.platformsDir, `${platformName}.json`);
    fs.writeFileSync(configPath, JSON.stringify(this.configs[platformName], null, 2));

    console.log(`💾 Updated config for ${platformName}`);
  }

  // Helper methods for common queries
  getEmailRecipients(listName = 'fans') {
    const emailConfig = this.configs.email;
    if (!emailConfig?.recipients?.defaultLists?.[listName]) {
      return [];
    }
    return emailConfig.recipients.defaultLists[listName];
  }

  getRedditSubreddits() {
    const redditConfig = this.configs.reddit;
    return redditConfig?.posting?.allowedSubreddits || [];
  }

  getFacebookPageInfo() {
    const fbConfig = this.configs.facebook;
    return {
      pageId: fbConfig?.credentials?.FACEBOOK_PAGE_ID,
      pageName: fbConfig?.credentials?.FACEBOOK_PAGE_NAME
    };
  }

  getNotificationSettings(platform) {
    const notifConfig = this.configs.notifications;
    return notifConfig?.[platform] || {};
  }
}

// Singleton instance
const platformConfigs = new PlatformConfigLoader();

module.exports = platformConfigs;
