---
name: web-scraping
description: This skill activates for web scraping and Actor development. It proactively discovers APIs via traffic interception, recommends optimal strategy (traffic interception/sitemap/API/DOM scraping/hybrid), and implements iteratively. For production, it guides TypeScript Actor creation via Apify CLI.
license: MIT
---

# Web Scraping with Intelligent Strategy Selection

## When This Skill Activates

Activate automatically when user requests:
- "Scrape [website]"
- "Extract data from [site]"
- "Get product information from [URL]"
- "Find all links/pages on [site]"
- "I'm getting blocked" or "Getting 403 errors" (loads `strategies/anti-blocking.md`)
- "Make this an Apify Actor" (loads `apify/` subdirectory)
- "Productionize this scraper"

## Proactive Workflow

This skill follows a systematic 5-phase approach to web scraping, always starting with interactive reconnaissance and ending with production-ready code.

### Phase 1: INTERACTIVE RECONNAISSANCE (Critical First Step)

When user says "scrape X", **immediately start with hands-on reconnaissance** using MCP tools:

**DO NOT jump to automated checks or implementation** - reconnaissance prevents wasted effort and discovers hidden APIs.

#### Use Proxy-MCP (Traffic Interception + Stealth Browser + Humanizer):

**1. Start MITM proxy and launch stealth browser**
   - `proxy_start()` → Start traffic interception proxy
   - `interceptor_chrome_launch(url, stealthMode: true)` → Launch Chrome with anti-detection patches (webdriver, chrome.runtime, Permissions.query, Error.stack)
   - `interceptor_chrome_devtools_attach(target_id)` → Attach DevTools bridge for DOM access
   - `interceptor_chrome_devtools_screenshot()` → Capture initial state
   - Observe page loading behavior (SSR? SPA? Loading states?)

**2. Analyze captured network traffic** (automatic — MITM proxy captures everything)
   - `proxy_list_traffic(url_filter: "api")` → Find REST API endpoints
   - `proxy_search_traffic(query: "application/json")` → Find JSON responses
   - `proxy_get_exchange(exchange_id)` → Inspect full request/response details
   - `interceptor_chrome_devtools_list_network(resource_types: ["xhr", "fetch"])` → Browser-side network view
   - **Find API endpoints** returning JSON (10-100x faster than HTML scraping!)
   - Document headers, cookies, authentication tokens
   - Extract pagination parameters

**3. Test site interactions** (humanizer for anti-detection)
   - `humanizer_click(target_id, selector)` → Click with human-like Bezier curves
   - `humanizer_type(target_id, text)` → Type with realistic WPM timing
   - `humanizer_scroll(target_id, direction, amount)` → Smooth scroll
   - `humanizer_idle(target_id, duration_ms)` → Idle with micro-jitter
   - `proxy_clear_traffic()` before each action → Isolate API calls per interaction
   - **Pagination**: URL-based? API? Infinite scroll?
   - **Filtering and search**: What API endpoints do they hit?
   - **Dynamic content loading**: What traffic does scrolling trigger?

**4. Assess protection mechanisms**
   - `interceptor_chrome_devtools_list_cookies(domain_filter: "cloudflare")` → Check for Cloudflare
   - `interceptor_chrome_devtools_list_storage_keys(storage_type: "local")` → Fingerprinting markers
   - `proxy_list_traffic()` → Look for 403s, challenge pages
   - `proxy_get_tls_fingerprints()` → Analyze TLS fingerprints
   - Note: stealth mode already handles most browser-level detection

**5. Generate Intelligence Report**
   - Site architecture (framework, rendering method)
   - **Discovered APIs/endpoints** with full specs (from traffic capture)
   - Protection mechanisms and required countermeasures
   - **Optimal extraction strategy** (Traffic Interception > Sitemap > API > DOM Scraping)
   - Time/complexity estimates

**See**: `workflows/reconnaissance.md` for complete reconnaissance guide with proxy-mcp examples

**Why this matters**: Traffic interception automatically discovers hidden APIs (eliminating need for HTML scraping), identifies blockers before coding, and provides intelligence for optimal strategy selection. **Never skip this step.**

### Phase 2: AUTOMATIC DISCOVERY (Validate Reconnaissance)

After Phase 1 reconnaissance, **validate findings with automated checks**:

#### 1. Check for Sitemaps

```bash
# Automatically check these locations
curl -s https://[site]/robots.txt | grep -i Sitemap
curl -I https://[site]/sitemap.xml
curl -I https://[site]/sitemap_index.xml
```

**Log findings clearly**:
- "Found sitemap at /sitemap.xml with ~1,234 URLs"
- "Found sitemap index with 5 sub-sitemaps"
- "No sitemap detected at common locations"

**Why this matters**: Sitemaps provide instant URL discovery (60x faster than crawling)

#### 2. Validate Discovered APIs

APIs already discovered automatically via proxy traffic capture in Phase 1. Validate them:

**If APIs were found**, confirm:
1. Direct access works (test outside browser context)
2. Pagination parameters function correctly
3. Rate limits are acceptable
4. No authentication barriers for target data

**If no APIs were found**, note:
- Site likely requires DOM scraping
- Check if content is static (→ Cheerio) or dynamic (→ DevTools bridge)

**Log findings**:
- "Confirmed API: GET /api/products/{id} (returns JSON, no auth)"
- "Found GraphQL endpoint: /graphql (auth required — use session tokens)"
- "No APIs detected — DOM scraping required"

#### 3. Analyze Site Structure

**Automatically assess**:
- JavaScript-heavy? (Look for React, Vue, Angular indicators in traffic)
- Authentication required? (Login walls, auth tokens in captured requests)
- Page count estimate (from sitemap or API pagination metadata)
- Rate limiting indicators (robots.txt directives, 429 responses in traffic)

### Phase 3: STRATEGY RECOMMENDATION

Based on Phases 1-2 findings, present 2-3 options with clear reasoning:

#### Example Output Template:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analysis of example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1 Intelligence (Traffic Interception):
✓ API discovered via traffic capture: GET /api/products?page=N&limit=100
✓ Framework: Next.js (SSR + CSR hybrid)
✓ Protection: Cloudflare detected, rate limit ~60/min
✓ Stealth mode handled browser detection
✗ No authentication required

Phase 2 Validation:
✓ Sitemap found: 1,234 product URLs (validates API total)
✓ Static HTML fallback available if needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recommended Approaches:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 1: Hybrid (Sitemap + API) [RECOMMENDED]
   ✓ Use sitemap to get all 1,234 product URLs instantly
   ✓ Extract product IDs from URLs
   ✓ Fetch data via API (fast, reliable JSON)

   Complexity: Low-Medium
   Data quality: Excellent
   Speed: Very Fast

Option 2: Sitemap + DOM Scraping (DevTools Bridge)
   ✓ Use sitemap for URLs
   ✓ Scrape HTML via accessibility tree snapshots

   Complexity: Medium
   Data quality: Good
   Speed: Fast

Option 3: Pure API (if sitemap fails)
   ✓ Discover product IDs through API exploration
   ✓ Fetch all data via API

   Complexity: Medium
   Data quality: Excellent
   Speed: Fast

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
My Recommendation: Option 1 (Hybrid)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reasoning:
• Sitemap gives us complete URL list (instant discovery)
• API provides clean, structured data (no HTML parsing)
• Combines speed of sitemap with reliability of API
• Best of both worlds

Proceed with Option 1? [Y/n]
```

**Key principles**:
- Always recommend the SIMPLEST approach that works
- Traffic Interception > Sitemap > API > DOM Scraping (in terms of priority)
- Show complexity and data quality
- Explain reasoning clearly

### Phase 4: ITERATIVE IMPLEMENTATION

Implement scraper incrementally, starting simple and adding complexity only as needed.

**Core Pattern**:
1. Implement recommended approach (minimal code)
2. Test with small batch (5-10 items)
3. Validate data quality
4. Scale to full dataset or fallback
5. Handle blocking if encountered
6. Add robustness (error handling, retries, logging)

**See**: `workflows/implementation.md` for complete implementation patterns and code examples

### Phase 5: PRODUCTIONIZATION (On Request)

Convert scraper to production-ready Apify Actor.

**Activation triggers**:
- "Make this an Apify Actor"
- "Productionize this scraper"
- "Deploy to Apify"
- "Create an actor from this"

**Core Pattern**:
1. Confirm TypeScript preference (STRONGLY RECOMMENDED)
2. Initialize with `apify create` command (CRITICAL)
3. Port scraping logic to Actor format
4. Test locally and deploy

**Note**: During development, proxy-mcp provides reconnaissance and traffic analysis. For production Actors, use Crawlee crawlers (CheerioCrawler/PlaywrightCrawler) on Apify infrastructure.

**See**: `workflows/productionization.md` for complete productionization workflow and `apify/` directory for all Actor development guides

## Quick Reference

| Task | Pattern/Command | Documentation |
|------|----------------|---------------|
| **Reconnaissance** | **Proxy-MCP (Traffic Interception + Stealth Browser)** | **`workflows/reconnaissance.md`** |
| Traffic analysis | `proxy_list_traffic()` + `proxy_get_exchange()` | `strategies/traffic-interception.md` |
| Find sitemaps | `RobotsFile.find(url)` | `strategies/sitemap-discovery.md` |
| Filter sitemap URLs | `RequestList + regex` | `reference/regex-patterns.md` |
| Discover APIs | Traffic capture (automatic) | `strategies/api-discovery.md` |
| DOM scraping | DevTools bridge + humanizer | `strategies/dom-scraping.md` |
| HTTP scraping | `CheerioCrawler` | `strategies/cheerio-scraping.md` |
| Hybrid approach | Sitemap + API | `strategies/hybrid-approaches.md` |
| Handle blocking | Stealth mode + upstream proxies | `strategies/anti-blocking.md` |
| Session recording | `proxy_session_start()` / `proxy_export_har()` | `strategies/session-workflows.md` |
| Proxy-MCP tools | Complete reference | `reference/proxy-tool-reference.md` |
| Fingerprint configs | Stealth + TLS presets | `reference/fingerprint-patterns.md` |
| Create Apify Actor | `apify create` | `apify/cli-workflow.md` |
| Template selection | Cheerio vs Playwright | `workflows/productionization.md` |
| Input schema | `.actor/input_schema.json` | `apify/input-schemas.md` |
| Deploy actor | `apify push` | `apify/deployment.md` |

## Common Patterns

### Pattern 1: Sitemap-Based Scraping

```javascript
import { RobotsFile, CheerioCrawler, Dataset } from 'crawlee';

// Auto-discover and parse sitemaps
const robots = await RobotsFile.find('https://example.com');
const urls = await robots.parseUrlsFromSitemaps();

const crawler = new CheerioCrawler({
    async requestHandler({ $, request }) {
        const data = {
            title: $('h1').text().trim(),
            // ... extract data
        };
        await Dataset.pushData(data);
    },
});

await crawler.addRequests(urls);
await crawler.run();
```

See `examples/sitemap-basic.js` for complete example.

### Pattern 2: API-Based Scraping

```javascript
import { gotScraping } from 'got-scraping';

const productIds = [123, 456, 789];

for (const id of productIds) {
    const response = await gotScraping({
        url: `https://api.example.com/products/${id}`,
        responseType: 'json',
    });

    console.log(response.body);
}
```

See `examples/api-scraper.js` for complete example.

### Pattern 3: Hybrid (Sitemap + API)

```javascript
// Get URLs from sitemap
const robots = await RobotsFile.find('https://shop.com');
const urls = await robots.parseUrlsFromSitemaps();

// Extract IDs from URLs
const productIds = urls
    .map(url => url.match(/\/products\/(\d+)/)?.[1])
    .filter(Boolean);

// Fetch data via API
for (const id of productIds) {
    const data = await gotScraping({
        url: `https://api.shop.com/v1/products/${id}`,
        responseType: 'json',
    });
    // Process data
}
```

See `examples/hybrid-sitemap-api.js` for complete example.

## Directory Navigation

This skill uses **progressive disclosure** - detailed information is organized in subdirectories and loaded only when needed.

### Workflows (Implementation Patterns)
**For**: Step-by-step workflow guides for each phase

- `workflows/reconnaissance.md` - **Phase 1 interactive reconnaissance (CRITICAL)**
- `workflows/implementation.md` - Phase 4 iterative implementation patterns
- `workflows/productionization.md` - Phase 5 Apify Actor creation workflow

### Strategies (Deep Dives)
**For**: Detailed guides on specific scraping approaches

- `strategies/traffic-interception.md` - **Traffic interception via MITM proxy (primary strategy)**
- `strategies/sitemap-discovery.md` - Complete sitemap guide (4 patterns)
- `strategies/api-discovery.md` - Finding and using APIs
- `strategies/dom-scraping.md` - DOM scraping via DevTools bridge
- `strategies/cheerio-scraping.md` - HTTP-only scraping
- `strategies/hybrid-approaches.md` - Combining strategies
- `strategies/anti-blocking.md` - Multi-layer anti-detection (stealth, humanizer, proxies, TLS)
- `strategies/session-workflows.md` - Session recording, HAR export, replay

### Examples (Runnable Code)
**For**: Working code to reference or execute

**JavaScript Learning Examples** (Simple standalone scripts):
- `examples/sitemap-basic.js` - Simple sitemap scraper
- `examples/api-scraper.js` - Pure API approach
- `examples/traffic-interception-basic.js` - Proxy-based reconnaissance
- `examples/hybrid-sitemap-api.js` - Combined approach
- `examples/iterative-fallback.js` - Try traffic interception→sitemap→API→DOM scraping

**TypeScript Production Examples** (Complete Actors):
- `apify/examples/basic-scraper/` - Sitemap + Playwright
- `apify/examples/anti-blocking/` - Fingerprinting + proxies
- `apify/examples/hybrid-api/` - Sitemap + API (optimal)

### Reference (Quick Lookup)
**For**: Quick patterns and troubleshooting

- `reference/proxy-tool-reference.md` - **Proxy-MCP tool reference (all 80+ tools)**
- `reference/regex-patterns.md` - Common URL regex patterns
- `reference/fingerprint-patterns.md` - Stealth mode + TLS fingerprint presets
- `reference/anti-patterns.md` - What NOT to do

### Apify (Production Deployment)
**For**: Creating production Apify Actors

- `apify/README.md` - When and how to use Apify
- `apify/typescript-first.md` - **Why TypeScript for actors**
- `apify/cli-workflow.md` - **apify create workflow (CRITICAL)**
- `apify/initialization.md` - Complete setup guide
- `apify/input-schemas.md` - Input validation patterns
- `apify/configuration.md` - actor.json setup
- `apify/deployment.md` - Testing and deployment
- `apify/templates/` - TypeScript boilerplate

**Note**: Each file is self-contained and can be read independently. Claude will navigate to specific files as needed.

## Core Principles

### 1. Traffic Interception First
Start with the approach that gives the most intelligence:
- Traffic Interception > Sitemap > API > DOM Scraping
- MITM proxy reveals hidden APIs automatically
- Stealth mode handles anti-detection out of the box

### 2. Progressive Enhancement
Start with the simplest approach that works:
- Static > Dynamic
- HTTP > Browser
- Cheerio > Playwright

### 3. Proactive Discovery
Always investigate before implementing:
- Capture traffic to discover APIs automatically
- Check for sitemaps
- Analyze site structure via traffic patterns

### 4. Iterative Implementation
Build incrementally:
- Small test batch first (5-10 items)
- Validate quality
- Scale or fallback
- Add robustness last

### 5. Production-Ready Code
When productionizing:
- Use TypeScript (strongly recommended)
- Use `apify create` (never manual setup)
- Add proper error handling
- Include logging and monitoring

---

**Remember**: Traffic interception first, sitemaps second, APIs third, DOM scraping last!

For detailed guidance on any topic, navigate to the relevant subdirectory file listed above.
