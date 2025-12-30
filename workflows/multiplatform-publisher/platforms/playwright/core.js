/**
 * Core Playwright functionality for social media automation
 * Provides base classes and utilities for all platform implementations
 */

const { chromium } = require('playwright');
const AntiDetection = require('./anti-detection');

class PlaywrightCore {
  constructor(platform, config = {}) {
    this.platform = platform;
    this.config = {
      headless: config.headless !== false,
      slowMo: config.slowMo || 100,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      userAgent: config.userAgent,
      viewport: config.viewport || { width: 1920, height: 1080 },
      ...config
    };

    this.browser = null;
    this.context = null;
    this.page = null;
    this.antiDetection = null;
  }

  /**
   * Initialize browser and page
   */
  async initialize() {
    try {
      console.log(`🚀 Initializing Playwright for ${this.platform}...`);

      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const result = await AntiDetection.setupBrowserContext(this.browser, this.config);
      this.context = result.context;
      this.page = result.page;
      this.antiDetection = new AntiDetection(this.page, this.config);

      // Set default timeout
      this.page.setDefaultTimeout(this.config.timeout);

      console.log(`✅ Playwright initialized for ${this.platform}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize Playwright for ${this.platform}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();

      console.log(`🧹 Cleaned up Playwright resources for ${this.platform}`);
    } catch (error) {
      console.error(`❌ Error during cleanup for ${this.platform}:`, error);
    }
  }

  /**
   * Navigate to URL with stability check
   */
  async goto(url, options = {}) {
    console.log(`🌐 Navigating to ${url}...`);

    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: this.config.timeout,
      ...options
    });

    await this.antiDetection.waitForStability();
    console.log(`✅ Navigation complete`);
  }

  /**
   * Login to platform
   */
  async login(username, password) {
    console.log(`🔐 Logging in to ${this.platform}...`);

    try {
      // Navigate to login page
      await this.goto(this.getLoginUrl());

      // Enter credentials with human-like behavior
      await this.antiDetection.humanType('[name="username"], [name="email"], #username, #email', username);
      await this.antiDetection.randomDelay();

      await this.antiDetection.humanType('[name="password"], #password', password);
      await this.antiDetection.randomDelay();

      // Click login button
      await this.antiDetection.humanClick('[type="submit"], button[type="submit"], .login-button, #login-button');

      // Wait for login to complete
      await this.antiDetection.waitForStability();

      // Check for 2FA or additional verification
      const has2FA = await this.checkFor2FA();
      if (has2FA) {
        throw new Error('2FA required - manual intervention needed');
      }

      // Verify login success
      const isLoggedIn = await this.verifyLogin();
      if (!isLoggedIn) {
        throw new Error('Login verification failed');
      }

      console.log(`✅ Successfully logged in to ${this.platform}`);
      return true;
    } catch (error) {
      console.error(`❌ Login failed for ${this.platform}:`, error);
      throw error;
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(filename) {
    const path = `debug-${this.platform}-${filename || Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: true });
    console.log(`📸 Screenshot saved: ${path}`);
  }

  /**
   * Check for 2FA requirement
   */
  async checkFor2FA() {
    const twoFAIndicators = [
      '2fa', 'two-factor', 'verification code', 'authenticator',
      'sms', 'email verification', 'security code'
    ];

    const pageText = await this.page.textContent('body');
    return twoFAIndicators.some(indicator =>
      pageText.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Abstract methods to be implemented by platform-specific classes
   */
  getLoginUrl() {
    throw new Error('getLoginUrl() must be implemented by subclass');
  }

  async verifyLogin() {
    throw new Error('verifyLogin() must be implemented by subclass');
  }

  async postContent(content) {
    throw new Error('postContent() must be implemented by subclass');
  }
}

/**
 * Base poster class that handles the complete posting workflow
 */
class BasePlaywrightPoster extends PlaywrightCore {
  constructor(platform, config = {}) {
    super(platform, config);
    this.isLoggedIn = false;
  }

  /**
   * Complete posting workflow
   */
  async post(content) {
    let result = { success: false, platform: this.platform };

    try {
      // Initialize if not already done
      if (!this.browser) {
        await this.initialize();
      }

      // Login if not already logged in
      if (!this.isLoggedIn) {
        await this.login(
          process.env[`${this.platform.toUpperCase()}_USERNAME`] || this.config.username,
          process.env[`${this.platform.toUpperCase()}_PASSWORD`] || this.config.password
        );
        this.isLoggedIn = true;
      }

      // Post content
      console.log(`📝 Posting content to ${this.platform}...`);
      const postResult = await this.postContent(content);

      result = {
        success: true,
        platform: this.platform,
        postId: postResult.postId,
        postUrl: postResult.postUrl,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Successfully posted to ${this.platform}`);

    } catch (error) {
      console.error(`❌ Posting failed on ${this.platform}:`, error.message);

      // Take screenshot for debugging
      try {
        await this.takeScreenshot(`error-${Date.now()}`);
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }

      result = {
        success: false,
        platform: this.platform,
        error: error.message,
        timestamp: new Date().toISOString()
      };

    } finally {
      // Don't cleanup here - keep session alive for multiple posts
      // Cleanup will be called externally when done
    }

    return result;
  }

  /**
   * Cleanup and logout
   */
  async close() {
    await this.cleanup();
    this.isLoggedIn = false;
  }
}

module.exports = {
  PlaywrightCore,
  BasePlaywrightPoster,
  AntiDetection
};
