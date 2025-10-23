# Phase 1: Interactive Reconnaissance

Critical intelligence gathering before any scraping implementation.

## Why Reconnaissance First?

**The current problem**: Most scraping projects start with guesswork:
- "Try the sitemap" → Maybe it doesn't have all data
- "Scrape HTML" → Slow and brittle
- "Use Playwright" → Overkill if APIs exist

**The reconnaissance solution**:
- Discover hidden APIs visible only in browser DevTools (10-100x faster than HTML)
- Understand site architecture before writing code
- Detect anti-bot measures early and plan countermeasures
- Find optimal data extraction points
- Save hours of wasted implementation effort

## MCP Tools Required

This phase requires:
- **Playwright MCP**: Browser automation for real user interaction
- **Chrome DevTools MCP** (via Playwright): Network monitoring, console analysis

Both are available through Claude's MCP integration when Playwright MCP server is configured.

---

## Step 1.1: Initialize Browser Session

### Open Target Site

Start by opening the site in a real browser to observe its behavior:

```typescript
// Navigate to target site
await playwright_navigate({
  url: "https://target-site.com",
  headless: false,  // Visual inspection important for first pass
  waitUntil: "networkidle"  // Wait for all network requests
});

// Capture initial state
await playwright_screenshot({
  name: "homepage-initial",
  fullPage: true,
  savePng: true
});
```

### Observe Loading Behavior

**Look for**:
- **Immediate content**: Page loads fully on first request → Likely SSR/static
- **Loading spinners**: Content loads after initial paint → JavaScript-rendered
- **Skeleton screens**: Placeholder UI → API-driven dynamic content
- **Popups/banners**: Cookie consent, newsletters → Need to dismiss before exploration

**Document findings**:
```
Initial Load Observation:
- Page type: [Static/SSR/SPA]
- Loading pattern: [Immediate/Progressive/Delayed]
- Interstitials: [Cookie banner, newsletter popup]
```

---

## Step 1.2: Network Traffic Analysis

### Monitor All Network Requests

**Critical**: This reveals the "invisible" data layer that drives the site.

```typescript
// Start network monitoring (Playwright automatically captures this)
await playwright_navigate({
  url: "https://target-site.com/products"
});

// Navigate through key pages while monitoring
await playwright_click({ selector: ".category-link" });
await playwright_wait({ timeout: 2000 });

await playwright_click({ selector: ".product-item:first-child" });
await playwright_wait({ timeout: 2000 });

// Retrieve console logs (includes network activity logged by site)
const logs = await playwright_console_logs({
  type: "all",
  limit: 100
});
```

### Analyze Network Patterns

Use browser DevTools (manually or via Playwright) to inspect:

**API Endpoints to Look For**:
- `/api/v{N}/...` - Versioned REST APIs
- `/graphql` - GraphQL endpoints
- `/_next/data/...` - Next.js data endpoints
- `/wp-json/...` - WordPress REST API
- `/ajax/...` - Legacy AJAX endpoints
- `/__data.json` - SvelteKit data

**What to Extract**:
```
Discovered Endpoints:
✅ GET /api/v2/products?page={n}&limit={m}
   Request: page=1, limit=20
   Response: JSON array of products
   Auth: None required
   Rate limit: Unknown (test needed)

✅ GET /api/v2/products/{id}
   Response: Detailed product JSON
   Fields: id, name, price, description, images, stock
```

### Inspect Request/Response Details

For each discovered endpoint:

```typescript
// Test API endpoint directly
await playwright_evaluate({
  script: `
    fetch('/api/v2/products?page=1&limit=5')
      .then(r => r.json())
      .then(data => console.log('API_DATA:', JSON.stringify(data)))
      .catch(e => console.log('API_ERROR:', e.message));
  `
});

// Check console for output
const apiLogs = await playwright_console_logs({
  search: "API_DATA",
  limit: 1
});
```

**Document**:
- Request method (GET/POST)
- Required headers (authorization, content-type)
- Query parameters (pagination, filters)
- Response structure
- Authentication requirements

---

## Step 1.3: Site Structure Discovery

### Test Pagination Mechanisms

**Pagination Type Detection**:

```typescript
// Test pagination clicks
await playwright_click({ selector: ".next-page" });
await playwright_wait({ timeout: 1000 });

// Check if URL changed
const currentUrl = await playwright_evaluate({
  script: "window.location.href"
});

// Check if content was replaced or appended
const itemCount = await playwright_evaluate({
  script: "document.querySelectorAll('.product-item').length"
});
```

**Pagination Patterns**:
1. **URL-based**: `?page=2` or `/page/2/`
   - Easy to iterate
   - Can directly construct URLs

2. **API-based**: XHR with `offset`/`cursor` parameters
   - Check DevTools Network tab
   - Extract pagination parameters

3. **Infinite scroll**: Content appends on scroll
   - Need to trigger scroll events
   - Watch for API calls

**Document**:
```
Pagination:
- Type: [URL-based / API-based / Infinite scroll]
- Parameter: page=N or offset=N or cursor=TOKEN
- Items per page: 20
- Total pages: ~250 (estimated from last page)
```

### Test Filtering and Search

```typescript
// Test filter selection
await playwright_click({ selector: ".filter-category" });
await playwright_wait({ timeout: 1000 });

// Observe URL or API changes
// Check DevTools Network tab for XHR/Fetch

// Test search functionality
await playwright_fill({
  selector: "input[name='search']",
  value: "test query"
});

await playwright_click({ selector: "button[type='submit']" });
```

**Look for**:
- Search API endpoints
- Filter parameters
- Sort options
- Query structure

### Discover Data Loading Patterns

```typescript
// Check for infinite scroll
await playwright_evaluate({
  script: `
    window.scrollTo(0, document.body.scrollHeight);
  `
});

await playwright_wait({ timeout: 2000 });

// Check if new content loaded
const newItemCount = await playwright_evaluate({
  script: "document.querySelectorAll('.product-item').length"
});

// Check console for API calls triggered by scroll
const scrollLogs = await playwright_console_logs({
  search: "api",
  limit: 10
});
```

---

## Step 1.4: Anti-Bot Assessment

### Detect Bot Protection

```typescript
// Check for common bot detection indicators
const protectionCheck = await playwright_evaluate({
  script: `
    const bodyText = document.body.textContent.toLowerCase();
    const html = document.documentElement.outerHTML;

    ({
      cloudflare: bodyText.includes('cloudflare') || html.includes('cf-ray'),
      captcha: bodyText.includes('captcha') || !!document.querySelector('.g-recaptcha, #px-captcha'),
      accessDenied: bodyText.includes('access denied') || bodyText.includes('403 forbidden'),
      rateLimited: bodyText.includes('too many requests') || bodyText.includes('429'),
      akamai: html.includes('akamai'),
      datadome: html.includes('datadome'),
      perimeter: html.includes('perimeterx')
    })
  `
});
```

### Check for Fingerprinting Scripts

```typescript
// Detect fingerprinting libraries
const fingerprintScripts = await playwright_evaluate({
  script: `
    Array.from(document.querySelectorAll('script[src]'))
      .map(s => s.src)
      .filter(src =>
        src.includes('fingerprint') ||
        src.includes('fp-') ||
        src.includes('akamai') ||
        src.includes('datadome') ||
        src.includes('perimeterx') ||
        src.includes('px-')
      );
  `
});
```

### Test Rate Limiting

```typescript
// Make multiple rapid requests to test limits
for (let i = 0; i < 10; i++) {
  await playwright_navigate({
    url: `https://target-site.com/products?page=${i}`
  });

  const blocked = await playwright_evaluate({
    script: `
      document.body.textContent.toLowerCase().includes('rate limit') ||
      document.body.textContent.toLowerCase().includes('too many requests')
    `
  });

  if (blocked) {
    console.log(`Rate limited after ${i} requests`);
    break;
  }
}
```

**Document Protection Mechanisms**:
```
Protection Assessment:
⚠️  Cloudflare: DETECTED (cf-ray header present)
✓   CAPTCHA: Not triggered during normal browsing
✓   Fingerprinting: Not detected
⚠️  Rate Limiting: ~60 requests/minute threshold
✓   Authentication: Not required for product pages

Countermeasures Needed:
- Use residential or datacenter proxies (Cloudflare)
- Respect rate limit: max 50 requests/minute
- Consider fingerprint-suite if blocks occur
- Rotate user agents
```

---

## Step 1.5: Generate Intelligence Report

### Compile Findings

Create structured report with all reconnaissance data:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INTELLIGENCE REPORT: example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: 2025-01-24 10:30 UTC

## 1. Site Architecture

**Framework**: Next.js 13 (detected __NEXT_DATA__)
**Rendering**: Hybrid SSR + CSR
**Primary Data Source**: Internal REST API

## 2. Discovered Endpoints

### Products API (Primary)
**Endpoint**: `GET /api/v2/products`
**Parameters**:
  - `page`: integer (1-250)
  - `limit`: integer (max 100, default 20)
  - `category`: string (optional filter)

**Response Structure**:
```json
{
  "products": [...],
  "total": 5000,
  "page": 1,
  "hasMore": true
}
```

**Authentication**: None required
**Rate Limit**: ~60 requests/minute

### Product Details API
**Endpoint**: `GET /api/v2/products/{id}`
**Response**: Full product object with variants
**Authentication**: None required

## 3. Sitemap Analysis

**Location**: `/sitemap_index.xml`
**Product URLs**: 5,000 URLs
**Update Frequency**: Daily
**Coverage**: 100% (matches API total)

## 4. Protection Mechanisms

| Mechanism | Status | Impact |
|-----------|--------|--------|
| Cloudflare | ✅ Active | Medium - use proxies |
| CAPTCHA | ⚪ Not triggered | None currently |
| Fingerprinting | ⚪ Not detected | None |
| Rate Limiting | ⚠️ 60/min | High - must respect |
| Auth Required | ❌ None | None |

## 5. Pagination Strategy

**Type**: API-based offset pagination
**Method**: Query parameters `?page=N&limit=M`
**Max per request**: 100 items
**Total pages**: 50 (at limit=100)
**Estimated total items**: 5,000

## 6. Optimal Scraping Strategy

### Recommended Approach: Hybrid (Sitemap + API)

**Phase A - URL Discovery** (~1 minute):
1. Parse sitemap.xml → Extract 5,000 product URLs
2. Extract product IDs from URLs: `/products/(\d+)`

**Phase B - Data Extraction** (~3-5 minutes):
1. Use discovered API: `/api/v2/products?page=1&limit=100`
2. Rate: 50 requests/minute (safe buffer)
3. Total requests needed: 50
4. Expected duration: ~1.5 minutes
5. Use datacenter proxies (Cloudflare present)

**Why This Works**:
- ✅ API is 10-100x faster than HTML scraping
- ✅ No HTML parsing needed (clean JSON)
- ✅ Sitemap validates completeness
- ✅ Under rate limit
- ✅ No authentication barriers

### Alternative: Direct Sitemap Scraping
If API becomes blocked:
- Scrape HTML from sitemap URLs
- Use project_playwright_crawler_ts template
- Enable proxies + fingerprint-suite
- Estimated time: 15-20 minutes (slower)

## 7. Implementation Checklist

- [ ] Use `gotScraping` or `fetch` for API calls
- [ ] Implement rate limiting: 50 requests/minute
- [ ] Use Apify proxy (datacenter tier minimum)
- [ ] Parse sitemap for product IDs
- [ ] Batch API requests (100 items per call)
- [ ] Add retry logic (3 attempts)
- [ ] Log failed requests
- [ ] Validate data completeness

## 8. Risk Assessment

**Low Risk** ✅:
- API is stable and publicly accessible
- No authentication required
- Rate limits are reasonable
- Cloudflare not aggressive (with proxies)

**Potential Issues** ⚠️:
- API structure may change (monitor for schema changes)
- Rate limit may tighten (respect current limits)
- Cloudflare may upgrade protection (have Playwright fallback ready)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROCEED TO PHASE 2: VALIDATION & PHASE 3: STRATEGY SELECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Real-World Examples

### Example 1: E-Commerce Site with Hidden API

**User Request**: "Scrape products from shop.example.com"

**Reconnaissance Process**:

1. **Browser Session**:
```typescript
await playwright_navigate({ url: "https://shop.example.com" });
await playwright_screenshot({ name: "homepage" });
```

2. **Network Analysis**:
   - Clicked through categories
   - Observed XHR requests in DevTools
   - **Discovery**: `GET /api/products.json?collection_id=123`

3. **API Testing**:
```typescript
await playwright_evaluate({
  script: `
    fetch('/api/products.json?collection_id=123&limit=100')
      .then(r => r.json())
      .then(d => console.log('FOUND:', d.products.length, 'products'));
  `
});
```
   - Result: API returns 100 products per request, no auth needed

4. **Protection Check**:
   - No Cloudflare detected
   - No rate limiting after 20 test requests
   - Simple API, no fingerprinting

**Outcome**: Skip HTML scraping entirely, use direct API access (50x faster)

---

### Example 2: News Site with Infinite Scroll

**User Request**: "Scrape articles from news.example.com"

**Reconnaissance**:

1. **Initial Load**: Only 10 articles visible

2. **Scroll Test**:
```typescript
await playwright_evaluate({
  script: "window.scrollTo(0, document.body.scrollHeight)"
});
await playwright_wait({ timeout: 2000 });
```

3. **Network Observation**:
   - XHR triggered: `GET /api/articles?offset=10`
   - Pattern discovered: offset-based pagination

4. **Pagination Extraction**:
   - Offset increases by 10
   - Total articles: 500 (from API response header)
   - API accessible directly without browser

**Outcome**: Use API with offset pagination instead of Playwright scroll automation

---

### Example 3: Protected Site with Cloudflare

**User Request**: "Scrape data from protected.example.com"

**Reconnaissance**:

1. **Initial Load**: Cloudflare challenge page

2. **Protection Analysis**:
```typescript
const protection = await playwright_evaluate({
  script: `
    document.body.textContent.includes('Checking your browser')
  `
});
// Result: true - Cloudflare active
```

3. **Challenge Solving**: Wait for automatic challenge resolution
```typescript
await playwright_wait({ timeout: 5000 });
await playwright_screenshot({ name: "after-challenge" });
```

4. **Post-Challenge Analysis**:
   - Cookies set: `cf_clearance`, `__cfduid`
   - All subsequent requests require these cookies
   - Standard HTML scraping, no API found

**Outcome**:
- Must use Playwright (browser needed for challenge)
- Use fingerprint-suite for stealth
- Use residential proxies
- Implement cookie persistence

---

## Decision Tree

Based on reconnaissance findings, determine next steps:

```
Reconnaissance Complete
    ├─ API Discovered?
    │   ├─ YES → Prefer API route (Phase 3: API strategy)
    │   │         └─ Check: Auth required?
    │   │             ├─ NO → Direct API access ✅ (fastest)
    │   │             └─ YES → Browser auth + API extraction
    │   └─ NO → HTML scraping needed
    │             └─ Check: JavaScript-rendered?
    │                 ├─ YES → Use Playwright
    │                 └─ NO → Use Cheerio (10x faster)
    │
    ├─ Protection Detected?
    │   ├─ Cloudflare/bot detection
    │   │   └─ Add: Proxies + Fingerprint-suite
    │   ├─ Rate limiting
    │   │   └─ Add: Rate limiter (respect limits)
    │   └─ CAPTCHA
    │       └─ Consider: CAPTCHA solving service or manual intervention
    │
    └─ Sitemap Available?
        ├─ YES → Use for URL discovery
        └─ NO → Implement crawler for discovery
```

---

## Common Mistakes to Avoid

### ❌ Skipping Reconnaissance

**Bad**: Jump straight to coding based on assumptions
```javascript
// WRONG: Assuming structure
const crawler = new PlaywrightCrawler({
  async requestHandler({ page }) {
    // Blindly scraping HTML without knowing if API exists
  }
});
```

**Good**: Perform reconnaissance first
```javascript
// RIGHT: After discovering API in Phase 1
const response = await gotScraping({
  url: discoveredApiEndpoint,  // From reconnaissance
  responseType: 'json'
});
```

### ❌ Ignoring Network Tab

**Bad**: Only looking at visible HTML
**Good**: Monitor DevTools Network tab for hidden APIs

### ❌ Testing Without Protection Awareness

**Bad**: Write scraper, then discover Cloudflare blocks it
**Good**: Detect Cloudflare in Phase 1, plan proxies from start

---

## Tools Reference

### MCP Tool Usage

**Playwright MCP commands used in reconnaissance**:
- `playwright_navigate` - Open URLs
- `playwright_screenshot` - Capture visual state
- `playwright_click` - Interact with elements
- `playwright_fill` - Test form inputs
- `playwright_evaluate` - Execute JavaScript, test APIs
- `playwright_console_logs` - Retrieve network/error logs
- `playwright_wait` - Pause for async operations

**Not yet available but useful**:
- Chrome DevTools Protocol directly (use `playwright_evaluate` workaround)
- Network HAR export (use console logging workaround)

---

## Next Steps

After completing reconnaissance:

1. **Proceed to Phase 2**: Validate findings with automated checks (sitemaps, robots.txt)
2. **Proceed to Phase 3**: Present strategy recommendations based on intelligence
3. **Proceed to Phase 4**: Implement chosen strategy with confidence

**Key Advantage**: No more guesswork - every implementation decision is backed by reconnaissance data.

---

Back to main workflow: `../SKILL.md`
