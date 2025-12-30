### **1. Menschliche Timing-Patterns** ⭐⭐⭐
```javascript
// Vor jedem Klick/Input 1-3 Sekunden warten
await page.waitForTimeout(Math.random() * 2000 + 1000);

// Zwischen Actions variieren
await page.waitForTimeout(Math.random() * 3000 + 2000);
```

### **2. Natürliche Mausbewegungen** ⭐⭐⭐
```javascript
// Nicht direkt auf Button klicken
const button = await page.locator('button');
const box = await button.boundingBox();

// Maus zu zufälliger Position bewegen
await page.mouse.move(
  box.x + Math.random() * box.width, 
  box.y + Math.random() * box.height
);

// Kleine Pause dann klicken
await page.waitForTimeout(300);
await button.click();
```

### **3. Realistischer Browser-Fingerprint** ⭐⭐⭐
```javascript
const browser = await chromium.launch({
  args: [
    '--disable-blink-features=AutomationControlled',
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1920, height: 1080 },
  locale: 'de-DE',
  timezoneId: 'Europe/Berlin'
});
```

### **4. Webdriver-Flag entfernen** ⭐⭐⭐
```javascript
await page.evaluateOnNewDocument(() => {
  // Webdriver Flag entfernen
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  
  // Permissions mocken
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ?
      Promise.resolve({ state: Notification.permission }) :
      originalQuery(parameters)
  );
});
```

### **5. Natürliches Typing** ⭐⭐
```javascript
// Nicht alles auf einmal tippen
await page.type('input', text, { 
  delay: Math.random() * 150 + 50 // 50-200ms pro Buchstabe
});
```


[7 tools called]

Basierend auf der aktuellen Struktur deines Workflows kann ich dir eine detaillierte Übersicht geben, wo du welche Konfigurationen am besten hinzufügst und was über API vs. Playwright möglich ist.

## 📍 **Wo du Reddit-Subreddits hinzufügen solltest:**

**Am besten in: `config/platforms/reddit.json`**

Dort gibt es bereits eine **`allowedSubreddits`** Liste und eine **`subreddits`** Sektion mit spezifischen Konfigurationen pro Subreddit.

### ✅ **Für deine Beispiele (r/leipzig, r/mritzbastei):**

```json
{
  "allowedSubreddits": [
    "DJs", "Techno", "HouseMusic", "EDM", "berlin", 
    "EventPromoters", "MusicEvents",
    "leipzig", "mritzbastei", "dresden", "hamburg"
  ],
  "subreddits": {
    "leipzig": {
      "flair": "Event",
      "nsfw": false,
      "spoiler": false,
      "postType": "self"
    },
    "mritzbastei": {
      "flair": "Event",
      "nsfw": false,
      "spoiler": false,
      "postType": "self"
    }
  }
}
```

## 🗺️ **Vollständige Übersicht: Wo was konfigurieren**

### **1. Plattform-Konfigurationen** (`config/platforms/*.json`)

| Plattform | Wo konfigurieren | Was möglich |
|-----------|------------------|-------------|
| **Twitter** | `twitter.json` | API Keys, Posting-Settings, Rate Limits |
| **Reddit** | `reddit.json` | Subreddits-Liste, Flair, Post-Types, Credentials |
| **Facebook** | `facebook.json` | Page-ID, Playwright-Settings, Posting-Intervall |
| **Instagram** | `instagram.json` | Account-Credentials, Hashtag-Limits, Mobile-Simulation |
| **LinkedIn** | `linkedin.json` | Profile/Page Selection, Posting-Settings |
| **Email** | `email.json` | Recipients, Templates, SMTP-Settings |

### **2. Interface-Konfigurationen** (`interface/src/config.js`)

Hier werden die verfügbaren Optionen für das Web-Interface definiert:

```javascript
platforms: {
  reddit: {
    settings: ['subreddit', 'username', 'password', 'flair']
  }
}
```

## 🔧 **API vs. Playwright: Was ist wo möglich?**

### **🚀 API-Methode (Schnell & Zuverlässig):**

| Plattform | API-Verfügbarkeit | Was möglich |
|-----------|-------------------|-------------|
| **Twitter/X** | ✅ Vollständig | Posten, Bilder, Threads, Polls |
| **Reddit** | ✅ Teilweise | Offizielle Subreddits, aber Einschränkungen bei NSFW/Adult-Content |
| **LinkedIn** | ✅ Vollständig | Text-Posts, Artikel, Company Pages |
| **Facebook** | ❌ Eingeschränkt | Nur über Graph API (komplex, limitiert) |
| **Instagram** | ❌ Kaum möglich | Business API sehr limitiert |

### **🎭 Playwright-Methode (Browser-Automation):**

| Plattform | Was möglich | Vorteile | Nachteile |
|-----------|-------------|----------|-----------|
| **Facebook** | ✅ Volle Kontrolle | - Page-Posts<br>- Gruppen-Posts<br>- Events | Langsamer, braucht Anti-Detection |
| **Instagram** | ✅ Volle Kontrolle | - Stories<br>- Reels<br>- IGTV<br>- Hashtags | Mobile-Simulation nötig |
| **Reddit** | ✅ Als Fallback | - Alle Subreddits<br>- NSFW-Content<br>- Custom Flair | Nur wenn API nicht funktioniert |
| **Twitter** | ❌ Nicht nötig | API ist besser | - |
| **LinkedIn** | ❌ Nicht nötig | API ist besser | - |

## 🎯 **Deine konkreten Reddit-Beispiele:**

### **Für r/leipzig:**
```json
"leipzig": {
  "flair": "Event",
  "nsfw": false,
  "spoiler": false,
  "postType": "self"
}
```

### **Für r/mritzbastei:**
```json
"mritzbastei": {
  "flair": "Event", 
  "nsfw": false,
  "spoiler": false,
  "postType": "self"
}
```

## 📋 **Empfohlene Reihenfolge zum Hinzufügen:**

1. **Sofort möglich**: Füge neue Subreddits zur `allowedSubreddits` Liste hinzu
2. **Interface**: Aktualisiere die Dropdown-Optionen im Web-Interface
3. **Workflow**: Teste mit dem gebauten n8n-Workflow
4. **Erweitert**: Füge spezifische Regeln pro Subreddit hinzu (Auto-Flair, etc.)

## 💡 **Pro-Tipp:**

Für lokale/regionale Subreddits wie r/leipzig ist Reddit-API oft ausreichend. Playwright würde ich nur als Fallback verwenden, wenn API blockiert wird oder für sehr spezielle Posting-Anforderungen.

Möchtest du, dass ich die Reddit-Konfiguration mit deinen gewünschten Subreddits aktualisiere?