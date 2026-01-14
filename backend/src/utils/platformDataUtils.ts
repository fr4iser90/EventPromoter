/**
 * Platform Data Utilities
 * 
 * Generic utilities for reading and writing platform-specific data files.
 * Data files are stored in platforms/{platformId}/data/{dataSource} where
 * dataSource is defined in PlatformMetadata.
 * 
 * @module utils/platformDataUtils
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPlatformRegistry } from '../services/platformRegistry.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get the data directory path for a platform
 */
function getPlatformDataDir(platformId: string): string {
  return path.join(__dirname, '../platforms', platformId, 'data')
}

/**
 * Get the data source filename for a platform from its metadata
 */
async function getPlatformDataSource(platformId: string): Promise<string | null> {
  try {
    const registry = getPlatformRegistry()
    const platform = registry.getPlatform(platformId)
    
    if (!platform) {
      console.warn(`Platform ${platformId} not found in registry`)
      return null
    }
    
    return platform.metadata.dataSource || null
  } catch (error) {
    console.error(`Error getting data source for ${platformId}:`, error)
    return null
  }
}

/**
 * Get the full file path for a platform data file
 */
async function getPlatformDataPath(platformId: string): Promise<string | null> {
  const dataSource = await getPlatformDataSource(platformId)
  
  if (!dataSource) {
    return null
  }
  
  const dataDir = getPlatformDataDir(platformId)
  return path.join(dataDir, dataSource)
}

/**
 * Ensure the platform data directory exists
 */
async function ensurePlatformDataDir(platformId: string): Promise<void> {
  const dataDir = getPlatformDataDir(platformId)
  try {
    await fs.access(dataDir)
  } catch {
    // Directory doesn't exist, create it
    await fs.mkdir(dataDir, { recursive: true })
  }
}

/**
 * Read a platform data file
 * Uses the dataSource from PlatformMetadata
 */
export async function readPlatformData(platformId: string): Promise<any> {
  try {
    const filePath = await getPlatformDataPath(platformId)
    
    if (!filePath) {
      // No dataSource defined for this platform
      return null
    }
    
    const data = await fs.readFile(filePath, 'utf8')
    
    if (!data || data.trim() === '') {
      return null // Empty file
    }
    
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist - return null (not an error)
      return null
    }
    if (error instanceof SyntaxError) {
      const dataSource = await getPlatformDataSource(platformId)
      console.warn(`❌ Invalid JSON in ${platformId}/data/${dataSource}, returning null: ${error.message}`)
      return null
    }
    throw error
  }
}

/**
 * Write a platform data file
 * Uses the dataSource from PlatformMetadata
 */
export async function writePlatformData(platformId: string, data: any): Promise<boolean> {
  try {
    const dataSource = await getPlatformDataSource(platformId)
    
    if (!dataSource) {
      console.error(`No dataSource defined for platform ${platformId}`)
      return false
    }
    
    // Ensure directory exists
    await ensurePlatformDataDir(platformId)
    
    const filePath = await getPlatformDataPath(platformId)
    if (!filePath) {
      return false
    }
    
    const jsonString = JSON.stringify(data, null, 2)
    await fs.writeFile(filePath, jsonString, 'utf8')
    return true
  } catch (error) {
    const dataSource = await getPlatformDataSource(platformId)
    console.error(`❌ Error writing ${platformId}/data/${dataSource}:`, error)
    return false
  }
}

/**
 * Check if a platform data file exists
 */
export async function platformDataExists(platformId: string): Promise<boolean> {
  try {
    const filePath = await getPlatformDataPath(platformId)
    if (!filePath) {
      return false
    }
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
