## 📋 **IMPLEMENTIERUNGSPLAN: Template-Management-System**

## 🏗️ **ARCHITEKTUR-ÜBERSICHT:**

```
Frontend (React)                    Backend (Node.js/Express)
├── TemplateEditor/               ├── controllers/
│   ├── TemplateList.jsx          │   └── templateController.ts
│   ├── TemplateEditor.jsx        ├── services/
│   └── TemplateSelector.jsx      │   └── templateService.ts
├── API Integration               ├── routes/
└── Store Integration             │   └── templates.ts
                                  ├── types/
                                  │   └── templateTypes.ts
                                  └── events/templates/
                                         ├── email.json
                                         ├── twitter.json
                                         └── ...
```

---

## 🔧 **BACKEND: Was erstellen?**

### **1. Neue Dateien:**

**`backend/src/types/templateTypes.ts`**
```typescript
// Template Types (erweitern bestehende)
export interface Template {
  id: string
  name: string  
  description?: string
  platform: string
  category: string
  template: Record<string, any> // Platform-specific structure
  variables: string[]
  isDefault: boolean // true for hardcoded, false for custom
  createdAt: string
  updatedAt: string
  createdBy?: string
}
```

**`backend/src/controllers/templateController.ts`**
```typescript
// CRUD Controller für Templates
export class TemplateController {
  // GET /api/templates/:platform
  static async getTemplates(req, res)
  
  // GET /api/templates/:platform/:id
  static async getTemplate(req, res)
  
  // POST /api/templates/:platform
  static async createTemplate(req, res)
  
  // PUT /api/templates/:platform/:id  
  static async updateTemplate(req, res)
  
  // DELETE /api/templates/:platform/:id
  static async deleteTemplate(req, res)
  
  // GET /api/templates/categories
  static async getCategories(req, res)
}
```

**`backend/src/services/templateService.ts`**
```typescript
// Template Storage & Management Service
export class TemplateService {
  // JSON-Dateien verwalten
  static async loadTemplates(platform: string): Promise<Template[]>
  static async saveTemplate(platform: string, template: Template): Promise<boolean>
  static async deleteTemplate(platform: string, id: string): Promise<boolean>
  
  // Default Templates mergen
  static mergeWithDefaults(platform: string): Template[]
  
  // Validation
  static validateTemplate(template: Template): ValidationResult
}
```

**`backend/src/routes/templates.ts`**
```typescript
// Template API Routes
router.get('/:platform', TemplateController.getTemplates)
router.get('/:platform/:id', TemplateController.getTemplate) 
router.post('/:platform', TemplateController.createTemplate)
router.put('/:platform/:id', TemplateController.updateTemplate)
router.delete('/:platform/:id', TemplateController.deleteTemplate)
router.get('/categories', TemplateController.getCategories)
```

### **2. Storage-Struktur:**

**`/backend/events/templates/`**
```
├── email.json     // Custom Email Templates
├── twitter.json   // Custom Twitter Templates
├── facebook.json  // Custom Facebook Templates
├── instagram.json // Custom Instagram Templates
├── linkedin.json  // Custom LinkedIn Templates
└── reddit.json    // Custom Reddit Templates
```

**Beispiel `email.json`:**
```json
{
  "templates": [
    {
      "id": "custom-welcome",
      "name": "Custom Welcome Email",
      "platform": "email", 
      "category": "welcome",
      "template": {
        "subject": "Welcome {userName}!",
        "html": "<h1>Welcome!</h1><p>Hi {userName}...</p>"
      },
      "variables": ["userName", "companyName"],
      "isDefault": false,
      "createdAt": "2025-01-06T10:00:00Z",
      "updatedAt": "2025-01-06T10:00:00Z"
    }
  ]
}
```

### **3. Bestehende Dateien erweitern:**

**`backend/src/routes/index.ts`** → Template-Routen einbinden
**`backend/src/platforms/*/templates.ts`** → `isDefault: true` hinzufügen

---

## 🎨 **FRONTEND: Was erstellen?**

### **1. Neue Komponenten:**

**`frontend/src/components/TemplateEditor/`**
```
├── TemplateList.jsx          // Template-Übersicht + CRUD
├── TemplateEditor.jsx        // Template erstellen/bearbeiten
├── TemplateSelector.jsx      // Template auswählen (für Content-Editor)
├── TemplatePreview.jsx       // Live-Preview beim Editieren
└── TemplateCategories.jsx    // Kategorie-Filter
```

**`frontend/src/hooks/useTemplates.js`**
```javascript
// Template-Management Hook
export const useTemplates = (platform) => {
  // CRUD-Operationen
  const { templates, loading, error } = useTemplates(platform)
  const createTemplate = useCreateTemplate(platform)
  const updateTemplate = useUpdateTemplate(platform) 
  const deleteTemplate = useDeleteTemplate(platform)
  
  return { templates, loading, error, createTemplate, updateTemplate, deleteTemplate }
}
```

### **2. Bestehende Komponenten erweitern:**

**`frontend/src/components/PlatformSelector/PlatformSelector.jsx`**
- Template-Count anzeigen
- Link zu Template-Editor

**`frontend/src/components/GenericPlatformEditor/GenericPlatformEditor.jsx`**  
- Template-Selector integrieren
- Template-Applier für Content

**`frontend/src/store.js`**
- Template-State hinzufügen
- Template-API-Actions integrieren

### **3. UI-Integration:**

**Template-Editor Modal/Dialog:**
- Platform auswählen
- Template-Name eingeben  
- Template-Content bearbeiten (WYSIWYG/HTML-Editor)
- Variables definieren
- Category zuweisen
- Live-Preview
- Save/Cancel

**Template-Selector in Content-Editor:**
- Dropdown/Liste mit Templates
- Filter nach Category  
- Apply-Button zum Übernehmen

---

## 🔄 **INTEGRATIONSPUNKTE:**

### **Backend:**
1. **Platform-Controller erweitern** → Templates in Response einbeziehen
2. **Template-Service** → Default + Custom Templates mergen
3. **Validation** → Template-Struktur prüfen

### **Frontend:**  
1. **Store erweitern** → Template-State + Actions
2. **Content-Editor** → Template-Applier integrieren
3. **Platform-Selector** → Template-Management-Links

---

## 📊 **IMPLEMENTIERUNGSREIHENFOLGE:**

### **Phase 1: Backend-Grundlagen** 
1. `templateTypes.ts` erstellen
2. `templateService.ts` erstellen (JSON-Storage)
3. `templateController.ts` erstellen (CRUD)
4. `templates.ts` Routes erstellen
5. In Haupt-Router einbinden

### **Phase 2: Frontend-Grundlagen**
1. `useTemplates` Hook erstellen
2. `TemplateList` Komponente erstellen
3. Store erweitern mit Template-State

### **Phase 3: Template-Editor**
1. `TemplateEditor` Komponente erstellen
2. `TemplatePreview` integrieren
3. CRUD-UI implementieren

### **Phase 4: Integration**
1. Content-Editor erweitern
2. Platform-Selector erweitern  
3. Testing & Validation

---

## 🎯 **ERFOLGSKRITERIEN:**

✅ **Backend:** Templates können über API verwaltet werden  
✅ **Frontend:** Templates können erstellt/bearbeitet/gelöscht werden  
✅ **Storage:** Custom Templates werden in JSON-Dateien gespeichert  
✅ **Integration:** Templates können in Content-Editor verwendet werden  
✅ **Fallback:** Default Templates bleiben verfügbar  

**Plan bereit zum Implementieren!** 🚀

(Warte auf dein "JA, implementieren" oder weitere Fragen) 🤔