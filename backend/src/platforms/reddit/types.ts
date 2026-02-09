// Reddit-specific types

export interface RedditTargets {
  mode: 'all' | 'groups' | 'individual'
  groups?: string[]
  individual?: string[]
  templateLocale?: string
  defaultTemplate?: string
  templateMapping?: Record<string, string>
}

export interface RedditContent {
  title: string
  text: string
  subreddits?: RedditTargets  // Optional - für Posts zu Subreddits
  users?: RedditTargets        // Optional - für DMs zu Usern
  link?: string
  image?: string
}

export interface RedditConfig {
  username?: string
  clientId?: string
  clientSecret?: string
  refreshToken?: string
}

export interface RedditValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  titleLength: number
  textLength: number
  maxTitleLength: number
}
