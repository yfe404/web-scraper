# Anti-Blocking Scraper Example

Actor demonstrating fingerprinting and proxy usage for blocked sites.

## What This Demonstrates

- Browser fingerprinting with `fingerprintOptions`
- Proxy configuration (residential proxies)
- Session management and rotation
- Blocking detection
- Error handling for blocked requests

## Files

- `src/main.ts` - Main Actor code with anti-blocking
- `.actor/actor.json` - Actor configuration
- `.actor/input_schema.json` - Input schema

## Usage

```bash
# Run locally (requires Apify proxies)
apify run --input='{"startUrls":[{"url":"https://example.com"}],"useFingerprinting":true}'

# Deploy
apify push

# Run on platform
apify call anti-blocking-scraper
```

## Input

```json
{
    "startUrls": [{"url": "https://example.com"}],
    "maxItems": 100,
    "useFingerprinting": true,
    "proxyGroup": "RESIDENTIAL"
}
```

## Output

```json
{
    "url": "https://example.com/page",
    "title": "Page Title",
    "content": "...",
    "sessionId": "session_abc123",
    "scrapedAt": "2025-01-15T10:30:00.000Z"
}
```

## Pattern

1. Enable fingerprinting for realistic browser profile
2. Use residential proxies for IP rotation
3. Manage sessions (rotate after errors)
4. Detect blocking (Cloudflare, CAPTCHAs)
5. Retry with new session if blocked
