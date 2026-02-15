import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Bestimme __dirname für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface FileContentResult {
  filename: string;
  buffer: Buffer;
  contentType: string;
}

export class FileService {
  private uploadDir: string;

  constructor() {
    // Hochgeladene Dateien befinden sich im 'temp/uploads' Verzeichnis relativ zum Projekt-Root
    // Dies muss an die tatsächliche Dateistruktur angepasst werden.
    this.uploadDir = path.resolve(__dirname, '../../../temp/uploads');
    console.log('FileService: Using upload directory', { uploadDir: this.uploadDir });
  }

  /**
   * Ruft den Inhalt einer Datei anhand ihrer ID ab.
   * @param fileId Die ID der Datei (z.B. UUID oder Dateiname)
   * @returns Den Dateinhalt (Buffer) und Metadaten, oder null, wenn nicht gefunden.
   */
  public async getFileContent(fileId: string): Promise<FileContentResult | null> {
    try {
      // TODO: In einem echten System sollte hier ein Lookup in einer Datenbank oder einem Index erfolgen,
      // um den echten Dateinamen und MIME-Typ anhand der fileId zu ermitteln.
      // Für jetzt nehmen wir an, die fileId ist der Dateiname und der MIME-Typ muss geraten werden.

      const filenameToLoad = String(fileId || '').trim();
      if (
        !filenameToLoad ||
        filenameToLoad.includes('/') ||
        filenameToLoad.includes('\\') ||
        filenameToLoad.includes('..') ||
        filenameToLoad.includes('\0')
      ) {
        console.warn('FileService: Rejected invalid file ID', { fileId });
        return null;
      }
      let contentType = 'application/octet-stream'; // Standard-MIME-Typ

      // Versuche MIME-Typ über Dateiendung zu erraten
      const ext = path.extname(fileId).toLowerCase();
      switch (ext) {
        case '.pdf': contentType = 'application/pdf'; break;
        case '.jpg':
        case '.jpeg': contentType = 'image/jpeg'; break;
        case '.png': contentType = 'image/png'; break;
        case '.gif': contentType = 'image/gif'; break;
        case '.doc': contentType = 'application/msword'; break;
        case '.docx': contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; break;
        case '.xls': contentType = 'application/vnd.ms-excel'; break;
        case '.xlsx': contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; break;
        case '.txt': contentType = 'text/plain'; break;
      }

      const filePath = path.resolve(this.uploadDir, filenameToLoad);
      if (filePath !== this.uploadDir && !filePath.startsWith(`${this.uploadDir}${path.sep}`)) {
        console.warn('FileService: Rejected path traversal attempt for file ID', { fileId });
        return null;
      }

      // Prüfen, ob die Datei existiert
      await fs.access(filePath, fs.constants.F_OK);

      const buffer = await fs.readFile(filePath);
      return {
        filename: filenameToLoad,
        buffer: buffer,
        contentType: contentType,
      };
    } catch (error) {
      console.error('FileService: Failed to get content for file ID', { fileId, error });
      return null;
    }
  }
}
