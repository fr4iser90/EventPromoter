import path from 'path';

export class PathConfig {
  private static assertSafePathSegment(segment: string, segmentName: string) {
    if (
      !segment ||
      segment.includes('\0') ||
      segment.includes('/') ||
      segment.includes('\\') ||
      segment === '.' ||
      segment === '..'
    ) {
      throw new Error(`Invalid ${segmentName}`);
    }
  }

  private static getBaseDir() {
    return process.cwd();
  }

  static getEventsRoot() {
    return path.join(this.getBaseDir(), 'events');
  }

  static getEventDir(eventId: string) {
    this.assertSafePathSegment(eventId, 'eventId');
    return path.join(this.getEventsRoot(), eventId);
  }

  static getFilesDir(eventId: string) {
    return path.join(this.getEventDir(eventId), 'files');
  }

  static getPlatformsDir(eventId: string) {
    return path.join(this.getEventDir(eventId), 'platforms');
  }

  static getParsedDataPath(eventId: string) {
    return path.join(this.getEventDir(eventId), 'parsed-data.json');
  }

  static getEventJsonPath(eventId: string) {
    return path.join(this.getEventDir(eventId), 'event.json');
  }
}
