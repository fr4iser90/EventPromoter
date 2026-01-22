/**
 * Schema Versioning Definitions
 * Defines the structure for schema version compatibility checks.
 */

/**
 * Schema version compatibility
 */
export interface SchemaVersion {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Parse schema version string (e.g., "1.2.3")
 */
export function parseSchemaVersion(version: string): SchemaVersion {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

/**
 * Check if schema version is compatible
 */
export function isSchemaVersionCompatible(version: string, minVersion: string): boolean {
  const v = parseSchemaVersion(version);
  const min = parseSchemaVersion(minVersion);
  
  if (v.major > min.major) return true;
  if (v.major < min.major) return false;
  if (v.minor > min.minor) return true;
  if (v.minor < min.minor) return false;
  return v.patch >= min.patch;
}
