# Traffic Interception Strategy

Primary reconnaissance and data extraction strategy using proxy-mcp's MITM proxy.

## Overview

Traffic interception is the **default first strategy** for all web scraping projects. Instead of inspecting the DOM or guessing at page structure, the MITM proxy captures all HTTP/HTTPS traffic between the browser and the server automatically. This reveals:

- Hidden APIs returning structured JSON data
- Authentication flows and token management
- Third-party service calls and analytics
- The exact requests that populate the page

**Why traffic interception beats DOM scraping**:

| Aspect | Traffic Interception | DOM Scraping |
|--------|---------------------|--------------|
| API discovery | Automatic — all XHR/fetch visible | Manual — must guess endpoints |
| Data format | Raw JSON from API responses | Parsed HTML (fragile selectors) |
| Coverage | Sees all traffic including background | Only sees rendered DOM |
| Speed | Instant capture, no rendering needed | Must wait for full page render |
| Reliability | APIs are stable contracts | HTML structure changes frequently |
| Authentication | Captures tokens/cookies in flight | Must extract from DOM/storage |

## When to Use

**Always as the first step** — traffic interception is the default reconnaissance method. Even if you ultimately use a different extraction strategy, traffic analysis informs your approach.

**Especially effective when**:
- You suspect the site has internal APIs (most modern sites do)
- The site is a SPA (React, Vue, Angular, Next.js)
- You need to understand authentication flows
- You want to find pagination patterns
- You need to reverse-engineer request signatures

**Consider alternatives when**:
- You already know the API from prior reconnaissance
- The site serves purely static HTML with no JavaScript
- You're doing bulk URL-based scraping from a known sitemap

## Core Workflow

### Step 1: Start Proxy and Launch Browser

```
proxy_start()
interceptor_chrome_launch("https://target-site.com", stealthMode: true)
interceptor_chrome_devtools_attach(target_id)
```

This gives you:
- MITM proxy capturing all traffic
- Chrome browser with stealth patches (webdriver, chrome.runtime, etc.)
- DevTools bridge for DOM inspection and screenshots

### Step 2: Initial Page Load Analysis

```
interceptor_chrome_devtools_screenshot()           → Visual reference
proxy_list_traffic()                                → See all requests from page load
proxy_list_traffic(url_filter: "api")              → Filter for API calls
proxy_search_traffic(query: "application/json")    → Find JSON responses
```

Document what you find:
- Framework indicators (Next.js `/_next/data/`, WordPress `/wp-json/`, etc.)
- API endpoints returning JSON
- Authentication headers or cookies
- CDN and third-party calls

### Step 3: Interactive Exploration

Browse the site while monitoring traffic:

```
proxy_clear_traffic()                               → Clear buffer before action
humanizer_click(target_id, ".category-link")       → Click a category
humanizer_idle(target_id, 2000)                     → Wait for network
proxy_list_traffic(url_filter: "products")         → See API calls triggered
```

**Test key interactions**:
- Pagination (click next page, observe API calls with page/offset parameters)
- Search (type a query, observe search API endpoint)
- Filters (select a filter, observe filter parameters in API calls)
- Infinite scroll (scroll down, observe lazy-load API calls)

### Step 4: Inspect Discovered Endpoints

For each API endpoint found:

```
proxy_get_exchange(exchange_id)
```

This returns the full request and response:
- Request method, URL, headers, body
- Response status, headers, body
- Timing information

**Extract**:
- Base URL pattern (e.g., `/api/v2/products`)
- Query parameters (pagination, filters, auth tokens)
- Required headers (Authorization, X-API-Key, custom headers)
- Response structure (JSON schema, pagination metadata)

### Step 5: Validate API Access

Once you've identified an API, test direct access:

```
proxy_clear_traffic()
interceptor_chrome_devtools_navigate("https://target-site.com/api/v2/products?page=1&limit=5")
proxy_get_exchange(exchange_id)    → Verify response
```

If the API works directly, you can skip DOM scraping entirely and use `gotScraping` or `fetch` for production extraction.

## API Discovery Patterns

### REST APIs

Look for traffic matching:
```
/api/v{N}/...
/rest/...
/ajax/...
/_api/...
```

Filter: `proxy_list_traffic(url_filter: "/api/")`

### GraphQL APIs

Look for POST requests to `/graphql`:
```
proxy_list_traffic(url_filter: "/graphql", method_filter: "POST")
proxy_get_exchange(exchange_id)    → Inspect query in request body
```

### Framework-Specific Endpoints

| Framework | Pattern | Filter |
|-----------|---------|--------|
| Next.js | `/_next/data/{BUILD_ID}/...` | `url_filter: "/_next/data/"` |
| WordPress | `/wp-json/wp/v2/...` | `url_filter: "/wp-json/"` |
| Shopify | `/products.json`, `/collections.json` | `url_filter: ".json"` |
| SvelteKit | `/__data.json` | `url_filter: "__data.json"` |

### Pagination Discovery

```
proxy_clear_traffic()
humanizer_click(target_id, ".next-page")         → Click pagination
humanizer_idle(target_id, 2000)
proxy_list_traffic(url_filter: "page=")          → Find pagination API
proxy_get_exchange(exchange_id)                   → Extract pagination params
```

Common patterns:
- Offset: `?page=2&limit=20` or `?offset=20&limit=20`
- Cursor: `?cursor=abc123&limit=20`
- Token: `?pageToken=xyz`

## Request Modification

### Inject Custom Headers

```
proxy_inject_headers({
    "Accept-Language": "en-US",
    "X-Custom-Header": "value"
})
```

### Rewrite URLs

```
proxy_rewrite_url("/old-api/", "/new-api/")
```

### Add Interception Rules

```
proxy_add_rule(
    matcher: { urlPattern: "*/analytics/*" },
    handler: { type: "drop" }
)
```

Use rules to:
- **Drop** analytics/tracking requests (reduce noise)
- **Forward** requests to a different server
- **Mock** responses for testing
- **Passthrough** with modifications

## Upstream Proxy Chaining

When you need IP rotation or geographic targeting:

```
proxy_set_upstream("http://user:pass@proxy.apify.com:8000")
```

This chains the MITM proxy to an upstream proxy (e.g., Apify residential proxies), giving you:
- IP rotation
- Geographic targeting
- Residential IP addresses for strict sites

## When to Add TLS Spoofing

TLS fingerprint spoofing is **only needed** when:
1. You've found an API via traffic interception
2. You want to switch from browser to HTTP-only client (gotScraping, curl, fetch) for production
3. The target blocks the HTTP client based on TLS fingerprint

```
proxy_set_fingerprint_spoof(preset: "chrome_136")
```

**Do NOT use TLS spoofing for Chrome browser sessions** — Chrome already has a legitimate TLS fingerprint.

## Comparison Table

| Approach | Speed | Reliability | API Discovery | Anti-Detection |
|----------|-------|-------------|---------------|----------------|
| **Traffic Interception** | Fast | High | Automatic | Stealth mode built-in |
| DOM Scraping | Slow | Medium | None — manual only | Requires extra setup |
| Direct HTTP (gotScraping) | Fastest | High | Must know API first | TLS spoofing may be needed |
| Sitemap + Cheerio | Fast | High | None | Minimal |

## Integration with Other Strategies

Traffic interception is Phase 1. Based on findings:

- **API found, no auth** → Switch to direct HTTP (`gotScraping`) for production
- **API found, needs auth** → Record auth flow with session management, then direct HTTP
- **No API found** → Fall back to DOM scraping via DevTools bridge
- **Sitemap available** → Combine sitemap URLs with API data (hybrid approach)

---

## Related

- **Tool reference**: See `../reference/proxy-tool-reference.md`
- **DOM scraping fallback**: See `dom-scraping.md`
- **Anti-blocking layers**: See `anti-blocking.md`
- **Session recording**: See `session-workflows.md`
- **API usage (production)**: See `api-discovery.md`
