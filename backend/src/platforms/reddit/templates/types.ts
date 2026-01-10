/**
 * Reddit Template Types
 * 
 * @module platforms/reddit/templates/types
 */

export interface RedditTemplate {
  id: string
  name: string
  description?: string
  template: {
    title: string
    text: string
  }
  category: string
  variables: string[]
  recommendedSubreddits: string[]
  createdAt?: string
  updatedAt?: string
}


