import { ConfigService } from '../../../../../services/configService.js'

export async function getCredentials(): Promise<any> {
  const config = await ConfigService.getPlatformSettings('reddit') || {}
  
  console.log('[Reddit Playwright] Loaded config keys', { keys: Object.keys(config) })
  console.log('[Reddit Playwright] Credential presence in config', {
    usernamePresent: !!config.username,
    passwordPresent: !!config.password
  })
  
  const credentials = {
    username: config.username || process.env.REDDIT_USERNAME,
    password: config.password || process.env.REDDIT_PASSWORD,
  }
  
  if (!credentials.username || !credentials.password) {
    console.error('[Reddit Playwright] Missing credentials', {
      usernamePresent: !!credentials.username,
      passwordPresent: !!credentials.password,
      configUsernamePresent: !!config.username,
      configPasswordPresent: !!config.password,
      envUsernamePresent: !!process.env.REDDIT_USERNAME,
      envPasswordPresent: !!process.env.REDDIT_PASSWORD
    })
  }
  
  return credentials
}
