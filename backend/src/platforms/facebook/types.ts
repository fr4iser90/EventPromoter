export interface FacebookContent {
  text: string
  image?: string
  link?: string
}

export interface FacebookConfig {
  pageId?: string
  accessToken?: string
}

export interface FacebookValidation {
  isValid: boolean
  errors: string[]
}
