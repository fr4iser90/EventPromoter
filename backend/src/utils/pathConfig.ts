import path from 'path';

export class PathConfig {
  private static getBaseDir() {
    return process.cwd();
  }

  static getEventsRoot() {
    return path.join(this.getBaseDir(), 'events');
  }

  static getEventDir(eventId: string) {
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
