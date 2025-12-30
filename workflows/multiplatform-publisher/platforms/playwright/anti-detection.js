/**
 * Anti-Detection Measures for Playwright
 * Implements human-like behavior to avoid bot detection
 */

class AntiDetection {
  constructor(page, options = {}) {
    this.page = page;
    this.options = {
      slowMo: options.slowMo || 100,
      randomDelay: options.randomDelay || [500, 2000],
      typingDelay: options.typingDelay || [50, 150],
      ...options
    };
  }

  /**
   * Setup browser context with anti-detection measures
   */
  static async setupBrowserContext(browser, options = {}) {
    const context = await browser.newContext({
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: options.viewport || { width: 1920, height: 1080 },
      locale: options.locale || 'de-DE',
      timezoneId: options.timezoneId || 'Europe/Berlin',
      permissions: ['notifications'],
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await context.newPage();

    // Apply anti-detection measures
    await AntiDetection.applyAntiDetection(page);

    return { context, page };
  }

  /**
   * Apply comprehensive anti-detection measures
   */
  static async applyAntiDetection(page) {
    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver flag
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', description: '', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' }
        ]
      });

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['de-DE', 'de', 'en-US', 'en']
      });

      // Mock permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Mock hardware concurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });

      // Mock device memory
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

      // Override chrome object
      window.chrome = {
        runtime: {},
        app: { isInstalled: false }
      };
    });

    // Add realistic viewport size variation
    await page.setViewportSize({
      width: 1920 + Math.floor(Math.random() * 100) - 50,
      height: 1080 + Math.floor(Math.random() * 100) - 50
    });
  }

  /**
   * Human-like click with mouse movement
   */
  async humanClick(selector, options = {}) {
    const element = await this.page.locator(selector);
    const box = await element.boundingBox();

    if (!box) {
      throw new Error(`Element ${selector} not found or not visible`);
    }

    // Random position within element
    const x = box.x + Math.random() * box.width;
    const y = box.y + Math.random() * box.height;

    // Move mouse to random position first
    await this.page.mouse.move(
      Math.random() * 800 + 100,
      Math.random() * 600 + 100
    );

    // Small delay
    await this.randomDelay(200, 500);

    // Move to target position with slight curve
    await this.page.mouse.move(x, y, { steps: 10 });

    // Final delay before click
    await this.randomDelay(300, 800);

    await this.page.mouse.click(x, y, options);
  }

  /**
   * Human-like typing with variable delays
   */
  async humanType(selector, text, options = {}) {
    const element = await this.page.locator(selector);

    // Focus element first
    await element.focus();
    await this.randomDelay();

    // Type character by character with varying delays
    for (const char of text) {
      await this.page.keyboard.type(char);
      await this.randomDelay(
        this.options.typingDelay[0],
        this.options.typingDelay[1]
      );
    }
  }

  /**
   * Random delay between actions
   */
  async randomDelay(min = this.options.randomDelay[0], max = this.options.randomDelay[1]) {
    const delay = Math.random() * (max - min) + min;
    await this.page.waitForTimeout(delay);
  }

  /**
   * Human-like scrolling
   */
  async humanScroll(distance = 500, steps = 10) {
    const stepSize = distance / steps;

    for (let i = 0; i < steps; i++) {
      await this.page.mouse.wheel(0, stepSize);
      await this.randomDelay(50, 150);
    }
  }

  /**
   * Wait for page to be fully loaded and stable
   */
  async waitForStability(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout });

    // Additional wait for dynamic content
    await this.randomDelay(1000, 2000);
  }

  /**
   * Check if page shows bot detection warning
   */
  async checkForBotDetection() {
    const botIndicators = [
      'robot',
      'bot',
      'captcha',
      'verification',
      'automated',
      'suspicious activity'
    ];

    const pageText = await this.page.textContent('body');
    const hasBotDetection = botIndicators.some(indicator =>
      pageText.toLowerCase().includes(indicator.toLowerCase())
    );

    if (hasBotDetection) {
      console.warn('🚨 Bot detection warning detected on page');
      return true;
    }

    return false;
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.page.waitForTimeout(delay);
      }
    }
  }
}

module.exports = AntiDetection;
