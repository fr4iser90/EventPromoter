// Twitter-specific types

export interface TwitterContent {
  text: string
  image?: string
  link?: string
  username?: string
}

export interface TwitterConfig {
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  accessTokenSecret?: string
  username?: string
}

export interface TwitterValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  characterCount: number
  maxLength: number
}
