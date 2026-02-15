/**
 * Secrets Manager
 * 
 * Utility for masking/unmasking secrets in API responses.
 * Ensures secrets are never exposed to the frontend in plain text.
 * Also provides encryption/decryption for stored credentials.
 * 
 * @module utils/secretsManager
 */

import crypto from 'crypto'

/**
 * Encryption configuration
 */
const ALGORITHM = 'aes-256-gcm' // Authenticated encryption (prevents tampering)
const IV_LENGTH = 16 // 16 bytes for AES
const SALT_LENGTH = 64 // 64 bytes for key derivation
const TAG_LENGTH = 16 // 16 bytes for authentication tag
const KEY_LENGTH = 32 // 32 bytes for AES-256
const ITERATIONS = 100000 // PBKDF2 iterations

/**
 * Get or generate encryption key
 * Priority:
 * 1. SECRETS_ENCRYPTION_KEY environment variable (highest priority)
 * 2. .secrets-key file (auto-generated, persistent)
 * 3. Generate new key and save to .secrets-key (first run)
 */
let cachedKey: Buffer | null = null

async function getEncryptionKey(): Promise<Buffer> {
  // Return cached key if available
  if (cachedKey) {
    return cachedKey
  }

  // Priority 1: Environment variable (explicit, highest priority)
  const envKey = process.env.SECRETS_ENCRYPTION_KEY
  if (envKey) {
    if (envKey.length === 64) {
      // Hex string (64 chars = 32 bytes)
      cachedKey = Buffer.from(envKey, 'hex')
      return cachedKey
    }
    // Derive key from string using PBKDF2
    cachedKey = crypto.pbkdf2Sync(envKey, 'secrets-salt', ITERATIONS, KEY_LENGTH, 'sha256')
    return cachedKey
  }

  // Priority 2: Load from .secrets-key file (auto-generated, persistent)
  try {
    const { getConfigPath } = await import('./fileUtils.js')
    const keyPath = getConfigPath('.secrets-key')
    
    // Try to read existing key file
    const fs = await import('fs/promises')
    try {
      const keyHex = await fs.readFile(keyPath, 'utf8')
      const trimmedKey = keyHex.trim()
      
      if (trimmedKey.length === 64) {
        // Valid hex key
        cachedKey = Buffer.from(trimmedKey, 'hex')
        console.log('✅ Loaded encryption key from .secrets-key file')
        return cachedKey
      } else {
        console.warn('⚠️ Invalid key format in .secrets-key, generating new key')
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        // File exists but couldn't read it
        throw error
      }
      // File doesn't exist, will generate new one
    }

    // Priority 3: Generate new key and save it
    console.log('🔐 Generating new encryption key...')
    const newKey = crypto.randomBytes(KEY_LENGTH)
    const keyHex = newKey.toString('hex')
    
    // Ensure config directory exists
    const path = await import('path')
    const keyDir = path.dirname(keyPath)
    await fs.mkdir(keyDir, { recursive: true })
    
    // Save to .secrets-key file with secure permissions
    await fs.writeFile(keyPath, keyHex, { 
      encoding: 'utf8',
      mode: 0o600 // Read/write for owner only (security)
    })
    
    cachedKey = newKey
    console.log('✅ Generated and saved encryption key to .secrets-key')
    console.log('   💡 Tip: For production, set SECRETS_ENCRYPTION_KEY environment variable')
    console.log('   💡 Or backup .secrets-key file securely (required to decrypt existing data)')
    
    return cachedKey
  } catch (error) {
    console.error('❌ Failed to manage encryption key:', error)
    // Fallback: generate in-memory key (will be lost on restart)
    console.warn('⚠️ Using in-memory key (will be lost on restart - not recommended!)')
    cachedKey = crypto.randomBytes(KEY_LENGTH)
    return cachedKey
  }
}

/**
 * Synchronous version for backward compatibility (uses cached key)
 * Note: First call should be awaited to ensure key is loaded
 */
function getEncryptionKeySync(): Buffer {
  if (cachedKey) {
    return cachedKey
  }
  // If not cached, this is an error - key should be loaded first
  throw new Error('Encryption key not initialized. Call getEncryptionKey() first.')
}

/**
 * Encrypt a value using AES-256-GCM
 * Returns: base64(IV + Salt + Tag + EncryptedData)
 */
export async function encryptValue(value: string): Promise<string> {
  if (!value || value === '') {
    return ''
  }
  
  try {
    const key = await getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const salt = crypto.randomBytes(SALT_LENGTH)
    
    // Derive a unique key for this encryption using the salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, ITERATIONS, KEY_LENGTH, 'sha256')
    
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv, { authTagLength: TAG_LENGTH })
    
    let encrypted = cipher.update(value, 'utf8')
    encrypted = Buffer.concat([encrypted, cipher.final()])
    
    const tag = cipher.getAuthTag()
    
    // Combine: IV + Salt + Tag + EncryptedData
    const combined = Buffer.concat([iv, salt, tag, encrypted])
    
    return combined.toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt value')
  }
}

/**
 * Decrypt a value using AES-256-GCM
 * Input: base64(IV + Salt + Tag + EncryptedData)
 */
export async function decryptValue(encryptedValue: string): Promise<string> {
  if (!encryptedValue || encryptedValue === '') {
    return ''
  }
  
  try {
    const key = await getEncryptionKey()
    const combined = Buffer.from(encryptedValue, 'base64')
    
    // Extract components
    const iv = combined.subarray(0, IV_LENGTH)
    const salt = combined.subarray(IV_LENGTH, IV_LENGTH + SALT_LENGTH)
    const tag = combined.subarray(IV_LENGTH + SALT_LENGTH, IV_LENGTH + SALT_LENGTH + TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + SALT_LENGTH + TAG_LENGTH)
    
    // Derive the same key used for encryption
    const derivedKey = crypto.pbkdf2Sync(key, salt, ITERATIONS, KEY_LENGTH, 'sha256')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv, { authTagLength: TAG_LENGTH })
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    
    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    // If decryption fails, it might be an unencrypted value (backward compatibility)
    // Try to return as-is if it looks like plain text
    if (error instanceof Error && error.message.includes('Unsupported state')) {
      // Might be an unencrypted value, return as-is
      return encryptedValue
    }
    throw new Error('Failed to decrypt value')
  }
}

/**
 * Check if a value is encrypted (base64 format with expected length)
 */
export function isEncrypted(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }
  
  // Encrypted values are base64 and have a minimum length
  // IV (16) + Salt (64) + Tag (16) + at least some data = ~100+ bytes = ~133+ base64 chars
  if (value.length < 100) {
    return false
  }
  
  // Check if it's valid base64
  try {
    const decoded = Buffer.from(value, 'base64')
    // Check if it has the expected structure (at least IV + Salt + Tag)
    return decoded.length >= IV_LENGTH + SALT_LENGTH + TAG_LENGTH
  } catch {
    return false
  }
}

/**
 * Mask a secret value (shows only first 4 and last 4 characters)
 */
export function maskSecret(value: string | undefined | null): string {
  if (!value || value === '') {
    return ''
  }
  
  // If value is already masked (contains asterisks), return as is
  if (value.includes('*')) {
    return value
  }
  
  // If value is too short, mask completely
  if (value.length <= 8) {
    return '********'
  }
  
  // Show first 4 and last 4 characters, mask the rest
  const first = value.substring(0, 4)
  const last = value.substring(value.length - 4)
  const masked = '*'.repeat(Math.max(8, value.length - 8))
  
  return `${first}${masked}${last}`
}

/**
 * Check if a value is a masked secret (contains asterisks)
 */
export function isMasked(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }
  return value.includes('*')
}

/**
 * Mask all sensitive fields in a settings object
 * Sensitive fields are: password, secret, token, key, apiKey, apiSecret, accessToken, clientSecret
 */
export function maskSecrets(settings: Record<string, any>, sensitiveFields?: string[]): Record<string, any> {
  const defaultSensitiveFields = [
    'password',
    'secret',
    'token',
    'key',
    'apiKey',
    'apiSecret',
    'accessToken',
    'accessTokenSecret',
    'clientSecret',
    'clientId', // Sometimes sensitive
    'refreshToken',
    'privateKey',
    'authToken'
  ]
  
  const fieldsToMask = sensitiveFields || defaultSensitiveFields
  const masked = { ...settings }
  
  for (const [key, value] of Object.entries(masked)) {
    // Check if field name contains any sensitive keyword
    const isSensitive = fieldsToMask.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )
    
    if (isSensitive && typeof value === 'string' && value !== '') {
      // Only mask if not already masked
      if (!isMasked(value)) {
        masked[key] = maskSecret(value)
      }
    }
  }
  
  return masked
}

/**
 * Merge new settings with existing settings, preserving masked values
 * If a new value is masked (unchanged), empty, null, or undefined, keep the existing value
 */
export function mergeSettings(
  existing: Record<string, any>,
  newSettings: Record<string, any>,
  sensitiveFields?: string[]
): Record<string, any> {
  const defaultSensitiveFields = [
    'password',
    'secret',
    'token',
    'key',
    'apiKey',
    'apiSecret',
    'accessToken',
    'accessTokenSecret',
    'clientSecret',
    'refreshToken',
    'privateKey',
    'authToken'
  ]
  
  const fieldsToCheck = sensitiveFields || defaultSensitiveFields
  const merged = { ...existing }
  
  for (const [key, newValue] of Object.entries(newSettings)) {
    // Check if field is sensitive
    const isSensitive = fieldsToCheck.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )
    
    if (isSensitive) {
      const existingValue = existing[key]
      
      // If new value is masked (unchanged), keep existing value
      if (isMasked(newValue) && existingValue && !isMasked(existingValue)) {
        merged[key] = existingValue
      }
      // If new value is empty string, null, or undefined and existing has value, keep existing
      else if ((newValue === '' || newValue === null || newValue === undefined) && existingValue) {
        merged[key] = existingValue
      }
      // Otherwise, use new value (actually changed)
      else if (newValue !== undefined && newValue !== null && newValue !== '') {
        merged[key] = newValue
      }
    } else {
      // For non-sensitive fields, use new value if provided, otherwise keep existing
      if (newValue !== undefined && newValue !== null && newValue !== '') {
        merged[key] = newValue
      } else if (existing[key] !== undefined) {
        merged[key] = existing[key]
      }
    }
  }
  
  return merged
}

/**
 * Extract only changed values (non-masked, non-empty) from settings
 * Empty, null, or undefined values are treated as "not changed" (partial update)
 */
export function extractChangedValues(
  existing: Record<string, any>,
  newSettings: Record<string, any>,
  sensitiveFields?: string[]
): Record<string, any> {
  const defaultSensitiveFields = [
    'password',
    'secret',
    'token',
    'key',
    'apiKey',
    'apiSecret',
    'accessToken',
    'accessTokenSecret',
    'clientSecret',
    'refreshToken',
    'privateKey',
    'authToken'
  ]
  
  const fieldsToCheck = sensitiveFields || defaultSensitiveFields
  const changed: Record<string, any> = {}
  
  for (const [key, newValue] of Object.entries(newSettings)) {
    const isSensitive = fieldsToCheck.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )
    
    const existingValue = existing[key]
    
    // For sensitive fields: only include if actually changed (not masked, not empty)
    if (isSensitive) {
      // Skip if masked (unchanged placeholder)
      if (isMasked(newValue)) {
        continue
      }
      // Skip if empty, null, or undefined (partial update - keep existing)
      if (newValue === '' || newValue === null || newValue === undefined) {
        continue
      }
      // Only include if actually different from existing
      if (newValue !== existingValue) {
        changed[key] = newValue
      }
    }
    // For non-sensitive fields: include if changed and not empty
    else {
      if (newValue !== undefined && newValue !== null && newValue !== '' && newValue !== existingValue) {
        changed[key] = newValue
      }
    }
  }
  
  return changed
}

/**
 * Encrypt all sensitive fields in a settings object before saving
 */
export async function encryptSecrets(
  settings: Record<string, any>,
  sensitiveFields?: string[]
): Promise<Record<string, any>> {
  const defaultSensitiveFields = [
    'password',
    'secret',
    'token',
    'key',
    'apiKey',
    'apiSecret',
    'accessToken',
    'accessTokenSecret',
    'clientSecret',
    'refreshToken',
    'privateKey',
    'authToken'
  ]
  
  const fieldsToEncrypt = sensitiveFields || defaultSensitiveFields
  const encrypted = { ...settings }
  
  for (const [key, value] of Object.entries(encrypted)) {
    // Check if field name contains any sensitive keyword
    const isSensitive = fieldsToEncrypt.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )
    
    if (isSensitive && typeof value === 'string' && value !== '') {
      // Only encrypt if not already encrypted and not masked
      if (!isEncrypted(value) && !isMasked(value)) {
        encrypted[key] = await encryptValue(value)
      }
    }
  }
  
  return encrypted
}

/**
 * Decrypt all sensitive fields in a settings object after loading
 */
export async function decryptSecrets(
  settings: Record<string, any>,
  sensitiveFields?: string[]
): Promise<Record<string, any>> {
  const defaultSensitiveFields = [
    'password',
    'secret',
    'token',
    'key',
    'apiKey',
    'apiSecret',
    'accessToken',
    'accessTokenSecret',
    'clientSecret',
    'refreshToken',
    'privateKey',
    'authToken'
  ]
  
  const fieldsToDecrypt = sensitiveFields || defaultSensitiveFields
  const decrypted = { ...settings }
  
  for (const [key, value] of Object.entries(decrypted)) {
    // Check if field name contains any sensitive keyword
    const isSensitive = fieldsToDecrypt.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )
    
    if (isSensitive && typeof value === 'string' && value !== '') {
      // Only decrypt if encrypted
      if (isEncrypted(value)) {
        try {
          decrypted[key] = await decryptValue(value)
        } catch (error) {
          console.error('Failed to decrypt key', { key, error })
          // Keep encrypted value if decryption fails
        }
      }
    }
  }
  
  return decrypted
}
