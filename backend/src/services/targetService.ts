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

const MAX_REGEX_SOURCE_LENGTH = 256
const SAFE_REGEX_SOURCE_PATTERN = /^[\w\s.^$*+?()[\]{}|\\/-]+$/

function createSafeValidationRegex(source: unknown): RegExp | null {
  if (typeof source !== 'string') return null
  if (!source || source.length > MAX_REGEX_SOURCE_LENGTH) return null
  if (!SAFE_REGEX_SOURCE_PATTERN.test(source)) return null
  // Basic backtracking guard for obviously dangerous constructs.
  if (/(\+\+|\*\*|\+\*|\*\+|\)\+[^)]*\+|\)\*[^)]*\*)/.test(source)) return null
  try {
    return new RegExp(source)
  } catch {
    return null
  }
}

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
  protected targetSchemas: Record<string, TargetSchema> // Multi-target support - required
  protected dataFileName: string = 'targets.json' // Override in subclasses if needed
  private static readonly SAFE_SEGMENT = /^[a-z0-9._-]+$/i
  
  constructor(platformId: string, targetSchemas: Record<string, TargetSchema>) {
    this.platformId = platformId
    this.targetSchemas = targetSchemas
  }

  // Abstract methods (platform-specific)
  /**
   * Validate the base field value
   */
  abstract validateBaseField(value: string, type?: string): boolean

  // Generic methods (work for all platforms)

  /**
   * Get all targets, optionally filtered by target type
   */
  async getTargets(type?: string): Promise<Target[]> {
    const data = await this.readTargetData();
    let targets = data?.targets || [];

    if (type) {
      // Filter by targetType (multi-target support)
      if (this.targetSchemas[type]) {
        // Only filter by targetType - no legacy support needed
        return targets.filter(target => target.targetType === type);
      }
      return [];
    }

    return targets;
  }
  
  /**
   * Get the target schema for a specific target type
   */
  getTargetSchema(type?: string): TargetSchema {
    if (type && this.targetSchemas[type]) {
      return this.targetSchemas[type];
    }
    // If no type specified, return first schema (for single-target platforms)
    const firstType = Object.keys(this.targetSchemas)[0];
    return this.targetSchemas[firstType];
  }
  
  /**
   * Get base field for a specific target type
   */
  getBaseField(type?: string): string {
    const schema = this.getTargetSchema(type);
    return schema.baseField;
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
    // targetType is REQUIRED - no auto-detection, no fallbacks
    const targetType = targetData.targetType;
    
    if (!targetType || typeof targetType !== 'string') {
      return { 
        success: false, 
        error: 'targetType is required. Must be one of: ' + Object.keys(this.targetSchemas).join(', ')
      }
    }
    
    // Validate that targetType exists in schemas
    if (!this.targetSchemas[targetType]) {
      return { 
        success: false, 
        error: `Invalid targetType: '${targetType}'. Must be one of: ` + Object.keys(this.targetSchemas).join(', ')
      }
    }
    
    const schema = this.getTargetSchema(targetType);
    
    // Validate base field
    const baseField = this.getBaseField(targetType);
    const baseValue = targetData[baseField];
    
    if (!baseValue || typeof baseValue !== 'string') {
      return { success: false, error: `${schema.baseFieldLabel} is required` }
    }

    if (!this.validateBaseField(baseValue, targetType)) {
      return { success: false, error: `Invalid ${schema.baseFieldLabel}` }
    }

    // Check if target already exists (by base field value and target type)
    const existingTargets = await this.getTargets(targetType);
    const normalizedBaseValue = this.normalizeBaseField(baseValue);
    
    if (existingTargets.some(t => {
      const existingBaseValue = this.normalizeBaseField(t[baseField]);
      return existingBaseValue === normalizedBaseValue && (!targetType || t.targetType === targetType);
    })) {
      return { success: false, error: `${schema.baseFieldLabel} already exists` }
    }

    // Validate custom fields
    const customFieldsValidation = this.validateCustomFields(targetData, schema)
    if (!customFieldsValidation.isValid) {
      const firstError = Object.values(customFieldsValidation.errors)[0]?.[0]
      return { success: false, error: firstError || 'Validation failed' }
    }

    // Create target object
    const target: Target = {
      id: this.generateTargetId(),
      targetType, // Always set targetType (required, no longer optional)
      [baseField]: baseValue,
      ...this.extractCustomFields(targetData, schema),
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
    const targetType = targetData.targetType || existingTarget.targetType
    const schema = this.getTargetSchema(targetType)
    const baseField = this.getBaseField(targetType)

    // If base field is being updated, validate it
    if (targetData[baseField] !== undefined) {
      const baseValue = targetData[baseField]
      if (!this.validateBaseField(baseValue, targetType)) {
        return { success: false, error: `Invalid ${schema.baseFieldLabel}` }
      }

      // Check if another target already has this base value (same type)
      const normalizedBaseValue = this.normalizeBaseField(baseValue)
      const conflictingTarget = targets.find(
        (t, idx) => idx !== targetIndex && 
        this.normalizeBaseField(t[baseField]) === normalizedBaseValue &&
        (!targetType || t.targetType === targetType)
      )
      if (conflictingTarget) {
        return { success: false, error: `${schema.baseFieldLabel} already exists` }
      }
    }

    // Validate custom fields
    const customFieldsValidation = this.validateCustomFields(targetData, schema)
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
   * Get a single group by ID
   */
  async getGroup(groupId: string): Promise<Group | null> {
    const groups = await this.getGroups()
    return groups.find(g => g.id === groupId) || null
  }

  /**
   * Create a new group
   */
  async createGroup(groupName: string, targetIds: string[] = []): Promise<{ success: boolean; group?: Group; error?: string }> {
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

    // Validate that all target IDs exist (only if targetIds is provided and not empty)
    if (targetIds && targetIds.length > 0) {
      const targets = await this.getTargets()
      const invalidIds = targetIds.filter(id => !targets.some(t => t.id === id))
      if (invalidIds.length > 0) {
        return { success: false, error: `Invalid target IDs: ${invalidIds.join(', ')}` }
      }
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
   */
  async updateGroup(groupId: string, updates: { name?: string; targetIds?: string[] }): Promise<{ success: boolean; group?: Group; error?: string }> {
    const data = await this.readTargetData()
    const currentGroups = data?.groups || {} as Record<string, Group>

    // Find group by ID
    const group: Group | undefined = currentGroups[groupId]
    
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
   */
  async deleteGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
    const data = await this.readTargetData()
    const currentGroups = data?.groups || {} as Record<string, Group>
    
    // Find group by ID
    const group: Group | undefined = currentGroups[groupId]
    
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
  protected validateCustomFields(data: Record<string, any>, schema?: TargetSchema): ValidationResult {
    const errors: Record<string, string[]> = {}
    const targetSchema = schema || this.getTargetSchema();

    if (!targetSchema.customFields) {
      return { isValid: true, errors }
    }

    for (const field of targetSchema.customFields) {
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
        if (typeof value === 'string') {
          const regex = createSafeValidationRegex(rule.value)
          if (!regex || !regex.test(value)) {
            return rule.message || `${field.label} format is invalid`
          }
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
  protected extractCustomFields(data: Record<string, any>, schema?: TargetSchema): Record<string, any> {
    const customFields: Record<string, any> = {}
    const targetSchema = schema || this.getTargetSchema();
    const baseField = this.getBaseField(data.targetType);

    if (targetSchema.customFields) {
      for (const field of targetSchema.customFields) {
        if (data[field.name] !== undefined && data[field.name] !== null) {
          customFields[field.name] = data[field.name]
        }
      }
    }

    // Don't include base field or targetType in custom fields
    delete customFields[baseField]
    delete customFields.targetType

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

  private validateSafeSegment(value: string, fieldName: string): string {
    const normalized = String(value || '').trim()
    if (
      !normalized ||
      normalized.includes('/') ||
      normalized.includes('\\') ||
      normalized.includes('..') ||
      normalized.includes('\0') ||
      !BaseTargetService.SAFE_SEGMENT.test(normalized)
    ) {
      throw new Error(`Invalid ${fieldName}`)
    }
    return normalized
  }

  private async resolveTargetDataPaths(): Promise<{ dataDir: string; dataPath: string }> {
    const path = await import('path')
    const { fileURLToPath } = await import('url')

    const safePlatformId = this.validateSafeSegment(this.platformId, 'platformId')
    const safeDataFileName = this.validateSafeSegment(this.dataFileName, 'dataFileName')
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const dataDir = path.resolve(__dirname, '../platforms', safePlatformId, 'data')
    const dataPath = path.resolve(dataDir, safeDataFileName)

    if (dataPath !== dataDir && !dataPath.startsWith(`${dataDir}${path.sep}`)) {
      throw new Error('Invalid target data path')
    }

    return { dataDir, dataPath }
  }

  /**
   * Read target data from file
   * Uses a custom data file name (targets.json) instead of the platform's default dataSource
   */
  protected async readTargetData(): Promise<{ targets?: Target[]; groups?: Record<string, Group> }> {
    try {
      const fs = await import('fs/promises')
      const { dataPath } = await this.resolveTargetDataPaths()
      
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
      const { dataDir, dataPath } = await this.resolveTargetDataPaths()
      
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
