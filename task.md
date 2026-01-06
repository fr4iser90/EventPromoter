## 🏢 **Wie Profis Internationalisierung (i18n) angehen:**

### **1. Daten-Separierung (Data Layer)**
```typescript
interface ParsedEventData {
  // Standardisiert gespeichert (für APIs, Templates, DB)
  dateISO: string        // "2026-05-16" - immer ISO
  timeISO: string        // "22:00" - immer 24h
  
  // Original-Formate für Fallback
  originalDate?: string  // "16.05.2026" 
  originalTime?: string  // "22:00"
  
  // Metadaten
  detectedLocale?: string // "de-DE", "en-US", etc.
}
```

### **2. UI-Layer mit i18n Framework**
```javascript
// Mit react-i18next oder ähnlich
import { useTranslation } from 'react-i18next'

function EventPreview({ parsedData }) {
  const { t, i18n } = useTranslation()
  
  const formatDate = (isoDate) => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    }).format(new Date(isoDate))
  }
  
  return (
    <div>
      📅 {t('date')}: {formatDate(parsedData.dateISO)}
    </div>
  )
}
```

### **3. User-Einstellungen**
```json
{
  "userPreferences": {
    "locale": "de-DE",
    "dateFormat": "DD.MM.YYYY", // oder "MM/DD/YYYY"
    "timeFormat": "24h", // oder "12h"
    "timezone": "Europe/Berlin"
  }
}
```

### **4. Template-System**
Templates verwenden **immer** standardisierte Platzhalter:
```
{{date}} → "2026-05-16" (ISO)
{{time}} → "22:00" (24h)
```

UI zeigt lokalisiert:
```javascript
// Template-Rendering mit Lokalisierung
renderTemplate(template, data, locale) {
  return template
    .replace('{{date}}', formatDate(data.dateISO, locale))
    .replace('{{time}}', formatTime(data.timeISO, locale))
}
```

### **5. Professionelle Architektur**
```
📁 src/
├── i18n/
│   ├── locales/
│   │   ├── de.json
│   │   ├── en.json  
│   │   └── es.json
│   └── index.ts
├── utils/
│   ├── dateUtils.ts    // Locale-aware Formatierung
│   └── numberUtils.ts  // Währungen, etc.
└── components/
    └── DateDisplay.tsx // Intelligente Datumskomponente
```

### **6. Parser-Intelligenz**
```typescript
class SmartParser {
  detectLocale(text: string): string {
    // Erkennt automatisch Sprache/Formate
    if (text.includes('Januar')) return 'de-DE'
    if (text.includes('January')) return 'en-US' 
    return 'en-US' // fallback
  }
  
  parseDate(dateStr: string, detectedLocale: string) {
    // Verwendet Intl.DateTimeFormat für Parsing
    return {
      iso: parseToISO(dateStr, detectedLocale),
      original: dateStr,
      locale: detectedLocale
    }
  }
}
```

## 🎯 **Langfristige Empfehlung:**

1. **i18n Framework** (react-i18next) einführen
2. **Locale-Detection** im Parser integrieren  
3. **User-Einstellungen** für Datumsformate
4. **Standardisierte Speicherung** (ISO) + lokalisierte Anzeige
5. **Template-System** weiterhin ISO-basiert halten

**Dann kannst du automatisch:**
- Deutsche Promoter sehen deutsche Formate
- US-Promoter sehen US-Formate  
- Templates funktionieren immer (ISO-Input)
- Vollständige Mehrsprachigkeit

**Das wäre die professionelle, skalierbare Lösung!** 🚀

*(Du bist im ASK MODE - für die Implementierung musst du zu AGENT MODE wechseln)*