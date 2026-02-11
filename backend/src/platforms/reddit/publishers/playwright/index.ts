/**
 * Reddit Playwright Publisher
 * 
 * Browser automation for publishing posts using Playwright.
 * 
 * @module platforms/reddit/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, BrowserContext, Page } from 'playwright'
import { PostResult } from '../../../../types/index.js'
import { RedditTargets } from '../../types.js'
import { RedditPublisher } from '../api.js'
import { PublisherEventService, EventAwarePublisher } from '../../../../services/publisherEventService.js'

// Utils
import { waitForPageFullyLoaded } from './utils/waitForPageFullyLoaded.js'
import { executeStep } from './utils/executeStep.js'
import { getCredentials } from './utils/getCredentials.js'
import { isLoggedIn } from './utils/isLoggedIn.js'
import { getLoggedInUsername } from './utils/getLoggedInUsername.js'
import { login } from './utils/login.js'
import { extractSubredditsFromTargets } from './utils/extractSubredditsFromTargets.js'
import { extractPostUrl } from './utils/extractPostUrl.js'
import { extractPostId } from './utils/extractPostId.js'

// Steps
import { step1_LoginCheck } from './steps/step1_LoginCheck.js'
import { step2_NavigateToSubmitPage } from './steps/step2_NavigateToSubmitPage.js'
import { step3_SelectPostType } from './steps/step3_SelectPostType.js'
import { step4_EnterTitle } from './steps/step4_EnterTitle.js'
import { step5_EnterContent } from './steps/step5_EnterContent.js'
import { step6_Submit } from './steps/step6_Submit.js'

/**
 * Playwright Publisher for Reddit
 */
export class RedditPlaywrightPublisher implements RedditPublisher, EventAwarePublisher {
  private browser: BrowserContext | null = null
  private eventEmitter?: PublisherEventService
  private publishRunId?: string

  setEventEmitter(emitter: PublisherEventService): void {
    this.eventEmitter = emitter
    // ✅ FIX: publishRunId wird jetzt von PublishingService übergeben, nicht hier generiert
    // this.publishRunId wird via setPublishRunId() gesetzt
  }

  // ✅ FIX: Neue Methode zum Setzen der publishRunId
  setPublishRunId(runId: string): void {
    this.publishRunId = runId
  }

  async publish(
    content: any,
    files: any[],
    hashtags: string[],
    options?: { dryMode?: boolean; sessionId?: string }
  ): Promise<PostResult> {
    // DRY MODE ist standardmäßig AKTIV - nur Formular ausfüllen, kein Posten
    const dryMode = options?.dryMode ?? true
    // ✅ FIX: Use sessionId from options (which is the base publishRunId)
    const currentPublishRunId = options?.sessionId || this.publishRunId
    
    try {
      const credentials = await getCredentials()

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
        console.log(`\n🔍 Extracting subreddits from targets configuration...`)
        console.log(`   Targets config:`, JSON.stringify(content.subreddits, null, 2))
        
        const { RedditTargetService } = await import('../../../services/targetService.js')
        const targetService = new RedditTargetService()
        const allTargets = await targetService.getTargets('subreddit')
        const groups = await targetService.getGroups()
        const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)

        const subredditsWithMetadata: any[] = []
        
        if (content.subreddits.mode === 'all') {
          allTargets.forEach((t: any) => {
            const baseField = targetService.getBaseField(t.targetType)
            subredditsWithMetadata.push({
              name: t[baseField],
              metadata: t
            })
          })
        } else if (content.subreddits.mode === 'groups' && content.subreddits.groups) {
          for (const groupIdentifier of content.subreddits.groups) {
            const group = groupsArray.find((g: any) => g.id === groupIdentifier || g.name === groupIdentifier) as any
            if (!group || !group.targetIds) continue
            group.targetIds.forEach((targetId: string) => {
              const target = allTargets.find((t: any) => t.id === targetId)
              if (target) {
                const baseField = targetService.getBaseField(target.targetType)
                subredditsWithMetadata.push({
                  name: target[baseField],
                  metadata: target
                })
              }
            })
          }
        } else if (content.subreddits.mode === 'individual' && content.subreddits.individual) {
          content.subreddits.individual.forEach((targetId: string) => {
            const target = allTargets.find((t: any) => t.id === targetId)
            if (target) {
              const baseField = targetService.getBaseField(target.targetType)
              subredditsWithMetadata.push({
                name: target[baseField],
                metadata: target
              })
            }
          })
        }

        // Remove duplicates
        const uniqueSubreddits = Array.from(new Map(subredditsWithMetadata.map(s => [s.name, s])).values())

        if (uniqueSubreddits.length === 0) {
          console.error(`❌ No subreddits found in targets configuration`)
          return {
            success: false,
            error: 'No subreddits found in targets configuration'
          }
        }

        // ✅ FIX: Use home directory in development to prevent Vite reloads
        const path = await import('path')
        const os = await import('os')
        let userDataDir;

        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
          userDataDir = path.join(os.homedir(), '.event-promoter', 'reddit-browser-data')
        } else {
          const { getConfigPath } = await import('../../../../utils/fileUtils.js')
          userDataDir = path.join(path.dirname(getConfigPath('dummy')), 'reddit-browser-data')
        }
        
        console.log(`🔍 Using browser context: ${userDataDir} (Mode: ${process.env.NODE_ENV || 'development'})`)
        
        // DRY MODE: headless false, damit User sehen kann was passiert
        // ✅ BEST PRACTICE: Persistenter Context speichert Cookies, localStorage, etc. automatisch
        this.browser = await chromium.launchPersistentContext(userDataDir, {
          headless: !dryMode,
          viewport: { width: 1280, height: 720 }
        })
        const page = this.browser.pages()[0] || await this.browser.newPage()

        try {
          // ✅ STEP 1: Login/Login-Check (with orchestration)
          // Note: Base events (started/completed) are handled by PublishingService.executeWithEvents
          // These are additional detailed events for granular tracking
          const step1Start = Date.now()
          await executeStep(page, 'Step 1: Login/Login-Check', async () => {
            await step1_LoginCheck(page, credentials)
          }, this.eventEmitter, currentPublishRunId)

          console.log(`\n✅ Step 1 complete. Starting form filling process...`)
          console.log(`📋 Subreddits to process: ${uniqueSubreddits.map(s => s.name).join(', ')}`)
          console.log(`📋 Title: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`)
          console.log(`📋 Text length: ${text.length} characters`)
          console.log(`📋 Files: ${files.length}`)

          // ✅ Post to ALL subreddits
          const results: Array<{ subreddit: string; success: boolean; url?: string; postId?: string; error?: string }> = []

          console.log(`\n📝 Starting to fill forms for ${uniqueSubreddits.length} subreddit(s)...`)

          for (const sub of uniqueSubreddits) {
            const subreddit = sub.name
            const metadata = sub.metadata
            try {
              console.log(`\n🔹 Processing subreddit: r/${subreddit}`)
              
              if (this.eventEmitter) {
                this.eventEmitter.info('reddit', 'playwright', `Processing subreddit: r/${subreddit}`, undefined, currentPublishRunId)
              }

              // Personalized salutation
              let processedText = text
              if (metadata) {
                const { getSalutationConfig } = await import('../../../../utils/salutationUtils.js')
                const { loadTranslations } = await import('../../../../utils/translationLoader.js')
                
                const targetLocale = content.subreddits?.templateLocale || 'de'
                const salutationConfig = getSalutationConfig(metadata)
                const platformTranslations = await loadTranslations('reddit', targetLocale)
                
                let salutation = salutationConfig.key.split('.').reduce((obj, key) => obj?.[key], platformTranslations as any)
                
                if (salutation) {
                  for (const [key, value] of Object.entries(salutationConfig.data)) {
                    salutation = salutation.replace(new RegExp(`{{${key}}}`, 'g'), value)
                  }
                  processedText = text.replace(/{salutation}/g, salutation)
                }

                processedText = processedText
                  .replace(/{target.firstName}/g, metadata.firstName || '')
                  .replace(/{target.lastName}/g, metadata.lastName || '')
              }
              
              // ✅ STEP 2: Navigate to submit page (with orchestration)
              // Note: These are detailed sub-steps within the main "Publishing to reddit via Playwright" step
              const step2Start = Date.now()
              await executeStep(page, `Step 2: Navigate to r/${subreddit}/submit`, async () => {
                await step2_NavigateToSubmitPage(page, subreddit)
              }, this.eventEmitter, currentPublishRunId)

              // ✅ STEP 3: Select post type (with orchestration)
              const step3Start = Date.now()
              await executeStep(page, 'Step 3: Select post type', async () => {
                await step3_SelectPostType(page, files.length > 0 && !!files[0].url)
              }, this.eventEmitter, currentPublishRunId)

              // ✅ STEP 4: Enter title (with orchestration)
              const step4Start = Date.now()
              await executeStep(page, 'Step 4: Enter title', async () => {
                await step4_EnterTitle(page, title)
              }, this.eventEmitter, currentPublishRunId)

              // ✅ STEP 5: Enter content (with orchestration)
              const step5Start = Date.now()
              await executeStep(page, 'Step 5: Enter content', async () => {
                await step5_EnterContent(page, files, processedText)
              }, this.eventEmitter, currentPublishRunId)

              // ✅ STEP 6: Submit (with orchestration)
              const step6Start = Date.now()
              const step6Result = await executeStep(page, 'Step 6: Submit', async () => {
                return await step6_Submit(page, subreddit, dryMode)
              }, this.eventEmitter, currentPublishRunId)

              // Handle results
              if (dryMode) {
                results.push({
                  subreddit,
                  success: true,
                  url: step6Result.url,
                  postId: undefined
                })
              } else {
                results.push({
                  subreddit,
                  success: true,
                  url: step6Result.url,
                  postId: step6Result.postId
                })
              }

              console.log(`✅ Completed processing r/${subreddit}`)

              // Rate limiting: wait 2 seconds between posts (except for last one)
              if (subreddits.indexOf(subreddit) < subreddits.length - 1) {
                console.log(`  ⏳ Waiting 2 seconds before next subreddit...`)
                await page.waitForTimeout(2000)
              }
            } catch (error: any) {
              console.error(`❌ Error processing r/${subreddit}: ${error.message}`)
              console.error(`   Stack: ${error.stack}`)
              results.push({
                subreddit,
                success: false,
                error: error.message || 'Unknown error'
              })
            }
          }
          
          console.log(`\n📊 Summary: ${results.filter(r => r.success).length}/${results.length} subreddits processed successfully`)

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
      console.error(`\n❌ CRITICAL ERROR in Reddit Playwright Publisher:`)
      console.error(`   Message: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
      console.error(`   Error type: ${error.constructor.name}`)
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
}

export default new RedditPlaywrightPublisher()
