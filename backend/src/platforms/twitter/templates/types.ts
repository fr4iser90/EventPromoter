/**
 * Twitter Template Types
 * 
 * @module platforms/twitter/templates/types
 */

export interface EventTemplate {
  id: string
  name: string
  description?: string
  template: string
  category: string
  variables: string[]
  createdAt?: string
  updatedAt?: string
}


