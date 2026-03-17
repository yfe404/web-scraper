# API Discovery and Usage

## Overview

Many websites expose hidden APIs that are **10-100x faster and more reliable** than scraping HTML. Always look for APIs before writing scraping code!

## Why APIs are Better Than Scraping

| Aspect | API | HTML Scraping |
|--------|-----|---------------|
| **Speed** | Very fast (JSON responses) | Slow (render full pages) |
| **Reliability** | Stable structure | Breaks when HTML changes |
| **Data Quality** | Clean, structured JSON | Messy, requires parsing |
| **Bandwidth** | Low (only data) | High (images, CSS, JS) |
| **Maintenance** | Low (stable contracts) | High (fragile selectors) |
| **Rate Limiting** | Clear limits | Ambiguous |

**Example**:
- Scraping HTML: Load entire page (~500 KB), parse HTML, extract data
- Using API: GET `/api/product/123` returns clean JSON (~5 KB)

**Result**: 100x less bandwidth, 10x faster, 0 HTML parsing

## How to Find APIs

### Via Proxy-MCP Traffic Capture (Recommended)

The MITM proxy captures all traffic automatically during reconnaissance:

```
proxy_start()
interceptor_chrome_launch("https://target-site.com", stealthMode: true)
interceptor_chrome_devtools_attach(target_id)

# Browse the site with humanizer
humanizer_click(target_id, ".category-link")
humanizer_idle(target_id, 2000)

# Discover APIs in captured traffic
proxy_list_traffic(url_filter: "api")
proxy_list_traffic(url_filter: "/graphql")
proxy_search_traffic(query: "application/json")

# Inspect discovered endpoints
proxy_get_exchange(exchange_id)
```

### What to Look For

Filter traffic for these common API patterns:
```
/api/...
/v1/...
/v2/...
/graphql
/_next/data/...
/wp-json/...
/rest/...
```

### Analyze Each Endpoint

For each promising request found in traffic, use `proxy_get_exchange(exchange_id)` to check:
- **URL pattern**: Can you construct similar URLs?
- **Method**: GET, POST, etc.
- **Headers**: Authentication? Content-Type?
- **Query parameters**: Pagination? Filters?
- **Response format**: JSON? GraphQL? XML?

## Common API Patterns

### REST APIs

**Pattern**: `https://api.example.com/v1/resources/{id}`

**Example**:
```
GET https://shop.com/api/products/12345
GET https://shop.com/api/products?category=electronics&limit=50
```

**How to use**:
```javascript
import { gotScraping } from 'got-scraping';

const response = await gotScraping({
    url: 'https://shop.com/api/products/12345',
    responseType: 'json',
});

console.log(response.body); // Clean JSON object
```

### GraphQL APIs

**Pattern**: POST to `/graphql` with query in body

**Example**:
```graphql
POST https://example.com/graphql

{
  "query": "{ products(limit: 10) { id name price } }"
}
```

**How to use**:
```javascript
const response = await gotScraping({
    url: 'https://example.com/graphql',
    method: 'POST',
    json: {
        query: `{
            products(limit: 10) {
                id
                name
                price
                inStock
            }
        }`
    },
    responseType: 'json',
});

console.log(response.body.data.products);
```

### Paginated APIs

**Pattern**: `?page=1&limit=50` or cursor-based

**Example**:
```javascript
async function fetchAllProducts() {
    const allProducts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await gotScraping({
            url: `https://api.shop.com/products?page=${page}&limit=50`,
            responseType: 'json',
        });

        allProducts.push(...response.body.products);

        hasMore = response.body.hasNextPage;
        page++;
    }

    return allProducts;
}
```

## Authentication Handling

### Cookies

Extract from browser session via DevTools bridge:

```
# Get cookies from browser
interceptor_chrome_devtools_list_cookies()

# Use extracted cookies in API requests
```

```javascript
await gotScraping({
    url: 'https://api.example.com/data',
    headers: {
        'Cookie': 'session=abc123; cf_clearance=xyz',
    },
});
```

### Bearer Tokens

Extract from localStorage via DevTools bridge:

```
# Get token from browser storage
interceptor_chrome_devtools_list_storage_keys(storage_type: "local")
interceptor_chrome_devtools_get_storage_value("auth_token", storage_type: "local")
```

```javascript
// Use in API requests
await gotScraping({
    url: 'https://api.example.com/data',
    headers: {
        'Authorization': `Bearer ${extractedToken}`,
    },
});
```

### API Keys

Often visible in captured traffic headers — inspect with `proxy_get_exchange(exchange_id)`:

```javascript
await gotScraping({
    url: 'https://api.example.com/data',
    headers: {
        'X-API-Key': 'abc123...',
        'X-Client-ID': 'web-app',
    },
});
```

## Hybrid Approach: Sitemap URLs + API Data

**Best of both worlds**: Use sitemap for URLs, API for data

```javascript
import { RobotsFile } from 'crawlee';
import { gotScraping } from 'got-scraping';

// Get all product URLs from sitemap
const robots = await RobotsFile.find('https://shop.com');
const urls = await robots.parseUrlsFromSitemaps();

// Extract product IDs from URLs
const productIds = urls
    .map(url => url.match(/\/products\/(\d+)/)?.[1])
    .filter(Boolean);

console.log(`Found ${productIds.length} products`);

// Fetch data from API (much faster than scraping pages)
for (const id of productIds) {
    const response = await gotScraping({
        url: `https://api.shop.com/v1/products/${id}`,
        responseType: 'json',
    });

    console.log(response.body);
    // Clean, structured data!
}
```

See `../examples/hybrid-sitemap-api.js` for complete example.

## got-scraping vs fetch

### Use `got-scraping` (Recommended)

**Benefits**:
- Automatic retries
- Browser-like headers
- Proxy support
- Cookie handling
- Response type conversion

```javascript
import { gotScraping } from 'got-scraping';

const response = await gotScraping({
    url: 'https://api.example.com/data',
    responseType: 'json', // Auto-parses JSON
    retry: {
        limit: 3,
    },
});

console.log(response.body); // Already parsed JSON
```

### Use `fetch` (Simple cases)

For simple requests:

```javascript
const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

## Common API Patterns to Look For

### 1. Next.js Data

```
/_next/data/BUILD_ID/products/123.json
```

### 2. WordPress REST API

```
/wp-json/wp/v2/posts
/wp-json/wp/v2/pages
```

### 3. Shopify API

```
/products.json
/collections.json
/products/HANDLE.json
```

### 4. Internal APIs

```
/api/v1/...
/internal/api/...
/_api/...
```

## Rate Limiting

Respect API rate limits:

```javascript
import { setTimeout } from 'timers/promises';

for (const id of productIds) {
    const response = await gotScraping({
        url: `https://api.example.com/products/${id}`,
        responseType: 'json',
    });

    console.log(response.body);

    // Respect rate limits (e.g., 10 requests/second)
    await setTimeout(100); // 100ms delay
}
```

Better: Use Crawlee's built-in rate limiting:

```javascript
import { HttpCrawler } from 'crawlee';

const crawler = new HttpCrawler({
    maxRequestsPerMinute: 60,
    async requestHandler({ json }) {
        console.log(json);
    },
});
```

## Error Handling

Always handle API errors:

```javascript
try {
    const response = await gotScraping({
        url: `https://api.example.com/products/${id}`,
        responseType: 'json',
        timeout: {
            request: 10000, // 10 second timeout
        },
    });

    // Check for API-level errors
    if (response.body.error) {
        throw new Error(`API error: ${response.body.error}`);
    }

    return response.body;

} catch (error) {
    if (error.response?.statusCode === 404) {
        console.log(`Product ${id} not found`);
        return null;
    } else if (error.response?.statusCode === 429) {
        console.log('Rate limited, waiting...');
        await setTimeout(5000);
        // Retry
    } else {
        throw error;
    }
}
```

## Best Practices

### ✅ DO:

- **Always check for APIs first** before scraping HTML
- **Analyze Network tab** on every scraping project
- **Use got-scraping** for better reliability
- **Respect rate limits** (add delays or use Crawlee)
- **Handle authentication** properly (cookies, tokens)
- **Cache API responses** to avoid redundant requests
- **Log API calls** for debugging
- **Use TypeScript** for type-safe API responses

### ❌ DON'T:

- **Skip API discovery** - always check first!
- **Ignore rate limits** - you'll get blocked
- **Hardcode credentials** - use environment variables
- **Trust API responses** - validate data
- **Forget error handling** - APIs fail too
- **Make redundant requests** - cache when possible

## Complete Example: API-First Scraper

```javascript
import { gotScraping } from 'got-scraping';
import { setTimeout } from 'timers/promises';

async function scrapeProducts(productIds) {
    const results = [];

    for (const id of productIds) {
        try {
            console.log(`Fetching product ${id}...`);

            const response = await gotScraping({
                url: `https://api.shop.com/v1/products/${id}`,
                responseType: 'json',
                headers: {
                    'User-Agent': 'Mozilla/5.0...',
                },
                timeout: {
                    request: 10000,
                },
                retry: {
                    limit: 3,
                    methods: ['GET'],
                },
            });

            results.push(response.body);

            // Rate limiting (10 req/sec max)
            await setTimeout(100);

        } catch (error) {
            console.error(`Failed to fetch product ${id}:`, error.message);
        }
    }

    return results;
}

// Usage
const productIds = [123, 456, 789];
const products = await scrapeProducts(productIds);
console.log(`Scraped ${products.length} products`);
```

## Related Resources

- **Sitemap discovery**: See `sitemap-discovery.md` (get IDs from URLs)
- **Hybrid approach**: See `hybrid-approaches.md`
- **Examples**: See `../examples/api-scraper.js`
- **Examples**: See `../examples/hybrid-sitemap-api.js`

## Summary

**APIs are the BEST way to get data** - always look for them first!

**Key takeaways**:
1. Use proxy-mcp traffic capture to discover APIs automatically
2. Look for `/api/`, `/v1/`, `/graphql` endpoints in captured traffic
3. Use got-scraping for production data extraction
4. Combine with sitemaps for complete coverage
5. Respect rate limits and authentication
6. 10-100x faster than HTML scraping!
