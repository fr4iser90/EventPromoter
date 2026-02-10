export function extractPostId(url?: string): string | undefined {
  if (!url) return undefined
  const match = url.match(/\/comments\/([^\/\?]+)/)
  return match ? match[1] : undefined
}
