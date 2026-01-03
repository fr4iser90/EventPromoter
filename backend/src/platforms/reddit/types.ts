// Reddit-specific types

export interface RedditContent {
  title: string
  text: string
  subreddit: string
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
