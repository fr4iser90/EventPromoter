/**
 * Base Target Service
 * 
 * Abstract base class for platform-specific target management.
 * Provides generic CRUD operations for targets (recipients, subreddits, etc.)
 * with support for custom fields and grouping.
 * 
 * @module services/targetService
 */

import { randomUUID } from 'crypto'
import { Target, Group, TargetSchema, ValidationRule } from '@/types/schema/index.js'
import { readPlatformData, writePlatformData } from '../utils/platformDataUtils.js'

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
}

/**
 * Base Target Service
 * Abstract class that provides generic target management functionality
 */
export abstract class BaseTargetService {
  protected platformId: string
  protected targetSchema: TargetSchema
  protected dataFileName: string = 'targets.json' // Override in subclasses if needed
  
  constructor(platformId: string, targetSchema: TargetSchema) {
    this.platformId = platformId
    this.targetSchema = targetSchema
  }

  // Abstract methods (platform-specific)
  /**
   * Get the base field name (e.g., 'email', 'subreddit')
   */
  abstract getBaseField(): string

  /**
   * Validate the base field value
   */
  abstract validateBaseField(value: string): boolean

  // Generic methods (work for all platforms)

  /**
   * Get all targets
   */
  async getTargets(type?: string): Promise<Target[]> {
    const data = await this.readTargetData();
    let targets = data?.targets || [];

    if (type) {
      // Implement filtering logic based on the 'type' parameter
      // This is a generic filtering, subclasses can override for specific logic
      if (this.targetSchema.baseField === type) {
        // If the requested type matches the base field, return all targets
        // as the base field usually represents the primary 'account' type
        return targets;
      } else if (this.targetSchema.customFields) {
        // Check if a custom field matches the requested type
        const typeField = this.targetSchema.customFields.find(f => f.name === type);
        if (typeField) {
          // If a custom field represents the type, filter targets where this field is true/exists
          return targets.filter(target => target[type] === true || target[type] !== undefined);
        }
      }
      // Fallback: if no specific filtering rule, return empty array
      return [];
    }

    return targets;
  }

  /**
   * Get a single target by ID
   */
  async getTarget(targetId: string): Promise<Target | null> {
    const targets = await this.getTargets()
    return targets.find(t => t.id === targetId) || null
  }

  /**
   * Add a new target
   */
  async addTarget(targetData: Record<string, any>): Promise<{ success: boolean; target?: Target; error?: string }> {
    // Validate base field
    const baseField = this.getBaseField()
    const baseValue = targetData[baseField]
    
    if (!baseValue || typeof baseValue !== 'string') {
      return { success: false, error: `${this.targetSchema.baseFieldLabel} is required` }
    }

    if (!this.validateBaseField(baseValue)) {
      return { success: false, error: `Invalid ${this.targetSchema.baseFieldLabel}` }
    }

    // Check if target already exists (by base field value)
    const existingTargets = await this.getTargets()
    const normalizedBaseValue = this.normalizeBaseField(baseValue)
    
    if (existingTargets.some(t => this.normalizeBaseField(t[baseField]) === normalizedBaseValue)) {
      return { success: false, error: `${this.targetSchema.baseFieldLabel} already exists` }
    }

    // Validate custom fields
    const customFieldsValidation = this.validateCustomFields(targetData)
    if (!customFieldsValidation.isValid) {
      const firstError = Object.values(customFieldsValidation.errors)[0]?.[0]
      return { success: false, error: firstError || 'Validation failed' }
    }

    // Create target object
    const target: Target = {
      id: this.generateTargetId(),
      [baseField]: baseValue,
      ...this.extractCustomFields(targetData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to data file
    const data = await this.readTargetData()
    const updated = {
      ...data,
      targets: [...(data?.targets || []), target],
      groups: data?.groups || {}
    }

    await this.writeTargetData(updated)
    return { success: true, target }
  }

  /**
   * Update an existing target
   */
  async updateTarget(targetId: string, targetData: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    const targets = await this.getTargets()
    const targetIndex = targets.findIndex(t => t.id === targetId)

    if (targetIndex === -1) {
      return { success: false, error: 'Target not found' }
    }

    const existingTarget = targets[targetIndex]
    const baseField = this.getBaseField()

    // If base field is being updated, validate it
    if (targetData[baseField] !== undefined) {
      const baseValue = targetData[baseField]
      if (!this.validateBaseField(baseValue)) {
        return { success: false, error: `Invalid ${this.targetSchema.baseFieldLabel}` }
      }

      // Check if another target already has this base value
      const normalizedBaseValue = this.normalizeBaseField(baseValue)
      const conflictingTarget = targets.find(
        (t, idx) => idx !== targetIndex && this.normalizeBaseField(t[baseField]) === normalizedBaseValue
      )
      if (conflictingTarget) {
        return { success: false, error: `${this.targetSchema.baseFieldLabel} already exists` }
      }
    }

    // Validate custom fields
    const customFieldsValidation = this.validateCustomFields(targetData)
    if (!customFieldsValidation.isValid) {
      const firstError = Object.values(customFieldsValidation.errors)[0]?.[0]
      return { success: false, error: firstError || 'Validation failed' }
    }

    // Update target
    const updatedTarget: Target = {
      ...existingTarget,
      ...targetData,
      id: targetId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    targets[targetIndex] = updatedTarget

    // Save to data file
    const data = await this.readTargetData()
    const updated = {
      ...data,
      targets,
      groups: data?.groups || {}
    }

    await this.writeTargetData(updated)
    return { success: true }
  }

  /**
   * Delete a target
   */
  async deleteTarget(targetId: string): Promise<{ success: boolean; error?: string }> {
    const targets = await this.getTargets()
    const targetIndex = targets.findIndex(t => t.id === targetId)

    if (targetIndex === -1) {
      return { success: false, error: 'Target not found' }
    }

    // Remove from all groups
    const data = await this.readTargetData()
    const currentGroups = data?.groups || {} as Record<string, Group>
    
    // Remove target from all groups
    for (const group of Object.values(currentGroups)) {
      group.targetIds = group.targetIds.filter(id => id !== targetId)
    }

    // Remove target
    targets.splice(targetIndex, 1)

    // Save to data file
    const updated = {
      ...data,
      targets,
      groups: currentGroups
    }

    await this.writeTargetData(updated)
    return { success: true }
  }

  /**
   * Generate a unique group ID
   */
  protected generateGroupId(): string {
    return randomUUID()
  }

  /**
   * Get all groups
   * Returns groups as object with UUID keys: { [groupId]: Group }
   */
  async getGroups(): Promise<(Group & { memberCount?: number })[]> {
    const data = await this.readTargetData()
    const groups = data?.groups || {}

    // Calculate memberCount for each group
    for (const groupId in groups) {
      if (Object.prototype.hasOwnProperty.call(groups, groupId)) {
        const group = groups[groupId];
        group.memberCount = group.targetIds ? group.targetIds.length : 0;
      }
    }
    
    return Object.values(groups).map(group => ({
      ...group,
      memberCount: group.targetIds ? group.targetIds.length : 0,
    })) as (Group & { memberCount?: number })[];
  }

  /**
   * Create a new group
   */
  async createGroup(groupName: string, targetIds: string[]): Promise<{ success: boolean; group?: Group; error?: string }> {
    if (!groupName || typeof groupName !== 'string') {
      return { success: false, error: 'Group name is required' }
    }

    const data = await this.readTargetData()
    const currentGroups = data?.groups || {} as Record<string, Group>

    // Check if group name already exists
    const existingGroup = Object.values(currentGroups).find(g => g.name === groupName)
    if (existingGroup) {
      return { success: false, error: 'Group name already exists' }
    }

    // Validate that all target IDs exist
    const targets = await this.getTargets()
    const invalidIds = targetIds.filter(id => !targets.some(t => t.id === id))
    if (invalidIds.length > 0) {
      return { success: false, error: `Invalid target IDs: ${invalidIds.join(', ')}` }
    }

    // Create new group with UUID
    const groupId = this.generateGroupId()
    const newGroup: Group = {
      id: groupId,
      name: groupName,
      targetIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    currentGroups[groupId] = newGroup

    const updated = {
      ...data,
      groups: currentGroups
    }

    await this.writeTargetData(updated)
    return { success: true, group: newGroup }
  }

  /**
   * Update an existing group
   * Can update by groupId or groupName (for backward compatibility)
   */
  async updateGroup(groupIdOrName: string, updates: { name?: string; targetIds?: string[] }): Promise<{ success: boolean; group?: Group; error?: string }> {
    const data = await this.readTargetData()
    const currentGroups = data?.groups || {} as Record<string, Group>

    // Find group by ID or name
    let group: Group | undefined = currentGroups[groupIdOrName]
    if (!group) {
      group = Object.values(currentGroups).find(g => g.name === groupIdOrName)
    }
    
    if (!group) {
      return { success: false, error: 'Group not found' }
    }

    // Validate target IDs if provided
    if (updates.targetIds) {
      const targets = await this.getTargets()
      const invalidIds = updates.targetIds.filter(id => !targets.some(t => t.id === id))
      if (invalidIds.length > 0) {
        return { success: false, error: `Invalid target IDs: ${invalidIds.join(', ')}` }
      }
    }

    // Check if new name conflicts with existing group
    if (updates.name && updates.name !== group.name) {
      const nameExists = Object.values(currentGroups).some(g => g.id !== group!.id && g.name === updates.name)
      if (nameExists) {
        return { success: false, error: 'Group name already exists' }
      }
    }

    // Update group
    const updatedGroup: Group = {
      ...group,
      ...(updates.name && { name: updates.name }),
      ...(updates.targetIds && { targetIds: updates.targetIds }),
      updatedAt: new Date().toISOString()
    }

    currentGroups[group.id] = updatedGroup

    const updated = {
      ...data,
      groups: currentGroups
    }

    await this.writeTargetData(updated)
    return { success: true, group: updatedGroup }
  }

  /**
   * Delete a group
   * Can delete by groupId or groupName (for backward compatibility)
   */
  async deleteGroup(groupIdOrName: string): Promise<{ success: boolean; error?: string }> {
    const data = await this.readTargetData()
    const currentGroups = data?.groups || {} as Record<string, Group>
    
    // Find group by ID or name
    let group: Group | undefined = currentGroups[groupIdOrName]
    if (!group) {
      group = Object.values(currentGroups).find(g => g.name === groupIdOrName)
    }
    
    if (!group) {
      return { success: false, error: 'Group not found' }
    }

    delete currentGroups[group.id]

    const updated = {
      ...data,
      groups: currentGroups
    }

    await this.writeTargetData(updated)
    return { success: true }
  }

  // Helper methods

  /**
   * Validate custom fields against schema
   */
  protected validateCustomFields(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string[]> = {}

    if (!this.targetSchema.customFields) {
      return { isValid: true, errors }
    }

    for (const field of this.targetSchema.customFields) {
      const value = data[field.name]
      const fieldErrors: string[] = []

      // Check required
      if (field.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(field.validation?.[0]?.message || `${field.label} is required`)
      }

      // Check validation rules
      if (field.validation && value !== undefined && value !== null && value !== '') {
        for (const rule of field.validation) {
          const error = this.validateFieldRule(field, value, rule)
          if (error) {
            fieldErrors.push(error)
          }
        }
      }

      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Validate a single field rule
   */
  protected validateFieldRule(field: any, value: any, rule: ValidationRule): string | null {
    switch (rule.type) {
      case 'required':
        if (field.required && (!value || value === '')) {
          return rule.message || `${field.label} is required`
        }
        break

      case 'minLength':
        if (typeof value === 'string' && value.length < (rule.value as number)) {
          return rule.message || `${field.label} must be at least ${rule.value} characters`
        }
        break

      case 'maxLength':
        if (typeof value === 'string' && value.length > (rule.value as number)) {
          return rule.message || `${field.label} must be at most ${rule.value} characters`
        }
        break

      case 'min':
        if (typeof value === 'number' && value < (rule.value as number)) {
          return rule.message || `${field.label} must be at least ${rule.value}`
        }
        break

      case 'max':
        if (typeof value === 'number' && value > (rule.value as number)) {
          return rule.message || `${field.label} must be at most ${rule.value}`
        }
        break

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value as string).test(value)) {
          return rule.message || `${field.label} format is invalid`
        }
        break

      case 'url':
        if (typeof value === 'string' && !/^https?:\/\/.+/.test(value)) {
          return rule.message || `${field.label} must be a valid URL`
        }
        break

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value)
          if (result !== true) {
            return typeof result === 'string' ? result : rule.message || `${field.label} is invalid`
          }
        }
        break
    }

    return null
  }

  /**
   * Extract custom fields from data
   */
  protected extractCustomFields(data: Record<string, any>): Record<string, any> {
    const customFields: Record<string, any> = {}
    const baseField = this.getBaseField()

    if (this.targetSchema.customFields) {
      for (const field of this.targetSchema.customFields) {
        if (data[field.name] !== undefined && data[field.name] !== null) {
          customFields[field.name] = data[field.name]
        }
      }
    }

    // Don't include base field in custom fields
    delete customFields[baseField]

    return customFields
  }

  /**
   * Generate a unique target ID
   */
  protected generateTargetId(): string {
    return randomUUID()
  }

  /**
   * Normalize base field value (for comparison)
   * Override in subclasses if needed (e.g., lowercase emails)
   */
  protected normalizeBaseField(value: string): string {
    return value.trim().toLowerCase()
  }

  /**
   * Read target data from file
   * Uses a custom data file name (targets.json) instead of the platform's default dataSource
   */
  protected async readTargetData(): Promise<{ targets?: Target[]; groups?: Record<string, Group> }> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const { fileURLToPath } = await import('url')
      
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      const dataPath = path.join(__dirname, '../platforms', this.platformId, 'data', this.dataFileName)
      
      try {
        const data = await fs.readFile(dataPath, 'utf8')
        if (!data || data.trim() === '') {
          return { targets: [], groups: {} }
        }
        return JSON.parse(data)
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          return { targets: [], groups: {} }
        }
        throw error
      }
    } catch (error) {
      console.error(`Error reading target data for ${this.platformId}:`, error)
      return { targets: [], groups: {} }
    }
  }

  /**
   * Write target data to file
   */
  protected async writeTargetData(data: { targets?: Target[]; groups?: Record<string, Group> }): Promise<boolean> {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const { fileURLToPath } = await import('url')
      
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      const dataDir = path.join(__dirname, '../platforms', this.platformId, 'data')
      const dataPath = path.join(dataDir, this.dataFileName)
      
      // Ensure directory exists
      await fs.mkdir(dataDir, { recursive: true })
      
      const jsonString = JSON.stringify(data, null, 2)
      await fs.writeFile(dataPath, jsonString, 'utf8')
      return true
    } catch (error) {
      console.error(`Error writing target data for ${this.platformId}:`, error)
      return false
    }
  }
}
