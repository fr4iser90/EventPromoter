/**
 * Reddit Playwright Publisher
 * 
 * Browser automation for publishing posts using Playwright.
 * 
 * @module platforms/reddit/publishers/playwright
 */

// @ts-ignore - Playwright is optional dependency
import { chromium, BrowserContext } from 'playwright'
import { PostResult } from '../../../../types/index.js'
import { RedditPublisher } from '../api.js'
import { PublisherEventService, EventAwarePublisher } from '../../../../services/publisherEventService.js'

// Utils
import { executeStep } from './utils/executeStep.js'
import { getCredentials } from './utils/getCredentials.js'

// Steps
import { loginCheck } from './steps/loginCheck.js'
import { openSubmitEditor } from './steps/openSubmitEditor.js'
import { selectPostType } from './steps/selectPostType.js'
import { fillTitle } from './steps/fillTitle.js'
import { fillContent } from './steps/fillContent.js'
import { submitPost } from './steps/submitPost.js'

const REDDIT_STEP_IDS = {
  COMMON_VALIDATE_INPUT: 'common.validate_input',
  COMMON_RESOLVE_TARGETS: 'common.resolve_targets',
  AUTH_VALIDATE_CREDENTIALS: 'auth.validate_credentials',
  AUTH_LOGIN_CHECK: 'auth.login_check',
  COMPOSE_OPEN_EDITOR: 'compose.open_editor',
  COMPOSE_FILL_CONTENT: 'compose.fill_content',
  PUBLISH_SUBMIT: 'publish.submit',
  PUBLISH_VERIFY_RESULT: 'publish.verify_result'
} as const

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

  private getErrorCode(error: any): string {
    if (error?.code) return String(error.code)
    if (error?.status) return `HTTP_${error.status}`
    if (error?.type) return String(error.type)
    return 'UNKNOWN_ERROR'
  }

  private isRetryableError(error: any): boolean {
    const code = error?.code
    const status = error?.status

    if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') {
      return true
    }

    if (typeof status === 'number' && status >= 500 && status < 600) {
      return true
    }

    if (status === 429) {
      return true
    }

    return false
  }

  private createError(message: string, code: string): Error {
    const err = new Error(message) as Error & { code?: string }
    err.code = code
    return err
  }

  private async executeContractStep<T>(
    stepId: string,
    publishRunId: string | undefined,
    fn: () => Promise<T>,
    message?: string
  ): Promise<T> {
    const start = Date.now()
    this.eventEmitter?.stepStarted('reddit', 'playwright', stepId, message || `Starting ${stepId}`, publishRunId)
    try {
      const result = await fn()
      this.eventEmitter?.stepCompleted('reddit', 'playwright', stepId, Date.now() - start, publishRunId)
      return result
    } catch (error: any) {
      this.eventEmitter?.stepFailed(
        'reddit',
        'playwright',
        stepId,
        error?.message || 'Unknown error',
        this.getErrorCode(error),
        this.isRetryableError(error),
        publishRunId
      )
      throw error
    }
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
      await this.executeContractStep(
        REDDIT_STEP_IDS.AUTH_VALIDATE_CREDENTIALS,
        currentPublishRunId,
        async () => {
          if (!credentials.username || !credentials.password) {
            throw this.createError('Reddit credentials not configured for Playwright publishing', 'MISSING_CREDENTIALS')
          }
        }
      )

      await this.executeContractStep(
        REDDIT_STEP_IDS.COMMON_VALIDATE_INPUT,
        currentPublishRunId,
        async () => {
          if (!content.subreddits && !content.users) {
            throw this.createError('At least one target configuration is required (subreddits or users)', 'INVALID_INPUT')
          }

          if (content.users) {
            throw this.createError('User DMs not yet implemented in Playwright publisher', 'NOT_IMPLEMENTED')
          }

          if (!content.title || content.title.trim().length === 0) {
            throw this.createError('Title is required', 'INVALID_INPUT')
          }

          if (!content.text || content.text.trim().length === 0) {
            throw this.createError('Text is required', 'INVALID_INPUT')
          }
        }
      )

      const title = content.title
      const text = content.text

      if (content.subreddits) {
        console.log('[Reddit Playwright] Extracting subreddits from targets configuration')
        console.log('[Reddit Playwright] Targets config', { subreddits: content.subreddits })
        let uniqueSubreddits: any[] = []
        await this.executeContractStep(
          REDDIT_STEP_IDS.COMMON_RESOLVE_TARGETS,
          currentPublishRunId,
          async () => {
            const { RedditTargetService } = await import('../../services/targetService.js')
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
            uniqueSubreddits = Array.from(new Map(subredditsWithMetadata.map(s => [s.name, s])).values())
            if (uniqueSubreddits.length === 0) {
              throw this.createError('No subreddits found in targets configuration', 'NO_TARGETS_RESOLVED')
            }
          },
          'Resolving target subreddits'
        )

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
        
        console.log('[Reddit Playwright] Using browser context', {
          userDataDir,
          mode: process.env.NODE_ENV || 'development'
        })
        
        // DRY MODE: headless false, damit User sehen kann was passiert
        // ✅ BEST PRACTICE: Persistenter Context speichert Cookies, localStorage, etc. automatisch
        this.browser = await chromium.launchPersistentContext(userDataDir, {
          headless: !dryMode,
          viewport: { width: 1280, height: 720 }
        })
        const page = this.browser.pages()[0] || await this.browser.newPage()

        try {
          // Detailed sub-steps for Reddit Playwright flow
          await executeStep(
            page,
            REDDIT_STEP_IDS.AUTH_LOGIN_CHECK,
            async () => {
            await loginCheck(page, credentials)
            },
            this.eventEmitter,
            currentPublishRunId
          )

          console.log('[Reddit Playwright] Step 1 complete, starting form filling process', {
            subreddits: uniqueSubreddits.map(s => s.name),
            titlePreview: `${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`,
            textLength: text.length,
            fileCount: files.length
          })

          // ✅ Post to ALL subreddits
          const results: Array<{ subreddit: string; success: boolean; url?: string; postId?: string; error?: string }> = []

          console.log('[Reddit Playwright] Starting to fill forms for subreddits', { count: uniqueSubreddits.length })

          for (const [subIdx, sub] of uniqueSubreddits.entries()) {
            const subreddit = sub.name
            const metadata = sub.metadata
            try {
              console.log('[Reddit Playwright] Processing subreddit', { subreddit })

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
              
              await executeStep(
                page,
                REDDIT_STEP_IDS.COMPOSE_OPEN_EDITOR,
                async () => {
                  await openSubmitEditor(page, subreddit)
                },
                this.eventEmitter,
                currentPublishRunId,
                { message: `Opening submit editor for r/${subreddit}` }
              )

              await executeStep(
                page,
                REDDIT_STEP_IDS.COMPOSE_FILL_CONTENT,
                async () => {
                  await selectPostType(page, files.length > 0 && !!files[0].url)
                  await fillTitle(page, title)
                  await fillContent(page, files, processedText)
                },
                this.eventEmitter,
                currentPublishRunId,
                { message: `Preparing post content for r/${subreddit}` }
              )

              const step6Result = await executeStep(
                page,
                REDDIT_STEP_IDS.PUBLISH_SUBMIT,
                async () => {
                  return await submitPost(page, subreddit, dryMode)
                },
                this.eventEmitter,
                currentPublishRunId,
                {
                  message: `Submitting post for r/${subreddit}`,
                  data: { subreddit }
                }
              )

              const verifiedResult = await executeStep(
                page,
                REDDIT_STEP_IDS.PUBLISH_VERIFY_RESULT,
                async () => {
                  if (dryMode) {
                    if (!step6Result.url) {
                      throw this.createError(`Missing form URL after dry-run submit for r/${subreddit}`, 'VERIFY_FAILED')
                    }
                    return step6Result
                  }

                  if (!step6Result.url || !step6Result.postId) {
                    throw this.createError(`Missing post URL or postId after submit for r/${subreddit}`, 'VERIFY_FAILED')
                  }

                  return step6Result
                },
                this.eventEmitter,
                currentPublishRunId,
                {
                  message: `Verifying publish result for r/${subreddit}`,
                  data: { subreddit, dryMode }
                }
              )

              // Handle results
              if (dryMode) {
                results.push({
                  subreddit,
                  success: true,
                  url: verifiedResult.url,
                  postId: undefined
                })
              } else {
                results.push({
                  subreddit,
                  success: true,
                  url: verifiedResult.url,
                  postId: verifiedResult.postId
                })
              }

              console.log('[Reddit Playwright] Completed subreddit', { subreddit })

              // Rate limiting: wait 2 seconds between posts (except for last one)
              if (subIdx < uniqueSubreddits.length - 1) {
                console.log('[Reddit Playwright] Waiting before next subreddit', { waitMs: 2000 })
                await page.waitForTimeout(2000)
              }
            } catch (error: any) {
              console.error('[Reddit Playwright] Error processing subreddit', {
                subreddit,
                error: error.message,
                stack: error.stack
              })
              results.push({
                subreddit,
                success: false,
                error: error.message || 'Unknown error'
              })
            }
          }
          
          console.log('[Reddit Playwright] Processing summary', {
            successful: results.filter(r => r.success).length,
            total: results.length
          })

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
              ? `Formular für ${successful.length}/${uniqueSubreddits.length} Subreddits ausgefüllt. ${failed.length > 0 ? `Fehler: ${failed.map(f => f.subreddit).join(', ')}` : 'Alle erfolgreich.'}`
              : `Posted to ${successful.length}/${uniqueSubreddits.length} subreddits. ${failed.length > 0 ? `Failed: ${failed.map(f => f.subreddit).join(', ')}` : 'All successful.'}`
          }
        } finally {
          // DRY MODE: Browser NICHT schließen, damit User sehen kann was passiert
          // Browser bleibt offen für manuelles Posten
        }
      }
      return {
        success: false,
        error: 'Invalid target configuration'
      }
    } catch (error: any) {
      console.error('[Reddit Playwright] Critical error', {
        message: error.message,
        stack: error.stack,
        errorType: error.constructor?.name
      })
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
