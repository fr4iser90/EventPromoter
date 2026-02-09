/**
 * Reddit Playwright Publisher
 * 
 * Browser automation for publishing posts using Playwright.
 * 
 * @module platforms/reddit/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, Browser, Page } from 'playwright'
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'
import { RedditTargetService } from '../services/targetService.js'
import { RedditTargets } from '../types.js'

export interface RedditPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean }
  ): Promise<PostResult>
}

/**
 * Playwright Publisher for Reddit
 */
export class RedditPlaywrightPublisher implements RedditPublisher {
  private browser: Browser | null = null

  private async getCredentials(): Promise<any> {
    const config = await ConfigService.getConfig('reddit') || {}
    return {
      username: config.username || process.env.REDDIT_USERNAME,
      password: config.password || process.env.REDDIT_PASSWORD,
    }
  }

  /**
   * Extract subreddit names from targets configuration
   */
  private async extractSubredditsFromTargets(targetsConfig: RedditTargets): Promise<string[]> {
    if (!targetsConfig) return []

    const targetService = new RedditTargetService()
    const allTargets = await targetService.getTargets('subreddit')
    const groups = await targetService.getGroups()

    // targetType is REQUIRED - no fallbacks
    const allSubreddits = allTargets.map((t: any) => {
      if (!t.targetType) {
        console.error(`Target ${t.id} missing targetType - this should not happen`)
        return undefined
      }
      const baseField = targetService.getBaseField(t.targetType)
      return t[baseField]
    }).filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)

    if (targetsConfig.mode === 'all') {
      return allSubreddits
    } else if (targetsConfig.mode === 'groups' && targetsConfig.groups && Array.isArray(targetsConfig.groups)) {
      // Collect all subreddits from selected groups
      const subreddits: string[] = []
      const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)
      for (const groupIdentifier of targetsConfig.groups) {
        // Find group by ID or name
        const group = groupsArray.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier) as any
        if (!group || !group.targetIds || !Array.isArray(group.targetIds)) continue
        
        // Convert target IDs to subreddit names (only subreddit type targets)
        const groupSubreddits = group.targetIds
          .map((targetId: string) => {
            const target = allTargets.find((t: any) => t.id === targetId && t.targetType === 'subreddit')
            if (!target) return undefined
            if (!target.targetType) {
              console.error(`Target ${target.id} missing targetType - this should not happen`)
              return undefined
            }
            const baseField = targetService.getBaseField(target.targetType)
            return target[baseField]
          })
          .filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)
        subreddits.push(...groupSubreddits)
      }
      return [...new Set(subreddits)] // Remove duplicates
    } else if (targetsConfig.mode === 'individual' && targetsConfig.individual && Array.isArray(targetsConfig.individual)) {
      // targetType is REQUIRED - no fallbacks
      const targetMap = new Map(allTargets.map((t: any) => {
        if (!t.targetType) {
          console.error(`Target ${t.id} missing targetType - this should not happen`)
          return [t.id, undefined]
        }
        const baseField = targetService.getBaseField(t.targetType)
        return [t.id, t[baseField]]
      }).filter((entry): entry is [string, string] => entry[1] !== undefined))
      
      const individualSubreddits: string[] = targetsConfig.individual
        .map((targetId: string) => targetMap.get(targetId))
        .filter((subreddit: string | undefined): subreddit is string => subreddit !== undefined)
      return [...new Set(individualSubreddits)]
    }

    return []
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean }
  ): Promise<PostResult> {
    // DRY MODE ist standardmäßig AKTIV - nur Formular ausfüllen, kein Posten
    const dryMode = options?.dryMode ?? true
    
    try {
      const credentials = await this.getCredentials()

      if (!credentials.username || !credentials.password) {
        return {
          success: false,
          error: 'Reddit credentials not configured for Playwright publishing'
        }
      }

      // ✅ GENERIC: Validate that AT LEAST ONE target type is present
      if (!content.subreddits && !content.users) {
        return {
          success: false,
          error: 'At least one target configuration is required (subreddits or users)'
        }
      }

      // ✅ NO FALLBACKS - Validate required fields
      if (!content.title || content.title.trim().length === 0) {
        return {
          success: false,
          error: 'Title is required'
        }
      }

      if (!content.text || content.text.trim().length === 0) {
        return {
          success: false,
          error: 'Text is required'
        }
      }

      const title = content.title
      const text = content.text

      // ✅ Support subreddits (posts) OR users (DMs)
      if (content.subreddits) {
        const subreddits = await this.extractSubredditsFromTargets(content.subreddits)
        if (subreddits.length === 0) {
          return {
            success: false,
            error: 'No subreddits found in targets configuration'
          }
        }

        // DRY MODE: headless false, damit User sehen kann was passiert
        this.browser = await chromium.launch({ headless: !dryMode })
        const page = await this.browser.newPage()

        try {
          // Navigate to Reddit login (only once)
          await page.goto('https://www.reddit.com/login', { waitUntil: 'networkidle' })

          // Login (only once)
          await page.fill('input[name="username"]', credentials.username)
          await page.fill('input[name="password"]', credentials.password)
          await page.click('button[type="submit"]')
          await page.waitForURL('**/reddit.com/**', { timeout: 15000 })

          // ✅ Post to ALL subreddits
          const results: Array<{ subreddit: string; success: boolean; url?: string; postId?: string; error?: string }> = []

          for (const subreddit of subreddits) {
            try {
              // Navigate to subreddit
              await page.goto(`https://www.reddit.com/r/${subreddit}/submit`, { waitUntil: 'networkidle' })

              // Select post type
              if (files.length > 0 && files[0].url) {
                // Link or image post
                await page.click('button:has-text("Link")').catch(() => {})
              } else {
                // Text post
                await page.click('button:has-text("Post")').catch(() => {})
              }
              await page.waitForTimeout(1000)

              // Enter title
              await page.fill('textarea[placeholder*="title"]', title)

              // Enter text (for text posts) or URL (for link posts)
              if (files.length > 0 && files[0].url) {
                await page.fill('input[placeholder*="url"]', files[0].url)
              } else {
                const textArea = await page.$('div[contenteditable="true"]')
                if (textArea) {
                  await textArea.fill(text)
                }
              }

              if (dryMode) {
                // DRY MODE: Stoppe hier, User kann selbst posten
                console.log(`🔍 DRY MODE: Formular für r/${subreddit} ausgefüllt. Browser bleibt offen.`)
                results.push({
                  subreddit,
                  success: true,
                  url: page.url(),
                  postId: undefined
                })
              } else {
                // Submit post
                await page.click('button:has-text("Post")')
                await page.waitForTimeout(3000)
                
                const postUrl = await this.extractPostUrl(page, subreddit)
                const postId = postUrl ? this.extractPostId(postUrl) : undefined

                results.push({
                  subreddit,
                  success: true,
                  url: postUrl,
                  postId
                })
              }

              // Rate limiting: wait 2 seconds between posts (except for last one)
              if (subreddits.indexOf(subreddit) < subreddits.length - 1) {
                await page.waitForTimeout(2000)
              }
            } catch (error: any) {
              results.push({
                subreddit,
                success: false,
                error: error.message || 'Unknown error'
              })
            }
          }

          // Return aggregated result
          const successful = results.filter(r => r.success)
          const failed = results.filter(r => !r.success)

          if (successful.length === 0) {
            return {
              success: false,
              error: `Failed to post to all subreddits. Errors: ${failed.map(f => `${f.subreddit}: ${f.error}`).join('; ')}`
            }
          }

          // Return first successful post as primary result
          const firstSuccess = successful[0]
          return {
            success: true,
            postId: firstSuccess.postId,
            url: firstSuccess.url,
            message: dryMode 
              ? `Formular für ${successful.length}/${subreddits.length} Subreddits ausgefüllt. ${failed.length > 0 ? `Fehler: ${failed.map(f => f.subreddit).join(', ')}` : 'Alle erfolgreich.'}`
              : `Posted to ${successful.length}/${subreddits.length} subreddits. ${failed.length > 0 ? `Failed: ${failed.map(f => f.subreddit).join(', ')}` : 'All successful.'}`
          }
        } finally {
          // DRY MODE: Browser NICHT schließen, damit User sehen kann was passiert
          // Browser bleibt offen für manuelles Posten
        }
      } else if (content.users) {
        // ✅ User DMs - not yet implemented
        return {
          success: false,
          error: 'User DMs not yet implemented in Playwright publisher'
        }
      } else {
        return {
          success: false,
          error: 'Either subreddits or users target configuration is required'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to publish to Reddit via Playwright'
      }
    } finally {
      // DRY MODE: Browser NICHT schließen, damit User sehen kann was passiert
      // Browser bleibt offen für manuelles Posten
      console.log('🔍 DRY MODE: Browser bleibt offen. Schließe manuell wenn fertig.')
    }
  }

  private async extractPostUrl(page: Page, subreddit: string): Promise<string | undefined> {
    try {
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      if (currentUrl.includes(`/r/${subreddit}/comments/`)) {
        return currentUrl
      }
    } catch (error) {
      console.warn('Could not extract post URL:', error)
    }
    return undefined
  }

  private extractPostId(url?: string): string | undefined {
    if (!url) return undefined
    const match = url.match(/\/comments\/([^\/\?]+)/)
    return match ? match[1] : undefined
  }
}

export default new RedditPlaywrightPublisher()
