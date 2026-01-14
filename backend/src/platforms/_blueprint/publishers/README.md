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

## Example

```typescript
// In your platform's api.ts
import { PostResult } from '../../../types/index.js'

export class TwitterApiPublisher {
  async publish(content: any, files: any[], hashtags: string[]): Promise<PostResult> {
    // Make API call to Twitter
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
```
