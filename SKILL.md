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

## Input Parsing

Determine reconnaissance depth from user request:

| User Says | Mode | Phases Run |
|-----------|------|------------|
| "quick recon", "just check", "what framework" | Quick | Phase 0 only |
| "scrape X", "extract data from X" (default) | Standard | Phases 0-3 + 5, Phase 4 only if protection signals detected |
| "full recon", "deep scan", "production scraping" | Full | All phases (0-5) including protection testing |

Default is Standard mode. Escalate to Full if protection signals appear during any phase.

## Adaptive Reconnaissance Workflow

This skill uses an adaptive phased workflow with quality gates. Each gate asks **"Do I have enough?"** — continue only when the answer is no.

**See**: `strategies/framework-signatures.md` for framework detection tables referenced throughout.

### Phase 0: QUICK ASSESSMENT (curl, no browser)

Gather maximum intelligence with minimum cost — a single HTTP request.

**Step 0a: Fetch raw HTML and headers**
```bash
curl -s -D- -L "https://target.com/page" -o response.html
```

**Step 0b: Check response headers**
- Match headers against `strategies/framework-signatures.md` → Response Header Signatures table
- Note `Server`, `X-Powered-By`, `X-Shopify-Stage`, `Set-Cookie` (protection markers)
- Check HTTP status code (200 = accessible, 403 = protected, 3xx = redirects)

**Step 0c: Check Known Major Sites table**
- Match domain against `strategies/framework-signatures.md` → Known Major Sites
- If matched: use the specified data strategy, skip generic pattern scanning

**Step 0d: Detect framework from HTML**
- Search raw HTML for signatures in `strategies/framework-signatures.md` → HTML Signatures table
- Look for `__NEXT_DATA__`, `__NUXT__`, `ld+json`, `/wp-content/`, `data-reactroot`

**Step 0e: Search for target data points**
- For each data point the user wants: search raw HTML for that content
- Track which data points are found vs missing
- Check for sitemaps: `curl -s https://[site]/robots.txt | grep -i Sitemap`

**Step 0f: Note protection signals**
- 403/503 status, Cloudflare challenge HTML, CAPTCHA elements, `cf-ray` header
- Record for Phase 4 decision

**See**: `strategies/cheerio-vs-browser-test.md` for the Cheerio viability assessment

> **QUALITY GATE A**: All target data points found in raw HTML + no protection signals?
> → YES: Skip to Phase 3 (Validate Findings). No browser needed.
> → NO: Continue to Phase 1.

### Phase 1: BROWSER RECONNAISSANCE (only if Phase 0 needs it)

Launch browser only for data points missing from raw HTML or when JavaScript rendering is required.

**Step 1a: Initialize browser session**
- `proxy_start()` → Start traffic interception proxy
- `interceptor_chrome_launch(url, stealthMode: true)` → Launch Chrome with anti-detection
- `interceptor_chrome_devtools_attach(target_id)` → Attach DevTools bridge
- `interceptor_chrome_devtools_screenshot()` → Capture visual state

**Step 1b: Capture traffic and rendered DOM**
- `proxy_list_traffic()` → Review all traffic from page load
- `proxy_search_traffic(query: "application/json")` → Find JSON responses
- `interceptor_chrome_devtools_list_network(resource_types: ["xhr", "fetch"])` → XHR/fetch calls
- `interceptor_chrome_devtools_snapshot()` → Accessibility tree (rendered DOM)

**Step 1c: Search rendered DOM for missing data points**
- For each data point NOT found in Phase 0: search rendered DOM
- Use framework-specific search strategy from `strategies/framework-signatures.md` → Framework → Search Strategy table
- Only search patterns relevant to the detected framework

**Step 1d: Inspect discovered endpoints**
- `proxy_get_exchange(exchange_id)` → Full request/response for promising endpoints
- Document: method, headers, auth, response structure, pagination

> **QUALITY GATE B**: All target data points now covered (raw HTML + rendered DOM + traffic)?
> → YES: Skip to Phase 3 (Validate Findings). No deep scan needed.
> → NO: Continue to Phase 2 for missing data points only.

### Phase 2: DEEP SCAN (only for missing data points)

Targeted investigation for data points not yet found. Only search for what's missing.

**Step 2a: Test interactions for missing data**
- `proxy_clear_traffic()` before each action → Isolate API calls
- `humanizer_click(target_id, selector)` → Trigger dynamic content loads
- `humanizer_scroll(target_id, direction, amount)` → Trigger lazy loading / infinite scroll
- `humanizer_idle(target_id, duration_ms)` → Wait for delayed content
- After each action: `proxy_list_traffic()` → Check for new API calls

**Step 2b: Sniff APIs (framework-aware)**
- Search only patterns relevant to detected framework:
  - Next.js → `proxy_list_traffic(url_filter: "/_next/data/")`
  - WordPress → `proxy_list_traffic(url_filter: "/wp-json/")`
  - GraphQL → `proxy_search_traffic(query: "graphql")`
  - Generic → `proxy_list_traffic(url_filter: "/api/")` + `proxy_search_traffic(query: "application/json")`
- Skip patterns that don't apply to the detected framework

**Step 2c: Test pagination and filtering**
- Only if pagination data is a missing data point or needed for coverage assessment
- `proxy_clear_traffic()` → click next page → `proxy_list_traffic(url_filter: "page=")`
- Document pagination type (URL-based, API offset, cursor, infinite scroll)

> **QUALITY GATE C**: Enough data points covered for a useful report?
> → YES: Go to Phase 3.
> → NO: Document gaps, go to Phase 3 anyway (report will note missing data in self-critique).

### Phase 3: VALIDATE FINDINGS

Every claimed extraction method must be verified. A data point is not "found" until the extraction path is specified and tested.

**See**: `strategies/cheerio-vs-browser-test.md` for validation methodology

**Step 3a: Validate CSS selectors**
- For each Cheerio/selector-based method: confirm the selector matches actual HTML
- Test against raw HTML (curl output) or rendered DOM (snapshot)
- Confirm selector extracts the correct value, not a different element

**Step 3b: Validate JSON paths**
- For each JSON extraction (e.g., `__NEXT_DATA__`, API response): confirm the path resolves
- Parse the JSON, follow the path, verify it returns the expected data type and value

**Step 3c: Validate API endpoints**
- For each discovered API: replay the request (curl or `proxy_get_exchange`)
- Confirm: response status 200, expected data structure, correct values
- Test pagination if claimed (at least page 1 and page 2)

**Step 3d: Downgrade or re-investigate failures**
- If a selector doesn't match: try alternative selectors, or downgrade to PARTIAL confidence
- If an API returns 403: note protection requirement, flag for Phase 4
- If a JSON path is wrong: re-examine the JSON structure, correct the path

### Phase 4: PROTECTION TESTING (conditional)

**See**: `strategies/proxy-escalation.md` for complete skip/run decision logic

**Skip Phase 4 when ALL true**:
- No protection signals detected in Phases 0-2
- All data points have validated extraction methods
- User didn't request "full recon"

**Run Phase 4 when ANY true**:
- 403/challenge page observed during any phase
- Known high-protection domain
- High-volume or production intent
- User explicitly requested it

**If running**:

**Step 4a: Test raw HTTP access**
```bash
curl -s -o /dev/null -w "%{http_code}" "https://target.com/page"
```
- 200 → Cheerio viable, no browser needed for accessible endpoints
- 403/503 → Escalate to stealth browser

**Step 4b: Test with stealth browser** (if needed)
- Already running from Phase 1 — check if pages loaded without challenges
- `interceptor_chrome_devtools_list_cookies(domain_filter: "cloudflare")` → Protection cookies
- `interceptor_chrome_devtools_list_storage_keys(storage_type: "local")` → Fingerprint markers
- `proxy_get_tls_fingerprints()` → TLS fingerprint analysis

**Step 4c: Test with upstream proxy** (if needed)
- `proxy_set_upstream("http://user:pass@proxy-provider:port")`
- Re-test blocked endpoints through proxy
- Document minimum access level for each data point

**Step 4d: Document protection profile**
- What protections exist, what worked to bypass them, what production scrapers will need

### Phase 5: REPORT + SELF-CRITIQUE

Generate the intelligence report, then critically review it for gaps.

**See**: `reference/report-schema.md` for complete report format

**Step 5a: Generate report**
- Follow `reference/report-schema.md` schema (Sections 1-6)
- Include `Validated?` status for every strategy (YES / PARTIAL / NO)
- Include all discovered endpoints with full specs

**Step 5b: Self-critique**
- Write Section 7 (Self-Critique) per `reference/report-schema.md`:
  - **Gaps**: Data points not found — why, and what would find them
  - **Skipped steps**: Which phases skipped, with quality gate reasoning
  - **Unvalidated claims**: Anything marked PARTIAL or NO
  - **Assumptions**: Things not verified (e.g., "consistent layout across categories")
  - **Staleness risk**: Geo-dependent prices, A/B layouts, session-specific content
  - **Recommendations**: Targeted next steps (not "re-run everything")

**Step 5c: Fix gaps with targeted re-investigation**
- If self-critique reveals fixable gaps: go back to the specific phase/step, not a full re-run
- Example: "Price selector untested" → run one curl + parse, don't re-launch browser
- Update report with results

**Step 5d: Record session** (if browser was used)
- `proxy_session_start(name)` → `proxy_session_stop(session_id)` → `proxy_export_har(session_id, path)`
- HAR file captures all traffic for replay. See `strategies/session-workflows.md`

---

### IMPLEMENTATION (after reconnaissance)

After reconnaissance report is accepted, implement scraper iteratively.

**Core Pattern**:
1. Implement recommended approach (minimal code)
2. Test with small batch (5-10 items)
3. Validate data quality
4. Scale to full dataset or fallback
5. Handle blocking if encountered
6. Add robustness (error handling, retries, logging)

**See**: `workflows/implementation.md` for complete implementation patterns and code examples

### PRODUCTIONIZATION (on request)

Convert scraper to production-ready Apify Actor.

**Activation triggers**: "Make this an Apify Actor", "Productionize this", "Deploy to Apify"

**Core Pattern**:
1. Confirm TypeScript preference (STRONGLY RECOMMENDED)
2. Initialize with `apify create` command (CRITICAL)
3. Port scraping logic to Actor format
4. Test locally and deploy

**Note**: During development, proxy-mcp provides reconnaissance and traffic analysis. For production Actors, use Crawlee crawlers (CheerioCrawler/PlaywrightCrawler) on Apify infrastructure.

**See**: `workflows/productionization.md` for complete workflow and `apify/` for Actor development guides

## Quick Reference

| Task | Pattern/Command | Documentation |
|------|----------------|---------------|
| **Reconnaissance** | **Adaptive Phases 0-5** | **`workflows/reconnaissance.md`** |
| Framework detection | Header + HTML signature matching | `strategies/framework-signatures.md` |
| Cheerio vs Browser | Three-way test + early exit | `strategies/cheerio-vs-browser-test.md` |
| Traffic analysis | `proxy_list_traffic()` + `proxy_get_exchange()` | `strategies/traffic-interception.md` |
| Protection testing | Conditional escalation | `strategies/proxy-escalation.md` |
| Report format | Sections 1-7 with self-critique | `reference/report-schema.md` |
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

- `strategies/framework-signatures.md` - **Framework detection lookup tables (Phase 0/1)**
- `strategies/cheerio-vs-browser-test.md` - **Cheerio vs Browser decision test with early exit**
- `strategies/proxy-escalation.md` - **Protection testing skip/run conditions (Phase 4)**
- `strategies/traffic-interception.md` - Traffic interception via MITM proxy
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

- `reference/report-schema.md` - **Intelligence report format (Sections 1-7 + self-critique)**
- `reference/proxy-tool-reference.md` - Proxy-MCP tool reference (all 80+ tools)
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

### 1. Assess Before Committing Resources
Start cheap (curl), escalate only when needed:
- Phase 0 (curl) before Phase 1 (browser) before Phase 2 (deep scan)
- Quality gates skip phases when data is sufficient
- Never launch a browser if curl gives you everything

### 2. Detect First, Then Search Relevant Patterns
Use framework detection to focus searches:
- Match against `strategies/framework-signatures.md` before scanning
- Skip patterns that don't apply (no `__NEXT_DATA__` on Amazon)
- Known major sites get direct strategy lookup

### 3. Validate, Don't Assume
Every claimed extraction method must be tested:
- "Found text in HTML" is not enough — need a working selector/path
- Phase 3 validates every finding before the report
- Unvalidated claims are marked PARTIAL or NO in the report

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
