import { ConfigService } from '../../../../../services/configService.js'

export async function getCredentials(): Promise<any> {
  const config = await ConfigService.getPlatformSettings('reddit') || {}
  
  console.log(`[Reddit Playwright] Loaded config keys:`, Object.keys(config))
  console.log(`[Reddit Playwright] Username present: ${!!config.username}, Password present: ${!!config.password}`)
  console.log(`[Reddit Playwright] Username value: ${config.username || 'MISSING'}`)
  
  const credentials = {
    username: config.username || process.env.REDDIT_USERNAME,
    password: config.password || process.env.REDDIT_PASSWORD,
  }
  
  if (!credentials.username || !credentials.password) {
    console.error(`[Reddit Playwright] Missing credentials - Username: ${!!credentials.username}, Password: ${!!credentials.password}`)
    console.error(`[Reddit Playwright] Config had username: ${!!config.username}, password: ${!!config.password}`)
    console.error(`[Reddit Playwright] Env vars: REDDIT_USERNAME=${!!process.env.REDDIT_USERNAME}, REDDIT_PASSWORD=${!!process.env.REDDIT_PASSWORD}`)
  }
  
  return credentials
}
