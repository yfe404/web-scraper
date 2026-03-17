# Phase 1: Interactive Reconnaissance

Critical intelligence gathering before any scraping implementation.

## Why Reconnaissance First?

**The current problem**: Most scraping projects start with guesswork:
- "Try the sitemap" → Maybe it doesn't have all data
- "Scrape HTML" → Slow and brittle
- "Use a browser crawler" → Overkill if APIs exist

**The reconnaissance solution**:
- Discover hidden APIs automatically via MITM traffic capture (10-100x faster than HTML)
- Understand site architecture before writing code
- Detect anti-bot measures early and plan countermeasures
- Find optimal data extraction points
- Save hours of wasted implementation effort

## MCP Tools Required

This phase requires:
- **Proxy-MCP**: MITM traffic interception + stealth Chrome browser + DevTools bridge + humanizer

Source reference: `/home/yms/Documents/proxy-mcp/`

See `../reference/proxy-tool-reference.md` for complete tool reference.

---

## Step 1.1: Initialize Browser Session

### Start Proxy and Launch Browser

Start the MITM proxy, launch Chrome with stealth mode, and attach DevTools:

```
proxy_start()

interceptor_chrome_launch(
    url: "https://target-site.com",
    stealthMode: true
)

interceptor_chrome_devtools_attach(target_id)
```

Stealth mode automatically patches:
- `navigator.webdriver` → `false`
- `chrome.runtime` → exists with expected shape
- `Permissions.query` → correct notification response
- `Error.stack` → cleaned of CDP traces

### Capture Initial State

```
interceptor_chrome_devtools_screenshot()
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

### Analyze Captured Traffic

**Critical**: The MITM proxy captures all traffic automatically. No manual DevTools inspection needed.

```
proxy_list_traffic()
```

This shows every HTTP exchange from the page load. Filter for interesting patterns:

```
proxy_list_traffic(url_filter: "/api/")          → REST APIs
proxy_list_traffic(url_filter: "/graphql")        → GraphQL endpoints
proxy_list_traffic(url_filter: "/_next/data/")    → Next.js data endpoints
proxy_list_traffic(url_filter: "/wp-json/")       → WordPress REST API
proxy_search_traffic(query: "application/json")   → Any JSON responses
```

Also check browser-side network view:
```
interceptor_chrome_devtools_list_network(resource_types: ["xhr", "fetch"])
```

### Inspect Discovered Endpoints

For each promising endpoint:

```
proxy_get_exchange(exchange_id)
```

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

### Navigate and Observe Traffic

Browse through key pages while the proxy captures everything:

```
proxy_clear_traffic()
humanizer_click(target_id, ".category-link")
humanizer_idle(target_id, 2000)
proxy_list_traffic(url_filter: "products")

proxy_clear_traffic()
humanizer_click(target_id, ".product-item:first-child")
humanizer_idle(target_id, 2000)
proxy_list_traffic()
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

```
proxy_clear_traffic()
humanizer_click(target_id, ".next-page")
humanizer_idle(target_id, 2000)
proxy_list_traffic(url_filter: "page=")
```

Check if the URL changed:
```
interceptor_chrome_devtools_snapshot()    → Check current page state
```

**Pagination Patterns**:
1. **URL-based**: `?page=2` or `/page/2/`
   - Easy to iterate
   - Can directly construct URLs

2. **API-based**: XHR with `offset`/`cursor` parameters
   - Visible in proxy traffic capture
   - Extract pagination parameters from `proxy_get_exchange()`

3. **Infinite scroll**: Content appends on scroll
   - Trigger with `humanizer_scroll()`
   - Watch for API calls in proxy traffic

**Document**:
```
Pagination:
- Type: [URL-based / API-based / Infinite scroll]
- Parameter: page=N or offset=N or cursor=TOKEN
- Items per page: 20
- Total pages: ~250 (estimated from last page)
```

### Test Filtering and Search

```
proxy_clear_traffic()
humanizer_click(target_id, ".filter-category")
humanizer_idle(target_id, 2000)
proxy_list_traffic()                               → Observe filter API calls

proxy_clear_traffic()
humanizer_click(target_id, "input[name='search']")
humanizer_type(target_id, "test query")
humanizer_idle(target_id, 2000)
proxy_list_traffic(url_filter: "search")           → Observe search API
```

**Look for**:
- Search API endpoints
- Filter parameters
- Sort options
- Query structure

### Discover Data Loading Patterns

```
proxy_clear_traffic()
humanizer_scroll(target_id, "down", 1000)
humanizer_idle(target_id, 2000)
proxy_list_traffic(url_filter: "offset")           → Infinite scroll API calls
```

---

## Step 1.4: Anti-Bot Assessment

### Check for Bot Protection Indicators

Review captured traffic for blocking signals:

```
proxy_list_traffic()                               → Look for 403s, challenge pages
```

Check cookies for tracking markers:
```
interceptor_chrome_devtools_list_cookies(domain_filter: "cloudflare")
interceptor_chrome_devtools_list_cookies(domain_filter: "datadome")
```

Check localStorage for fingerprinting:
```
interceptor_chrome_devtools_list_storage_keys(storage_type: "local")
```

### Check for Protection Scripts

```
interceptor_chrome_devtools_snapshot()
```

Look in the accessibility tree for:
- Cloudflare challenge elements
- CAPTCHA containers
- "Access Denied" text

### Analyze TLS Fingerprints

```
proxy_get_tls_fingerprints()
```

This shows the TLS fingerprints of captured traffic, useful for understanding what the server sees.

### Test Rate Limiting

Navigate to multiple pages and observe responses:

```
interceptor_chrome_devtools_navigate("https://target-site.com/products?page=1")
humanizer_idle(target_id, 1000)
interceptor_chrome_devtools_navigate("https://target-site.com/products?page=2")
humanizer_idle(target_id, 1000)
# ... repeat and check for 429 responses
proxy_list_traffic(url_filter: "429")
```

**Document Protection Mechanisms**:
```
Protection Assessment:
⚠️  Cloudflare: DETECTED (cf-ray header in proxy traffic)
✓   CAPTCHA: Not triggered during normal browsing
✓   Fingerprinting: Not detected
⚠️  Rate Limiting: ~60 requests/minute threshold
✓   Authentication: Not required for product pages

Countermeasures Needed:
- Stealth mode already active (handles browser-level detection)
- Use upstream proxies for IP rotation (proxy_set_upstream)
- Respect rate limit: max 50 requests/minute
- If switching to HTTP-only client: consider TLS spoofing
```

**Note**: Chrome with stealth mode already handles most browser-level detection. Escalation to TLS spoofing is only needed if switching to HTTP-only clients (gotScraping, curl) for production.

---

## Step 1.5: Generate Intelligence Report

### Compile Findings

Create structured report with all reconnaissance data:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTELLIGENCE REPORT: example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: 2026-03-17 10:30 UTC

## 1. Site Architecture

**Framework**: Next.js 13 (detected /_next/data/ in proxy traffic)
**Rendering**: Hybrid SSR + CSR
**Primary Data Source**: Internal REST API

## 2. Discovered Endpoints (via Traffic Capture)

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
| Cloudflare | Active | Medium - use upstream proxies |
| CAPTCHA | Not triggered | None currently |
| Fingerprinting | Not detected | Stealth mode sufficient |
| Rate Limiting | 60/min | High - must respect |
| Auth Required | None | None |

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
5. Use upstream proxies if needed (Cloudflare present)

**Why This Works**:
- API discovered via traffic capture — clean JSON, no HTML parsing
- Sitemap validates completeness
- Under rate limit
- No authentication barriers

### Alternative: DOM Scraping (DevTools Bridge)
If API becomes blocked:
- Use `interceptor_chrome_devtools_snapshot()` for accessibility tree extraction
- Use humanizer for interactions
- Enable upstream proxies + stealth mode
- Estimated time: 15-20 minutes (slower)

## 7. Implementation Checklist

- [ ] Use `gotScraping` or `fetch` for API calls
- [ ] Implement rate limiting: 50 requests/minute
- [ ] Use upstream proxy if needed (Cloudflare present)
- [ ] Parse sitemap for product IDs
- [ ] Batch API requests (100 items per call)
- [ ] Add retry logic (3 attempts)
- [ ] Log failed requests
- [ ] Validate data completeness

## 8. Risk Assessment

**Low Risk**:
- API is stable and publicly accessible
- No authentication required
- Rate limits are reasonable

**Potential Issues**:
- API structure may change (monitor for schema changes)
- Rate limit may tighten (respect current limits)
- Cloudflare may upgrade protection (have DOM scraping fallback ready)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROCEED TO PHASE 2: VALIDATION & PHASE 3: STRATEGY SELECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 1.6: Record Session for Replay

After completing reconnaissance, save the session for future reference:

```
proxy_session_start("recon-example-com")
# ... perform any additional exploration ...
proxy_session_stop(session_id)
proxy_export_har(session_id, "recon-example-com.har")
```

The HAR file captures all traffic for later analysis or replay. See `../strategies/session-workflows.md` for complete session management guide.

---

## Real-World Examples

### Example 1: E-Commerce Site with Hidden API

**User Request**: "Scrape products from shop.example.com"

**Reconnaissance Process**:

1. **Browser Session**:
```
proxy_start()
interceptor_chrome_launch("https://shop.example.com", stealthMode: true)
interceptor_chrome_devtools_attach(target_id)
interceptor_chrome_devtools_screenshot()
```

2. **Traffic Analysis**:
```
proxy_list_traffic(url_filter: "api")
proxy_search_traffic(query: "application/json")
```
   - **Discovery**: `GET /api/products.json?collection_id=123`

3. **API Inspection**:
```
proxy_get_exchange(exchange_id)
```
   - Result: API returns 100 products per request, no auth needed

4. **Protection Check**:
```
interceptor_chrome_devtools_list_cookies(domain_filter: "cloudflare")
proxy_list_traffic(url_filter: "403")
```
   - No Cloudflare detected
   - No rate limiting after browsing
   - Simple API, no fingerprinting

**Outcome**: Skip HTML scraping entirely, use direct API access (50x faster)

---

### Example 2: News Site with Infinite Scroll

**User Request**: "Scrape articles from news.example.com"

**Reconnaissance**:

1. **Initial Load**: Only 10 articles visible

2. **Scroll Test**:
```
proxy_clear_traffic()
humanizer_scroll(target_id, "down", 2000)
humanizer_idle(target_id, 2000)
```

3. **Traffic Observation**:
```
proxy_list_traffic(url_filter: "offset")
proxy_get_exchange(exchange_id)
```
   - XHR triggered: `GET /api/articles?offset=10`
   - Pattern discovered: offset-based pagination

4. **Pagination Extraction**:
   - Offset increases by 10
   - Total articles: 500 (from API response)
   - API accessible directly without browser

**Outcome**: Use API with offset pagination instead of scroll automation

---

### Example 3: Protected Site with Cloudflare

**User Request**: "Scrape data from protected.example.com"

**Reconnaissance**:

1. **Initial Load**: Stealth mode handles Cloudflare challenge automatically
```
proxy_start()
interceptor_chrome_launch("https://protected.example.com", stealthMode: true)
interceptor_chrome_devtools_attach(target_id)
humanizer_idle(target_id, 5000)
interceptor_chrome_devtools_screenshot()
```

2. **Protection Analysis**:
```
interceptor_chrome_devtools_list_cookies(domain_filter: "cloudflare")
proxy_list_traffic()
```
   - Cookies set: `cf_clearance`, `__cfduid`
   - All subsequent requests require these cookies
   - No API found in traffic — standard HTML rendering

3. **Traffic After Challenge**:
```
proxy_list_traffic(url_filter: "api")
proxy_search_traffic(query: "json")
```
   - No APIs discovered

**Outcome**:
- Use DOM scraping via DevTools bridge (`interceptor_chrome_devtools_snapshot()`)
- Stealth mode already handles browser-level detection
- Use upstream proxies for IP rotation (`proxy_set_upstream()`)
- For production Actor: use PlaywrightCrawler with fingerprint-suite on Apify infrastructure

---

## Decision Tree

Based on reconnaissance findings, determine next steps:

```
Reconnaissance Complete (Traffic Captured)
    ├─ API Discovered in Traffic?
    │   ├─ YES → Prefer API route (Phase 3: API strategy)
    │   │         └─ Auth required?
    │   │             ├─ NO → Direct API access (fastest)
    │   │             └─ YES → Record auth flow, extract tokens
    │   └─ NO → DOM scraping needed
    │             └─ JavaScript-rendered?
    │                 ├─ YES → DevTools bridge + humanizer
    │                 └─ NO → Use Cheerio (10x faster)
    │
    ├─ Protection Detected?
    │   ├─ Cloudflare/bot detection
    │   │   └─ Stealth mode handles browser detection
    │   │       └─ IP blocked? → Add upstream proxies
    │   ├─ Rate limiting
    │   │   └─ Respect limits in implementation
    │   └─ CAPTCHA
    │       └─ Consider CAPTCHA solving service or manual intervention
    │
    └─ Sitemap Available?
        ├─ YES → Use for URL discovery (combine with API if found)
        └─ NO → Use traffic-discovered pagination or crawl
```

---

## Common Mistakes to Avoid

### Skipping Reconnaissance

**Bad**: Jump straight to coding based on assumptions
```javascript
// WRONG: Assuming structure, no traffic analysis
const crawler = new PlaywrightCrawler({
  async requestHandler({ page }) {
    // Blindly scraping HTML without knowing if API exists
  }
});
```

**Good**: Perform traffic interception first
```javascript
// RIGHT: After discovering API via proxy traffic capture
const response = await gotScraping({
  url: discoveredApiEndpoint,  // From reconnaissance
  responseType: 'json'
});
```

### Launching Chrome Without Stealth Mode

**Bad**: `interceptor_chrome_launch(url)` — no stealth
**Good**: `interceptor_chrome_launch(url, stealthMode: true)` — always use stealth on protected sites

### Using interceptor_chrome_navigate Instead of DevTools Navigate

**Bad**: `interceptor_chrome_navigate(url)` — loses DevTools session
**Good**: `interceptor_chrome_devtools_navigate(url)` — preserves DevTools attachment

### Not Clearing Traffic Before Actions

**Bad**: Looking at all traffic (noisy, includes page load)
**Good**: `proxy_clear_traffic()` before each action to isolate specific API calls

---

## Tools Reference

### Proxy-MCP Tools Used in Reconnaissance

**Initialization**:
- `proxy_start()` — Start MITM proxy
- `interceptor_chrome_launch(url, stealthMode)` — Launch stealth Chrome
- `interceptor_chrome_devtools_attach(target_id)` — Attach DevTools bridge

**Traffic Analysis**:
- `proxy_list_traffic(url_filter, method_filter)` — List captured exchanges
- `proxy_search_traffic(query)` — Full-text search across traffic
- `proxy_get_exchange(exchange_id)` — Full request/response details
- `proxy_clear_traffic()` — Clear buffer before actions

**Browser Control (DevTools Bridge)**:
- `interceptor_chrome_devtools_navigate(url)` — Navigate (preserves DevTools)
- `interceptor_chrome_devtools_screenshot()` — Capture screenshot
- `interceptor_chrome_devtools_snapshot()` — Accessibility tree
- `interceptor_chrome_devtools_list_network(resource_types)` — Browser network view
- `interceptor_chrome_devtools_list_console()` — Console messages
- `interceptor_chrome_devtools_list_cookies(domain_filter)` — Cookies
- `interceptor_chrome_devtools_list_storage_keys(storage_type)` — Storage keys

**Human Interaction (Humanizer)**:
- `humanizer_click(target_id, selector)` — Click with human-like behavior
- `humanizer_type(target_id, text)` — Type with realistic timing
- `humanizer_scroll(target_id, direction, amount)` — Smooth scroll
- `humanizer_idle(target_id, duration_ms)` — Idle with micro-movements

**Session Management**:
- `proxy_session_start(name)` — Record session
- `proxy_session_stop(session_id)` — Stop recording
- `proxy_export_har(session_id, path)` — Export as HAR

See `../reference/proxy-tool-reference.md` for complete tool reference.

---

## Next Steps

After completing reconnaissance:

1. **Proceed to Phase 2**: Validate findings with automated checks (sitemaps, robots.txt)
2. **Proceed to Phase 3**: Present strategy recommendations based on intelligence
3. **Proceed to Phase 4**: Implement chosen strategy with confidence

**Key Advantage**: No more guesswork — every implementation decision is backed by traffic analysis data.

---

Back to main workflow: `../SKILL.md`
