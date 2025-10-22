# Fingerprint Configuration Patterns

Quick reference for common fingerprint-suite configurations.

## Basic Patterns

### Desktop Chrome (Windows/Mac) - Most Common

```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos'],
    browsers: ['chrome'],
}
```

**Use for**: Most websites, general scraping

### Mobile iPhone (iOS Safari)

```typescript
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['ios'],
    browsers: ['safari'],
}
```

**Use for**: Mobile-specific sites, iOS apps' web views

### Mobile Android (Chrome)

```typescript
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['android'],
    browsers: ['chrome'],
}
```

**Use for**: Mobile sites, Android apps' web views

### Desktop Firefox (Linux)

```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['linux'],
    browsers: ['firefox'],
}
```

**Use for**: Sites blocking Chrome, developer-focused sites

## Advanced Patterns

### Random Desktop Browser

```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos', 'linux'],
    browsers: ['chrome', 'firefox', 'edge'],
}
```

**Use for**: Maximum variety, avoiding pattern detection

### Windows Only (Corporate Environment)

```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows'],
    browsers: ['chrome', 'edge'],
}
```

**Use for**: Business/enterprise sites

### Mobile Only (Both Platforms)

```typescript
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['ios', 'android'],
}
```

**Use for**: Mobile-first websites

## Proxy + Fingerprint Combinations

### Residential Proxy + Desktop

```typescript
const crawler = new PlaywrightCrawler({
    fingerprintOptions: {
        devices: ['desktop'],
        operatingSystems: ['windows', 'macos'],
        browsers: ['chrome'],
    },
    proxyConfiguration: await Actor.createProxyConfiguration({
        groups: ['RESIDENTIAL'],
    }),
});
```

**Best for**: Strict anti-bot sites (e-commerce, social media)

### Datacenter Proxy + Mobile

```typescript
const crawler = new PlaywrightCrawler({
    fingerprintOptions: {
        devices: ['mobile'],
        operatingSystems: ['android'],
    },
    proxyConfiguration: await Actor.createProxyConfiguration({
        groups: ['SHADER'],
    }),
});
```

**Best for**: Mobile scraping with moderate protection

### No Proxy + Fingerprint

```typescript
const crawler = new PlaywrightCrawler({
    fingerprintOptions: {
        devices: ['desktop'],
        operatingSystems: ['windows'],
        browsers: ['chrome'],
    },
    // No proxy - use local IP
});
```

**Best for**: Sites with light protection, testing

## Session Configuration Patterns

### Aggressive Rotation (Very Strict Sites)

```typescript
useSessionPool: true,
sessionPoolOptions: {
    maxPoolSize: 100,
    sessionOptions: {
        maxUsageCount: 5,      // Rotate after just 5 requests
        maxErrorScore: 1,       // Retire after single error
    },
},
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos'],
    browsers: ['chrome'],
}
```

### Balanced Rotation (Normal Sites)

```typescript
useSessionPool: true,
sessionPoolOptions: {
    maxPoolSize: 50,
    sessionOptions: {
        maxUsageCount: 30,     // 30 requests per session
        maxErrorScore: 3,       // 3 errors allowed
    },
},
fingerprintOptions: {
    devices: ['desktop'],
    browsers: ['chrome'],
}
```

### Minimal Rotation (Light Protection)

```typescript
useSessionPool: true,
sessionPoolOptions: {
    maxPoolSize: 10,
    sessionOptions: {
        maxUsageCount: 100,    // Many requests per session
        maxErrorScore: 5,       // Tolerate more errors
    },
},
fingerprintOptions: {
    devices: ['desktop'],
}
```

## Common Use Cases

### E-commerce Scraping

```typescript
fingerprintOptions: {
    devices: ['desktop', 'mobile'],  // Both devices
    operatingSystems: ['windows', 'macos', 'ios', 'android'],
    browsers: ['chrome', 'safari'],
}
proxyConfiguration: await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],  // Residential proxies
    countryCode: 'US',        // Target country
})
```

### Social Media Scraping

```typescript
fingerprintOptions: {
    devices: ['mobile'],              // Mobile-first
    operatingSystems: ['ios', 'android'],
    browsers: ['safari', 'chrome'],
}
proxyConfiguration: await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
})
sessionPoolOptions: {
    maxUsageCount: 10,                // Rotate frequently
}
```

### News/Content Sites

```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos'],
    browsers: ['chrome', 'firefox'],
}
proxyConfiguration: await Actor.createProxyConfiguration({
    groups: ['SHADER'],               // Datacenter OK
})
```

### Travel/Booking Sites

```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos'],
    browsers: ['chrome'],
}
proxyConfiguration: await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
    countryCode: 'US',                // Match target market
})
sessionPoolOptions: {
    maxUsageCount: 20,
    sessionOptions: {
        maxAgeSecs: 3600,             // 1-hour session lifetime
    },
}
```

## Testing Patterns

### Test Your Fingerprint

```typescript
// Visit bot detection sites
const testUrls = [
    'https://bot.sannysoft.com/',
    'https://browserleaks.com/canvas',
    'https://www.whatismybrowser.com/',
];

const crawler = new PlaywrightCrawler({
    fingerprintOptions: {
        devices: ['desktop'],
        browsers: ['chrome'],
    },
    async requestHandler({ page, request, log }) {
        await page.screenshot({ path: `test-${Date.now()}.png` });
        log.info(`Tested: ${request.url}`);
    },
});

await crawler.run(testUrls);
```

## Troubleshooting Patterns

### Pattern 1: Getting Blocked Despite Fingerprints

**Try escalating**:

```typescript
// From this (basic)
fingerprintOptions: {
    devices: ['desktop'],
}

// To this (specific + proxy)
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows'],
    browsers: ['chrome'],
}
proxyConfiguration: await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL'],
})
```

### Pattern 2: Mismatched Fingerprint

**Wrong** (iOS fingerprint with Chromium):
```typescript
// Using chromium.launch()
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['ios'],  // ❌ Wrong - iOS uses Safari/WebKit
    browsers: ['safari'],
}
```

**Right**:
```typescript
// Using chromium.launch()
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['android'],  // ✅ Right - Android uses Chrome
    browsers: ['chrome'],
}
```

### Pattern 3: Too Many Variables

**Inefficient** (random everything):
```typescript
fingerprintOptions: {
    devices: ['desktop', 'mobile'],
    operatingSystems: ['windows', 'macos', 'linux', 'ios', 'android'],
    browsers: ['chrome', 'firefox', 'safari', 'edge'],
}
```

**Better** (focused):
```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos'],
    browsers: ['chrome'],
}
```

## Quick Reference Table

| Use Case | Device | OS | Browser | Proxy |
|----------|--------|----|---------| ------|
| General scraping | desktop | windows, macos | chrome | SHADER |
| E-commerce | desktop + mobile | all | chrome, safari | RESIDENTIAL |
| Social media | mobile | ios, android | safari, chrome | RESIDENTIAL |
| News sites | desktop | windows, macos | chrome, firefox | SHADER |
| Booking sites | desktop | windows, macos | chrome | RESIDENTIAL + country |
| Mobile apps | mobile | ios or android | safari or chrome | RESIDENTIAL |
| Testing | desktop | windows | chrome | none |

## Copy-Paste Snippets

### Snippet 1: Full Crawlee Setup

```typescript
import { PlaywrightCrawler } from 'crawlee';
import { Actor } from 'apify';

const crawler = new PlaywrightCrawler({
    useSessionPool: true,
    sessionPoolOptions: {
        maxPoolSize: 50,
        sessionOptions: { maxUsageCount: 30 },
    },
    fingerprintOptions: {
        devices: ['desktop'],
        operatingSystems: ['windows', 'macos'],
        browsers: ['chrome'],
    },
    proxyConfiguration: await Actor.createProxyConfiguration({
        groups: ['RESIDENTIAL'],
    }),
    async requestHandler({ page }) {
        // Your code here
    },
});
```

### Snippet 2: Playwright Only

```typescript
import { chromium } from 'playwright';
import { newInjectedContext } from 'fingerprint-injector';

const browser = await chromium.launch();
const context = await newInjectedContext(browser, {
    fingerprintOptions: {
        devices: ['desktop'],
        browsers: ['chrome'],
    },
});
const page = await context.newPage();
```

### Snippet 3: Mobile Specific

```typescript
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['ios'],
    browsers: ['safari'],
}
```

## Related

- **Complete guide**: See `../strategies/anti-blocking.md`
- **Anti-patterns**: See `anti-patterns.md`

---

**Remember**: Match fingerprint to actual browser (Chrome fingerprint with Chromium browser)!
