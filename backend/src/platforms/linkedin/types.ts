// LinkedIn-specific types

export interface LinkedInContent {
  text: string
  link?: string
  image?: string
}

export interface LinkedInConfig {
  profileId?: string
  companyId?: string
  accessToken?: string
}

export interface LinkedInValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  characterCount: number
  maxLength: number
}
