## 🎯 **PDF Parsing: Event-Daten Analyse**

Perfekt! Das Beispiel zeigt typische Event-Daten. Lass uns das strukturieren:

## 📋 **Wichtige Datenfelder identifiziert:**

Aus deinem Beispiel:
```
🎵 Event Title: "Depeche Mode Party Sounds of the Universe"
🕐 Time: "22 Uhr"  
📅 Date: "Samstag, 16.05.26"
🎧 DJs: "H@jo" & "A.L.E.X."  
📍 Venue: "Kochstraße 132, 04277 Leipzig, Halle D"
🌐 Website: "www.werk-2.de"
🎫 Ticket Info: "Infos und Tickets unter"
```

## 🏗️ **Datenstruktur für Events:**

```javascript
const eventSchema = {
  title: "Depeche Mode Party Sounds of the Universe",
  date: "2026-05-16", // ISO format
  time: "22:00",
  venue: {
    name: "werk 2",
    address: "Kochstraße 132",
    city: "Leipzig", 
    zip: "04277",
    hall: "Halle D"
  },
  performers: ["H@jo", "A.L.E.X."],
  website: "www.werk-2.de",
  ticketUrl: "www.werk-2.de",
  description: "Depeche Mode Party Sounds of the Universe",
  source: "PDF",
  parsedAt: "2025-12-30T12:00:00Z"
}
```

## 🔍 **Parsing-Strategie:**

### **1. Regex Patterns für Extraktion:**

```javascript
const patterns = {
  // Event Title (erste Zeile oder fett gedruckte)
  title: /^([^\n]{10,80})$/m,
  
  // Datum Pattern (verschiedene Formate)
  date: /(?:Samstag|Sonntag|Montag|etc),\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/,
  
  // Uhrzeit
  time: /(\d{1,2})\s*Uhr/,
  
  // Location (Adresse Pattern)
  address: /(\w+straße\s+\d+)\s*[\|ı]\s*(\d{5})\s+(\w+)\s*[\|ı]\s*(.*)/,
  
  // Website URL
  website: /(www\.[^\s]+)/,
  
  // DJs/Performer (nach "DJ" oder "&")
  performers: /(?:DJ['']s?|präsentieren)\s*([^&\n]+)(?:\s*&\s*([^&\n]+))*/,
  
  // Venue Name (aus Website oder Kontext)
  venue: /(werk-\d+|[A-Za-z\s]+Halle)/i
}
```

### **2. Parsing Pipeline:**

```javascript
function parseEventFromPDF(text) {
  // 1. Text extrahieren aus PDF
  const rawText = extractTextFromPDF(pdfBuffer)
  
  // 2. Bereinigen (Zeilenumbrüche, extra Spaces)
  const cleanText = cleanText(rawText)
  
  // 3. Daten mit Regex extrahieren
  const eventData = extractEventData(cleanText, patterns)
  
  // 4. Validierung
  const validatedData = validateEventData(eventData)
  
  // 5. Normalisierung (Dates, URLs, etc.)
  const normalizedData = normalizeEventData(validatedData)
  
  return normalizedData
}
```

## 🎨 **UI für Parsed Data:**

### **Parsed Data Tab:**
```
📝 PARSED EVENT DATA

🎵 Title: Depeche Mode Party Sounds of the Universe
📅 Date: 2026-05-16
🕐 Time: 22:00
📍 Venue: werk 2, Kochstraße 132, 04277 Leipzig
🎧 Performers: H@jo, A.L.E.X.
🌐 Website: www.werk-2.de

[✏️ Edit] [🔄 Re-parse] [✅ Confirm]
```

### **Edit Tab:**
```
✏️ EDIT EVENT DATA

Title: [______________________________]
Date: [____-__-__] Time: [__:__]
Venue: [______________________________]
Performers: [______________________________]
Website: [______________________________]
Description: [______________________________]

[Templates ▼] [Save Template] [Auto-Format]
```

## 🤖 **Smart Features:**

### **Auto-Formatierung:**
- **Dates** → ISO Format (2026-05-16)
- **Times** → 24h Format (22:00)
- **URLs** → Vollständige URLs (https://...)
- **Addresses** → Strukturierte Daten

### **Validation:**
- **Date** muss in Zukunft sein
- **URL** muss gültiges Format haben  
- **Venue** muss Stadt/Adresse haben

### **Templates:**
```javascript
const templates = {
  "Club Event": {
    hashtags: ["#club", "#party", "#techno"],
    platforms: ["instagram", "facebook", "email"]
  },
  "Festival": {
    hashtags: ["#festival", "#music", "#outdoor"], 
    platforms: ["twitter", "instagram", "facebook"]
  }
}
```

## 🚀 **Implementierung:**

Soll ich mit dem **PDF-Parsing-System** anfangen? Oder erst die **Event-Data-Struktur** im Frontend implementieren?

*(Das wird ein richtig intelligentes System für Event-Promotion!)* 🎉

**Was meinst du - sollen wir das PDF-Parsing zuerst bauen oder die UI für die strukturierten Daten?** 🤔