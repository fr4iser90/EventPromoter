import { Page } from 'playwright'

export async function extractPostUrl(page: Page, subreddit: string): Promise<string | undefined> {
  try {
    const currentUrl = page.url()
    if (currentUrl.includes(`/r/${subreddit}/comments/`)) {
      return currentUrl
    }
  } catch (error) {
    console.warn('Could not extract post URL:', error)
  }
  return undefined
}
