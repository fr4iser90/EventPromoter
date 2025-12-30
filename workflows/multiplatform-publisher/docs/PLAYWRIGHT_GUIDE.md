**Du hast recht - multiple Accounts sind nicht praktikabel** für einen Announcer/Veranstalter. Der Account sollte gleich bleiben.

## **Essentielle Anti-Detection Maßnahmen (ohne Multi-Account):**

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

### **6. Menschliche Posting-Zeiten** ⭐⭐
- Nicht immer zur gleichen Uhrzeit posten
- Variabilität einbauen (zufällige Abweichungen)
- Wochentage und Tageszeiten variieren

## **Was WIRKLICH wichtig ist:**

1. **Langsame, menschliche Interaktionen**
2. **Realistische Browser-Signatur**  
3. **Variabilität in Timing**
4. **Natürliche Mausbewegungen**
5. **Webdriver-Flag verstecken**

