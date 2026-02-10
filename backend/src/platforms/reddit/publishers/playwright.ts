/**
 * Reddit Playwright Publisher
 * 
 * Browser automation for publishing posts using Playwright.
 * 
 * @module platforms/reddit/publishers/playwright
 * 
 * This file is a re-export of the modularized playwright publisher.
 * The actual implementation is in playwright/index.ts
 */

// Re-export everything from the modularized version
export * from './playwright/index.js'
export { default } from './playwright/index.js'
