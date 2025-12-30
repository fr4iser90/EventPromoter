/**
 * Hybrid Poster - Combines API and Playwright approaches
 * Tries API first, falls back to Playwright for maximum reliability
 */

class HybridPoster {
  constructor(platform, config = {}) {
    this.platform = platform;
    this.config = {
      mode: config.mode || 'hybrid', // 'api-only', 'playwright-only', 'hybrid'
      apiRetries: config.apiRetries || 2,
      playwrightRetries: config.playwrightRetries || 1,
      ...config
    };

    // Initialize poster instances
    this.apiPoster = null;
    this.playwrightPoster = null;

    this.initializePosters();
  }

  initializePosters() {
    try {
      // Try to load API poster
      const apiPosterPath = `./api/${this.platform}.js`;
      try {
        const APIPoster = require(apiPosterPath);
        this.apiPoster = new APIPoster(this.config.api || {});
      } catch (error) {
        console.log(`⚠️ API poster for ${this.platform} not available:`, error.message);
      }

      // Try to load Playwright poster
      const playwrightPosterPath = `./playwright/${this.platform}.js`;
      try {
        const PlaywrightPoster = require(playwrightPosterPath);
        this.playwrightPoster = new PlaywrightPoster(this.config.playwright || {});
      } catch (error) {
        console.log(`⚠️ Playwright poster for ${this.platform} not available:`, error.message);
      }

    } catch (error) {
      console.error(`❌ Failed to initialize posters for ${this.platform}:`, error);
    }
  }

  async post(content) {
    const result = {
      platform: this.platform,
      method: null,
      success: false,
      timestamp: new Date().toISOString()
    };

    // API-Only Mode
    if (this.config.mode === 'api-only') {
      if (!this.apiPoster) {
        throw new Error(`API poster not available for ${this.platform} in API-only mode`);
      }

      console.log(`🔌 Posting to ${this.platform} via API only...`);
      result.method = 'api';

      try {
        const apiResult = await this.retryAPI(content, this.config.apiRetries);
        return { ...result, ...apiResult, success: true };
      } catch (error) {
        console.error(`❌ API posting failed for ${this.platform}:`, error.message);
        return { ...result, error: error.message };
      }
    }

    // Playwright-Only Mode
    if (this.config.mode === 'playwright-only') {
      if (!this.playwrightPoster) {
        throw new Error(`Playwright poster not available for ${this.platform} in Playwright-only mode`);
      }

      console.log(`🎭 Posting to ${this.platform} via Playwright only...`);
      result.method = 'playwright';

      try {
        const playwrightResult = await this.retryPlaywright(content, this.config.playwrightRetries);
        return { ...result, ...playwrightResult, success: true };
      } catch (error) {
        console.error(`❌ Playwright posting failed for ${this.platform}:`, error.message);
        return { ...result, error: error.message };
      }
    }

    // Hybrid Mode (Default)
    console.log(`🔄 Posting to ${this.platform} in hybrid mode...`);

    // Try API first
    if (this.apiPoster) {
      try {
        console.log(`🔌 Trying API first for ${this.platform}...`);
        const apiResult = await this.retryAPI(content, this.config.apiRetries);
        console.log(`✅ API posting successful for ${this.platform}`);
        return {
          ...result,
          method: 'api',
          ...apiResult,
          success: true
        };
      } catch (error) {
        console.log(`⚠️ API failed for ${this.platform}, trying Playwright:`, error.message);
      }
    } else {
      console.log(`⚠️ No API poster available for ${this.platform}, skipping to Playwright`);
    }

    // Fallback to Playwright
    if (this.playwrightPoster) {
      try {
        console.log(`🎭 Falling back to Playwright for ${this.platform}...`);
        const playwrightResult = await this.retryPlaywright(content, this.config.playwrightRetries);
        console.log(`✅ Playwright posting successful for ${this.platform}`);
        return {
          ...result,
          method: 'playwright',
          ...playwrightResult,
          success: true
        };
      } catch (error) {
        console.error(`❌ Playwright fallback also failed for ${this.platform}:`, error.message);
        return {
          ...result,
          method: 'playwright-failed',
          error: error.message
        };
      }
    } else {
      console.error(`❌ No Playwright poster available for ${this.platform}`);
      return {
        ...result,
        error: 'No posting methods available'
      };
    }
  }

  async retryAPI(content, retries) {
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.apiPoster.post(content);
      } catch (error) {
        lastError = error;
        console.log(`API attempt ${attempt}/${retries} failed for ${this.platform}:`, error.message);

        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  async retryPlaywright(content, retries) {
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.playwrightPoster.post(content);
      } catch (error) {
        lastError = error;
        console.log(`Playwright attempt ${attempt}/${retries} failed for ${this.platform}:`, error.message);

        if (attempt < retries) {
          // Wait before retry (longer delay for Playwright)
          const delay = Math.pow(2, attempt) * 2000;
          console.log(`Waiting ${delay}ms before Playwright retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  async cleanup() {
    // Cleanup API poster if it has cleanup method
    if (this.apiPoster && typeof this.apiPoster.cleanup === 'function') {
      try {
        await this.apiPoster.cleanup();
      } catch (error) {
        console.error(`Error cleaning up API poster for ${this.platform}:`, error);
      }
    }

    // Cleanup Playwright poster
    if (this.playwrightPoster && typeof this.playwrightPoster.close === 'function') {
      try {
        await this.playwrightPoster.close();
      } catch (error) {
        console.error(`Error cleaning up Playwright poster for ${this.platform}:`, error);
      }
    }
  }

  /**
   * Get available methods for this platform
   */
  getAvailableMethods() {
    return {
      platform: this.platform,
      api: !!this.apiPoster,
      playwright: !!this.playwrightPoster,
      mode: this.config.mode
    };
  }
}

module.exports = HybridPoster;
