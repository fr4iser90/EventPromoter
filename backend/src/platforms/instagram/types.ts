// Instagram-specific types

export interface InstagramContent {
  caption: string
  image?: string
  hashtags?: string[]
  account?: string
}

export interface InstagramConfig {
  username?: string
  password?: string
  twoFactorEnabled?: boolean
  apiKey?: string
}

export interface InstagramValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  captionLength: number
  maxLength: number
}
