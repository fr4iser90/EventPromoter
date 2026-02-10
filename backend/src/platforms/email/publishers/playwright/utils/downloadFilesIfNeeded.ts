/**
 * Download Files If Needed
 * 
 * Downloads files from URLs if needed for Playwright file upload
 * 
 * @module platforms/email/publishers/playwright/utils/downloadFilesIfNeeded
 */

export async function downloadFilesIfNeeded(files: any[]): Promise<string[]> {
  const fsPromises = await import('fs/promises')
  const fs = await import('fs')
  const path = await import('path')
  const https = await import('https')
  const http = await import('http')

  const tempDir = path.join(process.cwd(), 'temp', 'playwright-uploads')
  await fsPromises.mkdir(tempDir, { recursive: true })

  const filePaths: string[] = []

  for (const file of files) {
    if (file.path) {
      filePaths.push(file.path)
    } else if (file.url) {
      const fileName = file.name || `file-${Date.now()}.${file.type?.split('/')[1] || 'pdf'}`
      const filePath = path.join(tempDir, fileName)

      await new Promise<void>((resolve, reject) => {
        const protocol = file.url.startsWith('https') ? https : http
        const fileStream = fs.createWriteStream(filePath)

        protocol.get(file.url, (response) => {
          response.pipe(fileStream)
          fileStream.on('finish', () => {
            fileStream.close()
            resolve()
          })
        }).on('error', reject)
      })

      filePaths.push(filePath)
    }
  }

  return filePaths
}
