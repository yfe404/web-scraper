# Fingerprint & Anti-Detection Patterns

Quick reference for anti-detection configurations across development and production contexts.

---

## Section 1: Stealth Mode (Browser Sessions — proxy-mcp)

Stealth mode is the primary anti-detection mechanism for Chrome browser sessions during interactive development.

### Enable Stealth Mode

```
interceptor_chrome_launch("https://target-site.com", stealthMode: true)
```

**Always use** `stealthMode: true` on any site with bot detection.

### What Stealth Mode Patches

| Detection Vector | Patch |
|-----------------|-------|
| `navigator.webdriver` | `false` with `configurable:true` |
| `chrome.runtime` | Exists with expected shape |
| `Permissions.query` | Correct notification response |
| `Error.stack` | Cleaned of CDP traces |

### Verify Stealth Mode

Navigate to bot detection test sites and take screenshots:

```
interceptor_chrome_devtools_navigate("https://bot.sannysoft.com/")
interceptor_chrome_devtools_screenshot()
```

All tests should show "pass" with stealth mode enabled.

### Combine with Humanizer

For sites with behavioral detection, add humanizer interactions:

```
humanizer_click(target_id, selector)      → Bezier curve mouse movement
humanizer_type(target_id, text)           → WPM-based keystroke timing
humanizer_scroll(target_id, "down", 500)  → easeInOutQuad scroll
humanizer_idle(target_id, 2000)           → Micro-jitter anti-idle
```

### Combine with Upstream Proxy

For IP-level blocking:

```
proxy_set_upstream("http://user:pass@proxy.apify.com:8000")
interceptor_chrome_launch("https://target-site.com", stealthMode: true)
```

---

## Section 2: TLS Fingerprint Presets (HTTP-Only Clients — proxy-mcp)

TLS fingerprint spoofing is for HTTP-only clients (gotScraping, curl, fetch) that need to pass TLS-based bot detection. **Not for Chrome browser sessions.**

### Enable TLS Spoofing

```
proxy_set_fingerprint_spoof(preset: "chrome_136")
```

### Available Presets

| Preset | Browser/Client | Use Case |
|--------|---------------|----------|
| `chrome_131` | Chrome 131 | General scraping |
| `chrome_136` | Chrome 136 | Latest Chrome TLS |
| `chrome_136_linux` | Chrome 136 (Linux) | Linux-based scraping |
| `firefox_133` | Firefox 133 | When Chrome is blocked |
| `okhttp3` | OkHttp 3 | Android app emulation |
| `okhttp4` | OkHttp 4 | Android app emulation |
| `okhttp5` | OkHttp 5 | Android app emulation |

### When to Use

**Only when ALL of these are true:**
1. You've found an API via traffic interception
2. You're switching from browser to HTTP-only client for production
3. The target blocks based on TLS fingerprint (JA3)

### Verify TLS Fingerprint

```
proxy_get_tls_fingerprints()           → See what the server sees
proxy_list_fingerprint_presets()       → List available presets
proxy_check_fingerprint_runtime()     → Verify impit is available
```

### Combine with Upstream Proxy

```
proxy_set_upstream("http://user:pass@proxy.apify.com:8000")
proxy_set_fingerprint_spoof(preset: "chrome_136")
```

This gives you both IP rotation AND TLS spoofing for HTTP-only clients.

---

## Section 3: Production (Apify fingerprint-suite)

For production Actors deployed on Apify infrastructure, use the fingerprint-suite with Crawlee.

### Basic Patterns

#### Desktop Chrome (Windows/Mac) — Most Common

```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos'],
    browsers: ['chrome'],
}
```

**Use for**: Most websites, general scraping

#### Mobile Android (Chrome)

```typescript
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['android'],
    browsers: ['chrome'],
}
```

**Use for**: Mobile sites, Android apps' web views

#### Desktop Firefox (Linux)

```typescript
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['linux'],
    browsers: ['firefox'],
}
```

**Use for**: Sites blocking Chrome, developer-focused sites

### Proxy + Fingerprint Combinations

#### Residential Proxy + Desktop

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

#### Datacenter Proxy + Mobile

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

### Session Configuration Patterns

#### Aggressive Rotation (Very Strict Sites)

```typescript
useSessionPool: true,
sessionPoolOptions: {
    maxPoolSize: 100,
    sessionOptions: {
        maxUsageCount: 5,
        maxErrorScore: 1,
    },
},
```

#### Balanced Rotation (Normal Sites)

```typescript
useSessionPool: true,
sessionPoolOptions: {
    maxPoolSize: 50,
    sessionOptions: {
        maxUsageCount: 30,
        maxErrorScore: 3,
    },
},
```

### Common Use Cases

| Use Case | Device | OS | Browser | Proxy |
|----------|--------|----|---------| ------|
| General scraping | desktop | windows, macos | chrome | SHADER |
| E-commerce | desktop + mobile | all | chrome, safari | RESIDENTIAL |
| Social media | mobile | ios, android | safari, chrome | RESIDENTIAL |
| News sites | desktop | windows, macos | chrome, firefox | SHADER |
| Booking sites | desktop | windows, macos | chrome | RESIDENTIAL + country |

### Full Crawlee Setup

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

### Troubleshooting

**Mismatched fingerprint** — ensure fingerprint options match actual browser:
```typescript
// Using chromium.launch() → use Chrome/Android options, NOT Safari/iOS
fingerprintOptions: {
    devices: ['mobile'],
    operatingSystems: ['android'],  // NOT ios (iOS uses WebKit)
    browsers: ['chrome'],           // NOT safari
}
```

**Too many variables** — focused is better than random:
```typescript
// Better: focused
fingerprintOptions: {
    devices: ['desktop'],
    operatingSystems: ['windows', 'macos'],
    browsers: ['chrome'],
}
```

---

## Related

- **Complete anti-blocking guide**: See `../strategies/anti-blocking.md`
- **Anti-patterns**: See `anti-patterns.md`
- **Proxy-MCP tool reference**: See `proxy-tool-reference.md`
