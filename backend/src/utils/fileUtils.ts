// File utilities for reading and writing configuration files

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CONFIG_DIR = path.join(__dirname, '../../../config')

export async function readConfig(filename: string): Promise<any> {
  try {
    const filePath = path.join(CONFIG_DIR, filename)
    const data = await fs.readFile(filePath, 'utf8')
    if (process.env.DEBUG_CONFIG_ACCESS === 'true') {
      console.log('Reading config', {
        filename,
        preview: data.substring(0, 200) + (data.length > 200 ? '...' : '')
      })
    }
    if (!data || data.trim() === '') {
      return null // Empty file
    }
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      if (process.env.DEBUG_CONFIG_ACCESS === 'true') {
        console.log('Config not found', { filename })
      }
      return null // File doesn't exist
    }
    if (error instanceof SyntaxError) {
      console.warn('Invalid JSON in config', { filename, error: error.message })
      
      // ✅ Try to recover: Find first valid JSON object in the file
      try {
        const filePath = path.join(CONFIG_DIR, filename)
        const data = await fs.readFile(filePath, 'utf8')
        
        // Try to extract first valid JSON object
        const firstBrace = data.indexOf('{')
        if (firstBrace !== -1) {
          // Find matching closing brace
          let braceCount = 0
          let endPos = firstBrace
          for (let i = firstBrace; i < data.length; i++) {
            if (data[i] === '{') braceCount++
            if (data[i] === '}') braceCount--
            if (braceCount === 0) {
              endPos = i + 1
              break
            }
          }
          
          if (endPos > firstBrace) {
            const partialJson = data.substring(firstBrace, endPos)
            const recovered = JSON.parse(partialJson)
            console.warn('Recovered partial config from first JSON object', { filename })
            
            // Create backup of broken file
            const backupPath = `${filePath}.broken.${Date.now()}`
            await fs.writeFile(backupPath, data).catch(() => {})
            console.warn('Backup of broken config saved', { backupFile: path.basename(backupPath) })
            
            return recovered
          }
        }
      } catch (recoveryError) {
        console.warn('Could not recover config', { filename })
      }
      
      // ✅ Last resort: Try to load from backup file
      try {
        const backupFiles = await fs.readdir(CONFIG_DIR)
        const backupFile = backupFiles
          .filter(f => f.startsWith(filename) && f.includes('.broken.'))
          .sort()
          .reverse()[0] // Get most recent backup
        
        if (backupFile) {
          const backupPath = path.join(CONFIG_DIR, backupFile)
          const backupData = await fs.readFile(backupPath, 'utf8')
          const backupConfig = JSON.parse(backupData)
          console.warn('Loaded config from backup', { backupFile })
          return backupConfig
        }
      } catch (backupError) {
        // No backup available
      }
      
      // If all recovery attempts fail, return empty object instead of null
      // This prevents data loss when merging configs
      console.warn('Returning empty config to prevent data loss', { filename })
      return {}
    }
    throw error
  }
}

export async function writeConfig(filename: string, data: any): Promise<boolean> {
  try {
    const filePath = path.join(CONFIG_DIR, filename)
    const jsonString = JSON.stringify(data, null, 2)
    if (process.env.DEBUG_CONFIG_ACCESS === 'true') {
      console.log('Writing config', {
        filename,
        preview: jsonString.substring(0, 200) + (jsonString.length > 200 ? '...' : '')
      })
    }
    await fs.writeFile(filePath, jsonString)
    return true
  } catch (error) {
    console.error('Error writing config', { filename, error })
    return false
  }
}

export async function configExists(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(CONFIG_DIR, filename)
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export function getConfigPath(filename: string): string {
  return path.join(CONFIG_DIR, filename)
}
