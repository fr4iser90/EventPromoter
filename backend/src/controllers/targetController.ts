/**
 * Target Controller
 * 
 * Generic controller for target management across all platforms.
 * Works with platform-specific target services (EmailTargetService, RedditTargetService, etc.)
 * 
 * @module controllers/targetController
 */

import { Request, Response } from 'express'
import { BaseTargetService } from '../services/targetService.js'
import { Target, Group } from '@/types/schema/index.js'

export class TargetController {
  /**
   * Get all targets for a platform
   * GET /api/platforms/:platformId/targets
   */
  static async getTargets(req: Request, res: Response) {
    try {
      const { platformId } = req.params;
      const { type } = req.query; // Extract the 'type' query parameter
      const service = await TargetController.getTargetService(platformId);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        });
      }

      const targetType = typeof type === 'string' ? type : undefined;
      const targets = await service.getTargets(targetType); // Pass type to service
      const groups = await service.getGroups();
      const groupsArray = Array.isArray(groups) ? groups : Object.values(groups);

      // Transform targets to options format for multiselect components
      // targetType is REQUIRED - no fallbacks
      const options = targets.map((target: Target) => {
        if (!target.targetType) {
          console.error(`Target ${target.id} missing targetType - this should not happen`)
          return {
            label: target.id,
            value: target.id
          }
        }
        const targetBaseField = service.getBaseField(target.targetType)
        const baseValue = target[targetBaseField] || target.id
        const displayName = target.name || target.displayName || ''
        return {
          label: `${baseValue}${displayName ? ` (${displayName})` : ''}`,
          value: target.id
        }
      })

      return res.json({
        success: true,
        targets,
        options, // For multiselect components
        groups: groupsArray
      })
    } catch (error: any) {
      console.error('Get targets error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get targets',
        details: error.message
      })
    }
  }

  /**
   * Get a single target by ID
   * GET /api/platforms/:platformId/targets/:targetId
   */
  static async getTarget(req: Request, res: Response) {
    try {
      const { platformId, targetId } = req.params
      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const target = await service.getTarget(targetId)

      if (!target) {
        return res.status(404).json({
          success: false,
          error: 'Target not found'
        })
      }

      return res.json({
        success: true,
        target
      })
    } catch (error: any) {
      console.error('Get target error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get target',
        details: error.message
      })
    }
  }

  /**
   * Add a new target
   * POST /api/platforms/:platformId/targets
   */
  static async addTarget(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const targetData = req.body

      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const result = await service.addTarget(targetData)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)
    } catch (error: any) {
      console.error('Add target error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to add target',
        details: error.message
      })
    }
  }

  /**
   * Update an existing target
   * PUT /api/platforms/:platformId/targets/:targetId
   */
  static async updateTarget(req: Request, res: Response) {
    try {
      const { platformId, targetId } = req.params
      const targetData = req.body

      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const result = await service.updateTarget(targetId, targetData)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)
    } catch (error: any) {
      console.error('Update target error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update target',
        details: error.message
      })
    }
  }

  /**
   * Delete a target
   * DELETE /api/platforms/:platformId/targets/:targetId
   */
  static async deleteTarget(req: Request, res: Response) {
    try {
      const { platformId, targetId } = req.params
      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const result = await service.deleteTarget(targetId)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)
    } catch (error: any) {
      console.error('Delete target error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete target',
        details: error.message
      })
    }
  }

  /**
   * Get all groups for a platform
   * GET /api/platforms/:platformId/target-groups
   */
  static async getGroups(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const groups = await service.getGroups()
      const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)

      // Resolve target IDs to baseField values for display (generic)
      // targetType is REQUIRED - no fallbacks
      const targets = await service.getTargets()
      const targetMap = new Map(targets.map((t: Target) => {
        if (!t.targetType) {
          console.error(`Target ${t.id} missing targetType - this should not happen`)
          return [t.id, t.id]
        }
        const baseField = service.getBaseField(t.targetType)
        return [t.id, t[baseField] || t.id]
      }))

      // Add member values to each group (generic - uses baseField)
      const groupsWithMembers = groupsArray.map((group: any) => {
        const memberValues = group.targetIds
          ? group.targetIds
              .map((targetId: string) => targetMap.get(targetId))
              .filter((value: string | undefined): value is string => value !== undefined)
          : []
        return {
          ...group,
          memberValues // Add member values for display (generic)
        }
      })

      // Transform groups to options array for multiselect components
      const options = groupsWithMembers.map((group: any) => ({
        label: group.name,
        value: group.id
      }))

      return res.json({
        success: true,
        groups: groupsWithMembers, // Full group objects with member values
        options // For multiselect components
      })
    } catch (error: any) {
      console.error('Get groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get groups',
        details: error.message
      })
    }
  }

  /**
   * Get a single group by ID
   * GET /api/platforms/:platformId/target-groups/:groupId
   */
  static async getGroup(req: Request, res: Response) {
    try {
      const { platformId, groupId } = req.params
      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const group = await service.getGroup(groupId)

      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Group not found'
        })
      }

      // Resolve target IDs to baseField values for display (generic)
      // targetType is REQUIRED - no fallbacks
      const targets = await service.getTargets()
      const targetMap = new Map(targets.map((t: Target) => {
        if (!t.targetType) {
          console.error(`Target ${t.id} missing targetType - this should not happen`)
          return [t.id, t.id]
        }
        const baseField = service.getBaseField(t.targetType)
        return [t.id, t[baseField] || t.id]
      }))
      
      const memberValues = group.targetIds
        ? group.targetIds
            .map((targetId: string) => targetMap.get(targetId))
            .filter((value: string | undefined): value is string => value !== undefined)
        : []

      return res.json({
        success: true,
        group: {
          ...group,
          memberValues // Add member values for display (generic)
        }
      })
    } catch (error: any) {
      console.error('Get group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get group',
        details: error.message
      })
    }
  }

  /**
   * Create a new group
   * POST /api/platforms/:platformId/target-groups
   */
  static async createGroup(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const { name, targetIds } = req.body

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Group name is required'
        })
      }

      if (targetIds !== undefined && !Array.isArray(targetIds)) {
        return res.status(400).json({
          success: false,
          error: 'targetIds must be an array'
        })
      }

      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const result = await service.createGroup(name, targetIds)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)
    } catch (error: any) {
      console.error('Create group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create group',
        details: error.message
      })
    }
  }

  /**
   * Update an existing group
   * PUT /api/platforms/:platformId/target-groups/:groupId
   */
  static async updateGroup(req: Request, res: Response) {
    try {
      const { platformId, groupId } = req.params
      const { name, targetIds } = req.body

      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const updates: { name?: string; targetIds?: string[] } = {}
      if (name !== undefined) updates.name = name
      if (targetIds !== undefined) {
        if (!Array.isArray(targetIds)) {
          return res.status(400).json({
            success: false,
            error: 'targetIds must be an array'
          })
        }
        updates.targetIds = targetIds
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one field (name or targetIds) must be provided'
        })
      }

      const result = await service.updateGroup(groupId, updates)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)
    } catch (error: any) {
      console.error('Update group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update group',
        details: error.message
      })
    }
  }

  /**
   * Delete a group
   * DELETE /api/platforms/:platformId/target-groups/:groupId
   */
  static async deleteGroup(req: Request, res: Response) {
    try {
      const { platformId, groupId } = req.params
      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const result = await service.deleteGroup(groupId)

      if (!result.success) {
        return res.status(400).json(result)
      }

      return res.json(result)
    } catch (error: any) {
      console.error('Delete group error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete group',
        details: error.message
      })
    }
  }

  /**
   * Import groups from JSON
   * POST /api/platforms/:platformId/target-groups/import
   */
  static async importGroups(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const { groups } = req.body

      if (!groups || typeof groups !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Groups object is required'
        })
      }

      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      // Validate all target IDs exist
      const targets = await service.getTargets()
      const allTargetIds = new Set(targets.map(t => t.id))

      for (const [groupId, group] of Object.entries(groups)) {
        if (!group || typeof group !== 'object' || !('name' in group) || !('targetIds' in group)) {
          return res.status(400).json({
            success: false,
            error: `Invalid group format for key ${groupId}. Expected Group object with id, name, and targetIds.`
          })
        }

        const groupObj = group as Group
        const groupName = groupObj.name
        const targetIds = groupObj.targetIds

        if (!Array.isArray(targetIds)) {
          return res.status(400).json({
            success: false,
            error: `Group ${groupName} must have an array of target IDs`
          })
        }

        const invalidIds = targetIds.filter((id: string) => !allTargetIds.has(id))
        if (invalidIds.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Invalid target IDs in group ${groupName}: ${invalidIds.join(', ')}`
          })
        }

        // Create or update group
        const existingGroups = await service.getGroups()
        const existingGroup = Object.values(existingGroups).find(g => g.name === groupName)
        if (existingGroup) {
          await service.updateGroup(existingGroup.id, { targetIds })
        } else {
          await service.createGroup(groupName, targetIds)
        }
      }

      return res.json({
        success: true,
        message: 'Groups imported successfully'
      })
    } catch (error: any) {
      console.error('Import groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to import groups',
        details: error.message
      })
    }
  }

  /**
   * Export groups to JSON
   * GET /api/platforms/:platformId/target-groups/export
   */
  static async exportGroups(req: Request, res: Response) {
    try {
      const { platformId } = req.params
      const service = await TargetController.getTargetService(platformId)

      if (!service) {
        return res.status(404).json({
          success: false,
          error: `Target service not found for platform: ${platformId}`
        })
      }

      const groups = await service.getGroups()
      const groupsArray = Array.isArray(groups) ? groups : Object.values(groups)

      return res.json({
        success: true,
        groups: groupsArray
      })
    } catch (error: any) {
      console.error('Export groups error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to export groups',
        details: error.message
      })
    }
  }

  /**
   * Helper: Get platform-specific target service
   * Dynamically loads the service from platforms/{platformId}/services/targetService.ts
   */
  static async getTargetService(platformId: string): Promise<BaseTargetService | null> {
    try {
      // Try to import platform-specific target service
      const serviceModule = await import(`../platforms/${platformId}/services/targetService.js`)
      
      // Service should export a class that extends BaseTargetService
      const ServiceClass = serviceModule[`${platformId.charAt(0).toUpperCase() + platformId.slice(1)}TargetService`] ||
                          serviceModule.default ||
                          serviceModule.TargetService

      if (!ServiceClass) {
        console.warn('No target service found for platform', { platformId })
        return null
      }

      // Instantiate service
      return new ServiceClass()
    } catch (error: any) {
      // Handle module not found errors (expected for platforms without target services)
      if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND') {
        // Silently return null - this is expected for platforms that don't support targets
        return null
      }
      // Only log unexpected errors
      console.error('Error loading target service for platform', { platformId, error })
      return null
    }
  }
}
