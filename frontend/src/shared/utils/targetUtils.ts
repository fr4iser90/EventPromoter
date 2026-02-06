/**
 * Target Utilities
 * 
 * Utilities for working with targets and resolving target-specific properties
 * like locale. Completely generic - no platform-specific logic.
 * 
 * @module shared/utils/targetUtils
 */

import { getValidLocale } from './localeUtils'
import { getApiUrl } from './api'

/**
 * Extract locale from target object
 * Supports both direct locale field and metadata.locale
 * 
 * @param target - Target object (may have locale or metadata.locale)
 * @returns Valid locale or undefined
 */
export const extractTargetLocale = (target: any): 'en' | 'de' | 'es' | undefined => {
  if (!target) return undefined
  
  // Check direct locale field
  if (target.locale) {
    return getValidLocale(target.locale)
  }
  
  // Check metadata.locale
  if (target.metadata?.locale) {
    return getValidLocale(target.metadata.locale)
  }
  
  return undefined
}

/**
 * Extract locale from group object
 * Groups can have locale in metadata.locale
 * 
 * @param group - Group object (may have metadata.locale)
 * @returns Valid locale or undefined
 */
export const extractGroupLocale = (group: any): 'en' | 'de' | 'es' | undefined => {
  if (!group) return undefined
  
  // Check metadata.locale
  if (group.metadata?.locale) {
    return getValidLocale(group.metadata.locale)
  }
  
  return undefined
}

/**
 * Resolve locale for a set of individual targets
 * If all targets have the same locale, return it. Otherwise undefined.
 * 
 * @param targetIds - Array of target IDs
 * @param platform - Platform ID (e.g., 'email')
 * @param dataEndpoint - Endpoint for fetching targets (e.g., 'platforms/:platformId/targets')
 * @returns Locale if all targets share the same locale, undefined otherwise
 */
export const resolveTargetsLocale = async (
  targetIds: string[],
  platform: string,
  dataEndpoint: string
): Promise<'en' | 'de' | 'es' | undefined> => {
  if (!targetIds || targetIds.length === 0) return undefined
  
  try {
    const endpoint = dataEndpoint.replace(':platformId', platform)
    const response = await fetch(getApiUrl(endpoint))
    if (!response.ok) return undefined
    
    const data = await response.json()
    const options = data.options || []
    
    // Get locales for all targets
    const locales = targetIds
      .map(id => {
        const option = options.find((opt: any) => (opt.value || opt.id) === id)
        if (!option) return undefined
        
        // Extract locale from option (may be in option.locale or option.target?.locale)
        const target = option.target || option
        return extractTargetLocale(target)
      })
      .filter((locale): locale is 'en' | 'de' | 'es' => locale !== undefined)
    
    if (locales.length === 0) return undefined
    
    // If all targets have same locale, return it
    const uniqueLocales = [...new Set(locales)]
    return uniqueLocales.length === 1 ? uniqueLocales[0] : undefined
  } catch (error) {
    console.warn('Failed to resolve targets locale:', error)
    return undefined
  }
}

/**
 * Resolve locale for a set of groups
 * If all groups have the same locale, return it. Otherwise undefined.
 * 
 * @param groupIds - Array of group IDs
 * @param platform - Platform ID (e.g., 'email')
 * @param dataEndpoint - Endpoint for fetching groups (e.g., 'platforms/:platformId/target-groups')
 * @returns Locale if all groups share the same locale, undefined otherwise
 */
export const resolveGroupsLocale = async (
  groupIds: string[],
  platform: string,
  dataEndpoint: string
): Promise<'en' | 'de' | 'es' | undefined> => {
  if (!groupIds || groupIds.length === 0) return undefined
  
  try {
    const endpoint = dataEndpoint.replace(':platformId', platform)
    const response = await fetch(getApiUrl(endpoint))
    if (!response.ok) return undefined
    
    const data = await response.json()
    const groups = data.groups || []
    const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)
    
    // Get locales for all groups
    const locales = groupIds
      .map(id => {
        const group = groupsArray.find((g: any) => (g.id || g.name) === id)
        if (!group) return undefined
        return extractGroupLocale(group)
      })
      .filter((locale): locale is 'en' | 'de' | 'es' => locale !== undefined)
    
    if (locales.length === 0) return undefined
    
    // If all groups have same locale, return it
    const uniqueLocales = [...new Set(locales)]
    return uniqueLocales.length === 1 ? uniqueLocales[0] : undefined
  } catch (error) {
    console.warn('Failed to resolve groups locale:', error)
    return undefined
  }
}
