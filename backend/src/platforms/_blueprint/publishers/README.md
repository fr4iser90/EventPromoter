# Platform Publishers

This directory contains platform-specific publishing implementations.

## Structure

```
publishers/
├── api.ts          # Direct API integration
├── playwright.ts   # Browser automation (Playwright)
└── README.md       # This file
```

## Publishing Methods

### API Publisher (`api.ts`)

Direct integration with the platform's official API.

**When to use:**
- Platform has a well-documented API
- You have API credentials (API keys, OAuth tokens)
- You want fast, reliable publishing
- You need to handle rate limits and errors programmatically

**Requirements:**
- API credentials configured in platform config
- API endpoints documented
- Error handling for rate limits, authentication failures

### Playwright Publisher (`playwright.ts`)

Browser automation using Playwright to interact with the platform's web interface.

**When to use:**
- Platform doesn't have an official API
- API access is restricted or requires approval
- You need to simulate real user behavior
- You want to bypass API limitations

**Requirements:**
- Playwright installed (`npm install playwright`)
- Platform login credentials
- Knowledge of platform's web UI structure
- More resources (CPU, memory) than API calls

## Implementation

Each publisher must implement the `PlatformPublisher` interface:

```typescript
export interface PlatformPublisher {
  publish(
    content: any,
    files: any[],
    hashtags: string[]
  ): Promise<PostResult>
}
```

## Configuration

Publishers should load credentials from:
1. Platform config file (`config/{platformId}.json`)
2. Environment variables (`{PLATFORM_ID}_API_KEY`, etc.)
3. User settings (future)

## Usage

The `PublishingService` automatically selects the appropriate publisher based on:
- `publishingMode` in app config (`n8n`, `api`, `playwright`, `auto`)
- Availability of publishers for each platform
- Fallback logic (n8n → api → playwright)

## Image Handling

**WICHTIG**: Wie Bilder gehandhabt werden, hängt von der Platform ab:

### Embedded Images (z.B. Email)
- Bilder werden im Template-Text eingebettet: `<img src="{img1}">`
- Template-Variable `{img1}` wird durch Bild-URL ersetzt
- Publisher bettet Bilder direkt in Content ein

### Separate Media Upload (z.B. Social Media)
- Bilder werden separat über Platform-API hochgeladen
- Template enthält **KEINE** Image-Placeholder
- Publisher lädt Bilder separat hoch und verknüpft sie mit Post

**Dokumentation**: Siehe `/docs/development/platform-image-handling.md` für detaillierte Platform-spezifische Anweisungen.

## Example

```typescript
// In your platform's api.ts
import { PostResult } from '../../../types/index.js'

export class TwitterApiPublisher {
  async publish(content: any, files: any[], hashtags: string[]): Promise<PostResult> {
    // Upload media separately (if platform requires it)
    let mediaId: string | undefined
    if (files.length > 0) {
      mediaId = await this.uploadMedia(files[0].url)
    }
    
    // Make API call to Twitter
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: content.text,
        media: mediaId ? { media_ids: [mediaId] } : undefined
      })
    })
    
    const data = await response.json()
    return {
      success: true,
      postId: data.data.id,
      url: `https://twitter.com/user/status/${data.data.id}`
    }
  }
  
  private async uploadMedia(mediaUrl: string): Promise<string> {
    // Platform-specific media upload logic
    // Returns media ID to attach to post
  }
}
```
