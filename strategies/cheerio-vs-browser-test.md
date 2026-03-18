# Cheerio vs Browser Decision Test

Determine whether a site needs a full browser (Playwright/DevTools) or can be scraped with HTTP-only tools (Cheerio/gotScraping).

## Quick Decision

**Use Cheerio (HTTP-only)** when raw HTML contains all target data points.
**Use Browser** when data is rendered by JavaScript after page load.

## Early Exit: Raw HTML Assessment

Before launching a browser, check if raw HTML is sufficient.

### Phase 0 Check (curl-based)

```bash
curl -s -L "https://target.com/page" | head -500
```

Search the raw HTML for each data point the user wants:

| Data Point | Search Method | Found? |
|-----------|---------------|--------|
| Product name | Search for known product name text | YES/NO |
| Price | Search for price pattern (`$XX.XX`, `€`, etc.) | YES/NO |
| Description | Search for product description text | YES/NO |

**Early exit rule**: If **all** data points are found in raw HTML → **skip browser entirely**. Proceed to selector validation (below), then go to Phase 3.

**Continue to browser** if: raw HTML finds **less than 50%** of data points, or critical data points are missing.

**Edge case**: If raw HTML has *some* data points (50-99%), note which are missing and launch browser only to find those specific missing points.

## Three-Way Test (when browser is needed)

Compare data availability across three sources:

### Source 1: Raw HTML (curl)
```bash
curl -s "https://target.com/page" > raw.html
```
- Parse with text search or regex
- Fastest, lowest resource usage
- What Cheerio will see

### Source 2: Rendered DOM (browser)
```
interceptor_chrome_devtools_snapshot()
```
- Accessibility tree after JavaScript execution
- What Playwright/DevTools will see
- Shows JS-rendered content

### Source 3: Network Traffic (API)
```
proxy_list_traffic(url_filter: "api")
proxy_search_traffic(query: "application/json")
```
- JSON data from API calls
- Often the cleanest source
- May contain data not visible in DOM

### Comparison Matrix

| Data Point | Raw HTML | Rendered DOM | API Response | Best Source |
|-----------|----------|-------------|--------------|-------------|
| Title | YES | YES | YES | Raw HTML (simplest) |
| Price | NO | YES | NO | Rendered DOM |
| Reviews | NO | NO | YES | API |

**Decision**: Use the simplest source that covers each data point.

## Post-Decision Validation

**Critical rule**: Finding text in HTML is NOT enough. A data point is only "found" when the extraction path is specified AND tested.

### For Cheerio (CSS selectors):

1. **Identify selector**: Find the specific CSS selector that targets the data
2. **Verify uniqueness**: Confirm the selector matches exactly one element (or the expected count)
3. **Test extraction**: Confirm the selector extracts the correct text/attribute value

Validation checklist:
```
Data point: Product name
Selector: #productTitle
Verified: YES — selector matches 1 element, innerText = expected product name

Data point: Price
Selector: span.a-price .a-offscreen
Verified: PARTIAL — found in rendered DOM, not in raw HTML (JS-rendered)
Action: Requires browser, not Cheerio
```

### For JSON paths:

1. **Identify path**: Find the JSON path to the data (e.g., `props.pageProps.product.title`)
2. **Verify value**: Confirm the path resolves to the expected value
3. **Test with sample**: Parse the JSON and extract the value programmatically

### For API endpoints:

1. **Replay request**: Make the same request outside the browser context
2. **Verify response**: Confirm the response contains expected data structure
3. **Test pagination**: If paginated, confirm at least page 1 and page 2 work

## Decision Output

After testing, produce a clear recommendation:

```
CHEERIO VIABLE: YES/NO/PARTIAL

Data points via Cheerio (raw HTML):
  - Product name: #productTitle ✓ validated
  - Description: #productDescription ✓ validated

Data points requiring browser:
  - Price: span.a-price .a-offscreen (JS-rendered)
  - Stock: .availability span (JS-rendered)

Data points via API:
  - Reviews: GET /api/reviews?asin={id} ✓ validated

RECOMMENDATION: Hybrid — Cheerio for name/description, API for reviews,
browser only if price/stock needed from rendered DOM.
```

## Common Pitfalls

### "Found in HTML" doesn't mean "extractable with Cheerio"
- Text may be inside a `<script>` tag (JSON data, not DOM element)
- Text may be in an HTML comment
- Text may be split across multiple elements
- Always verify with an actual selector

### Minified class names
- React/Vue/Angular apps often use generated class names (`.css-1a2b3c`)
- These change between builds — use `data-*` attributes or structural selectors instead
- Prefer `[data-testid="price"]` over `.price-module__value_abc123`

### Partial SSR
- Some sites render a skeleton in SSR, then hydrate with JS
- Price might show as `$--` in raw HTML but `$29.99` after hydration
- Always compare raw HTML values against rendered DOM values
