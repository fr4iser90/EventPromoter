// Facebook-specific types

export interface FacebookContent {
  text: string
  image?: string
  link?: string
  pageId?: string
}

export interface FacebookConfig {
  pageId?: string
  pageName?: string
  accessToken?: string
  appId?: string
  appSecret?: string
}

export interface FacebookValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  characterCount: number
  maxLength: number
}