# DOM Scraping via DevTools Bridge

## Overview

DOM scraping is the **last resort** when traffic interception found no clean APIs. Use the proxy-mcp DevTools bridge for accessibility tree extraction and the humanizer for interactions.

**Important**: This strategy is for interactive development/reconnaissance. For production Actors, use Crawlee crawlers (PlaywrightCrawler/CheerioCrawler) on Apify infrastructure.

## When to Use

### Use DOM Scraping When:
- Traffic interception (Phase 1) found no usable APIs
- Site requires JavaScript rendering (React, Vue, Angular, etc.)
- Content is only available in the rendered DOM
- Need to interact with page elements (clicks, forms, scrolling)
- Authentication flows require browser context

### Don't Use DOM Scraping When:
- An API was discovered via traffic capture (use API instead — 10x faster)
- Static HTML works fine (use Cheerio — 5x faster)
- Sitemap + API hybrid is available

## DevTools Bridge Approach

### Prerequisites

Browser session must be initialized with stealth mode:

```
proxy_start()
interceptor_chrome_launch("https://target-site.com", stealthMode: true)
interceptor_chrome_devtools_attach(target_id)
```

### Accessibility Tree Extraction

Use `interceptor_chrome_devtools_snapshot()` instead of CSS selectors. The accessibility tree is:
- More stable than CSS selectors (survives CSS/class changes)
- Semantic (based on ARIA roles, not visual styling)
- Includes text content, labels, and element roles

```
interceptor_chrome_devtools_snapshot()
```

Returns a structured tree showing all interactive and content elements with their roles, names, and values.

### Visual Verification

Always verify what the page looks like:

```
interceptor_chrome_devtools_screenshot()
```

Compare the screenshot with the accessibility tree to identify the data you need.

## Interaction Patterns

All interactions use the humanizer for anti-detection behavior.

### Click Elements

```
humanizer_click(target_id, "button.submit")
```

The humanizer moves the mouse along a Bezier curve with Fitts's law timing, then clicks with realistic variance.

### Fill Form Fields

```
humanizer_click(target_id, "input[name='search']")    → Focus the field
humanizer_type(target_id, "search query")               → Type with WPM-based timing
```

### Scroll Page

```
humanizer_scroll(target_id, "down", 500)
```

Uses easeInOutQuad acceleration for natural scroll behavior.

### Wait for Content

```
humanizer_idle(target_id, 2000)
```

Maintains micro-jitter and occasional micro-scrolls to defeat idle detection, while waiting for network activity to complete.

## Common Patterns

### Pattern 1: Extract Data from Accessibility Tree

```
1. interceptor_chrome_devtools_navigate("https://site.com/product/123")
2. humanizer_idle(target_id, 2000)                          → Wait for render
3. interceptor_chrome_devtools_snapshot()                    → Get accessibility tree
4. interceptor_chrome_devtools_screenshot()                  → Visual verification
```

Parse the accessibility tree for:
- Headings (product names, article titles)
- Text content (descriptions, prices)
- Links (related products, pagination)
- Images (via alt text and src attributes)

### Pattern 2: Dynamic Content via Scroll + Traffic Monitoring

```
1. proxy_clear_traffic()
2. humanizer_scroll(target_id, "down", 2000)
3. humanizer_idle(target_id, 2000)
4. proxy_list_traffic()                                      → Check if scroll triggered API calls
5. interceptor_chrome_devtools_snapshot()                    → Get updated content
```

If scrolling triggers API calls visible in traffic, switch to the API approach instead.

### Pattern 3: Form Submission

```
1. humanizer_click(target_id, "input[name='email']")
2. humanizer_type(target_id, "user@example.com")
3. humanizer_click(target_id, "input[name='password']")
4. humanizer_type(target_id, "password123")
5. humanizer_click(target_id, "button[type='submit']")
6. humanizer_idle(target_id, 3000)
7. interceptor_chrome_devtools_screenshot()                  → Verify login success
8. interceptor_chrome_devtools_list_cookies()                → Extract auth cookies
```

### Pattern 4: Pagination

```
1. interceptor_chrome_devtools_snapshot()                    → Extract page 1 data
2. proxy_clear_traffic()
3. humanizer_click(target_id, "a.next-page")
4. humanizer_idle(target_id, 2000)
5. proxy_list_traffic()                                      → Check for pagination API
6. interceptor_chrome_devtools_snapshot()                    → Extract page 2 data
```

If pagination triggers an API call (visible in step 5), switch to direct API access for remaining pages.

### Pattern 5: Extract Cookies and Tokens

After navigating and authenticating:

```
interceptor_chrome_devtools_list_cookies()                   → Get all cookies
interceptor_chrome_devtools_list_storage_keys(storage_type: "local")  → List localStorage keys
interceptor_chrome_devtools_get_storage_value("auth_token", "local")  → Get specific token
```

Use extracted cookies/tokens for direct API calls with `gotScraping`:

```javascript
const response = await gotScraping({
    url: 'https://api.example.com/data',
    headers: {
        'Cookie': 'session=abc123; cf_clearance=xyz',
        'Authorization': `Bearer ${extractedToken}`,
    },
    responseType: 'json',
});
```

## Production Actors

For production deployment, convert DOM scraping logic to Crawlee crawlers:

### PlaywrightCrawler (JavaScript-rendered content)

```typescript
import { PlaywrightCrawler, Dataset } from 'crawlee';

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, log }) {
        const data = await page.evaluate(() => ({
            title: document.querySelector('h1')?.textContent?.trim(),
            price: document.querySelector('.price')?.textContent?.trim(),
        }));
        await Dataset.pushData({ url: request.url, ...data });
    },
});
```

### CheerioCrawler (Static HTML — faster)

```typescript
import { CheerioCrawler, Dataset } from 'crawlee';

const crawler = new CheerioCrawler({
    async requestHandler({ $, request }) {
        const data = {
            title: $('h1').text().trim(),
            price: $('.price').text().trim(),
        };
        await Dataset.pushData({ url: request.url, ...data });
    },
});
```

## Best Practices

### DO:
- **Use accessibility tree** (`interceptor_chrome_devtools_snapshot()`) over CSS selectors
- **Always check traffic first** — the action you're about to scrape from DOM might trigger an API call
- **Use humanizer for all interactions** — never use raw DevTools clicks/typing
- **Take screenshots** for verification before and after actions
- **Clear traffic before actions** to isolate specific API calls

### DON'T:
- **Skip traffic analysis** — always check if an API exists first
- **Use `interceptor_chrome_navigate()`** — it loses the DevTools session (use `interceptor_chrome_devtools_navigate()`)
- **Launch Chrome without stealth mode** on protected sites
- **Use arbitrary waits** — use `humanizer_idle()` instead (includes anti-detection micro-movements)

## Related

- **Traffic interception (do first)**: See `traffic-interception.md`
- **Anti-blocking**: See `anti-blocking.md`
- **Humanizer details**: See `../reference/proxy-tool-reference.md`
- **Production patterns**: See `../workflows/productionization.md`
