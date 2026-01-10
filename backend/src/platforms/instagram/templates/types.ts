/**
 * Instagram Template Types
 * 
 * @module platforms/instagram/templates/types
 */

export interface InstagramTemplate {
  id: string
  name: string
  description?: string
  template: string
  category: string
  variables: string[]
  createdAt?: string
  updatedAt?: string
}


