/**
 * urlUtils.js
 * 
 * Utility functions for resolving dynamic URLs based on schema templates.
 */

/**
 * Resolves a schema endpoint URL by replacing dynamic placeholders.
 * 
 * The backend schema defines endpoints with placeholders like ':platformId' and ':id'.
 * This function takes such a template and replaces the placeholders with actual values.
 * This is NOT manipulation of the schema itself, but rather preparing a concrete URL
 * based on the schema's provided template for backend communication.
 *
 * @param {string} endpointTemplate The URL string with placeholders (e.g., 'platforms/:platformId/targets/:id').
 * @param {string} platformId The actual platform ID (e.g., 'email').
 * @param {string} [itemId] The actual item ID (e.g., a target or group ID).
 * @returns {string} The fully resolved URL.
 */
export function resolveSchemaEndpoint(endpointTemplate: string, platformId: string, itemId?: string): string {
  let resolvedUrl = endpointTemplate.replace(':platformId', platformId)
  if (itemId) {
    resolvedUrl = resolvedUrl.replace(':id', itemId)
  }
  return resolvedUrl
}
