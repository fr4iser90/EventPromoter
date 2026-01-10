/**
 * Facebook Template Types
 * 
 * @module platforms/facebook/templates/types
 */

export interface FacebookTemplate {
  id: string
  name: string
  description?: string
  template: string
  category: string
  variables: string[]
  createdAt?: string
  updatedAt?: string
}


