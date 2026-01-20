# Plan: Panel Target Management Erweiterung

## Ziel
Erweiterung des Panel-Systems für generisches Target-Management mit Custom Fields für Personalisierung.

## Übersicht
- **Was:** Targets (Email-Empfänger, Reddit-Subreddits, LinkedIn-User, etc.) mit zusätzlichen Feldern verwalten
- **Wo:** Panel-Schema + Backend Services + Frontend Components
- **Warum:** Personalisierung ermöglichen (Name, Geburtstag, Tags, etc.)

---

## Phase 1: Backend - Type Definitions

### 1.1 Target Schema Interface
**Datei:** `backend/src/types/platformSchema.ts`

```typescript
/**
 * Target Schema Definition
 * Defines the structure for platform targets (recipients, subreddits, users, etc.)
 */
export interface TargetSchema {
  /** Base field name (e.g., 'email', 'subreddit', 'username') */
  baseField: string
  /** Base field label */
  baseFieldLabel: string
  /** Base field validation rules */
  baseFieldValidation?: ValidationRule[]
  /** Additional custom fields for personalization */
  customFields?: FieldDefinition[]
  /** Whether targets can be grouped */
  supportsGroups?: boolean
}

/**
 * Target Object Structure
 */
export interface Target {
  /** Unique target identifier */
  id: string
  /** Base field value (email, subreddit, etc.) */
  [baseField: string]: any
  /** Custom fields (name, birthday, tags, etc.) */
  [key: string]: any
  /** Metadata (optional additional data) */
  metadata?: Record<string, any>
  /** Timestamps */
  createdAt?: string
  updatedAt?: string
}
```

**Tasks:**
- [ ] `TargetSchema` Interface hinzufügen
- [ ] `Target` Interface hinzufügen
- [ ] `PanelSchema` um `targetSchema?: TargetSchema` erweitern

---

### 1.2 Base Target Service
**Datei:** `backend/src/services/targetService.ts` (NEU)

**Struktur:**
```typescript
export abstract class BaseTargetService {
  protected platformId: string
  protected targetSchema: TargetSchema
  
  // Abstract methods (platform-specific)
  abstract getBaseField(): string
  abstract validateBaseField(value: string): boolean
  
  // Generic methods (work for all platforms)
  async getTargets(): Promise<Target[]>
  async getTarget(targetId: string): Promise<Target | null>
  async addTarget(targetData: Record<string, any>): Promise<{ success: boolean; target?: Target; error?: string }>
  async updateTarget(targetId: string, targetData: Record<string, any>): Promise<{ success: boolean; error?: string }>
  async deleteTarget(targetId: string): Promise<{ success: boolean; error?: string }>
  
  // Group management
  async getGroups(): Promise<Record<string, string[]>>
  async createGroup(groupName: string, targetIds: string[]): Promise<{ success: boolean; error?: string }>
  async updateGroup(groupName: string, targetIds: string[]): Promise<{ success: boolean; error?: string }>
  async deleteGroup(groupName: string): Promise<{ success: boolean; error?: string }>
  
  // Helper methods
  protected validateCustomFields(data: Record<string, any>): ValidationResult
  protected extractCustomFields(data: Record<string, any>): Record<string, any>
  protected generateTargetId(): string
}
```

**Tasks:**
- [ ] `BaseTargetService` abstract class erstellen
- [ ] Generic CRUD-Methoden implementieren
- [ ] Group-Management-Methoden implementieren
- [ ] Validierung gegen `targetSchema` implementieren
- [ ] Migration von alten Datenstrukturen (Strings → Objects)

---

### 1.3 Platform-spezifische Target Services

#### Email Target Service
**Datei:** `backend/src/platforms/email/services/targetService.ts` (NEU)

```typescript
import { BaseTargetService } from '../../../../services/targetService.js'
import { TargetSchema } from '../../../../types/platformSchema.js'

export class EmailTargetService extends BaseTargetService {
  constructor() {
    super()
    this.platformId = 'email'
    // Load targetSchema from email panel schema
    this.targetSchema = {
      baseField: 'email',
      baseFieldLabel: 'Email-Adresse',
      baseFieldValidation: [
        { type: 'required', message: 'Email is required' },
        { type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email' }
      ],
      customFields: [
        { name: 'name', type: 'text', label: 'Name' },
        { name: 'birthday', type: 'date', label: 'Geburtstag' },
        { name: 'tags', type: 'multiselect', label: 'Tags' },
        { name: 'company', type: 'text', label: 'Firma' },
        { name: 'phone', type: 'text', label: 'Telefon' }
      ],
      supportsGroups: true
    }
  }
  
  getBaseField(): string {
    return 'email'
  }
  
  validateBaseField(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
```

**Tasks:**
- [ ] `EmailTargetService` erstellen
- [ ] `targetSchema` aus Panel-Schema laden
- [ ] Email-spezifische Validierung implementieren
- [ ] Migration von `recipients.json` (Strings → Objects)

#### Reddit Target Service
**Datei:** `backend/src/platforms/reddit/services/targetService.ts` (NEU)

```typescript
export class RedditTargetService extends BaseTargetService {
  constructor() {
    super()
    this.platformId = 'reddit'
    this.targetSchema = {
      baseField: 'subreddit',
      baseFieldLabel: 'Subreddit Name',
      baseFieldValidation: [
        { type: 'pattern', value: '^[a-z0-9_]{3,21}$', message: 'Invalid subreddit name' }
      ],
      customFields: [
        { name: 'description', type: 'textarea', label: 'Beschreibung' },
        { name: 'tags', type: 'multiselect', label: 'Tags' },
        { name: 'active', type: 'switch', label: 'Aktiv' }
      ],
      supportsGroups: true
    }
  }
  
  getBaseField(): string {
    return 'subreddit'
  }
  
  validateBaseField(subreddit: string): boolean {
    return /^[a-z0-9_]{3,21}$/.test(subreddit.toLowerCase())
  }
}
```

**Tasks:**
- [ ] `RedditTargetService` erstellen
- [ ] `targetSchema` aus Panel-Schema laden
- [ ] Subreddit-spezifische Validierung implementieren
- [ ] Migration von `subreddits.json` (Strings → Objects)

---

### 1.4 Panel Schema Erweiterung

#### Email Panel Schema
**Datei:** `backend/src/platforms/email/schema/panel.ts`

**Änderungen:**
- [ ] `targetSchema` hinzufügen
- [ ] Section `target-list` mit `target-list` field type
- [ ] Section `add-target` mit allen Custom Fields
- [ ] Section `edit-target` für Bearbeitung
- [ ] Section `group-management` aktualisieren (IDs statt Strings)

**Tasks:**
- [ ] `targetSchema` definieren
- [ ] `target-list` field type in `target-list` section
- [ ] `add-target` section mit Base Field + Custom Fields
- [ ] `edit-target` section mit Target-Auswahl + Edit-Form
- [ ] `group-management` auf Target-IDs umstellen

#### Reddit Panel Schema
**Datei:** `backend/src/platforms/reddit/schema/panel.ts`

**Tasks:**
- [ ] `targetSchema` definieren
- [ ] Sections analog zu Email anpassen
- [ ] Subreddit-spezifische Custom Fields

---

### 1.5 API Routes & Controllers

#### Generische Target Routes
**Datei:** `backend/src/routes/platforms.ts` (ERWEITERN)

**⚠️ WICHTIG: Routen werden in `platforms.ts` integriert, nicht als separate Datei!**

**Neue Routen (in `platforms.ts` hinzufügen):**
```typescript
// Generic target routes (work for all platforms)
router.get('/:platformId/targets', TargetController.getTargets)
router.post('/:platformId/targets', TargetController.addTarget)
router.get('/:platformId/targets/:targetId', TargetController.getTarget)
router.put('/:platformId/targets/:targetId', TargetController.updateTarget)
router.delete('/:platformId/targets/:targetId', TargetController.deleteTarget)

// Group routes
router.get('/:platformId/target-groups', TargetController.getGroups)
router.post('/:platformId/target-groups', TargetController.createGroup)
router.put('/:platformId/target-groups/:groupId', TargetController.updateGroup)
router.delete('/:platformId/target-groups/:groupId', TargetController.deleteGroup)

// Import/Export routes (optional, für alle Platforms)
router.post('/:platformId/target-groups/import', TargetController.importGroups)
router.get('/:platformId/target-groups/export', TargetController.exportGroups)
```

**Alte Routen (WERDEN ENTFERNT):**

**Email (alt - ENTFERNEN):**
- ❌ `GET /platforms/email/recipients` → ✅ `GET /platforms/email/targets`
- ❌ `POST /platforms/email/recipients` → ✅ `POST /platforms/email/targets`
- ❌ `DELETE /platforms/email/recipients/:email` → ✅ `DELETE /platforms/email/targets/:targetId`
- ❌ `GET /platforms/email/recipient-groups` → ✅ `GET /platforms/email/target-groups`
- ❌ `POST /platforms/email/recipient-groups` → ✅ `POST /platforms/email/target-groups`
- ❌ `PUT /platforms/email/recipient-groups/:groupName` → ✅ `PUT /platforms/email/target-groups/:groupId`
- ❌ `DELETE /platforms/email/recipient-groups/:groupName` → ✅ `DELETE /platforms/email/target-groups/:groupId`
- ❌ `POST /platforms/email/recipient-groups/import` → ✅ `POST /platforms/email/target-groups/import`
- ❌ `GET /platforms/email/recipient-groups/export` → ✅ `GET /platforms/email/target-groups/export`

**Reddit (alt - ENTFERNEN):**
- ❌ `GET /platforms/reddit/subreddits` → ✅ `GET /platforms/reddit/targets`
- ❌ `POST /platforms/reddit/subreddits` → ✅ `POST /platforms/reddit/targets`
- ❌ `DELETE /platforms/reddit/subreddits/:subreddit` → ✅ `DELETE /platforms/reddit/targets/:targetId`
- ❌ `GET /platforms/reddit/subreddit-groups` → ✅ `GET /platforms/reddit/target-groups`
- ❌ `POST /platforms/reddit/subreddit-groups` → ✅ `POST /platforms/reddit/target-groups`
- ❌ `PUT /platforms/reddit/subreddit-groups/:groupName` → ✅ `PUT /platforms/reddit/target-groups/:groupId`
- ❌ `DELETE /platforms/reddit/subreddit-groups/:groupName` → ✅ `DELETE /platforms/reddit/target-groups/:groupId`
- ❌ `POST /platforms/reddit/subreddit-groups/import` → ✅ `POST /platforms/reddit/target-groups/import`
- ❌ `GET /platforms/reddit/subreddit-groups/export` → ✅ `GET /platforms/reddit/target-groups/export`

**⚠️ WICHTIG: Keine Backward Compatibility!**
- Alte Routen werden direkt entfernt
- Frontend muss parallel migriert werden
- Keine Legacy-Support oder Wrapper-Funktionen
- Alles wird korrekt umgestellt, keine halben Lösungen

**Tasks:**
- [ ] `TargetController` erstellen
- [ ] Generic Routes in `platforms.ts` hinzufügen (VOR den dynamischen Platform-Routes!)
- [ ] **Alte Routen in `email/api/routes.ts` ENTFERNEN** (nicht deprecated, direkt löschen!)
- [ ] **Alte Routen in `reddit/routes.ts` ENTFERNEN** (nicht deprecated, direkt löschen!)
- [ ] **Alte Controller-Methoden ENTFERNEN** (`EmailController.getRecipients`, etc.)
- [ ] Platform-spezifische Services dynamisch laden
- [ ] Response-Format standardisieren (targets + options für multiselect)
- [ ] Import/Export-Endpoints implementieren

#### Target Controller
**Datei:** `backend/src/controllers/targetController.ts` (NEU)

```typescript
export class TargetController {
  // Target CRUD
  static async getTargets(req: Request, res: Response)
  static async getTarget(req: Request, res: Response)
  static async addTarget(req: Request, res: Response)
  static async updateTarget(req: Request, res: Response)
  static async deleteTarget(req: Request, res: Response)
  
  // Group management
  static async getGroups(req: Request, res: Response)
  static async createGroup(req: Request, res: Response)
  static async updateGroup(req: Request, res: Response)
  static async deleteGroup(req: Request, res: Response)
  
  // Import/Export
  static async importGroups(req: Request, res: Response)
  static async exportGroups(req: Request, res: Response)
  
  // Helper: Get platform-specific target service
  private static async getTargetService(platformId: string): Promise<BaseTargetService>
}
```

**Response-Format (standardisiert):**
```typescript
// GET /platforms/:platformId/targets
{
  success: true,
  targets: Target[],  // Full target objects with custom fields
  options: Array<{ label: string, value: string }>,  // For multiselect components
  groups: Record<string, string[]>  // Group name -> target IDs
}

// GET /platforms/:platformId/targets/:targetId
{
  success: true,
  target: Target
}

// POST /platforms/:platformId/targets
{
  success: true,
  target: Target
}

// GET /platforms/:platformId/target-groups
{
  success: true,
  groups: Record<string, string[]>  // Group name -> target IDs
}
```

**Tasks:**
- [ ] Controller-Methoden implementieren
- [ ] Platform-Service-Discovery (dynamisch laden aus `platforms/{platformId}/services/targetService.ts`)
- [ ] Error Handling (404 für nicht-existierende Platforms/Targets)
- [ ] Response-Formatierung (targets + options für multiselect)
- [ ] Import/Export-Endpoints (JSON-Format)

---

### 1.6 Datenstruktur Migration

**Datei:** `backend/src/services/targetMigration.ts` (NEU)

**Tasks:**
- [ ] Migration-Script für Email (Strings → Objects)
- [ ] Migration-Script für Reddit (Strings → Objects)
- [ ] Backward Compatibility (beide Formate lesen)
- [ ] Migration beim ersten Zugriff

---

## Phase 2: Frontend - Components

### 2.1 Target List Renderer
**Datei:** `frontend/src/features/schema/components/TargetListRenderer.jsx` (NEU)

**Features:**
- Tabelle/Liste mit konfigurierbaren Spalten
- Edit-Button öffnet Edit-Form
- Delete-Button mit Bestätigung
- Sortierbar
- Filterbar (nach Tags, etc.)
- Bulk-Actions (mehrere löschen)

**Tasks:**
- [ ] `TargetListRenderer` Component erstellen
- [ ] Tabelle mit `displayFields` rendern
- [ ] Edit-Funktionalität
- [ ] Delete-Funktionalität
- [ ] Sortierung implementieren
- [ ] Filterung implementieren
- [ ] Bulk-Actions

---

### 2.2 Schema Renderer Erweiterung
**Datei:** `frontend/src/features/schema/components/Renderer.jsx`

**Tasks:**
- [ ] `target-list` field type in SchemaRenderer hinzufügen
- [ ] `TargetListRenderer` importieren und verwenden
- [ ] Edit-Modal für Targets
- [ ] Delete-Confirmation Dialog

---

### 2.3 Panel Component Updates
**Datei:** `frontend/src/features/platform/components/Panel.jsx`

**Tasks:**
- [ ] `targetSchema` aus Panel-Schema lesen
- [ ] Custom Fields in Add/Edit-Forms rendern
- [ ] Target-List anzeigen
- [ ] Group-Management mit Target-IDs

---

## Phase 3: Testing & Migration

### 3.1 Unit Tests
**Tasks:**
- [ ] `BaseTargetService` Tests
- [ ] `EmailTargetService` Tests
- [ ] `RedditTargetService` Tests
- [ ] `TargetController` Tests
- [ ] Migration-Script Tests

---

### 3.2 Integration Tests
**Tasks:**
- [ ] API Endpoints testen
- [ ] Frontend Components testen
- [ ] End-to-End Flows testen

---

### 3.3 Migration
**Tasks:**
- [ ] Bestehende Daten migrieren
- [ ] Backward Compatibility testen
- [ ] Performance testen

---

## Implementierungsreihenfolge

### Phase 1: Backend Foundation
1. **Backend Types** (Phase 1.1) - `TargetSchema`, `Target` Interface
2. **Base Target Service** (Phase 1.2) - Abstract class mit generischen Methoden
3. **Platform Services** (Phase 1.3) - `EmailTargetService`, `RedditTargetService`
4. **Panel Schema Erweiterung** (Phase 1.4) - `targetSchema` in Panel-Schemas
5. **API Routes & Controller** (Phase 1.5) - Neue generische Routen + Controller
6. **Migration** (Phase 1.6) - Daten-Migration (Strings → Objects)

### Phase 2: Frontend (parallel zu Backend)
7. **Frontend Target List Renderer** (Phase 2.1) - Neue Component für Target-Liste
8. **Schema Renderer Erweiterung** (Phase 2.2) - `target-list` field type
9. **Panel Component Updates** (Phase 2.3) - Custom Fields in Forms
10. **Frontend API-Calls umstellen** - Alle API-Calls auf neue Routen umstellen

### Phase 3: Cleanup
11. **Alte Routen ENTFERNEN** - `email/api/routes.ts` und `reddit/routes.ts` bereinigen
12. **Alte Controller-Methoden ENTFERNEN** - `EmailController`, `RedditController` bereinigen
13. **Alte Services ENTFERNEN** - `EmailRecipientService`, `RedditSubredditService` entfernen (wenn nicht mehr benötigt)

### Phase 4: Testing
14. **Testing** (Phase 3) - Unit, Integration, E2E Tests

---

## Offene Fragen / Entscheidungen

- [x] **Wo wird `targetSchema` gespeichert?** → Panel-Schema (`panel.ts`), als `targetSchema` Property
- [x] **Wie werden Custom Fields validiert?** → Schema-basiert, über `targetSchema.customFields` mit Validation Rules
- [x] **Sollen alte Daten automatisch migriert werden?** → Ja, automatisch beim ersten Zugriff (siehe Phase 1.6)
- [x] **Wie werden Target-IDs generiert?** → UUID v4 (`crypto.randomUUID()`)
- [x] **Sollen Targets in Datenbank oder JSON-Dateien gespeichert werden?** → JSON-Dateien (wie bisher), in `platforms/{platformId}/data/targets.json`
- [x] **Wie werden alte Routen behandelt?** → Direkt entfernen, keine Backward Compatibility, keine Legacy-Support
- [x] **Routen-Struktur?** → In `platforms.ts` integriert, nicht als separate Datei
- [ ] **Sollen Import/Export für alle Platforms unterstützt werden?** → Ja, als generische Endpoints

---

## Erfolgskriterien

- ✅ Targets haben Custom Fields (Name, Geburtstag, etc.)
- ✅ Targets können bearbeitet werden
- ✅ Gruppen verwenden Target-IDs statt Strings
- ✅ Gleiche Struktur für alle Platforms
- [ ] Migration funktioniert
- [ ] Frontend zeigt Targets mit Custom Fields
- [ ] Personalisierung in Templates möglich
