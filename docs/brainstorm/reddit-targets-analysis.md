# Reddit Targets Analysis & Brainstorming

## 🎯 Ziel: Reddit API & n8n Publishing (wie Email)

### Aktueller Stand

#### ✅ Email (Referenz-Implementierung)
- **Targets**: Email-Adressen (`baseField: 'email'`)
- **Target-Typen**: Nur ein Typ (Email-Adressen)
- **Use Cases**: 
  - Email an alle Empfänger
  - Email an Gruppen
  - Email an einzelne Empfänger
- **Schema**: Einfach - nur `email` als baseField

#### 🔴 Reddit (Aktueller Stand)
- **Targets**: Nur Subreddits (`baseField: 'subreddit'`)
- **Target-Typen**: Nur ein Typ (Subreddits)
- **Use Cases**: 
  - Posts in Subreddits (öffentlich)
- **Schema**: Aktuell nur Subreddits

---

## 🤔 Brainstorming: Reddit Targets

### Reddit hat ZWEI verschiedene Use Cases:

#### 1. **Subreddit Posts** (öffentlich)
- Post wird in einem Subreddit veröffentlicht
- Alle User im Subreddit können den Post sehen
- Ähnlich wie ein öffentlicher Social Media Post

#### 2. **Direct Messages (DMs)** (privat)
- Nachricht wird direkt an einen User gesendet
- Nur der Empfänger sieht die Nachricht
- Ähnlich wie eine Email

### ❓ Fragen & Überlegungen:

#### **Frage 1: Sollen beide Target-Typen gleichzeitig unterstützt werden?**

**Option A: Zwei separate Target-Typen**
```
targets: {
  subreddits: ['r/techno', 'r/berlin'],
  users: ['u/username1', 'u/username2']
}
```

**Option B: Einheitliches Target-System mit Typ-Feld**
```
targets: [
  { type: 'subreddit', value: 'techno' },
  { type: 'user', value: 'username1' }
]
```

**Option C: Separate Content-Struktur**
```
content: {
  subredditPosts: [...],
  directMessages: [...]
}
```

#### **Frage 2: Wie sollen Targets im Schema definiert werden?**

**Aktuell (Email):**
```typescript
targetSchema: {
  baseField: 'email',
  baseFieldLabel: 'Email-Adresse',
  // ...
}
```

**Für Reddit - Option 1: Zwei separate Target-Schemas**
```typescript
// In settings.ts
subredditTargetSchema: {
  baseField: 'subreddit',
  // ...
},
userTargetSchema: {
  baseField: 'username',
  // ...
}
```

**Für Reddit - Option 2: Einheitliches Schema mit Typ-Feld**
```typescript
targetSchema: {
  baseField: 'target', // Generic
  targetType: 'subreddit' | 'user', // Required field
  // ...
}
```

**Für Reddit - Option 3: Zwei separate Target-Listen**
```typescript
// Zwei separate target-lists in Settings
sections: [
  {
    id: 'subreddit-list',
    title: 'Subreddits',
    // ...
  },
  {
    id: 'user-list',
    title: 'Users (for DMs)',
    // ...
  }
]
```

---

## 💡 Empfehlung: Hybrid-Ansatz

### **Vorschlag: Zwei separate Target-Typen mit gemeinsamer Infrastruktur**

#### 1. **Schema-Struktur**

```typescript
// settings.ts
export const redditSettingsSchema: SettingsSchema = {
  // ...
  targetSchema: {
    // Subreddit targets (für Posts)
    subredditTargetSchema: {
      baseField: 'subreddit',
      baseFieldLabel: 'Subreddit Name',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'Invalid subreddit name' }
      ],
      customFields: [
        { name: 'description', type: 'textarea', ... },
        { name: 'tags', type: 'multiselect', ... },
        { name: 'active', type: 'boolean', ... }
      ],
      supportsGroups: true
    },
    // User targets (für DMs)
    userTargetSchema: {
      baseField: 'username',
      baseFieldLabel: 'Reddit Username',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-zA-Z0-9_-]{3,20}$', message: 'Invalid username' }
      ],
      customFields: [
        { name: 'displayName', type: 'text', ... },
        { name: 'notes', type: 'textarea', ... },
        { name: 'active', type: 'boolean', ... }
      ],
      supportsGroups: true
    }
  }
}
```

#### 2. **Target Service Struktur**

```typescript
// services/targetService.ts
export class RedditTargetService extends BaseTargetService {
  // Get subreddit targets
  async getSubredditTargets(): Promise<Target[]> {
    // Load from data/subreddits.json or database
  }
  
  // Get user targets (for DMs)
  async getUserTargets(): Promise<Target[]> {
    // Load from data/users.json or database
  }
  
  // Get all targets (both types)
  async getTargets(type?: 'subreddit' | 'user'): Promise<Target[]> {
    if (type === 'subreddit') return this.getSubredditTargets()
    if (type === 'user') return this.getUserTargets()
    return [...await this.getSubredditTargets(), ...await this.getUserTargets()]
  }
}
```

#### 3. **Content-Struktur für Publishing**

```typescript
// In RedditApiPublisher
content: {
  // Für Subreddit Posts
  subredditPosts?: {
    mode: 'all' | 'groups' | 'individual',
    groups?: string[],
    individual?: string[],
    // Subreddit-spezifische Settings
    flair?: string,
    nsfw?: boolean,
    spoiler?: boolean
  },
  
  // Für Direct Messages
  directMessages?: {
    mode: 'all' | 'groups' | 'individual',
    groups?: string[],
    individual?: string[],
    // DM-spezifische Settings
    subject?: string
  },
  
  // Gemeinsamer Content
  text: string,
  title?: string, // Für Posts
  files?: any[]
}
```

#### 4. **Publisher-Logik**

```typescript
async publish(content: any, files: any[], hashtags: string[]): Promise<PostResult> {
  const results: PostResult[] = []
  
  // 1. Handle Subreddit Posts
  if (content.subredditPosts) {
    const subreddits = await this.extractSubreddits(content.subredditPosts)
    for (const subreddit of subreddits) {
      const result = await this.postToSubreddit(subreddit, content, files)
      results.push(result)
    }
  }
  
  // 2. Handle Direct Messages
  if (content.directMessages) {
    const users = await this.extractUsers(content.directMessages)
    for (const user of users) {
      const result = await this.sendDirectMessage(user, content)
      results.push(result)
    }
  }
  
  return this.combineResults(results)
}
```

---

## 📋 Vergleich: Email vs Reddit

| Aspekt | Email | Reddit (Vorschlag) |
|--------|-------|-------------------|
| **Target-Typen** | 1 (Email-Adressen) | 2 (Subreddits + Users) |
| **Use Cases** | Nur Emails | Posts + DMs |
| **Base Field** | `email` | `subreddit` + `username` |
| **Groups** | ✅ Ja | ✅ Ja (für beide Typen) |
| **Content-Format** | `_templates` mit `targets` | `subredditPosts` + `directMessages` |
| **Publisher-Logik** | Einfach (nur Emails) | Komplexer (2 verschiedene APIs) |

---

## 🚀 Implementierungs-Plan

### Phase 1: Subreddit Posts (wie aktuell, aber verbessert)
- ✅ Subreddit Targets Schema
- ✅ Subreddit Groups
- ✅ API Publisher für Posts
- ✅ n8n Integration für Posts

### Phase 2: User DMs (neu)
- ⬜ User Targets Schema
- ⬜ User Groups
- ⬜ API Publisher für DMs
- ⬜ n8n Integration für DMs

### Phase 3: Unified Content Structure
- ⬜ Content-Format mit `subredditPosts` + `directMessages`
- ⬜ Editor-UI für beide Typen
- ⬜ Preview für beide Typen

---

## ❓ Offene Fragen

1. **Sollen Subreddit- und User-Targets in derselben UI verwaltet werden?**
   - Option A: Separate Tabs (wie aktuell "Subreddits" und "Gruppen")
   - Option B: Ein Tab mit Typ-Auswahl
   - Option C: Zwei separate Settings-Bereiche

2. **Wie sollen Groups funktionieren?**
   - Option A: Separate Groups für Subreddits und Users
   - Option B: Gemischte Groups (Subreddits + Users zusammen)
   - Option C: Beides möglich

3. **Content-Editor: Wie sollen beide Typen ausgewählt werden?**
   - Option A: Checkbox "Post to Subreddits" + "Send DMs"
   - Option B: Tabs im Editor
   - Option C: Separate Content-Felder

4. **Sollen beide gleichzeitig möglich sein?**
   - Beispiel: Post in r/techno UND DM an u/username gleichzeitig?

---

## 💭 Meine Empfehlung

**Für den Start (MVP):**
1. **Zuerst Subreddit Posts vollständig implementieren** (wie Email)
   - API Publisher ✅
   - n8n Integration ✅
   - Targets & Groups ✅

2. **Dann User DMs als separate Feature hinzufügen**
   - Separate Target-Liste für Users
   - Separate Groups für Users
   - Separate Publisher-Logik

3. **Content-Format:**
   ```typescript
   content: {
     // Subreddit Posts (wie aktuell)
     subreddit?: string, // Legacy, wird zu subredditPosts migriert
     subredditPosts?: {
       mode: 'all' | 'groups' | 'individual',
       groups?: string[],
       individual?: string[]
     },
     
     // Direct Messages (neu)
     directMessages?: {
       mode: 'all' | 'groups' | 'individual',
       groups?: string[],
       individual?: string[]
     },
     
     // Gemeinsamer Content
     text: string,
     title: string,
     files: any[]
   }
   ```

**Warum dieser Ansatz?**
- ✅ Klare Trennung der Use Cases
- ✅ Einfache Erweiterung (erst Subreddits, dann Users)
- ✅ Wiederverwendbare Infrastruktur (BaseTargetService)
- ✅ Flexibel für zukünftige Features

---

## 🎯 Nächste Schritte

1. ✅ **Brainstorming abgeschlossen**
2. ✅ **Entscheidung: Clean Design ohne Legacy**
3. ⬜ Schema-Design finalisieren
4. ⬜ Target Service erweitern
5. ⬜ Publisher anpassen
6. ⬜ n8n Integration

---

## ✅ FINALE ENTSCHEIDUNG: Clean Design ohne Legacy

### Warum kein Legacy?

❌ **Legacy targetSchema unterstützt nur einen Target-Typ** → bremst dich bei Reddit (Subreddits + Users) und zukünftigen Plattformen

❌ **Alte Struktur im Code** → unnötige if/else-Checks überall → komplexer, fehleranfällig

✅ **Du willst ein generisches, erweiterbares System** → besser gleich sauber designen

### 💡 Lösung: "Richtig machen"

#### **1. SettingsSchema - Zwingend, kein optionales Legacy**

```typescript
export interface SettingsSchema {
  id: string;
  version: string;
  title: string;
  description?: string;
  sections: SettingsSection[];
  tabs?: Array<{ id: string; label: string; sections: string[] }>;
  
  // ✅ Zwingend, kein optionales legacy
  targetSchemas: Record<string, TargetSchema>;
  // key = targetType ('email', 'subreddit', 'user', etc.)
}
```

#### **2. Target - Mit targetType und value**

```typescript
export interface Target {
  id: string;
  targetType: string; // ✅ Zwingend: 'email' | 'subreddit' | 'user' | ...
  value: string; // ✅ Der eigentliche Wert (email, subreddit name, username)
  metadata?: Record<string, any>; // Custom fields (name, birthday, flair, notes, etc.)
  createdAt?: string;
  updatedAt?: string;
}
```

#### **3. BaseTargetService - Clean, generisch**

```typescript
export abstract class BaseTargetService {
  protected platformId: string;
  protected targetSchemas: Record<string, TargetSchema>; // ✅ Zwingend
  protected dataFileName: string = 'targets.json';
  
  constructor(platformId: string, targetSchemas: Record<string, TargetSchema>) {
    this.platformId = platformId;
    this.targetSchemas = targetSchemas;
  }

  // ✅ Abstract: type ist required
  abstract getBaseField(type: string): string;
  abstract validateBaseField(value: string, type: string): boolean;

  protected getTargetSchema(type: string): TargetSchema {
    const schema = this.targetSchemas[type];
    if (!schema) {
      throw new Error(`No schema for target type '${type}' in platform '${this.platformId}'`);
    }
    return schema;
  }

  async getTargets(type?: string): Promise<Target[]> {
    const data = await this.readTargetData();
    let targets = data?.targets || [];
    
    if (type) {
      targets = targets.filter(t => t.targetType === type);
    }
    
    return targets;
  }
}
```

#### **4. Publisher - Filtert nach targetType**

```typescript
// platforms/reddit/publishers/api.ts
export class RedditApiPublisher {
  private async extractSubreddits(targets: any): Promise<string[]> {
    const { RedditTargetService } = await import('../services/targetService.js');
    const service = new RedditTargetService();
    const allTargets = await service.getTargets('subreddit'); // ✅ Filter nach type
    
    if (targets.mode === 'all') {
      return allTargets.map(t => t.value);
    } else if (targets.mode === 'groups' && targets.groups) {
      // ... group logic
    } else if (targets.mode === 'individual' && targets.individual) {
      const subreddits = targets.individual
        .map((targetId: string) => allTargets.find(t => t.id === targetId)?.value)
        .filter((s: string | undefined): s is string => s !== undefined);
      return [...new Set(subreddits)];
    }
    return [];
  }

  private async extractUsers(targets: any): Promise<string[]> {
    const { RedditTargetService } = await import('../services/targetService.js');
    const service = new RedditTargetService();
    const allTargets = await service.getTargets('user'); // ✅ Filter nach type
    
    // ... ähnlich wie extractSubreddits
  }

  async publish(content: any, files: any[], hashtags: string[]): Promise<PostResult> {
    const results: PostResult[] = [];
    
    // ✅ Subreddit Posts
    if (content.subredditPosts) {
      const subreddits = await this.extractSubreddits(content.subredditPosts);
      for (const subreddit of subreddits) {
        const result = await this.postToSubreddit(subreddit, content, files);
        results.push(result);
      }
    }
    
    // ✅ Direct Messages
    if (content.directMessages) {
      const users = await this.extractUsers(content.directMessages);
      for (const user of users) {
        const result = await this.sendDirectMessage(user, content);
        results.push(result);
      }
    }
    
    return this.combineResults(results);
  }
}
```

### ✅ Vorteile dieses Ansatzes:

1. **Clean, modern, generisch** → zukunftssicher
2. **Keine Legacy-Müll**, kein unnötiger Fallback-Code
3. **Einfach**, neue Plattformen oder Target-Typen hinzuzufügen
4. **Type-safe**: `targetType` ist zwingend
5. **Klare Trennung**: Jeder Target-Typ hat sein Schema
6. **Publisher filtert nach targetType** → unterstützt beliebig viele Target-Typen pro Plattform

### 📝 Beispiel: Email Platform (Migration)

```typescript
// platforms/email/schema/settings.ts
export const emailSettingsSchema: SettingsSchema = {
  // ...
  targetSchemas: {
    email: {  // ✅ targetType: 'email'
      baseField: 'email',
      baseFieldLabel: 'Email-Adresse',
      baseFieldValidation: [
        { type: 'required', message: 'Email is required' },
        { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email format' }
      ],
      customFields: [
        { name: 'name', type: 'text', label: 'Name', required: false },
        { name: 'birthday', type: 'date', label: 'Geburtstag', required: false },
        // ...
      ],
      supportsGroups: true
    }
  }
}

// platforms/email/services/targetService.ts
export class EmailTargetService extends BaseTargetService {
  constructor() {
    const targetSchemas = {
      email: {
        baseField: 'email',
        baseFieldLabel: 'Email-Adresse',
        // ...
      }
    };
    super('email', targetSchemas);
  }

  getBaseField(type: string): string {
    if (type !== 'email') {
      throw new Error(`Email platform only supports 'email' target type, got '${type}'`);
    }
    return 'email';
  }

  validateBaseField(value: string, type: string): boolean {
    if (type !== 'email') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
```

### 📝 Beispiel: Reddit Platform (Zwei Target-Typen)

```typescript
// platforms/reddit/schema/settings.ts
export const redditSettingsSchema: SettingsSchema = {
  // ...
  targetSchemas: {
    subreddit: {  // ✅ targetType: 'subreddit'
      baseField: 'subreddit',
      baseFieldLabel: 'Subreddit Name',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'Invalid subreddit name' }
      ],
      customFields: [
        { name: 'description', type: 'textarea', label: 'Beschreibung', required: false },
        { name: 'tags', type: 'multiselect', label: 'Tags', required: false },
        { name: 'active', type: 'boolean', label: 'Aktiv', required: false, default: true }
      ],
      supportsGroups: true
    },
    user: {  // ✅ targetType: 'user'
      baseField: 'username',
      baseFieldLabel: 'Reddit Username',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-zA-Z0-9_-]{3,20}$', message: 'Invalid username' }
      ],
      customFields: [
        { name: 'displayName', type: 'text', label: 'Display Name', required: false },
        { name: 'notes', type: 'textarea', label: 'Notes', required: false },
        { name: 'active', type: 'boolean', label: 'Aktiv', required: false, default: true }
      ],
      supportsGroups: true
    }
  }
}

// platforms/reddit/services/targetService.ts
export class RedditTargetService extends BaseTargetService {
  constructor() {
    const targetSchemas = {
      subreddit: {
        baseField: 'subreddit',
        baseFieldLabel: 'Subreddit Name',
        // ...
      },
      user: {
        baseField: 'username',
        baseFieldLabel: 'Reddit Username',
        // ...
      }
    };
    super('reddit', targetSchemas);
  }

  getBaseField(type: string): string {
    if (type === 'subreddit') return 'subreddit';
    if (type === 'user') return 'username';
    throw new Error(`Reddit platform only supports 'subreddit' and 'user' target types, got '${type}'`);
  }

  validateBaseField(value: string, type: string): boolean {
    if (type === 'subreddit') {
      return /^[a-z0-9_]{3,21}$/.test(value);
    }
    if (type === 'user') {
      return /^[a-zA-Z0-9_-]{3,20}$/.test(value);
    }
    return false;
  }
}
```

### 🔄 Migration-Script für bestehende Daten

```typescript
// scripts/migrate-targets.ts
async function migrateEmailTargets() {
  const data = await readPlatformData('email', 'targets.json');
  const migrated = {
    targets: data.targets.map((t: any) => ({
      id: t.id,
      targetType: 'email', // ✅ Hinzufügen
      value: t.email, // ✅ Umbenennen
      ...Object.keys(t).reduce((acc, key) => {
        if (key !== 'id' && key !== 'email' && key !== 'createdAt' && key !== 'updatedAt') {
          acc[key] = t[key]; // Custom fields bleiben
        }
        return acc;
      }, {} as any),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    })),
    groups: data.groups
  };
  
  await writePlatformData('email', 'targets.json', migrated);
}

async function migrateRedditTargets() {
  const data = await readPlatformData('reddit', 'targets.json');
  const migrated = {
    targets: data.targets.map((t: any) => ({
      id: t.id,
      targetType: 'subreddit', // ✅ Hinzufügen
      value: t.subreddit, // ✅ Umbenennen
      ...Object.keys(t).reduce((acc, key) => {
        if (key !== 'id' && key !== 'subreddit' && key !== 'createdAt' && key !== 'updatedAt') {
          acc[key] = t[key];
        }
        return acc;
      }, {} as any),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }),
    groups: data.groups
  };
  
  await writePlatformData('reddit', 'targets.json', migrated);
}
```

### 🎯 Implementierungs-Reihenfolge

1. **Types aktualisieren** (`SettingsSchema`, `Target`)
2. **BaseTargetService refactoren** (targetSchemas statt targetSchema)
3. **Email Service anpassen** (Migration zu targetSchemas)
4. **Reddit Service implementieren** (mit subreddit + user)
5. **Migration-Script erstellen** (für bestehende Daten)
6. **Publisher anpassen** (filtert nach targetType)
7. **n8n Integration** (unterstützt beide Target-Typen)
