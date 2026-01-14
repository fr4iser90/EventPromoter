# Publishing Service

Der PublishingService verwaltet die Veröffentlichung von Inhalten auf verschiedenen Plattformen mit mehreren Fallback-Optionen.

## Publishing-Modi

### 1. N8N (Standard)
Verwendet n8n Webhooks für die Veröffentlichung.

**Konfiguration:**
```json
{
  "n8nEnabled": true,
  "n8nWebhookUrl": "http://localhost:5678/webhook/multiplatform-publisher",
  "publishingMode": "n8n"
}
```

### 2. API (Direkte API-Calls)
Verwendet direkte API-Integrationen der Plattformen.

**Konfiguration:**
```json
{
  "publishingMode": "api"
}
```

**Erforderlich:**
- Platform-spezifische Publisher in `platforms/{platformId}/publishers/api.ts`
- API-Credentials in `config/{platformId}.json` oder Environment-Variablen

### 3. Playwright (Browser-Automation)
Verwendet Browser-Automation für Plattformen ohne API.

**Konfiguration:**
```json
{
  "publishingMode": "playwright"
}
```

**Erforderlich:**
- Playwright installiert: `npm install playwright`
- Platform-spezifische Publisher in `platforms/{platformId}/publishers/playwright.ts`
- Login-Credentials in `config/{platformId}.json`

### 4. Auto (Intelligenter Fallback)
Versucht automatisch die beste verfügbare Methode.

**Konfiguration:**
```json
{
  "publishingMode": "auto",
  "n8nEnabled": true,
  "n8nWebhookUrl": "http://localhost:5678/webhook/multiplatform-publisher"
}
```

**Fallback-Reihenfolge:**
1. N8N (wenn enabled und URL konfiguriert)
2. API (wenn Publisher verfügbar)
3. Playwright (wenn Publisher verfügbar)

## Platform Publisher erstellen

### API Publisher

Erstelle `platforms/{platformId}/publishers/api.ts`:

```typescript
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export class TwitterApiPublisher {
  async publish(content: any, files: any[], hashtags: string[]): Promise<PostResult> {
    const config = await ConfigService.getConfig('twitter')
    const accessToken = config.accessToken || process.env.TWITTER_ACCESS_TOKEN
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: content.text
      })
    })
    
    const data = await response.json()
    return {
      success: true,
      postId: data.data.id,
      url: `https://twitter.com/user/status/${data.data.id}`
    }
  }
}

export default new TwitterApiPublisher()
```

### Playwright Publisher

Erstelle `platforms/{platformId}/publishers/playwright.ts`:

```typescript
import { chromium, Browser, Page } from 'playwright'
import { PostResult } from '../../../types/index.js'
import { ConfigService } from '../../../services/configService.js'

export class TwitterPlaywrightPublisher {
  async publish(content: any, files: any[], hashtags: string[]): Promise<PostResult> {
    const config = await ConfigService.getConfig('twitter')
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    
    try {
      // Login und Posting-Logik hier
      // ...
      
      return {
        success: true,
        postId: '...',
        url: '...'
      }
    } finally {
      await browser.close()
    }
  }
}

export default new TwitterPlaywrightPublisher()
```

## Verwendung

Der `submitController` verwendet automatisch den `PublishingService`:

```typescript
// Automatisch im submitController
const publishResult = await PublishingService.publish({
  files,
  platforms,
  content,
  hashtags,
  eventData
})
```

## Konfiguration

Die Publishing-Modi werden in `config/app.json` konfiguriert:

```json
{
  "publishingMode": "auto",
  "n8nEnabled": true,
  "n8nWebhookUrl": "http://localhost:5678/webhook/multiplatform-publisher",
  "darkMode": true
}
```

## Verfügbare Modi prüfen

```typescript
const modes = await PublishingService.getAvailableModes('twitter')
// ['n8n', 'api', 'playwright']
```
