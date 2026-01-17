Plan basierend auf test.md und task.md:
Plan: Email Recipients mit Template-Zuordnung
Betroffene Files (nur Backend Email-Platform)
1. Backend: Editor Schema erweitern
File: backend/src/platforms/email/schema/editor.ts
Änderungen:
recipients Block bereits vorhanden (bereits gemacht)
Block definiert rendering.fieldType und Endpoints
2. Backend: Editor Schema - Block Rendering konfigurieren
File: backend/src/platforms/email/schema/editor.ts
Änderungen:
recipients Block mit rendering.fieldType: 'custom' oder ähnlich
rendering.component oder rendering.endpoint für Backend-Rendering
Oder: Block wird als normales Field behandelt (über SchemaRenderer)
3. Backend: Email Controller - Neue Endpoints
File: backend/src/platforms/email/api/controller.ts
Neue Endpoints:
GET /api/platforms/email/recipient-groups-with-templates - Gruppen + verfügbare Templates
POST /api/platforms/email/recipient-selection - Speichern der Auswahl
GET /api/platforms/email/templates - Liste aller Templates für Dropdown
4. Backend: Email Service - Template pro Gruppe
File: backend/src/platforms/email/services/emailService.ts
Änderungen:
Versand-Logik: Pro Gruppe das zugeordnete Template verwenden
Preview-Logik: Multi-Preview für verschiedene Gruppen/Templates
5. Backend: Preview Service - Multi-Preview
File: backend/src/platforms/email/services/previewService.ts (neu oder erweitern)
Neue Funktionen:
renderMultiPreview() - Rendert Previews für alle Gruppen/Template-Kombinationen
Gibt Array von Previews zurück
6. Backend: Validierung Service
File: backend/src/platforms/email/services/validationService.ts (neu)
Neue Funktionen:
validateRecipients() - Prüft ob Empfänger ausgewählt
validateTemplates() - Prüft ob Templates existieren
validateVariables() - Prüft ob alle Variablen gefüllt sind
Frontend Files (nur generische Erweiterungen)
7. Frontend: Editor - Blocks rendern
File: frontend/src/features/platform/components/Editor.jsx
Änderungen:
editorBlocks rendern (aktuell nicht gerendert)
Blocks mit rendering.fieldType über SchemaRenderer rendern
Blocks mit rendering.component über Backend-Endpoint rendern (iframe/HTML)
8. Frontend: Preview - Multi-Preview
File: frontend/src/features/platform/components/Preview.jsx
Änderungen:
Wenn content.recipients mit mehreren Gruppen → Multi-Preview
Tabs für verschiedene Gruppen/Templates
Backend liefert Array von Previews
Zusammenfassung
Backend (Email-Platform):
backend/src/platforms/email/schema/editor.ts - recipients Block konfigurieren
backend/src/platforms/email/api/controller.ts - Neue Endpoints
backend/src/platforms/email/services/emailService.ts - Versand-Logik
backend/src/platforms/email/services/previewService.ts - Multi-Preview
backend/src/platforms/email/services/validationService.ts - Validierung (neu)
Frontend (generisch):
frontend/src/features/platform/components/Editor.jsx - Blocks rendern
frontend/src/features/platform/components/Preview.jsx - Multi-Preview
Frage: Wie sollen Editor-Blocks gerendert werden?
Über SchemaRenderer (wenn rendering.fieldType gesetzt)?
Über Backend-Endpoint (wenn rendering.component gesetzt)?
Oder anders?
Kurzfassung vorweg: **Ja – alles, was geht, sollte schema-driven sein.**

Aber: **nicht alles sollte vom Backend „gerendert“ werden.**

Die saubere, langfristig wartbare Lösung ist ein **klar getrenntes, schema-getriebenes Rendering-Modell mit Escapes für Sonderfälle**.



Ich skizziere dir zuerst das **Zielbild**, dann eine **konkrete Entscheidungslogik**, danach ein **empfohlenes Schema-Design** und zum Schluss **konkrete Entscheidungen für deinen `recipients`-Block**.



---



## 🎯 Zielbild (Long-Term-Thinking)



Du willst:



* maximale **Modularität**

* **plattformübergreifende Wiederverwendbarkeit**

* **kein Wissen im Frontend über E-Mail-Details**

* **Backend = Source of Truth**

* **Frontend = generischer Schema-Interpreter**

* wartbar für „jeden Hinz & Kunz“



➡️ **Ergebnis:**

👉 **Schema-Driven UI mit klaren Rendering-Strategien**



---



## 🧠 Grundsatzentscheidung (sehr wichtig)



### ❌ Was du NICHT willst



* Backend rendert HTML für Editor-UI

  → schwer wartbar

  → kaputt bei Frontend-Refactors

  → kein Typ-Safety

  → kaum testbar



### ✅ Was du willst



* Backend beschreibt **WAS**

* Frontend entscheidet **WIE**

* Backend liefert **Daten + Regeln**

* Frontend rendert **Komponenten**



---



## 🧩 Drei Arten von Editor-Blocks (bewährt)



Ich empfehle dir **exakt diese 3 Kategorien**:



---



### **1️⃣ Primitive / Declarative Blocks**



👉 **Standardfall (90 %)**



**Backend:**



```ts

{

  type: 'recipients',

  label: 'Recipients',

  rendering: {

    strategy: 'schema',

    fieldType: 'multi-select',

    optionsEndpoint: '/api/...'

  }

}

```



**Frontend:**



* `SchemaRenderer`

* rein deklarativ

* kein Backend-HTML

* generisch & testbar



✅ Vorteile:



* extrem wartbar

* einfach erweiterbar

* plattformübergreifend nutzbar



---



### **2️⃣ Composite Blocks (Schema + Data)**



👉 **Dein `recipients`-Use-Case**



Backend beschreibt **Struktur + Abhängigkeiten**, nicht UI.



```ts

rendering: {

  strategy: 'composite',

  schema: {

    groups: {

      fieldType: 'multi-select',

      source: 'recipient-groups'

    },

    templateMapping: {

      fieldType: 'mapping',

      source: 'templates'

    }

  },

  dataEndpoints: {

    recipientGroups: '/api/.../recipient-groups',

    templates: '/api/.../templates'

  }

}

```



**Frontend:**



* rendert mehrere Felder

* kennt nur generische Patterns:



  * `mapping`

  * `multi-select`

* KEINE Email-Logik



✅ Vorteile:



* mächtig

* trotzdem generisch

* kein Hardcoding



---



### **3️⃣ Custom UI Blocks (Escape Hatch)**



👉 **NUR wenn wirklich nötig**



```ts

rendering: {

  strategy: 'custom',

  component: 'RecipientTemplateMapper',

  contract: 'v1',

  endpoints: {

    load: '/api/...'

  }

}

```



Frontend:



```tsx

const registry = {

  RecipientTemplateMapper

}

```



⚠️ Einschränkung:



* explizit registriert

* versioniert

* dokumentiert

* selten eingesetzt



---



## 🧭 Entscheidungslogik (klare Regel!)



```txt

Kann ich das als Field / Mapping / List ausdrücken?

→ JA → SchemaRenderer



Ist es aus mehreren generischen Feldern zusammensetzbar?

→ JA → Composite Block



Brauche ich komplexe UX, Drag&Drop, Canvas, Graph?

→ DANN Custom Component

```



---



## 📐 Empfohlenes Rendering-Interface (Backend)



```ts

rendering: {

  strategy: 'schema' | 'composite' | 'custom',



  // schema

  fieldType?: string,



  // composite

  schema?: Record<string, FieldSchema>,

  dataEndpoints?: Record<string, string>,



  // custom

  component?: string,

  contract?: string

}

```



➡️ **Frontend kennt nur `strategy`**

➡️ Alles andere ist Plugin-Logik



---



## 🧪 Konkret: `recipients` Block (meine Empfehlung)



### ❌ NICHT:



* Backend rendert HTML

* iframe

* „Backend-Component“



### ✅ DO THIS:



```ts

recipients: {

  type: 'block',

  label: 'Recipients',

  rendering: {

    strategy: 'composite',

    schema: {

      groups: {

        fieldType: 'multi-select',

        label: 'Recipient Groups',

        source: 'recipientGroups'

      },

      templates: {

        fieldType: 'mapping',

        label: 'Template per Group',

        source: 'templates'

      }

    },

    dataEndpoints: {

      recipientGroups: '/api/platforms/email/recipient-groups',

      templates: '/api/platforms/email/templates'

    }

  }

}

```



Frontend:



* rendert 2 generische Controls

* speichert **nur Daten**

* Preview & Versand laufen rein backend-seitig



---



## 🔐 Warum das langfristig goldrichtig ist



* **Neue Plattform?** → neues Schema

* **Neuer Block?** → kein Frontend-Code

* **Neuer Maintainer?** → liest Schema, fertig

* **Tests?** → Backend-Schemas testbar

* **Docs?** → Schema = Doku



Das ist exakt das gleiche Prinzip wie:



* OpenAPI

* JSON Schema Forms

* Backstage Plugins

* Kubernetes CRDs



---



## 🏁 Klare Antwort auf deine Frage



> Wie sollen Editor-Blocks gerendert werden?



### ✅ **Primär über SchemaRenderer**



### ✅ **Composite Blocks für komplexere Fälle**



### ⚠️ **Custom Components nur als Escape Hatch**



### ❌ **Kein Backend-HTML-Rendering**



Wenn du willst, kann ich dir im nächsten Schritt:



* ein **konkretes TypeScript-Schema-Interface**

* einen **SchemaRenderer-Flow**

* oder ein **Example für Mapping-Fields (Group → Template)**



bauen.



Plan basierend auf der Strategie:
Plan: Recipients mit Template-Zuordnung (Schema-Driven)
Betroffene Files
Backend (Email-Platform)
backend/src/platforms/email/schema/editor.ts
recipients Block mit strategy: 'composite'
Schema: groups (multi-select) + templateMapping (mapping)
dataEndpoints definieren
backend/src/platforms/email/api/controller.ts
GET /api/platforms/email/recipient-groups - Gruppen für multi-select
GET /api/platforms/email/templates - Templates für mapping
POST /api/platforms/email/recipient-selection - Speichern der Auswahl
backend/src/platforms/email/services/emailService.ts
Versand-Logik: Pro Gruppe das zugeordnete Template verwenden
sendToRecipients(recipients, content) - Template pro Gruppe
backend/src/platforms/email/services/previewService.ts
renderMultiPreview(recipients, content) - Array von Previews
Pro Gruppe/Template-Kombination ein Preview
backend/src/platforms/email/services/validationService.ts (neu)
validateRecipients(recipients) - Empfänger prüfen
validateTemplates(recipients) - Templates existieren
validateVariables(content, templates) - Variablen gefüllt
backend/src/types/platformSchema.ts
rendering.strategy: 'schema' | 'composite' | 'custom'
rendering.schema für composite
rendering.dataEndpoints für composite
Frontend (generisch)
frontend/src/features/schema/components/Renderer.jsx
composite Strategy hinzufügen
Rendert mehrere Felder basierend auf rendering.schema
Lädt Daten von rendering.dataEndpoints
Keine Email-spezifische Logik
frontend/src/features/platform/components/Editor.jsx
editorBlocks rendern
Blocks mit rendering.strategy über SchemaRenderer rendern
Blocks sortiert nach block.ui.order
frontend/src/features/platform/components/Preview.jsx
Multi-Preview wenn content.recipients mehrere Gruppen hat
Tabs für verschiedene Gruppen/Templates
Backend liefert Array von Previews
Konkrete Implementierung
Backend Schema (editor.ts):
{  type: 'recipients',  id: 'recipients',  rendering: {    strategy: 'composite',    schema: {      groups: {        fieldType: 'multi-select',        label: 'Recipient Groups',        source: 'recipientGroups'      },      templateMapping: {        fieldType: 'mapping',        label: 'Template per Group',        source: 'templates'      }    },    dataEndpoints: {      recipientGroups: '/api/platforms/email/recipient-groups',      templates: '/api/platforms/email/templates'    }  }}
Frontend SchemaRenderer:
Case strategy === 'composite'
Rendert Felder aus rendering.schema
Lädt Daten von rendering.dataEndpoints
Speichert in content.recipients
🔥 Klare Antwort

Wer rendert dann das HTML?

👉 Ausschließlich das Frontend.
👉 Das Backend liefert niemals HTML für den Editor.
👉 Das Backend liefert Schema + Daten + Regeln.

🧠 Die saubere Trennung (Single Source of Truth)
Backend ist verantwortlich für:

📐 Struktur (Schema)

📦 Daten (Optionen, Defaults, Mappings)

🧠 Regeln (Validierung, Abhängigkeiten)

🧪 Logik (Preview-Rendering, Versand)

Frontend ist verantwortlich für:

🖼️ HTML / JSX Rendering

🎨 Layout & UX

🔁 State-Handling

🔌 Schema-Interpretation

➡️ Das Frontend ist ein Schema-Interpreter, kein Business-Logic-Träger.

🚫 Warum Backend-HTML ein Dead-End ist

Backend-HTML-Rendering führt IMMER zu:

❌ iframe-Hölle

❌ kaputte Styles

❌ kein Typing

❌ schwer testbar

❌ kein Reuse

❌ kein Debugging

❌ kein Tree-Shaking

❌ kein Feature-Flagging

Langfristig nicht wartbar, egal wie sauber man startet.

✅ Was stattdessen passiert (konkret)
1️⃣ Backend liefert Schema
{
  "type": "block",
  "key": "recipients",
  "label": "Recipients",
  "rendering": {
    "strategy": "composite",
    "schema": {
      "groups": {
        "fieldType": "multi-select",
        "label": "Recipient Groups",
        "source": "recipientGroups"
      },
      "templateMapping": {
        "fieldType": "mapping",
        "label": "Template per Group",
        "source": "templates"
      }
    },
    "dataEndpoints": {
      "recipientGroups": "/api/platforms/email/recipient-groups",
      "templates": "/api/platforms/email/templates"
    }
  }
}

2️⃣ Frontend rendert JSX
switch (block.rendering.strategy) {
  case 'schema':
    return <SchemaField {...block} />

  case 'composite':
    return <CompositeRenderer block={block} />

  case 'custom':
    return <CustomBlockRenderer block={block} />
}

3️⃣ CompositeRenderer ist generisch
Object.entries(block.rendering.schema).map(([key, field]) => (
  <SchemaField
    key={key}
    field={field}
    data={data[field.source]}
  />
))


➡️ Kein Email-Wissen
➡️ Kein Backend-Wissen
➡️ Kein Spezialfall

🧪 Aber: Preview & Versand?

Das ist etwas komplett anderes.

✔️ Backend rendert:

Email-HTML

Preview HTML

Text-Version

MJML / Handlebars / React Email / etc

➡️ Das ist Output-Rendering, kein UI-Rendering.

Editor-UI ≠ Email-HTML

🧩 Wichtiges mentales Modell
Editor:
Backend → Schema → Frontend → JSX

Email:
Backend → Template → HTML → Client


Diese Ebenen dürfen niemals vermischt werden.

🔍 Wie erkennst du Backend-HTML-Leichen?

Such nach:

res.send('<div>')

renderHtml()

iframe

dangerouslySetInnerHTML

content-type: text/html im Editor-Kontext

➡️ Alles davon: raus

🧱 Deine Architektur (nach Cleanup)
email/
 ├─ schema/
 │   └─ editor.ts      ← beschreibt UI
 ├─ api/
 │   └─ controller.ts  ← liefert Daten
 ├─ services/
 │   ├─ emailService.ts
 │   ├─ previewService.ts  ← rendert EMAIL-HTML
 │   └─ validationService.ts


Frontend:

Editor.jsx
 ├─ SchemaRenderer
 ├─ CompositeRenderer
 └─ CustomBlockRegistry

🏁 Fazit (knallhart)

✅ Ja, Backend-HTML im Editor muss raus

✅ Frontend rendert ALLES UI

✅ Backend liefert nur Schema + Daten

❌ Keine iframes

❌ Kein HTML aus dem Backend
