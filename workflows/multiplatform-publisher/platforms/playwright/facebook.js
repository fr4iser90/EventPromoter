/**
 * Facebook Playwright Poster
 * Handles posting to Facebook Pages using browser automation
 */

const { BasePlaywrightPoster } = require('./core');

class FacebookPlaywrightPoster extends BasePlaywrightPoster {
  constructor(config = {}) {
    super('facebook', config);
    this.pageId = config.pageId || process.env.FACEBOOK_PAGE_ID;
    this.pageName = config.pageName || process.env.FACEBOOK_PAGE_NAME;
  }

  getLoginUrl() {
    return 'https://www.facebook.com/login';
  }

  async verifyLogin() {
    // Check if we're logged in by looking for profile elements
    try {
      await this.page.waitForSelector('[data-pagelet="ProfileHeader"]', { timeout: 5000 });
      return true;
    } catch (error) {
      // Try alternative selectors
      const loggedInSelectors = [
        '[aria-label="Your profile"]',
        '[data-visualcompletion="ignore-dynamic"]',
        '.fb-logo'
      ];

      for (const selector of loggedInSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          return true;
        } catch (e) {
          continue;
        }
      }

      return false;
    }
  }

  async postContent(content) {
    try {
      console.log('📘 Starting Facebook post process...');

      // Navigate to the page
      if (this.pageId) {
        await this.goto(`https://www.facebook.com/${this.pageId}`);
      } else if (this.pageName) {
        await this.goto(`https://www.facebook.com/${this.pageName}`);
      } else {
        throw new Error('Facebook page ID or name required');
      }

      await this.antiDetection.randomDelay(2000, 4000);

      // Click on "Create Post" or "What's on your mind" button
      const postButtonSelectors = [
        '[aria-label="Create post"]',
        '[data-visualcompletion="ignore-dynamic"] button',
        'div[role="button"]:has-text("Create post")',
        'div[role="button"]:has-text("Was ist los?")'
      ];

      let postButtonClicked = false;
      for (const selector of postButtonSelectors) {
        try {
          await this.antiDetection.humanClick(selector);
          postButtonClicked = true;
          console.log('✅ Clicked create post button');
          break;
        } catch (error) {
          continue;
        }
      }

      if (!postButtonClicked) {
        throw new Error('Could not find create post button');
      }

      await this.antiDetection.waitForStability();

      // Wait for the post composer to appear
      await this.page.waitForSelector('[contenteditable="true"], [role="textbox"]', { timeout: 10000 });
      await this.antiDetection.randomDelay(1000, 2000);

      // Type the post content
      const textSelector = '[contenteditable="true"], [role="textbox"]';
      await this.antiDetection.humanType(textSelector, content.text);

      // Add image if provided
      if (content.imageUrl) {
        await this.addImage(content.imageUrl);
      }

      await this.antiDetection.randomDelay(1000, 2000);

      // Click the post button
      const postSelectors = [
        '[aria-label="Post"]',
        'div[role="button"]:has-text("Post")',
        'div[role="button"]:has-text("Teilen")',
        'button[type="submit"]:has-text("Post")'
      ];

      let postClicked = false;
      for (const selector of postSelectors) {
        try {
          await this.antiDetection.humanClick(selector);
          postClicked = true;
          console.log('✅ Clicked post button');
          break;
        } catch (error) {
          continue;
        }
      }

      if (!postClicked) {
        throw new Error('Could not find post button');
      }

      // Wait for post to be published
      await this.antiDetection.waitForStability();
      await this.antiDetection.randomDelay(3000, 5000);

      // Try to get the post URL
      const postUrl = await this.getPostUrl();

      console.log('✅ Facebook post published successfully');

      return {
        postId: this.extractPostId(postUrl),
        postUrl: postUrl
      };

    } catch (error) {
      console.error('❌ Facebook posting failed:', error);
      throw error;
    }
  }

  async addImage(imageUrl) {
    try {
      console.log('🖼️ Adding image to Facebook post...');

      // Look for photo/video button
      const photoSelectors = [
        '[aria-label="Photo/Video"]',
        'div[aria-label="Photo/Video"]',
        'button:has-text("Photo/Video")',
        '[data-visualcompletion="ignore-dynamic"] [role="button"]'
      ];

      let photoClicked = false;
      for (const selector of photoSelectors) {
        try {
          await this.antiDetection.humanClick(selector);
          photoClicked = true;
          console.log('✅ Clicked photo/video button');
          break;
        } catch (error) {
          continue;
        }
      }

      if (!photoClicked) {
        console.log('⚠️ Could not find photo button, continuing without image');
        return;
      }

      await this.antiDetection.waitForStability();

      // Handle file upload
      const fileInput = await this.page.$('input[type="file"]');
      if (fileInput) {
        // If we have a local file path, upload it directly
        if (content.imagePath) {
          await fileInput.setInputFiles(content.imagePath);
        } else {
          // For URLs, we need to download first (this would require additional logic)
          console.log('⚠️ URL image upload not implemented yet, skipping image');
        }
      } else {
        console.log('⚠️ File input not found, skipping image');
      }

      await this.antiDetection.randomDelay(2000, 4000);

    } catch (error) {
      console.log('⚠️ Failed to add image, continuing without it:', error.message);
    }
  }

  async getPostUrl() {
    try {
      // Try to get the current URL after posting
      const currentUrl = this.page.url();

      // If we're on a post page, return it
      if (currentUrl.includes('/posts/') || currentUrl.includes('/permalink/')) {
        return currentUrl;
      }

      // Otherwise, try to find the latest post link
      const postLinks = await this.page.$$eval('a[href*="/posts/"]', links =>
        links.map(link => link.href).slice(0, 1)
      );

      return postLinks[0] || currentUrl;
    } catch (error) {
      console.log('⚠️ Could not extract post URL:', error.message);
      return null;
    }
  }

  extractPostId(url) {
    if (!url) return null;

    const matches = url.match(/\/posts\/(\d+)/) || url.match(/\/permalink\/(\d+)/);
    return matches ? matches[1] : null;
  }
}

module.exports = FacebookPlaywrightPoster;
