# Anti-Blocking & Fingerprinting

## Overview

When websites detect automated scraping, they deploy anti-bot measures. This guide covers Apify's fingerprint-suite and techniques to bypass blocking while respecting ethical scraping practices.

## When You Need Anti-Blocking

### Signs You're Being Blocked

- **403 Forbidden** errors
- **Cloudflare challenges** ("Checking your browser...")
- **Bot detection** messages ("Access Denied", "Unusual traffic")
- **CAPTCHAs** appearing unexpectedly
- **Rate limiting** (429 Too Many Requests)
- **Empty responses** or incomplete data
- **Timeouts** or connection resets
- Pages return different content than browser shows

### Escalation Strategy

Try solutions in this order:

1. **Slow down** → Reduce request rate
2. **Add headers** → Use realistic User-Agent, headers
3. **Fingerprinting** → Use fingerprint-suite
4. **Proxies** → Datacenter → Residential
5. **Session rotation** → Rotate browser sessions
6. **Advanced** → CAPTCHA solving (ethical considerations)

## The fingerprint-suite

Apify's **fingerprint-suite** generates and injects realistic browser fingerprints to make your scraper appear as a real browser.

### What is Browser Fingerprinting?

Websites collect browser characteristics:
- User-Agent header
- Screen resolution
- Installed fonts
- Canvas fingerprint
- WebGL renderer
- Timezone & language
- Installed plugins
- Hardware concurrency

Bots typically have **inconsistent fingerprints**. fingerprint-suite generates **consistent, realistic fingerprints** that match real browsers.

### Components

| Package | Purpose |
|---------|---------|
| **header-generator** | Generates realistic HTTP headers |
| **fingerprint-generator** | Generates full browser fingerprints (headers + JS APIs) |
| **fingerprint-injector** | Injects fingerprints into Playwright/Puppeteer |
| **generative-bayesian-network** | ML model for realistic fingerprint generation |

## Quick Setup

### Method 1: Crawlee with FingerprintOptions (Easiest)

```typescript
import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.main(async () => {
    const crawler = new PlaywrightCrawler({
        // Enable automatic fingerprinting
        useSessionPool: true,
        sessionPoolOptions: {
            maxPoolSize: 50,
        },

        // Configure fingerprint generation
        fingerprintOptions: {
            devices: ['desktop'],              // desktop, mobile, or both
            operatingSystems: ['windows'],      // windows, macos, linux, ios, android
            browsers: ['chrome'],               // chrome, firefox, safari, edge
        },

        // Add proxies (highly recommended with fingerprinting)
        proxyConfiguration: await Actor.createProxyConfiguration({
            groups: ['RESIDENTIAL'],
        }),

        async requestHandler({ page, request, log }) {
            log.info(`Scraping: ${request.url}`);
            // Your scraping logic
        },
    });

    await crawler.run(['https://example.com']);
});
```

**Benefits**:
- Automatic fingerprint generation per session
- Session management built-in
- Works with all Crawlee crawlers

### Method 2: Playwright with fingerprint-injector

```typescript
import { chromium } from 'playwright';
import { newInjectedContext } from 'fingerprint-injector';

const browser = await chromium.launch({ headless: true });

// Create context with injected fingerprint
const context = await newInjectedContext(browser, {
    fingerprintOptions: {
        devices: ['desktop'],
        operatingSystems: ['windows', 'macos'],
        browsers: ['chrome'],
    },
    newContextOptions: {
        // Playwright context options
        locale: 'en-US',
        timezoneId: 'America/New_York',
    },
});

const page = await context.newPage();
await page.goto('https://example.com');
// Scrape with realistic fingerprint
```

### Method 3: Puppeteer with fingerprint-injector

```typescript
import puppeteer from 'puppeteer';
import { newInjectedPage } from 'fingerprint-injector';

const browser = await puppeteer.launch({ headless: true });

const page = await newInjectedPage(browser, {
    fingerprintOptions: {
        devices: ['mobile'],
        operatingSystems: ['android'],
    },
});

await page.goto('https://example.com');
// Scrape with mobile fingerprint
```

## Fingerprint Configuration

### Device Types

```typescript
// Desktop browsers
fingerprintOptions: {
    devices: ['desktop'],
}

// Mobile devices
fingerprintOptions: {
    devices: ['mobile'],
}

// Both (random selection)
fingerprintOptions: {
    devices: ['desktop', 'mobile'],
}
```

### Operating Systems

```typescript
// Windows + Mac (desktop)
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos'],
}

// iOS (mobile)
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['ios'],
}

// Android (mobile)
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['android'],
}
```

### Browsers

```typescript
// Chrome only (most common)
fingerprintOptions: {
    browsers: ['chrome'],
}

// Chrome + Firefox
fingerprintOptions: {
    browsers: ['chrome', 'firefox'],
}

// All browsers (random selection)
fingerprintOptions: {
    browsers: ['chrome', 'firefox', 'safari', 'edge'],
}
```

See `../reference/fingerprint-patterns.md` for more configurations.

## Proxy Configuration

**Fingerprinting alone is often not enough** - combine with proxies for best results.

### Datacenter Proxies (Faster, Cheaper)

```typescript
const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['SHADER'],  // Apify datacenter proxies
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    fingerprintOptions: { devices: ['desktop'] },
    // ...
});
```

### Residential Proxies (More Reliable)

```typescript
const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    fingerprintOptions: { devices: ['desktop'] },
    // ...
});
```

### Custom Proxies

```typescript
const proxyConfiguration = new ProxyConfiguration({
    proxyUrls: [
        'http://user:pass@proxy1.example.com:8000',
        'http://user:pass@proxy2.example.com:8000',
    ],
});
```

## Session Management

Sessions group requests that should appear to come from the same "user".

```typescript
const crawler = new PlaywrightCrawler({
    useSessionPool: true,
    sessionPoolOptions: {
        maxPoolSize: 50,                    // Max concurrent sessions
        sessionOptions: {
            maxUsageCount: 50,              // Requests per session before rotation
            maxErrorScore: 3,                // Retire session after 3 errors
        },
    },

    async requestHandler({ session, request }) {
        // All requests in this session share:
        // - Same fingerprint
        // - Same proxy IP
        // - Same cookies
        console.log(`Session ID: ${session.id}`);
    },
});
```

## Complete Example: Anti-Blocking Scraper

```typescript
import { Actor } from 'apify';
import { PlaywrightCrawler, Dataset } from 'crawlee';

await Actor.main(async () => {
    const crawler = new PlaywrightCrawler({
        // Slow down to avoid rate limiting
        maxConcurrency: 3,
        maxRequestsPerMinute: 30,

        // Enable sessions with fingerprinting
        useSessionPool: true,
        sessionPoolOptions: {
            maxPoolSize: 20,
            sessionOptions: {
                maxUsageCount: 30,
            },
        },

        // Generate realistic fingerprints
        fingerprintOptions: {
            devices: ['desktop'],
            operatingSystems: ['windows', 'macos'],
            browsers: ['chrome'],
        },

        // Use residential proxies
        proxyConfiguration: await Actor.createProxyConfiguration({
            groups: ['RESIDENTIAL'],
        }),

        // Additional stealth
        preNavigationHooks: [
            async ({ page }) => {
                // Block unnecessary resources
                await page.route('**/*', (route) => {
                    const resourceType = route.request().resourceType();
                    if (['image', 'font', 'media'].includes(resourceType)) {
                        route.abort();
                    } else {
                        route.continue();
                    }
                });
            },
        ],

        async requestHandler({ page, request, session, log }) {
            log.info(`Scraping: ${request.url} (Session: ${session.id})`);

            try {
                // Wait for content
                await page.waitForSelector('body', { timeout: 10000 });

                // Check for blocking
                const isBlocked = await page.evaluate(() => {
                    const text = document.body.textContent?.toLowerCase() || '';
                    return text.includes('access denied') ||
                           text.includes('cloudflare') ||
                           text.includes('captcha');
                });

                if (isBlocked) {
                    log.warning('Detected blocking, retiring session');
                    session.retire();
                    throw new Error('Blocked');
                }

                // Extract data
                const data = await page.evaluate(() => ({
                    title: document.querySelector('h1')?.textContent,
                    // ...
                }));

                await Dataset.pushData(data);

                // Mark session as working
                session.markGood();

            } catch (error) {
                log.error(`Error: ${error.message}`);
                session.markBad();
                throw error; // Retry
            }
        },

        failedRequestHandler({ request, session }, { log }) {
            log.error(`Request failed after retries: ${request.url}`);
            session?.retire();
        },
    });

    await crawler.run(['https://example.com']);
});
```

## Troubleshooting

### Still Getting Blocked?

Try escalating:

1. **Slow down more**
   ```typescript
   maxConcurrency: 1,
   maxRequestsPerMinute: 10,
   ```

2. **Change fingerprint constraints**
   ```typescript
   fingerprintOptions: {
       devices: ['mobile'],  // Try mobile instead of desktop
       operatingSystems: ['ios'],
   }
   ```

3. **Upgrade proxies**
   ```typescript
   // From datacenter → residential
   groups: ['RESIDENTIAL']
   ```

4. **Rotate sessions more**
   ```typescript
   sessionOptions: {
       maxUsageCount: 10,  // Rotate after just 10 requests
   }
   ```

5. **Add delays**
   ```typescript
   import { setTimeout } from 'timers/promises';

   async requestHandler({ page }) {
       // Random delay between actions
       await setTimeout(Math.random() * 2000 + 1000); // 1-3 seconds
   }
   ```

### Detecting Fingerprint Issues

Test your fingerprint:

```typescript
const page = await context.newPage();
await page.goto('https://browserleaks.com/canvas');
// Check if fingerprint looks realistic

await page.goto('https://bot.sannysoft.com/');
// Check bot detection tests
```

### Common Issues

**Issue**: "Fingerprint doesn't match browser"

**Solution**: Ensure fingerprintOptions match actual browser:
```typescript
// If using chromium
fingerprintOptions: {
    browsers: ['chrome'],  // Not firefox!
}
```

**Issue**: "Proxy connection failed"

**Solution**: Verify proxy configuration:
```typescript
const proxyUrl = await proxyConfiguration.newUrl();
console.log('Testing proxy:', proxyUrl);
```

**Issue**: "Session pool exhausted"

**Solution**: Increase pool size:
```typescript
sessionPoolOptions: {
    maxPoolSize: 100,  // Increase from 50
}
```

## Best Practices

### ✅ DO:

- **Use fingerprinting from the start** on strict sites
- **Combine with proxies** (fingerprints alone often insufficient)
- **Match fingerprint to browser** (Chrome fingerprint with Chromium browser)
- **Rotate sessions** after errors or blocks
- **Monitor session health** (markGood/markBad)
- **Test fingerprints** on bot detection sites first
- **Respect robots.txt** even with anti-blocking
- **Use residential proxies** for strict sites

### ❌ DON'T:

- **Rely on fingerprints alone** - always use proxies too
- **Use mismatched configs** (iOS fingerprint with desktop browser)
- **Ignore session errors** - retire bad sessions
- **Scrape too fast** even with fingerprints
- **Use free proxies** - they're usually detected
- **Bypass CAPTCHAs** without permission
- **Violate ToS** - anti-blocking ≠ permission to scrape

## Ethical Considerations

**Anti-blocking is a tool, not permission**:

- ✅ Use for public data collection
- ✅ Respect rate limits (even if you can bypass them)
- ✅ Honor robots.txt
- ✅ Don't overload servers
- ❌ Don't bypass paywalls
- ❌ Don't scrape private data
- ❌ Don't violate terms of service

## Performance Impact

| Technique | Speed Impact | Detection Evasion |
|-----------|--------------|-------------------|
| No anti-blocking | Fastest | ❌ High detection |
| Headers only | Fast | ⚠️ Medium detection |
| Fingerprinting | Medium | ✅ Low detection |
| Fingerprinting + Proxies | Medium-Slow | ✅✅ Very low detection |
| + Session rotation | Slower | ✅✅✅ Minimal detection |

**Trade-off**: More anti-blocking = Slower but more reliable

## Resources

- [fingerprint-suite GitHub](https://github.com/apify/fingerprint-suite)
- [Apify Anti-Scraping Academy](https://docs.apify.com/academy/anti-scraping)
- [Crawlee FingerprintOptions](https://crawlee.dev/api/browser-pool/interface/FingerprintOptions)
- [fingerprint-injector npm](https://www.npmjs.com/package/fingerprint-injector)
- [Apify Proxy Docs](https://docs.apify.com/platform/proxy)

## Related

- **Fingerprint patterns**: See `../reference/fingerprint-patterns.md`
- **Proxy configuration**: See Apify docs
- **Session management**: See Crawlee docs

## Summary

**Anti-blocking is essential for scraping strict sites**

**Key steps**:
1. Use fingerprint-suite with Crawlee (easiest)
2. Configure realistic fingerprints (match target device/OS)
3. Add proxies (residential recommended)
4. Enable session rotation
5. Monitor and retire bad sessions
6. Slow down if still blocked

**Remember**: Anti-blocking enables scraping, but doesn't grant permission. Always scrape ethically and legally.
