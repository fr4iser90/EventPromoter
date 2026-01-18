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
      console.log(`🔍 Reading config ${filename}:`, data.substring(0, 200) + (data.length > 200 ? '...' : ''))
    }
    if (!data || data.trim() === '') {
      return null // Empty file
    }
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      if (process.env.DEBUG_CONFIG_ACCESS === 'true') {
        console.log(`📁 Config ${filename} not found`)
      }
      return null // File doesn't exist
    }
    if (error instanceof SyntaxError) {
      console.warn(`❌ Invalid JSON in ${filename}, returning null: ${error.message}`)
      return null // Invalid JSON
    }
    throw error
  }
}

export async function writeConfig(filename: string, data: any): Promise<boolean> {
  try {
    const filePath = path.join(CONFIG_DIR, filename)
    const jsonString = JSON.stringify(data, null, 2)
    if (process.env.DEBUG_CONFIG_ACCESS === 'true') {
      console.log(`💾 Writing config ${filename}:`, jsonString.substring(0, 200) + (jsonString.length > 200 ? '...' : ''))
    }
    await fs.writeFile(filePath, jsonString)
    return true
  } catch (error) {
    console.error(`❌ Error writing ${filename}:`, error)
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
